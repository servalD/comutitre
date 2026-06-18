import { Injectable } from '@nestjs/common';
import { EligibilityDataPort } from '../ports/eligibility-data.port';
import {
  EligibilityCheckInput,
  VerificationResult,
} from '../../domain/external-api.types';

@Injectable()
export class CheckEligibilityUseCase {
  constructor(private readonly eligibilityData: EligibilityDataPort) {}

  execute(input: EligibilityCheckInput): Promise<VerificationResult> {
    return this.eligibilityData.check(input);
  }
}
