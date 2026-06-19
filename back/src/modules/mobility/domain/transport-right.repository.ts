import { TransportRightStatus } from './enums/transport-right-status.enum';
import { TransportRight } from './transport-right';

export interface CreateTransportRightParams {
  mobilityIdentityId: string;
  contractId: string;
  productType: string;
  status?: TransportRightStatus;
  validFrom: Date;
  validTo: Date;
  rightCommitment: string;
}

export abstract class TransportRightRepository {
  abstract findById(id: string): Promise<TransportRight | null>;
  abstract findByMobilityIdentityId(
    mobilityIdentityId: string,
  ): Promise<TransportRight[]>;
  abstract create(params: CreateTransportRightParams): Promise<TransportRight>;
}
