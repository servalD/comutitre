import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportRight } from '../domain/transport-right';
import {
  CreateTransportRightParams,
  TransportRightRepository,
} from '../domain/transport-right.repository';
import { TransportRightStatus } from '../domain/enums/transport-right-status.enum';
import { TransportRightOrmEntity } from './transport-right.orm-entity';

@Injectable()
export class TypeOrmTransportRightRepository extends TransportRightRepository {
  constructor(
    @InjectRepository(TransportRightOrmEntity)
    private readonly repository: Repository<TransportRightOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<TransportRight | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<TransportRight[]> {
    const entities = await this.repository.find({
      where: { mobilityIdentityId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(params: CreateTransportRightParams): Promise<TransportRight> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      contractId: params.contractId,
      productType: params.productType,
      status: params.status ?? TransportRightStatus.ACTIVE,
      validFrom: params.validFrom,
      validTo: params.validTo,
      rightCommitment: params.rightCommitment,
    });
    return this.toDomain(await this.repository.save(entity));
  }

  private toDomain(entity: TransportRightOrmEntity): TransportRight {
    return new TransportRight(
      entity.id,
      entity.mobilityIdentityId,
      entity.contractId,
      entity.productType,
      entity.status,
      entity.validFrom,
      entity.validTo,
      entity.rightCommitment,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
