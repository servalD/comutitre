import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import { ContractStatus } from '../../../contracts/domain/contract';
import { JustificatifStatus } from '../../domain/justificatif';
import { JustificatifRepository } from '../../domain/justificatif.repository';

@Injectable()
export class ValidateJustificatifUseCase {
  constructor(
    private readonly repo: JustificatifRepository,
    private readonly contractRepo: ContractRepository,
  ) {}

  async execute(params: {
    justificatifId: string;
    agentId: string;
    motif?: string;
  }) {
    const justificatif = await this.repo.findById(params.justificatifId);
    if (!justificatif) throw new NotFoundException('Justificatif introuvable');

    justificatif.accept(params.agentId, params.motif);
    await this.repo.save(justificatif);

    // Transition contrat si tous les justificatifs du contrat sont acceptés
    await this.tryAdvanceContract(justificatif.contractId);

    return justificatif;
  }

  private async tryAdvanceContract(contractId: string): Promise<void> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) return;

    if (contract.status !== ContractStatus.EN_ATTENTE_DE_JUSTIFICATIF) return;

    const all = await this.repo.findByContractId(contractId);
    const allAccepted = all.every(
      (j) => j.status === JustificatifStatus.ACCEPTE,
    );

    if (allAccepted && all.length > 0) {
      contract.status = ContractStatus.EN_ATTENTE_DE_SIGNATURE_PAYEUR;
      await this.contractRepo.save(contract);
    }
  }
}
