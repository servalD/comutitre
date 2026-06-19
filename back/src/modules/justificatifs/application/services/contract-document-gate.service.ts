import { Injectable, Logger } from '@nestjs/common';
import { ContractStatus } from '../../../contracts/domain/contract';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import { contractDocumentsComplete } from '../../domain/required-documents';
import { JustificatifRepository } from '../../domain/justificatif.repository';

@Injectable()
export class ContractDocumentGateService {
  private readonly logger = new Logger(ContractDocumentGateService.name);

  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly justificatifRepo: JustificatifRepository,
  ) {}

  async tryAdvanceContract(contractId: string): Promise<boolean> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) return false;

    if (contract.status !== ContractStatus.EN_ATTENTE_DE_JUSTIFICATIF) {
      return false;
    }

    const uploads = await this.justificatifRepo.findByContractId(contractId);
    const readiness = contractDocumentsComplete(contract.productCode, uploads);

    if (!readiness.complete) return false;

    contract.status = ContractStatus.EN_ATTENTE_DE_SIGNATURE_PAYEUR;
    await this.contractRepo.save(contract);
    this.logger.log(
      `Contract ${contractId} advanced to en_attente_de_signature_payeur (all documents ready)`,
    );
    return true;
  }

  async getReadiness(contractId: string) {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) return null;

    const uploads = await this.justificatifRepo.findByContractId(contractId);
    return contractDocumentsComplete(contract.productCode, uploads);
  }
}
