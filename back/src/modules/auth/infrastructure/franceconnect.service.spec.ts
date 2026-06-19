import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Env } from '../../../infrastructure/config/env.validation';
import { FranceConnectService } from './franceconnect.service';

const SANDBOX_CLIENT_ID = 'sandbox-client-id-for-tests';
const SANDBOX_CLIENT_SECRET = 'sandbox-client-secret-for-tests';

const createService = (
  overrides: Record<string, unknown> = {},
): FranceConnectService => {
  const values: Record<string, unknown> = {
    FRANCECONNECT_MODE: 'mock',
    FRANCECONNECT_CLIENT_ID: 'placeholder-client-id',
    FRANCECONNECT_CLIENT_SECRET: 'placeholder-client-secret',
    FRANCECONNECT_ISSUER_URL: 'https://fcp-low.sbx.dev-franceconnect.fr/api/v2',
    FRANCECONNECT_REDIRECT_URI:
      'http://localhost:3000/auth/franceconnect/callback',
    FRANCECONNECT_FALLBACK_TO_MOCK: true,
    ...overrides,
  };

  return new FranceConnectService({
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService<Env, true>);
};

describe('FranceConnectService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds a real sandbox authorization URL with the public FranceConnect callback', () => {
    const service = createService({
      FRANCECONNECT_MODE: 'sandbox',
      FRANCECONNECT_CLIENT_ID: SANDBOX_CLIENT_ID,
      FRANCECONNECT_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
      FRANCECONNECT_REDIRECT_URI: 'http://localhost:3000/callback',
    });

    const authorizationUrl = new URL(
      service.buildAuthorizationUrl('state-for-demo', 'nonce-for-demo'),
    );

    expect(authorizationUrl.toString()).toContain(
      'https://fcp-low.sbx.dev-franceconnect.fr/api/v2/authorize',
    );
    expect(authorizationUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizationUrl.searchParams.get('acr_values')).toBe('eidas1');
    expect(authorizationUrl.searchParams.get('client_id')).toBe(
      SANDBOX_CLIENT_ID,
    );
    expect(authorizationUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/callback',
    );
    expect(authorizationUrl.searchParams.get('state')).toBe('state-for-demo');
    expect(authorizationUrl.searchParams.get('nonce')).toBe('nonce-for-demo');
  });

  it('falls back to a mock identity when sandbox token exchange fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    const service = createService({
      FRANCECONNECT_MODE: 'sandbox',
      FRANCECONNECT_CLIENT_ID: SANDBOX_CLIENT_ID,
      FRANCECONNECT_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
      FRANCECONNECT_REDIRECT_URI: 'http://localhost:3000/callback',
      FRANCECONNECT_FALLBACK_TO_MOCK: true,
    });

    const identity = await service.handleCallback('sandbox-code');

    expect(identity.subject).toBe('fc-sandbox-fallback-sandbox-code');
    expect(identity.email).toBe('mock.user@franceconnect.test');
    expect(identity.displayName).toBe('Marie Dupont');
    expect(identity.givenName).toBe('Marie');
    expect(identity.familyName).toBe('Dupont');
    expect(identity.birthDate).toBe('1990-03-15');
  });

  it('keeps live mode strict when fallback is disabled', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    const service = createService({
      FRANCECONNECT_MODE: 'live',
      FRANCECONNECT_FALLBACK_TO_MOCK: false,
    });

    await expect(service.handleCallback('live-code')).rejects.toThrow(
      'FranceConnect token exchange failed',
    );
  });
});
