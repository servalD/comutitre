import { Injectable, NotFoundException } from '@nestjs/common';
import { JustificatifRepository } from '../../domain/justificatif.repository';
import { ContractDocumentGateService } from '../services/contract-document-gate.service';

@Injectable()
export class ValidateJustificatifUseCase {
  constructor(
    private readonly repo: JustificatifRepository,
    private readonly documentGate: ContractDocumentGateService,
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

    await this.documentGate.tryAdvanceContract(justificatif.contractId);

    return justificatif;
  }
}
