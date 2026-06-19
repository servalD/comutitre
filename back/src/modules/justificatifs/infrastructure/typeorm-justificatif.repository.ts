import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Justificatif,
  JustificatifStatus,
  JustificatifType,
} from '../domain/justificatif';
import { JustificatifRepository } from '../domain/justificatif.repository';
import { JustificatifOrmEntity } from './justificatif.orm-entity';

@Injectable()
export class TypeOrmJustificatifRepository extends JustificatifRepository {
  constructor(
    @InjectRepository(JustificatifOrmEntity)
    private readonly orm: Repository<JustificatifOrmEntity>,
  ) {
    super();
  }

  async save(justificatif: Justificatif): Promise<Justificatif> {
    const entity = this.toOrm(justificatif);
    const saved = await this.orm.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Justificatif | null> {
    const entity = await this.orm.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByContractId(contractId: string): Promise<Justificatif[]> {
    const entities = await this.orm.find({
      where: { contractId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByContractIdAndType(
    contractId: string,
    type: JustificatifType,
  ): Promise<Justificatif | null> {
    const entities = await this.orm.find({
      where: { contractId, type },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    return entities[0] ? this.toDomain(entities[0]) : null;
  }

  async findByYousignVerificationId(
    verificationId: string,
  ): Promise<Justificatif | null> {
    const entity = await this.orm.findOne({
      where: { yousignVerificationId: verificationId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findPending(): Promise<Justificatif[]> {
    const entities = await this.orm.find({
      where: {
        status: In([
          JustificatifStatus.EN_COURS_DE_VERIFICATION,
          JustificatifStatus.PRE_QUALIFIE,
          JustificatifStatus.A_REVOIR,
        ]),
      },
      order: { createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  private toDomain(e: JustificatifOrmEntity): Justificatif {
    return new Justificatif(
      e.id,
      e.contractId,
      e.userId,
      e.type,
      e.status,
      e.filePath,
      e.originalFilename,
      e.yousignVerificationId,
      e.yousignStatus,
      e.yousignStatusCodes ?? [],
      e.agentDecision,
      e.agentMotif,
      e.decidedBy,
      e.decidedAt,
      e.createdAt,
      e.updatedAt,
    );
  }

  private toOrm(j: Justificatif): JustificatifOrmEntity {
    const e = new JustificatifOrmEntity();
    e.id = j.id;
    e.contractId = j.contractId;
    e.userId = j.userId;
    e.type = j.type;
    e.status = j.status;
    e.filePath = j.filePath;
    e.originalFilename = j.originalFilename;
    e.yousignVerificationId = j.yousignVerificationId;
    e.yousignStatus = j.yousignStatus;
    e.yousignStatusCodes = j.yousignStatusCodes;
    e.agentDecision = j.agentDecision;
    e.agentMotif = j.agentMotif;
    e.decidedBy = j.decidedBy;
    e.decidedAt = j.decidedAt;
    return e;
  }
}
