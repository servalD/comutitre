import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ExternalIdentity } from '../domain/external-identity';
import { TokenVerifier } from '../application/ports/token-verifier.port';
import { AppJwtService, APP_TOKEN_ISSUER } from './app-jwt.service';
import { DynamicTokenVerifier } from './dynamic-token-verifier';

/**
 * Routes a Bearer token to the right verifier based on its (unverified) `iss`
 * claim: our own app session tokens vs Dynamic.xyz tokens. The chosen verifier
 * performs the actual signature check.
 */
@Injectable()
export class CompositeTokenVerifier extends TokenVerifier {
  constructor(
    private readonly appJwtService: AppJwtService,
    private readonly dynamicVerifier: DynamicTokenVerifier,
  ) {
    super();
  }

  verify(token: string): Promise<ExternalIdentity> {
    const decoded = jwt.decode(token, { json: true });
    if (!decoded) {
      throw new UnauthorizedException('Malformed token');
    }

    if (decoded.iss === APP_TOKEN_ISSUER) {
      return this.appJwtService.verify(token);
    }
    return this.dynamicVerifier.verify(token);
  }
}
