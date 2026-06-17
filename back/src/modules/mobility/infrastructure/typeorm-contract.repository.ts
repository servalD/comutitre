import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../domain/contract';
import {
  ContractRepository,
  CreateContractParams,
} from '../domain/contract.repository';
import { ContractStatus } from '../domain/enums/contract-status.enum';
import { RenewalMode } from '../domain/enums/renewal-mode.enum';
import { ContractOrmEntity } from './contract.orm-entity';

@Injectable()
export class TypeOrmContractRepository extends ContractRepository {
  constructor(
    @InjectRepository(ContractOrmEntity)
    private readonly repository: Repository<ContractOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Contract | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<Contract[]> {
    const entities = await this.repository.find({
      where: { mobilityIdentityId },
      order: { validFrom: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(params: CreateContractParams): Promise<Contract> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      payerAccountId: params.payerAccountId ?? null,
      productType: params.productType,
      status: params.status ?? ContractStatus.DRAFT,
      validFrom: params.validFrom,
      validTo: params.validTo,
      renewalMode: params.renewalMode ?? RenewalMode.MANUAL,
      currentTariff: params.currentTariff,
      cgvVersionAccepted: params.cgvVersionAccepted ?? null,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: ContractOrmEntity): Contract {
    return new Contract(
      entity.id,
      entity.mobilityIdentityId,
      entity.payerAccountId,
      entity.productType,
      entity.status,
      entity.validFrom,
      entity.validTo,
      entity.renewalMode,
      Number(entity.currentTariff),
      entity.cgvVersionAccepted,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
