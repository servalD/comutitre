import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnomalyCase } from '../domain/anomaly-case';
import {
  AnomalyCaseRepository,
  CreateAnomalyCaseParams,
} from '../domain/anomaly-case.repository';
import { AnomalyStatus } from '../domain/enums/anomaly-status.enum';
import { AnomalyCaseOrmEntity } from './anomaly-case.orm-entity';

@Injectable()
export class TypeOrmAnomalyCaseRepository extends AnomalyCaseRepository {
  constructor(
    @InjectRepository(AnomalyCaseOrmEntity)
    private readonly repository: Repository<AnomalyCaseOrmEntity>,
  ) {
    super();
  }

  async create(params: CreateAnomalyCaseParams): Promise<AnomalyCase> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      transportRightId: params.transportRightId,
      supportId: params.supportId,
      type: params.type,
      severity: params.severity,
      status: (params.status ?? AnomalyStatus.OPEN) as AnomalyStatus,
      summary: params.summary,
    });
    return this.toDomain(await this.repository.save(entity));
  }

  async listOpen(): Promise<AnomalyCase[]> {
    const entities = await this.repository.find({
      where: { status: AnomalyStatus.OPEN },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  private toDomain(entity: AnomalyCaseOrmEntity): AnomalyCase {
    return new AnomalyCase(
      entity.id,
      entity.mobilityIdentityId,
      entity.transportRightId,
      entity.supportId,
      entity.type,
      entity.severity,
      entity.status,
      entity.summary,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
