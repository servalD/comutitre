import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { YousignClient } from '../../../../infrastructure/yousign/yousign.client';
import { ContractRepository } from '../../domain/contract.repository';

@Injectable()
export class GetSignatureStatusUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly yousign: YousignClient,
  ) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<{ yousignStatus: string | null; signatureLink: string | null }> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');
    if (contract.userId !== userId)
      throw new ForbiddenException('Accès refusé');

    if (!contract.yousignSignatureRequestId) {
      return { yousignStatus: null, signatureLink: null };
    }

    try {
      const sr = await this.yousign.getSignatureRequest(
        contract.yousignSignatureRequestId,
      );
      return {
        yousignStatus: sr.status,
        signatureLink: contract.yousignSignatureLink,
      };
    } catch {
      return {
        yousignStatus: null,
        signatureLink: contract.yousignSignatureLink,
      };
    }
  }
}
