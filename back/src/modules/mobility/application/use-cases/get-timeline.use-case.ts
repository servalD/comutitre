import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/user';
import { TimelineEvent } from '../../domain/timeline-event';
import { TimelineEventRepository } from '../../domain/timeline-event.repository';
import { MobilityAccessService } from '../services/mobility-access.service';

@Injectable()
export class GetTimelineUseCase {
  constructor(
    private readonly timelineRepository: TimelineEventRepository,
    private readonly accessService: MobilityAccessService,
  ) {}

  async execute(
    user: User,
    mobilityIdentityId: string,
  ): Promise<TimelineEvent[]> {
    await this.accessService.assertPermission(
      user,
      mobilityIdentityId,
      'canViewHistory',
    );

    return this.timelineRepository.findByMobilityIdentityId(mobilityIdentityId);
  }
}
