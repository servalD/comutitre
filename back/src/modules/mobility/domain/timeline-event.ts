import { ActorType } from './enums/actor-type.enum';

export class TimelineEvent {
  constructor(
    public readonly id: string,
    public readonly mobilityIdentityId: string,
    public readonly contractId: string | null,
    public readonly supportId: string | null,
    public readonly actorType: ActorType,
    public readonly actorId: string | null,
    public readonly type: string,
    public readonly metadata: Record<string, unknown> | null,
    public readonly createdAt: Date,
  ) {}
}
