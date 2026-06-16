import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FranceConnectService } from '../../infrastructure/franceconnect.service';

export interface FranceConnectLoginResult {
  authorizationUrl: string;
  state: string;
  nonce: string;
}

/**
 * Starts the FranceConnect login: generates CSRF `state` + `nonce` and builds
 * the provider authorize URL.
 *
 * // TODO (live mode): persist {state, nonce} in a short-lived store / signed
 * //       cookie and validate them on callback to prevent CSRF / replay.
 */
@Injectable()
export class FranceConnectLoginUseCase {
  constructor(private readonly franceConnect: FranceConnectService) {}

  execute(): FranceConnectLoginResult {
    const state = randomUUID();
    const nonce = randomUUID();
    return {
      authorizationUrl: this.franceConnect.buildAuthorizationUrl(state, nonce),
      state,
      nonce,
    };
  }
}
