import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CgvuPdfGenerator } from '../../../../infrastructure/yousign/cgvu-pdf.generator';
import { YousignClient } from '../../../../infrastructure/yousign/yousign.client';
import { ContractStatus } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';
import { CgvuAcceptanceRepository } from '../../domain/cgvu-acceptance.repository';

@Injectable()
export class SignContractUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly cgvuRepo: CgvuAcceptanceRepository,
    private readonly yousign: YousignClient,
    private readonly pdfGenerator: CgvuPdfGenerator,
  ) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<{ signatureLink: string | null }> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    if (
      contract.status !== ContractStatus.EN_ATTENTE_DE_SIGNATURE_PAYEUR &&
      contract.status !== ContractStatus.EN_ATTENTE_DE_JUSTIFICATIF
    ) {
      throw new BadRequestException(
        `Le contrat ne peut pas être signé dans son état actuel : ${contract.status}`,
      );
    }

    const pdfBuffer = await this.pdfGenerator.generate({
      productCode: contract.productCode,
      cgvuVersion: contract.cgvuVersion,
      signerName: `${contract.signerFirstName} ${contract.signerLastName}`,
      contractId: contract.id,
    });

    const result = await this.yousign.createAndActivateSignatureRequest({
      name: `CGVU ${contract.productCode} — ${contract.id.slice(0, 8)}`,
      externalId: contract.id,
      pdfBuffer,
      pdfFilename: `cgvu-${contract.productCode}.pdf`,
      signers: [
        {
          firstName: contract.signerFirstName,
          lastName: contract.signerLastName,
          email: contract.signerEmail,
        },
      ],
    });

    const signatureLink = result.signers[0]?.signatureLink ?? null;
    contract.startSignature(result.id, signatureLink);
    await this.contractRepo.save(contract);

    return { signatureLink };
  }
}
