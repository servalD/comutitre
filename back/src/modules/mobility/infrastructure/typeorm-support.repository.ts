import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from '../domain/support';
import {
  CreateSupportParams,
  SupportRepository,
} from '../domain/support.repository';
import { SupportStatus } from '../domain/enums/support-status.enum';
import { SupportType } from '../domain/enums/support-type.enum';
import { SupportOrmEntity } from './support.orm-entity';

@Injectable()
export class TypeOrmSupportRepository extends SupportRepository {
  constructor(
    @InjectRepository(SupportOrmEntity)
    private readonly repository: Repository<SupportOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Support | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<Support[]> {
    const entities = await this.repository.find({
      where: { mobilityIdentityId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(params: CreateSupportParams): Promise<Support> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      contractId: params.contractId ?? null,
      type: params.type ?? SupportType.PHYSICAL_CARD,
      status: params.status ?? SupportStatus.PENDING_ACTIVATION,
      publicKey: params.publicKey ?? null,
      walletAddress: params.walletAddress ?? null,
      supportCommitment: params.supportCommitment ?? null,
      activatedAt: params.activatedAt ?? null,
      revokedAt: null,
      expiresAt: params.expiresAt ?? null,
      lastUsedAt: null,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async updateStatus(
    id: string,
    status: SupportStatus,
  ): Promise<Support | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }

    entity.status = status;
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: SupportOrmEntity): Support {
    return new Support(
      entity.id,
      entity.mobilityIdentityId,
      entity.contractId,
      entity.type,
      entity.status,
      entity.publicKey,
      entity.walletAddress,
      entity.supportCommitment,
      entity.activatedAt,
      entity.revokedAt,
      entity.expiresAt,
      entity.lastUsedAt,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
