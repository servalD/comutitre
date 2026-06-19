import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrityHashService {
  hashPayload(payload: Record<string, unknown>): string {
    return `sha256:${createHash('sha256')
      .update(JSON.stringify(this.sortValue(payload)))
      .digest('hex')}`;
  }

  supportCommitment(input: {
    mobilityIdentityId: string;
    transportRightId: string;
    type: string;
    walletAddress?: string | null;
    publicKey?: string | null;
  }): string {
    return this.hashPayload({
      scope: 'support',
      mobilityIdentityId: input.mobilityIdentityId,
      transportRightId: input.transportRightId,
      type: input.type,
      walletAddress: input.walletAddress ?? null,
      publicKey: input.publicKey ?? null,
    });
  }

  rightCommitment(input: {
    mobilityIdentityId: string;
    contractId: string;
    productType: string;
  }): string {
    return this.hashPayload({ scope: 'right', ...input });
  }

  private sortValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortValue(item));
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, this.sortValue(item)]),
      );
    }
    return value;
  }
}
