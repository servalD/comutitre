import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Relationship } from '../domain/relationship';
import {
  CreateRelationshipParams,
  RelationshipRepository,
} from '../domain/relationship.repository';
import { RelationshipStatus } from '../domain/enums/relationship-status.enum';
import { RelationshipOrmEntity } from './relationship.orm-entity';

@Injectable()
export class TypeOrmRelationshipRepository extends RelationshipRepository {
  constructor(
    @InjectRepository(RelationshipOrmEntity)
    private readonly repository: Repository<RelationshipOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Relationship | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByAccountId(accountId: string): Promise<Relationship[]> {
    const entities = await this.repository.find({
      where: { accountId, status: RelationshipStatus.ACTIVE },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<Relationship[]> {
    const entities = await this.repository.find({
      where: { mobilityIdentityId, status: RelationshipStatus.ACTIVE },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findActiveByAccountAndIdentity(
    accountId: string,
    mobilityIdentityId: string,
  ): Promise<Relationship[]> {
    const entities = await this.repository.find({
      where: {
        accountId,
        mobilityIdentityId,
        status: RelationshipStatus.ACTIVE,
      },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(params: CreateRelationshipParams): Promise<Relationship> {
    const entity = this.repository.create({
      accountId: params.accountId,
      mobilityIdentityId: params.mobilityIdentityId,
      relationshipType: params.relationshipType,
      permissions: params.permissions,
      status: params.status ?? RelationshipStatus.ACTIVE,
      revokedAt: null,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async revoke(id: string): Promise<Relationship> {
    const entity = await this.repository.findOneOrFail({ where: { id } });
    entity.status = RelationshipStatus.REVOKED;
    entity.revokedAt = new Date();
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: RelationshipOrmEntity): Relationship {
    return new Relationship(
      entity.id,
      entity.accountId,
      entity.mobilityIdentityId,
      entity.relationshipType,
      entity.permissions,
      entity.status,
      entity.createdAt,
      entity.revokedAt,
    );
  }
}
