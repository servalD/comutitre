import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Address } from '../domain/address';
import { Contract } from '../domain/contract';
import { Document } from '../domain/document';
import { IdentityStatus } from '../domain/enums/identity-status.enum';
import { Profile } from '../domain/enums/profile.enum';
import { RelationshipType } from '../domain/enums/relationship-type.enum';
import { RelationshipStatus } from '../domain/enums/relationship-status.enum';
import { MobilityIdentity } from '../domain/mobility-identity';
import { PermissionSet } from '../domain/permission-set';
import { Relationship } from '../domain/relationship';
import { Support } from '../domain/support';
import { TimelineEvent } from '../domain/timeline-event';

export class AddressResponse {
  @ApiPropertyOptional()
  street?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  country?: string;
}

export class MobilityIdentityResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ format: 'date' })
  birthDate: string;

  @ApiProperty()
  calculatedAge: number;

  @ApiPropertyOptional({ nullable: true })
  photoUrl: string | null;

  @ApiPropertyOptional({ type: AddressResponse, nullable: true })
  address: Address | null;

  @ApiProperty({ enum: Profile })
  currentProfile: Profile;

  @ApiProperty({ enum: IdentityStatus })
  status: IdentityStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class PermissionSetResponse implements PermissionSet {
  @ApiProperty()
  canView: boolean;

  @ApiProperty()
  canEditIdentity: boolean;

  @ApiProperty()
  canSubscribe: boolean;

  @ApiProperty()
  canPay: boolean;

  @ApiProperty()
  canManageDocuments: boolean;

  @ApiProperty()
  canManageSupport: boolean;

  @ApiProperty()
  canTransferOwnership: boolean;

  @ApiProperty()
  canViewHistory: boolean;
}

export class RelationshipResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  accountId: string;

  @ApiProperty({ format: 'uuid' })
  mobilityIdentityId: string;

  @ApiProperty({ enum: RelationshipType })
  relationshipType: RelationshipType;

  @ApiProperty({ type: PermissionSetResponse })
  permissions: PermissionSetResponse;

  @ApiProperty({ enum: RelationshipStatus })
  status: RelationshipStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  revokedAt: string | null;
}

export class MobilityIdentityWithRelationshipsResponse extends MobilityIdentityResponse {
  @ApiProperty({ type: RelationshipResponse, isArray: true })
  relationships: RelationshipResponse[];
}

export class ContractResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  mobilityIdentityId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  payerAccountId: string | null;

  @ApiProperty()
  productType: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ format: 'date-time' })
  validFrom: string;

  @ApiProperty({ format: 'date-time' })
  validTo: string;

  @ApiProperty()
  renewalMode: string;

  @ApiProperty()
  currentTariff: number;

  @ApiPropertyOptional({ nullable: true })
  cgvVersionAccepted: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class DocumentResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  mobilityIdentityId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  contractId: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ nullable: true })
  refusalReason: string | null;

  @ApiProperty({ format: 'date-time' })
  uploadedAt: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  verifiedAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  verifiedBy: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class SupportResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  mobilityIdentityId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  contractId: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ nullable: true })
  publicKey: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  activatedAt: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  revokedAt: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  expiresAt: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  lastUsedAt: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class TimelineEventResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  mobilityIdentityId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  contractId: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  supportId: string | null;

  @ApiProperty()
  actorType: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  actorId: string | null;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional({ nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}

export const toMobilityIdentityResponse = (
  identity: MobilityIdentity,
): MobilityIdentityResponse => ({
  id: identity.id,
  firstName: identity.firstName,
  lastName: identity.lastName,
  birthDate: identity.birthDate.toISOString().slice(0, 10),
  calculatedAge: identity.calculatedAge,
  photoUrl: identity.photoUrl,
  address: identity.address,
  currentProfile: identity.currentProfile,
  status: identity.status,
  createdAt: identity.createdAt.toISOString(),
  updatedAt: identity.updatedAt.toISOString(),
});

export const toRelationshipResponse = (
  relationship: Relationship,
): RelationshipResponse => ({
  id: relationship.id,
  accountId: relationship.accountId,
  mobilityIdentityId: relationship.mobilityIdentityId,
  relationshipType: relationship.relationshipType,
  permissions: relationship.permissions,
  status: relationship.status,
  createdAt: relationship.createdAt.toISOString(),
  revokedAt: relationship.revokedAt?.toISOString() ?? null,
});

export const toContractResponse = (contract: Contract): ContractResponse => ({
  id: contract.id,
  mobilityIdentityId: contract.mobilityIdentityId,
  payerAccountId: contract.payerAccountId,
  productType: contract.productType,
  status: contract.status,
  validFrom: contract.validFrom.toISOString(),
  validTo: contract.validTo.toISOString(),
  renewalMode: contract.renewalMode,
  currentTariff: contract.currentTariff,
  cgvVersionAccepted: contract.cgvVersionAccepted,
  createdAt: contract.createdAt.toISOString(),
  updatedAt: contract.updatedAt.toISOString(),
});

export const toDocumentResponse = (document: Document): DocumentResponse => ({
  id: document.id,
  mobilityIdentityId: document.mobilityIdentityId,
  contractId: document.contractId,
  type: document.type,
  status: document.status,
  refusalReason: document.refusalReason,
  uploadedAt: document.uploadedAt.toISOString(),
  verifiedAt: document.verifiedAt?.toISOString() ?? null,
  verifiedBy: document.verifiedBy,
  createdAt: document.createdAt.toISOString(),
  updatedAt: document.updatedAt.toISOString(),
});

export const toSupportResponse = (support: Support): SupportResponse => ({
  id: support.id,
  mobilityIdentityId: support.mobilityIdentityId,
  contractId: support.contractId,
  type: support.type,
  status: support.status,
  publicKey: support.publicKey,
  activatedAt: support.activatedAt?.toISOString() ?? null,
  revokedAt: support.revokedAt?.toISOString() ?? null,
  expiresAt: support.expiresAt?.toISOString() ?? null,
  lastUsedAt: support.lastUsedAt?.toISOString() ?? null,
  createdAt: support.createdAt.toISOString(),
  updatedAt: support.updatedAt.toISOString(),
});

export const toTimelineEventResponse = (
  event: TimelineEvent,
): TimelineEventResponse => ({
  id: event.id,
  mobilityIdentityId: event.mobilityIdentityId,
  contractId: event.contractId,
  supportId: event.supportId,
  actorType: event.actorType,
  actorId: event.actorId,
  type: event.type,
  metadata: event.metadata,
  createdAt: event.createdAt.toISOString(),
});
