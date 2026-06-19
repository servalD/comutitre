import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { YousignClient } from '../../../../infrastructure/yousign/yousign.client';
import {
  ActorRole,
  Contract,
  ContractStatus,
} from '../../domain/contract';
import { CgvuAcceptance } from '../../domain/cgvu-acceptance';
import { CgvuAcceptanceRepository } from '../../domain/cgvu-acceptance.repository';
import { ContractRepository } from '../../domain/contract.repository';

const REVERT_STATUSES = new Set([
  'declined',
  'expired',
  'canceled',
  'cancelled',
  'rejected',
]);

@Injectable()
export class ContractSignatureSyncService {
  private readonly logger = new Logger(ContractSignatureSyncService.name);

  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly cgvuRepo: CgvuAcceptanceRepository,
    private readonly yousign: YousignClient,
  ) {}

  /** Polling fallback when le webhook YouSign n'a pas encore mis à jour le contrat. */
  async syncIfPending(contractId: string): Promise<Contract | null> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract?.yousignSignatureRequestId) return contract;
    if (contract.status !== ContractStatus.SIGNATURE_EN_COURS) return contract;

    try {
      const sr = await this.yousign.getSignatureRequest(
        contract.yousignSignatureRequestId,
      );
      const normalized = sr.status.toLowerCase();

      if (normalized === 'done') {
        await this.recordAcceptanceIfNeeded(contract);
        contract.markAwaitingPayment();
        this.logger.log(
          `Contract ${contract.id} awaiting payment via YouSign polling`,
        );
      } else if (REVERT_STATUSES.has(normalized)) {
        contract.status = ContractStatus.EN_ATTENTE_DE_SIGNATURE_PAYEUR;
        contract.updatedAt = new Date();
        this.logger.log(
          `Contract ${contract.id} signature ${normalized} — reverted to en_attente_de_signature_payeur`,
        );
      } else {
        const link =
          sr.signers.find((s) => s.signatureLink)?.signatureLink ?? null;
        if (link) {
          contract.yousignSignatureLink = link;
        }
      }

      await this.contractRepo.save(contract);
    } catch (err) {
      this.logger.debug(
        `YouSign signature poll skipped for ${contractId}: ${String(err)}`,
      );
    }

    return this.contractRepo.findById(contractId);
  }

  private async recordAcceptanceIfNeeded(contract: Contract): Promise<void> {
    const srId = contract.yousignSignatureRequestId;
    if (!srId) return;

    const existing = await this.cgvuRepo.findByContractId(contract.id);
    if (existing.some((a) => a.yousignSignatureRequestId === srId)) return;

    const acceptance = new CgvuAcceptance(
      randomUUID(),
      contract.id,
      contract.cgvuVersion,
      null,
      contract.userId,
      ActorRole.HOLDER,
      'web',
      srId,
      new Date(),
      new Date(),
    );
    await this.cgvuRepo.save(acceptance);
  }
}
