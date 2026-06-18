import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../domain/contract';
import { ContractRepository } from '../domain/contract.repository';
import { ContractOrmEntity } from './contract.orm-entity';

@Injectable()
export class TypeOrmContractRepository extends ContractRepository {
  constructor(
    @InjectRepository(ContractOrmEntity)
    private readonly orm: Repository<ContractOrmEntity>,
  ) {
    super();
  }

  async save(contract: Contract): Promise<Contract> {
    const saved = await this.orm.save(this.toOrm(contract));
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Contract | null> {
    const e = await this.orm.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async findByUserId(userId: string): Promise<Contract[]> {
    const entities = await this.orm.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByYousignSignatureRequestId(
    signatureRequestId: string,
  ): Promise<Contract | null> {
    const e = await this.orm.findOne({
      where: { yousignSignatureRequestId: signatureRequestId },
    });
    return e ? this.toDomain(e) : null;
  }

  private toDomain(e: ContractOrmEntity): Contract {
    return new Contract(
      e.id,
      e.userId,
      e.productCode,
      e.status,
      e.holderFirstName,
      e.holderLastName,
      e.holderEmail,
      e.payerFirstName,
      e.payerLastName,
      e.payerEmail,
      e.legalRepEmail,
      e.yousignSignatureRequestId,
      e.yousignSignatureLink,
      e.cgvuVersion,
      e.createdAt,
      e.updatedAt,
    );
  }

  private toOrm(c: Contract): ContractOrmEntity {
    const e = new ContractOrmEntity();
    e.id = c.id;
    e.userId = c.userId;
    e.productCode = c.productCode;
    e.status = c.status;
    e.holderFirstName = c.holderFirstName;
    e.holderLastName = c.holderLastName;
    e.holderEmail = c.holderEmail;
    e.payerFirstName = c.payerFirstName;
    e.payerLastName = c.payerLastName;
    e.payerEmail = c.payerEmail;
    e.legalRepEmail = c.legalRepEmail;
    e.yousignSignatureRequestId = c.yousignSignatureRequestId;
    e.yousignSignatureLink = c.yousignSignatureLink;
    e.cgvuVersion = c.cgvuVersion;
    return e;
  }
}
