import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { YousignClient } from '../../../../infrastructure/yousign/yousign.client';
import { ContractStatus } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractSignatureSyncService } from '../services/contract-signature-sync.service';

export interface SignatureStatusResult {
  yousignStatus: string | null;
  signatureLink: string | null;
  contractStatus: string;
  alreadySigned: boolean;
  awaitingPayment: boolean;
  awaitingValidation: boolean;
}

@Injectable()
export class GetSignatureStatusUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly yousign: YousignClient,
    private readonly signatureSync: ContractSignatureSyncService,
  ) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<SignatureStatusResult> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');
    if (contract.userId !== userId)
      throw new ForbiddenException('Accès refusé');

    const synced = await this.signatureSync.syncIfPending(contractId);
    const current = synced ?? contract;
    const awaitingPayment =
      current.status === ContractStatus.EN_ATTENTE_PAIEMENT;
    const awaitingValidation =
      current.status === ContractStatus.EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE ||
      current.status === ContractStatus.ACTIF;
    const alreadySigned =
      awaitingPayment ||
      awaitingValidation ||
      current.status === ContractStatus.ACTIF;

    if (!current.yousignSignatureRequestId) {
      return {
        yousignStatus: null,
        signatureLink: null,
        contractStatus: current.status,
        alreadySigned,
        awaitingPayment,
        awaitingValidation,
      };
    }

    try {
      const sr = await this.yousign.getSignatureRequest(
        current.yousignSignatureRequestId,
      );
      return {
        yousignStatus: sr.status,
        signatureLink: current.yousignSignatureLink,
        contractStatus: current.status,
        alreadySigned,
        awaitingPayment,
        awaitingValidation,
      };
    } catch {
      return {
        yousignStatus: null,
        signatureLink: current.yousignSignatureLink,
        contractStatus: current.status,
        alreadySigned,
        awaitingPayment,
        awaitingValidation,
      };
    }
  }
}
