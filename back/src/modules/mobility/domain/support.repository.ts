import { SupportStatus } from './enums/support-status.enum';
import { SupportType } from './enums/support-type.enum';
import { Support } from './support';

export interface CreateSupportParams {
  mobilityIdentityId: string;
  contractId?: string | null;
  type?: SupportType;
  status?: SupportStatus;
  publicKey?: string | null;
  activatedAt?: Date | null;
  expiresAt?: Date | null;
}

export abstract class SupportRepository {
  abstract findById(id: string): Promise<Support | null>;
  abstract findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<Support[]>;
  abstract create(params: CreateSupportParams): Promise<Support>;
  abstract updateStatus(
    id: string,
    status: SupportStatus,
  ): Promise<Support | null>;
}
