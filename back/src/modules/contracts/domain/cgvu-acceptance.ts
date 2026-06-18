import { ActorRole } from './contract';

export class CgvuAcceptance {
  constructor(
    public readonly id: string,
    public readonly contractId: string,
    public readonly productCgvuVersion: string,
    public readonly supportCguVersion: string | null,
    public readonly acceptedByUserId: string,
    public readonly actorRole: ActorRole,
    public readonly channel: string,
    public readonly yousignSignatureRequestId: string,
    public readonly signedAt: Date,
    public readonly createdAt: Date,
  ) {}
}
