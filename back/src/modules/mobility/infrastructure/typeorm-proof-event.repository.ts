import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProofEvent } from '../domain/proof-event';
import {
  AppendProofEventParams,
  ProofEventRepository,
} from '../domain/proof-event.repository';
import { ProofEventOrmEntity } from './proof-event.orm-entity';

@Injectable()
export class TypeOrmProofEventRepository extends ProofEventRepository {
  constructor(
    @InjectRepository(ProofEventOrmEntity)
    private readonly repository: Repository<ProofEventOrmEntity>,
  ) {
    super();
  }

  async append(params: AppendProofEventParams): Promise<ProofEvent> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      transportRightId: params.transportRightId,
      supportId: params.supportId ?? null,
      type: params.type,
      eventHash: params.eventHash,
      previousHash: params.previousHash ?? null,
      payload: params.payload ?? null,
    });
    return this.toDomain(await this.repository.save(entity));
  }

  async listByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<ProofEvent[]> {
    const entities = await this.repository.find({
      where: { mobilityIdentityId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findLatest(): Promise<ProofEvent | null> {
    const entity = await this.repository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: ProofEventOrmEntity): ProofEvent {
    return new ProofEvent(
      entity.id,
      entity.mobilityIdentityId,
      entity.transportRightId,
      entity.supportId,
      entity.type,
      entity.eventHash,
      entity.previousHash,
      entity.payload,
      entity.createdAt,
    );
  }
}
