import { DocumentStatus } from './enums/document-status.enum';
import { DocumentType } from './enums/document-type.enum';

export class Document {
  constructor(
    public readonly id: string,
    public readonly mobilityIdentityId: string,
    public readonly contractId: string | null,
    public readonly type: DocumentType,
    public readonly status: DocumentStatus,
    public readonly refusalReason: string | null,
    public readonly uploadedAt: Date,
    public readonly verifiedAt: Date | null,
    public readonly verifiedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
