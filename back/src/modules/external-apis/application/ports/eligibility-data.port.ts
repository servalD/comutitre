import {
  EligibilityCheckInput,
  VerificationResult,
} from '../../domain/external-api.types';

export abstract class EligibilityDataPort {
  abstract check(input: EligibilityCheckInput): Promise<VerificationResult>;
}
