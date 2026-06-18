import {
  InternalMobilityCheckInput,
  VerificationResult,
} from '../../domain/external-api.types';

export abstract class InternalMobilityPort {
  abstract check(
    input: InternalMobilityCheckInput,
  ): Promise<VerificationResult>;
}
