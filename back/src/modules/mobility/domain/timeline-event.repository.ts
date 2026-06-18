import { ActorType } from './enums/actor-type.enum';
import { TimelineEvent } from './timeline-event';

export interface AppendTimelineEventParams {
  mobilityIdentityId: string;
  contractId?: string | null;
  supportId?: string | null;
  actorType: ActorType;
  actorId?: string | null;
  type: string;
  metadata?: Record<string, unknown> | null;
}

export abstract class TimelineEventRepository {
  abstract findById(id: string): Promise<TimelineEvent | null>;
  abstract findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<TimelineEvent[]>;
  abstract append(params: AppendTimelineEventParams): Promise<TimelineEvent>;
}
