import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Contract, ContractStatus } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractSignatureSyncService } from '../services/contract-signature-sync.service';

@Injectable()
export class GetContractUseCase {
  constructor(
    private readonly repo: ContractRepository,
    private readonly signatureSync: ContractSignatureSyncService,
  ) {}

  async execute(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.repo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    if (contract.status === ContractStatus.SIGNATURE_EN_COURS) {
      const synced = await this.signatureSync.syncIfPending(contractId);
      return synced ?? contract;
    }

    return contract;
  }

  async executeForUser(userId: string): Promise<Contract[]> {
    return this.repo.findByUserId(userId);
  }
}
