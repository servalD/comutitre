import { Injectable } from '@nestjs/common';
import { CgvuPdfGenerator } from '../../../../infrastructure/yousign/cgvu-pdf.generator';
import { GetContractUseCase } from './get-contract.use-case';

@Injectable()
export class GetCgvuPreviewUseCase {
  constructor(
    private readonly getContract: GetContractUseCase,
    private readonly pdfGenerator: CgvuPdfGenerator,
  ) {}

  async execute(contractId: string, userId: string): Promise<Buffer> {
    const contract = await this.getContract.execute(contractId, userId);

    return this.pdfGenerator.generate({
      productCode: contract.productCode,
      cgvuVersion: contract.cgvuVersion,
      signerName: `${contract.signerFirstName} ${contract.signerLastName}`,
      contractId: contract.id,
    });
  }
}
