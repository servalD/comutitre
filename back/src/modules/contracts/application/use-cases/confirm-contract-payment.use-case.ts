import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SyncSubscriptionPaymentToProfileUseCase } from '../../../mobility/application/use-cases/sync-subscription-payment-to-profile.use-case';
import { ContractStatus } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';

export interface ConfirmContractPaymentResult {
  status: string;
  alreadyConfirmed: boolean;
  mobilityIdentityId: string | null;
}

@Injectable()
export class ConfirmContractPaymentUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly syncToProfile: SyncSubscriptionPaymentToProfileUseCase,
  ) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<ConfirmContractPaymentResult> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== userId) {
      throw new ForbiddenException('Acces refuse');
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
        `Le paiement ne peut pas etre confirme dans l'etat actuel : ${contract.status}`,
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
