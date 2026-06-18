import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { Env } from '../../../infrastructure/config/env.validation';
import { AuthProvider } from '../../users/domain/user';
import { ExternalIdentity } from '../domain/external-identity';

/**
 * FranceConnect OIDC Relying Party.
 *
 * The back drives the authorization-code flow: it builds the authorize URL,
 * then exchanges the returned code for tokens + userinfo on the callback.
 *
 * `mock` keeps local tests deterministic. `sandbox` uses FranceConnect's public
 * integration credentials and falls back to the mock identity for demos.
 * `live` is reserved for provisioned credentials.
 */
@Injectable()
export class FranceConnectService {
  private readonly logger = new Logger(FranceConnectService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  private get mode(): 'mock' | 'sandbox' | 'live' {
    return this.config.get('FRANCECONNECT_MODE', { infer: true });
  }

  private get fallbackToMock(): boolean {
    return this.config.get('FRANCECONNECT_FALLBACK_TO_MOCK', { infer: true });
  }

  /** Build the URL the user is redirected to in order to authenticate. */
  buildAuthorizationUrl(state: string, nonce: string): string {
    if (this.mode === 'mock') {
      // Loop straight back to our callback with a fake code.
      const redirectUri = this.config.get('FRANCECONNECT_REDIRECT_URI', {
        infer: true,
      });
      const url = new URL(redirectUri);
      url.searchParams.set('code', `mock-code-${randomUUID()}`);
      url.searchParams.set('state', state);
      return url.toString();
    }

    const issuer = this.config.get('FRANCECONNECT_ISSUER_URL', { infer: true });
    const url = new URL(`${issuer}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.getClientId());
    url.searchParams.set(
      'redirect_uri',
      this.config.get('FRANCECONNECT_REDIRECT_URI', { infer: true }),
    );
    url.searchParams.set('scope', 'openid given_name family_name email');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    return url.toString();
  }

  /** Exchange the authorization code for a verified identity. */
  async handleCallback(code: string): Promise<ExternalIdentity> {
    if (!code) {
      throw new UnauthorizedException('Missing authorization code');
    }

    if (this.mode === 'mock') {
      return this.buildMockIdentity(code, 'fc-mock');
    }

    try {
      return await this.exchangeCodeLive(code);
    } catch (error) {
      if (this.shouldFallbackToMock()) {
        this.logger.warn(
          `FranceConnect ${this.mode} failed, falling back to mock identity: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return this.buildMockIdentity(code, `fc-${this.mode}-fallback`);
      }

      this.logger.error(
        `FranceConnect ${this.mode} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  handleCallbackError(
    error: string,
    errorDescription?: string,
  ): Promise<ExternalIdentity> {
    this.logger.warn(
      `FranceConnect callback returned ${error}${
        errorDescription ? `: ${errorDescription}` : ''
      }`,
    );
    throw new UnauthorizedException(
      errorDescription || `FranceConnect callback failed: ${error}`,
    );
  }

  /**
   * Real OIDC code exchange + userinfo. Scaffolded; wired once credentials exist.
   */
  private async exchangeCodeLive(code: string): Promise<ExternalIdentity> {
    const issuer = this.config.get('FRANCECONNECT_ISSUER_URL', { infer: true });

    const tokenResponse = await fetch(`${issuer}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.get('FRANCECONNECT_REDIRECT_URI', {
          infer: true,
        }),
        client_id: this.getClientId(),
        client_secret: this.getClientSecret(),
      }),
    });

    if (!tokenResponse.ok) {
      throw new UnauthorizedException('FranceConnect token exchange failed');
    }

    const tokens = (await tokenResponse.json()) as { access_token?: string };
    if (!tokens.access_token) {
      throw new UnauthorizedException('FranceConnect did not return a token');
    }

    const userinfoResponse = await fetch(`${issuer}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userinfoResponse.ok) {
      throw new UnauthorizedException('FranceConnect userinfo failed');
    }

    const info = (await userinfoResponse.json()) as {
      sub: string;
      email?: string;
      given_name?: string;
      family_name?: string;
      birthdate?: string;
    };

    return {
      provider: AuthProvider.FRANCECONNECT,
      subject: info.sub,
      email: info.email ?? null,
      walletAddress: null,
      displayName:
        [info.given_name, info.family_name].filter(Boolean).join(' ') || null,
      givenName: info.given_name ?? null,
      familyName: info.family_name ?? null,
      birthDate: info.birthdate ?? null,
    };
  }

  private shouldFallbackToMock(): boolean {
    return this.mode === 'sandbox' || this.fallbackToMock;
  }

  private getClientId(): string {
    return this.config.get('FRANCECONNECT_CLIENT_ID', {
      infer: true,
    });
  }

  private getClientSecret(): string {
    return this.config.get('FRANCECONNECT_CLIENT_SECRET', {
      infer: true,
    });
  }

  private buildMockIdentity(
    code: string,
    subjectPrefix: string,
  ): ExternalIdentity {
    return {
      provider: AuthProvider.FRANCECONNECT,
      subject: `${subjectPrefix}-${code.slice(-12)}`,
      email: 'mock.user@franceconnect.test',
      walletAddress: null,
      displayName: 'Marie Dupont',
      givenName: 'Marie',
      familyName: 'Dupont',
      birthDate: '1990-03-15',
    };
  }
}
