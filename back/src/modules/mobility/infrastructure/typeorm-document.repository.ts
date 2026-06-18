import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../domain/document';
import {
  CreateDocumentParams,
  DocumentRepository,
} from '../domain/document.repository';
import { DocumentStatus } from '../domain/enums/document-status.enum';
import { DocumentOrmEntity } from './document.orm-entity';

@Injectable()
export class TypeOrmDocumentRepository extends DocumentRepository {
  constructor(
    @InjectRepository(DocumentOrmEntity)
    private readonly repository: Repository<DocumentOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Document | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<Document[]> {
    const entities = await this.repository.find({
      where: { mobilityIdentityId },
      order: { uploadedAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(params: CreateDocumentParams): Promise<Document> {
    const entity = this.repository.create({
      mobilityIdentityId: params.mobilityIdentityId,
      contractId: params.contractId ?? null,
      type: params.type,
      status: params.status ?? DocumentStatus.UPLOADED,
      refusalReason: params.refusalReason ?? null,
      uploadedAt: new Date(),
      verifiedAt: null,
      verifiedBy: null,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: DocumentOrmEntity): Document {
    return new Document(
      entity.id,
      entity.mobilityIdentityId,
      entity.contractId,
      entity.type,
      entity.status,
      entity.refusalReason,
      entity.uploadedAt,
      entity.verifiedAt,
      entity.verifiedBy,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
