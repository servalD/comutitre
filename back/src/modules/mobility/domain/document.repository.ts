import { DocumentStatus } from './enums/document-status.enum';
import { DocumentType } from './enums/document-type.enum';
import { Document } from './document';

export interface CreateDocumentParams {
  mobilityIdentityId: string;
  contractId?: string | null;
  type: DocumentType;
  status?: DocumentStatus;
  refusalReason?: string | null;
}

export abstract class DocumentRepository {
  abstract findById(id: string): Promise<Document | null>;
  abstract findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<Document[]>;
  abstract create(params: CreateDocumentParams): Promise<Document>;
}
