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
 * Currently runs in MOCK mode (FRANCECONNECT_MODE=mock): no real credentials
 * are provisioned yet, so we short-circuit with a deterministic fake identity
 * to let the full flow be exercised end-to-end.
 *
 * // TODO: replace the mock branch with the real FranceConnect endpoints once
 * //       client_id / client_secret are provisioned (set FRANCECONNECT_MODE=live).
 */
@Injectable()
export class FranceConnectService {
  private readonly logger = new Logger(FranceConnectService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  private get mode(): 'mock' | 'live' {
    return this.config.get('FRANCECONNECT_MODE', { infer: true });
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
    url.searchParams.set(
      'client_id',
      this.config.get('FRANCECONNECT_CLIENT_ID', { infer: true }),
    );
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
      // Deterministic per-code subject so repeated logins map to one user.
      const subject = `fc-mock-${code.slice(-12)}`;
      return {
        provider: AuthProvider.FRANCECONNECT,
        subject,
        email: 'mock.user@franceconnect.test',
        walletAddress: null,
        displayName: 'Mock FranceConnect User',
      };
    }

    return this.exchangeCodeLive(code);
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
        client_id: this.config.get('FRANCECONNECT_CLIENT_ID', { infer: true }),
        client_secret: this.config.get('FRANCECONNECT_CLIENT_SECRET', {
          infer: true,
        }),
      }),
    });

    if (!tokenResponse.ok) {
      this.logger.error(
        `FranceConnect token exchange failed: ${tokenResponse.status}`,
      );
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
    };

    return {
      provider: AuthProvider.FRANCECONNECT,
      subject: info.sub,
      email: info.email ?? null,
      walletAddress: null,
      displayName:
        [info.given_name, info.family_name].filter(Boolean).join(' ') || null,
    };
  }
}
