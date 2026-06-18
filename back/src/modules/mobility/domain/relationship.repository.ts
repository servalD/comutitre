import { PermissionSet } from './permission-set';
import { RelationshipStatus } from './enums/relationship-status.enum';
import { RelationshipType } from './enums/relationship-type.enum';
import { Relationship } from './relationship';

export interface CreateRelationshipParams {
  accountId: string;
  mobilityIdentityId: string;
  relationshipType: RelationshipType;
  permissions: PermissionSet;
  status?: RelationshipStatus;
}

export abstract class RelationshipRepository {
  abstract findById(id: string): Promise<Relationship | null>;
  abstract findByAccountId(accountId: string): Promise<Relationship[]>;
  abstract findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<Relationship[]>;
  abstract findActiveByAccountAndIdentity(
    accountId: string,
    mobilityIdentityId: string,
  ): Promise<Relationship[]>;
  abstract create(params: CreateRelationshipParams): Promise<Relationship>;
  abstract revoke(id: string): Promise<Relationship>;
}
