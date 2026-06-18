import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Contract } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';

@Injectable()
export class GetContractUseCase {
  constructor(private readonly repo: ContractRepository) {}

  async execute(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.repo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return contract;
  }

  async executeForUser(userId: string): Promise<Contract[]> {
    return this.repo.findByUserId(userId);
  }
}
