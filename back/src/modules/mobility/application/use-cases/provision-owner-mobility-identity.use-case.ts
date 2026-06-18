import { Injectable, Logger } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { MobilityIdentity } from '../../domain/mobility-identity';
import { RelationshipStatus } from '../../domain/enums/relationship-status.enum';
import { RelationshipType } from '../../domain/enums/relationship-type.enum';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { RelationshipRepository } from '../../domain/relationship.repository';
import { DefaultPermissionsService } from '../services/default-permissions.service';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

export interface ProvisionOwnerIdentityInput {
  firstName: string;
  lastName: string;
  birthDate: Date;
}

/**
 * Ensures the authenticated account has exactly one owner mobility identity.
 * Idempotent: skips creation when an active owner relationship already exists.
 */
@Injectable()
export class ProvisionOwnerMobilityIdentityUseCase {
  private readonly logger = new Logger(
    ProvisionOwnerMobilityIdentityUseCase.name,
  );

  constructor(
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly relationshipRepository: RelationshipRepository,
    private readonly defaultPermissions: DefaultPermissionsService,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    user: User,
    input: ProvisionOwnerIdentityInput,
  ): Promise<MobilityIdentity> {
    const existing = await this.findExistingOwnerIdentity(user.id);
    if (existing) {
      return existing;
    }

    const identity = await this.mobilityIdentityRepository.create({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      birthDate: input.birthDate,
    });

    await this.relationshipRepository.create({
      accountId: user.id,
      mobilityIdentityId: identity.id,
      relationshipType: RelationshipType.OWNER,
      permissions: this.defaultPermissions.forType(RelationshipType.OWNER),
    });

    await this.timelineRecorder.recordIdentityCreated(identity.id, user.id, {
      firstName: identity.firstName,
      lastName: identity.lastName,
      currentProfile: identity.currentProfile,
    });

    await this.timelineRecorder.recordRelationshipCreated(
      identity.id,
      user.id,
      {
        relationshipType: RelationshipType.OWNER,
        accountId: user.id,
      },
    );

    this.logger.log(
      `Owner mobility identity provisioned for account ${user.id}: ${identity.id}`,
    );

    return identity;
  }

  private async findExistingOwnerIdentity(
    accountId: string,
  ): Promise<MobilityIdentity | null> {
    const relationships =
      await this.relationshipRepository.findByAccountId(accountId);

    const ownerRelationship = relationships.find(
      (relationship) =>
        relationship.relationshipType === RelationshipType.OWNER &&
        relationship.status === RelationshipStatus.ACTIVE,
    );

    if (!ownerRelationship) {
      return null;
    }

    return this.mobilityIdentityRepository.findById(
      ownerRelationship.mobilityIdentityId,
    );
  }
}
