import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { MobilityIdentity } from '../../domain/mobility-identity';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { UpdateMobilityIdentityRequest } from '../dto/update-mobility-identity.request';
import { MobilityAccessService } from '../services/mobility-access.service';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

@Injectable()
export class UpdateMobilityIdentityUseCase {
  constructor(
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly accessService: MobilityAccessService,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    user: User,
    id: string,
    request: UpdateMobilityIdentityRequest,
  ): Promise<MobilityIdentity> {
    await this.accessService.assertPermission(user, id, 'canEditIdentity');

    const existing = await this.mobilityIdentityRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Mobility identity not found');
    }

    const updated = await this.mobilityIdentityRepository.update(id, {
      firstName: request.firstName,
      lastName: request.lastName,
      birthDate: request.birthDate ? new Date(request.birthDate) : undefined,
      photoUrl: request.photoUrl,
      address: request.address,
      currentProfile: request.currentProfile,
      status: request.status,
    });

    await this.timelineRecorder.recordIdentityUpdated(updated.id, user.id, {
      updatedFields: Object.keys(request),
    });

    return updated;
  }
}
