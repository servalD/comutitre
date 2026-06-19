import { AnomalyStatus } from './enums/anomaly-status.enum';

export class AnomalyCase {
  constructor(
    public readonly id: string,
    public readonly mobilityIdentityId: string,
    public readonly transportRightId: string,
    public readonly supportId: string,
    public readonly type: string,
    public readonly severity: string,
    public readonly status: AnomalyStatus,
    public readonly summary: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
