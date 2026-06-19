import { Injectable } from '@nestjs/common';
import {
  CheckIdentityMatchRequest,
  CheckIdentityMatchResponse,
} from '../dto/check-identity-match.request';
import { RecoverableIdentityLookupService } from '../services/recoverable-identity-lookup.service';

@Injectable()
export class CheckIdentityMatchUseCase {
  constructor(
    private readonly recoverableLookup: RecoverableIdentityLookupService,
  ) {}

  async execute(
    params: CheckIdentityMatchRequest,
  ): Promise<CheckIdentityMatchResponse> {
    const identity = await this.recoverableLookup.findRecoverable(
      params.firstName,
      params.lastName,
      new Date(params.birthDate),
    );

    if (!identity) {
      return { matched: false };
    }

    return {
      matched: true,
      maskedHolder: this.recoverableLookup.maskHolder(
        identity.firstName,
        identity.lastName,
      ),
      recoveryEligible: true,
    };
  }
}
