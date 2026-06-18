import { validateEnv } from './env.validation';

const baseConfig = {
  NODE_ENV: 'test',
  APP_JWT_SECRET: 'test-only-secret-change-me-please-32',
  DYNAMIC_ENVIRONMENT_ID: 'test-environment-id',
};

const sandboxCredentials = {
  FRANCECONNECT_CLIENT_ID: 'sandbox-client-id-for-tests',
  FRANCECONNECT_CLIENT_SECRET: 'sandbox-client-secret-for-tests',
};

describe('validateEnv', () => {
  it('accepts FranceConnect sandbox mode with a public allowlisted callback', () => {
    const config = validateEnv({
      ...baseConfig,
      ...sandboxCredentials,
      FRANCECONNECT_MODE: 'sandbox',
      FRANCECONNECT_REDIRECT_URI: 'http://localhost:3000/callback',
    });

    expect(config.FRANCECONNECT_MODE).toBe('sandbox');
    expect(config.FRANCECONNECT_FALLBACK_TO_MOCK).toBe(true);
  });

  it('parses FranceConnect fallback flag as a real boolean', () => {
    const config = validateEnv({
      ...baseConfig,
      FRANCECONNECT_FALLBACK_TO_MOCK: 'false',
    });

    expect(config.FRANCECONNECT_FALLBACK_TO_MOCK).toBe(false);
  });

  it('rejects FranceConnect sandbox mode with a non-allowlisted callback', () => {
    expect(() =>
      validateEnv({
        ...baseConfig,
        ...sandboxCredentials,
        FRANCECONNECT_MODE: 'sandbox',
        FRANCECONNECT_REDIRECT_URI:
          'http://localhost:3000/auth/franceconnect/callback',
      }),
    ).toThrow(/FRANCECONNECT_REDIRECT_URI/);
  });

  it('rejects FranceConnect sandbox mode without local integration credentials', () => {
    expect(() =>
      validateEnv({
        ...baseConfig,
        FRANCECONNECT_MODE: 'sandbox',
        FRANCECONNECT_REDIRECT_URI: 'http://localhost:3000/callback',
      }),
    ).toThrow(/FRANCECONNECT_CLIENT_ID/);
  });

  it('rejects Sirene live mode without a bearer token', () => {
    expect(() =>
      validateEnv({
        ...baseConfig,
        EXTERNAL_API_COMPANY_MODE: 'live',
        SIRENE_API_BEARER_TOKEN: '',
      }),
    ).toThrow(/SIRENE_API_BEARER_TOKEN/);
  });
});
