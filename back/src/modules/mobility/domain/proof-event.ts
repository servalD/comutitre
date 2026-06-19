export class ProofEvent {
  constructor(
    public readonly id: string,
    public readonly mobilityIdentityId: string,
    public readonly transportRightId: string,
    public readonly supportId: string | null,
    public readonly type: string,
    public readonly eventHash: string,
    public readonly previousHash: string | null,
    public readonly payload: Record<string, unknown> | null,
    public readonly createdAt: Date,
  ) {}
}
