import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { Env } from '../../../infrastructure/config/env.validation';
import { AuthProvider } from '../../users/domain/user';
import { ExternalIdentity } from '../domain/external-identity';
import { TokenVerifier } from '../application/ports/token-verifier.port';

/**
 * Verified Dynamic.xyz access-token claims we rely on. Dynamic signs tokens
 * with RS256; we fetch the matching public key from its per-environment JWKS.
 * See: https://www.dynamic.xyz/docs (validate users on the backend).
 */
interface DynamicClaims extends jwt.JwtPayload {
  sub?: string;
  email?: string;
  environment_id?: string;
  scope?: string;
  verified_credentials?: Array<{
    address?: string;
    email?: string;
    format?: string;
  }>;
}

@Injectable()
export class DynamicTokenVerifier extends TokenVerifier {
  private readonly jwks: JwksClient;

  constructor(private readonly config: ConfigService<Env, true>) {
    super();
    const environmentId = this.config.get('DYNAMIC_ENVIRONMENT_ID', {
      infer: true,
    });
    const jwksUri =
      this.config.get('DYNAMIC_JWKS_URL', { infer: true }) ??
      `https://app.dynamicauth.com/api/v0/sdk/${environmentId}/.well-known/jwks`;

    this.jwks = new JwksClient({
      jwksUri,
      cache: true,
      rateLimit: true,
    });
  }

  async verify(token: string): Promise<ExternalIdentity> {
    const environmentId = this.config.get('DYNAMIC_ENVIRONMENT_ID', {
      infer: true,
    });
    const tokenAudience = this.config.get('DYNAMIC_TOKEN_AUDIENCE', {
      infer: true,
    });
    const verifyOptions: jwt.VerifyOptions = {
      algorithms: ['RS256'],
      issuer: this.expectedIssuer,
    };
    verifyOptions.audience = tokenAudience.trim() || environmentId;

    const claims = await new Promise<DynamicClaims>((resolve, reject) => {
      jwt.verify(
        token,
        (header, callback) => {
          this.jwks
            .getSigningKey(header.kid)
            .then((key) => callback(null, key.getPublicKey()))
            .catch((err: Error) => callback(err));
        },
        verifyOptions,
        (err, decoded) => {
          if (err || !decoded || typeof decoded === 'string') {
            reject(new UnauthorizedException('Invalid Dynamic token'));
            return;
          }
          resolve(decoded);
        },
      );
    });

    if (!claims.sub) {
      throw new UnauthorizedException('Dynamic token missing subject');
    }
    if (
      claims.environment_id !== undefined &&
      claims.environment_id !== environmentId
    ) {
      throw new UnauthorizedException('Dynamic token environment mismatch');
    }
    if (!this.includesScope(claims.scope, 'user:basic')) {
      throw new UnauthorizedException(
        'Dynamic token authentication incomplete',
      );
    }
    if (
      claims.iat !== undefined &&
      claims.iat > Math.floor(Date.now() / 1000) + 60
    ) {
      throw new UnauthorizedException('Dynamic token issued in the future');
    }

    const wallet = claims.verified_credentials?.find((c) => c.address)?.address;

    return {
      provider: AuthProvider.DYNAMIC,
      subject: claims.sub,
      email: claims.email ?? null,
      walletAddress: wallet ?? null,
      displayName: claims.email ?? wallet ?? null,
    };
  }

  private get expectedIssuer(): string {
    const configured = this.config.get('DYNAMIC_TOKEN_ISSUER', {
      infer: true,
    });
    if (configured.trim()) {
      return configured;
    }
    return `app.dynamic.xyz/${this.config.get('DYNAMIC_ENVIRONMENT_ID', {
      infer: true,
    })}`;
  }

  private includesScope(scope: string | undefined, expected: string): boolean {
    return (scope ?? '').split(' ').includes(expected);
  }
}
