import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CgvuPdfGenerator } from '../../../../infrastructure/yousign/cgvu-pdf.generator';
import { YousignClient } from '../../../../infrastructure/yousign/yousign.client';
import { ContractDocumentGateService } from '../../../justificatifs/application/services/contract-document-gate.service';
import { ContractStatus } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractSignatureSyncService } from '../services/contract-signature-sync.service';

export interface SignContractResult {
  signatureLink: string | null;
  contractStatus?: string;
  alreadySigned?: boolean;
}

@Injectable()
export class SignContractUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly yousign: YousignClient,
    private readonly pdfGenerator: CgvuPdfGenerator,
    private readonly documentGate: ContractDocumentGateService,
    private readonly signatureSync: ContractSignatureSyncService,
  ) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<SignContractResult> {
    let contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    const readiness = await this.documentGate.getReadiness(contractId);
    if (!readiness?.complete) {
      throw new BadRequestException(
        'Tous les justificatifs requis doivent être conformes avant la signature.',
      );
    }

    if (contract.status === ContractStatus.SIGNATURE_EN_COURS) {
      const synced = await this.signatureSync.syncIfPending(contractId);
      contract = synced ?? contract;

      if (contract.status === ContractStatus.ACTIF) {
        return {
          signatureLink: null,
          contractStatus: contract.status,
          alreadySigned: true,
        };
      }

      if (contract.status === ContractStatus.EN_ATTENTE_PAIEMENT) {
        return {
          signatureLink: null,
          contractStatus: contract.status,
          alreadySigned: true,
        };
      }

      if (contract.status === ContractStatus.SIGNATURE_EN_COURS) {
        return {
          signatureLink: contract.yousignSignatureLink,
          contractStatus: contract.status,
        };
      }
    }

    if (contract.status !== ContractStatus.EN_ATTENTE_DE_SIGNATURE_PAYEUR) {
      if (contract.status === ContractStatus.EN_ATTENTE_DE_JUSTIFICATIF) {
        await this.documentGate.tryAdvanceContract(contractId);
        const refreshed = await this.contractRepo.findById(contractId);
        if (
          refreshed?.status !== ContractStatus.EN_ATTENTE_DE_SIGNATURE_PAYEUR
        ) {
          throw new BadRequestException(
            'Les justificatifs ne sont pas encore tous conformes.',
          );
        }
        contract = refreshed;
      } else if (contract.status === ContractStatus.ACTIF) {
        return {
          signatureLink: null,
          contractStatus: contract.status,
          alreadySigned: true,
        };
      } else if (contract.status === ContractStatus.EN_ATTENTE_PAIEMENT) {
        return {
          signatureLink: null,
          contractStatus: contract.status,
          alreadySigned: true,
        };
      } else if (
        contract.status === ContractStatus.EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE
      ) {
        return {
          signatureLink: null,
          contractStatus: contract.status,
          alreadySigned: true,
        };
      } else {
        throw new BadRequestException(
          `Le contrat ne peut pas être signé dans son état actuel : ${contract.status}`,
        );
      }
    }

    const activeContract = await this.contractRepo.findById(contractId);
    if (!activeContract) throw new NotFoundException('Contrat introuvable');

    const pdfBuffer = await this.pdfGenerator.generate({
      productCode: activeContract.productCode,
      cgvuVersion: activeContract.cgvuVersion,
      signerName: `${activeContract.signerFirstName} ${activeContract.signerLastName}`,
      contractId: activeContract.id,
    });

    const result = await this.yousign.createAndActivateSignatureRequest({
      name: `CGVU ${activeContract.productCode} — ${activeContract.id.slice(0, 8)}`,
      externalId: activeContract.id,
      pdfBuffer,
      pdfFilename: `cgvu-${activeContract.productCode}.pdf`,
      signers: [
        {
          firstName: activeContract.signerFirstName,
          lastName: activeContract.signerLastName,
          email: activeContract.signerEmail,
        },
      ],
    });

    const signatureLink = result.signers[0]?.signatureLink ?? null;
    activeContract.startSignature(result.id, signatureLink);
    await this.contractRepo.save(activeContract);

    return { signatureLink };
  }
}
