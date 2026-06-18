import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimelineEvent } from '../domain/timeline-event';
import {
  AppendTimelineEventParams,
  TimelineEventRepository,
} from '../domain/timeline-event.repository';
import { TimelineEventOrmEntity } from './timeline-event.orm-entity';

@Injectable()
export class TypeOrmTimelineEventRepository extends TimelineEventRepository {
  constructor(
    @InjectRepository(TimelineEventOrmEntity)
    private readonly repository: Repository<TimelineEventOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<TimelineEvent | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<TimelineEvent[]> {
    const entities = await this.repository.find({
      where: { mobilityIdentityId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async append(params: AppendTimelineEventParams): Promise<TimelineEvent> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      contractId: params.contractId ?? null,
      supportId: params.supportId ?? null,
      actorType: params.actorType,
      actorId: params.actorId ?? null,
      type: params.type,
      metadata: params.metadata ?? null,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: TimelineEventOrmEntity): TimelineEvent {
    return new TimelineEvent(
      entity.id,
      entity.mobilityIdentityId,
      entity.contractId,
      entity.supportId,
      entity.actorType,
      entity.actorId,
      entity.type,
      entity.metadata,
      entity.createdAt,
    );
  }
}
