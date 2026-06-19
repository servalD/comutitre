import { TransportRightStatus } from './enums/transport-right-status.enum';

export class TransportRight {
  constructor(
    public readonly id: string,
    public readonly mobilityIdentityId: string,
    public readonly contractId: string,
    public readonly productType: string,
    public readonly status: TransportRightStatus,
    public readonly validFrom: Date,
    public readonly validTo: Date,
    public readonly rightCommitment: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
