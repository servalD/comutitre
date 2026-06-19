import { AnomalyStatus } from './enums/anomaly-status.enum';
import { AnomalyCase } from './anomaly-case';

export interface CreateAnomalyCaseParams {
  mobilityIdentityId: string;
  transportRightId: string;
  supportId: string;
  type: string;
  severity: string;
  status?: AnomalyStatus | string;
  summary: string;
}

export abstract class AnomalyCaseRepository {
  abstract create(params: CreateAnomalyCaseParams): Promise<AnomalyCase>;
  abstract listOpen(): Promise<AnomalyCase[]>;
}
