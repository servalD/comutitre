import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { Relationship } from '../../domain/relationship';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { RelationshipRepository } from '../../domain/relationship.repository';
import { CreateRelationshipRequest } from '../dto/create-relationship.request';
import { DefaultPermissionsService } from '../services/default-permissions.service';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

@Injectable()
export class CreateRelationshipUseCase {
  constructor(
    private readonly relationshipRepository: RelationshipRepository,
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly defaultPermissions: DefaultPermissionsService,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    user: User,
    request: CreateRelationshipRequest,
  ): Promise<Relationship> {
    const accountId = request.accountId ?? user.id;

    if (!user.isAdmin() && accountId !== user.id) {
      throw new ForbiddenException(
        'Cannot create relationship for another account',
      );
    }

    const identity = await this.mobilityIdentityRepository.findById(
      request.mobilityIdentityId,
    );
    if (!identity) {
      throw new NotFoundException('Mobility identity not found');
    }

    const existing =
      await this.relationshipRepository.findActiveByAccountAndIdentity(
        accountId,
        request.mobilityIdentityId,
      );

    if (
      existing.some(
        (relationship) =>
          relationship.relationshipType === request.relationshipType,
      )
    ) {
      throw new ConflictException('Relationship of this type already exists');
    }

    const relationship = await this.relationshipRepository.create({
      accountId,
      mobilityIdentityId: request.mobilityIdentityId,
      relationshipType: request.relationshipType,
      permissions: this.defaultPermissions.forType(request.relationshipType),
    });

    await this.timelineRecorder.recordRelationshipCreated(
      request.mobilityIdentityId,
      user.id,
      {
        relationshipType: request.relationshipType,
        accountId,
      },
    );

    return relationship;
  }
}
