import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractDocumentGateService } from '../../../justificatifs/application/services/contract-document-gate.service';
import { ContractRepository } from '../../domain/contract.repository';

@Injectable()
export class GetContractDocumentsReadinessUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly documentGate: ContractDocumentGateService,
  ) {}

  async execute(contractId: string, userId: string) {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract || contract.userId !== userId) {
      throw new NotFoundException('Contrat introuvable');
    }

    const readiness = await this.documentGate.getReadiness(contractId);
    return (
      readiness ?? {
        complete: false,
        missing: [],
        pending: [],
      }
    );
  }
}
