import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { CreateMobilityIdentityRequest } from '../dto/create-mobility-identity.request';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { MobilityIdentity } from '../../domain/mobility-identity';
import { RelationshipRepository } from '../../domain/relationship.repository';
import { RelationshipType } from '../../domain/enums/relationship-type.enum';
import { RelationshipStatus } from '../../domain/enums/relationship-status.enum';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

const OWNER_PERMISSIONS = {
  canView: true,
  canEditIdentity: true,
  canSubscribe: true,
  canPay: true,
  canManageDocuments: true,
  canManageSupport: true,
  canTransferOwnership: true,
  canViewHistory: true,
};

@Injectable()
export class CreateMobilityIdentityUseCase {
  constructor(
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly relationshipRepository: RelationshipRepository,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    user: User,
    request: CreateMobilityIdentityRequest,
  ): Promise<MobilityIdentity> {
    const identity = await this.mobilityIdentityRepository.create({
      firstName: request.firstName,
      lastName: request.lastName,
      birthDate: new Date(request.birthDate),
      photoUrl: request.photoUrl ?? null,
      address: request.address ?? null,
      currentProfile: request.currentProfile,
      status: request.status,
    });

    await this.relationshipRepository.create({
      accountId: user.id,
      mobilityIdentityId: identity.id,
      relationshipType: RelationshipType.OWNER,
      permissions: OWNER_PERMISSIONS,
      status: RelationshipStatus.ACTIVE,
    });

    await this.timelineRecorder.recordIdentityCreated(identity.id, user.id, {
      firstName: identity.firstName,
      lastName: identity.lastName,
      currentProfile: identity.currentProfile,
    });

    return identity;
  }
}
