import { Injectable } from '@nestjs/common';
import { InternalMobilityPort } from '../ports/internal-mobility.port';
import {
  InternalMobilityCheckInput,
  VerificationResult,
} from '../../domain/external-api.types';

@Injectable()
export class CheckInternalMobilityUseCase {
  constructor(private readonly internalMobility: InternalMobilityPort) {}

  execute(input: InternalMobilityCheckInput): Promise<VerificationResult> {
    return this.internalMobility.check(input);
  }
}
