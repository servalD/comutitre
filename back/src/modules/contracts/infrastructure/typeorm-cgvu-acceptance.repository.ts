import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CgvuAcceptance } from '../domain/cgvu-acceptance';
import { CgvuAcceptanceRepository } from '../domain/cgvu-acceptance.repository';
import { CgvuAcceptanceOrmEntity } from './cgvu-acceptance.orm-entity';

@Injectable()
export class TypeOrmCgvuAcceptanceRepository extends CgvuAcceptanceRepository {
  constructor(
    @InjectRepository(CgvuAcceptanceOrmEntity)
    private readonly orm: Repository<CgvuAcceptanceOrmEntity>,
  ) {
    super();
  }

  async save(acceptance: CgvuAcceptance): Promise<CgvuAcceptance> {
    const saved = await this.orm.save(this.toOrm(acceptance));
    return this.toDomain(saved);
  }

  async findByContractId(contractId: string): Promise<CgvuAcceptance[]> {
    const entities = await this.orm.find({
      where: { contractId },
      order: { createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  private toDomain(e: CgvuAcceptanceOrmEntity): CgvuAcceptance {
    return new CgvuAcceptance(
      e.id,
      e.contractId,
      e.productCgvuVersion,
      e.supportCguVersion,
      e.acceptedByUserId,
      e.actorRole,
      e.channel,
      e.yousignSignatureRequestId,
      e.signedAt,
      e.createdAt,
    );
  }

  private toOrm(a: CgvuAcceptance): CgvuAcceptanceOrmEntity {
    const e = new CgvuAcceptanceOrmEntity();
    e.id = a.id;
    e.contractId = a.contractId;
    e.productCgvuVersion = a.productCgvuVersion;
    e.supportCguVersion = a.supportCguVersion;
    e.acceptedByUserId = a.acceptedByUserId;
    e.actorRole = a.actorRole;
    e.channel = a.channel;
    e.yousignSignatureRequestId = a.yousignSignatureRequestId;
    e.signedAt = a.signedAt;
    return e;
  }
}
