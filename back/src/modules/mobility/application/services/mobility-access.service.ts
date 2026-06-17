import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { RelationshipRepository } from '../../domain/relationship.repository';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { PermissionSet } from '../../domain/permission-set';
import { RelationshipStatus } from '../../domain/enums/relationship-status.enum';

type PermissionKey = keyof PermissionSet;

@Injectable()
export class MobilityAccessService {
  constructor(
    private readonly relationshipRepository: RelationshipRepository,
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
  ) {}

  async assertIdentityExists(mobilityIdentityId: string): Promise<void> {
    const identity =
      await this.mobilityIdentityRepository.findById(mobilityIdentityId);
    if (!identity) {
      throw new NotFoundException('Mobility identity not found');
    }
  }

  async assertPermission(
    user: User,
    mobilityIdentityId: string,
    permission: PermissionKey,
  ): Promise<void> {
    if (user.isAdmin()) {
      return;
    }

    const relationships =
      await this.relationshipRepository.findActiveByAccountAndIdentity(
        user.id,
        mobilityIdentityId,
      );

    const activeRelationships = relationships.filter(
      (relationship) => relationship.status === RelationshipStatus.ACTIVE,
    );

    if (activeRelationships.length === 0) {
      throw new ForbiddenException('No access to this mobility identity');
    }

    const hasPermission = activeRelationships.some(
      (relationship) => relationship.permissions[permission],
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }
}
