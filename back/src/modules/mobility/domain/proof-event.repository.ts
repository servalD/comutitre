import { ProofEvent } from './proof-event';

export interface AppendProofEventParams {
  mobilityIdentityId: string;
  transportRightId: string;
  supportId?: string | null;
  type: string;
  eventHash: string;
  previousHash?: string | null;
  payload?: Record<string, unknown> | null;
}

export abstract class ProofEventRepository {
  abstract append(params: AppendProofEventParams): Promise<ProofEvent>;
  abstract listByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<ProofEvent[]>;
  abstract findLatest(): Promise<ProofEvent | null>;
}
