import { Injectable, Logger } from '@nestjs/common';
import { YousignClient } from '../../../../infrastructure/yousign/yousign.client';
import {
  Justificatif,
  JustificatifStatus,
  JustificatifType,
} from '../../domain/justificatif';
import { ContractDocumentGateService } from '../services/contract-document-gate.service';
import { JustificatifRepository } from '../../domain/justificatif.repository';

const TERMINAL_YOUSIGN_STATUSES = new Set([
  'verified',
  'failed',
  'inconclusive',
  'done',
]);

@Injectable()
export class ListJustificatifsUseCase {
  private readonly logger = new Logger(ListJustificatifsUseCase.name);

  constructor(
    private readonly repo: JustificatifRepository,
    private readonly yousign: YousignClient,
    private readonly documentGate: ContractDocumentGateService,
  ) {}

  async execute(contractId: string): Promise<Justificatif[]> {
    const items = await this.repo.findByContractId(contractId);
    await Promise.all(items.map((j) => this.syncPendingVerification(j)));
    return this.repo.findByContractId(contractId);
  }

  async executePending(): Promise<Justificatif[]> {
    const items = await this.repo.findPending();
    await Promise.all(items.map((j) => this.syncPendingVerification(j)));
    return this.repo.findPending();
  }

  /** Polling fallback when le webhook YouSign n'a pas encore mis à jour le statut. */
  private async syncPendingVerification(
    justificatif: Justificatif,
  ): Promise<void> {
    if (justificatif.status !== JustificatifStatus.EN_COURS_DE_VERIFICATION) {
      return;
    }
    if (!justificatif.yousignVerificationId) return;
    if (justificatif.yousignVerificationId.startsWith('sandbox-local-')) return;

    try {
      const result =
        justificatif.type === JustificatifType.PIECE_IDENTITE
          ? await this.yousign.getIdentityDocumentVerification(
              justificatif.yousignVerificationId,
            )
          : await this.yousign.getProofOfAddressVerification(
              justificatif.yousignVerificationId,
            );

      if (!TERMINAL_YOUSIGN_STATUSES.has(result.status)) return;

      justificatif.applyYousignResult(result.status, result.statusCodes);
      await this.repo.save(justificatif);
      await this.documentGate.tryAdvanceContract(justificatif.contractId);
      this.logger.log(
        `Justificatif ${justificatif.id} synced via polling → ${justificatif.status}`,
      );
    } catch (err) {
      this.logger.debug(
        `YouSign poll skipped for ${justificatif.id}: ${String(err)}`,
      );
    }
  }
}
