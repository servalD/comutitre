import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SyncSubscriptionPaymentToProfileUseCase } from '../../../mobility/application/use-cases/sync-subscription-payment-to-profile.use-case';
import { ContractStatus } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';

export interface ConfirmMockPaymentResult {
  status: string;
  alreadyConfirmed: boolean;
  mobilityIdentityId: string | null;
}

@Injectable()
export class ConfirmMockPaymentUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly syncToProfile: SyncSubscriptionPaymentToProfileUseCase,
  ) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<ConfirmMockPaymentResult> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    let alreadyConfirmed = false;

    if (
      contract.status === ContractStatus.EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE
    ) {
      alreadyConfirmed = true;
    } else if (
      contract.status === ContractStatus.EN_ATTENTE_PAIEMENT ||
      contract.status === ContractStatus.ACTIF
    ) {
      contract.status = ContractStatus.EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE;
      contract.updatedAt = new Date();
      await this.contractRepo.save(contract);
    } else {
      throw new BadRequestException(
        `Le paiement ne peut pas être confirmé dans l'état actuel : ${contract.status}`,
      );
    }

    const { mobilityIdentityId } = await this.syncToProfile.execute({
      userId,
      holderFirstName: contract.holderFirstName,
      holderLastName: contract.holderLastName,
      productCode: contract.productCode,
      subscriptionContractId: contract.id,
    });

    return {
      status: contract.status,
      alreadyConfirmed,
      mobilityIdentityId,
    };
  }
}
