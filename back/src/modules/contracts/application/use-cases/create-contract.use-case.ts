import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Contract, ContractStatus } from '../../domain/contract';
import { ContractRepository } from '../../domain/contract.repository';
import { CreateContractRequest } from '../dto/create-contract.request';

const CURRENT_CGVU_VERSION = '2025-v1';

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly repo: ContractRepository) {}

  async execute(userId: string, req: CreateContractRequest): Promise<Contract> {
    const contract = new Contract(
      randomUUID(),
      userId,
      req.productCode,
      ContractStatus.EN_ATTENTE_DE_JUSTIFICATIF,
      req.holderFirstName,
      req.holderLastName,
      req.holderEmail,
      req.payerFirstName ?? null,
      req.payerLastName ?? null,
      req.payerEmail ?? null,
      req.legalRepEmail ?? null,
      null,
      null,
      CURRENT_CGVU_VERSION,
      new Date(),
      new Date(),
    );

    return this.repo.save(contract);
  }
}
