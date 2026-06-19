import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivateSubscriptionOnProfileUseCase } from '../../../mobility/application/use-cases/activate-subscription-on-profile.use-case';
import { ContractStatus } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';

export interface ConfirmMockValidationResult {
  status: string;
  alreadyValidated: boolean;
  mobilityIdentityId: string | null;
}

@Injectable()
export class ConfirmMockValidationUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly activateOnProfile: ActivateSubscriptionOnProfileUseCase,
  ) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<ConfirmMockValidationResult> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    let alreadyValidated = false;

    if (contract.status === ContractStatus.ACTIF) {
      alreadyValidated = true;
    } else if (
      contract.status === ContractStatus.EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE
    ) {
      contract.status = ContractStatus.ACTIF;
      contract.updatedAt = new Date();
      await this.contractRepo.save(contract);
    } else {
      throw new BadRequestException(
        `La validation ne peut pas être confirmée dans l'état actuel : ${contract.status}`,
      );
    }

    const { mobilityIdentityId, activated } =
      await this.activateOnProfile.execute({
        userId,
        holderFirstName: contract.holderFirstName,
        holderLastName: contract.holderLastName,
        subscriptionContractId: contract.id,
      });

    return {
      status: contract.status,
      alreadyValidated: alreadyValidated && activated,
      mobilityIdentityId,
    };
  }
}
