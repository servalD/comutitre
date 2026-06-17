import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { CreateMobilityIdentityRequest } from '../dto/create-mobility-identity.request';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { MobilityIdentity } from '../../domain/mobility-identity';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

@Injectable()
export class CreateMobilityIdentityUseCase {
  constructor(
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
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

    await this.timelineRecorder.recordIdentityCreated(identity.id, user.id, {
      firstName: identity.firstName,
      lastName: identity.lastName,
      currentProfile: identity.currentProfile,
    });

    return identity;
  }
}
