import { PermissionSet } from './permission-set';
import { RelationshipStatus } from './enums/relationship-status.enum';
import { RelationshipType } from './enums/relationship-type.enum';

export class Relationship {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly mobilityIdentityId: string,
    public readonly relationshipType: RelationshipType,
    public readonly permissions: PermissionSet,
    public readonly status: RelationshipStatus,
    public readonly createdAt: Date,
    public readonly revokedAt: Date | null,
  ) {}
}
