import { SupportStatus } from './enums/support-status.enum';
import { SupportType } from './enums/support-type.enum';

export class Support {
  constructor(
    public readonly id: string,
    public readonly mobilityIdentityId: string,
    public readonly contractId: string | null,
    public readonly type: SupportType,
    public readonly status: SupportStatus,
    public readonly publicKey: string | null,
    public readonly activatedAt: Date | null,
    public readonly revokedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly lastUsedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
