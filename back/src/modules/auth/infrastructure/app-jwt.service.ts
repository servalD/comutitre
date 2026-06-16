import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '../../users/domain/user';
import { ExternalIdentity } from '../domain/external-identity';

/**
 * App session tokens. After a FranceConnect login completes, the back issues
 * its OWN signed JWT (FranceConnect does not give the SPA a reusable bearer
 * token). Subsequent API calls send this token; we verify it here.
 *
 * Token issuer is set to "comutitre" so the composite verifier can route it.
 */
export const APP_TOKEN_ISSUER = 'comutitre';

interface AppSessionClaims {
  sub: string;
  provider: AuthProvider;
  email: string | null;
  walletAddress: string | null;
  displayName: string | null;
}

@Injectable()
export class AppJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(identity: ExternalIdentity): Promise<string> {
    const payload: AppSessionClaims = {
      sub: identity.subject,
      provider: identity.provider,
      email: identity.email,
      walletAddress: identity.walletAddress,
      displayName: identity.displayName,
    };
    return this.jwtService.signAsync(payload, { issuer: APP_TOKEN_ISSUER });
  }

  async verify(token: string): Promise<ExternalIdentity> {
    try {
      const claims = await this.jwtService.verifyAsync<AppSessionClaims>(
        token,
        {
          issuer: APP_TOKEN_ISSUER,
        },
      );
      return {
        provider: claims.provider,
        subject: claims.sub,
        email: claims.email ?? null,
        walletAddress: claims.walletAddress ?? null,
        displayName: claims.displayName ?? null,
      };
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }
  }
}
