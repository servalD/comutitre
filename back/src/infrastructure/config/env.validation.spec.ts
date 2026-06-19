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

  it('uses a public FranceConnect sandbox callback by default', () => {
    const config = validateEnv({
      ...baseConfig,
      ...sandboxCredentials,
      FRANCECONNECT_MODE: 'sandbox',
    });

    expect(config.FRANCECONNECT_REDIRECT_URI).toBe(
      'http://localhost:3000/callback',
    );
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

  it('rejects FranceConnect sandbox mode with the obsolete v1 issuer', () => {
    expect(() =>
      validateEnv({
        ...baseConfig,
        ...sandboxCredentials,
        FRANCECONNECT_MODE: 'sandbox',
        FRANCECONNECT_ISSUER_URL:
          'https://fcp.integ01.dev-franceconnect.fr/api/v1',
        FRANCECONNECT_REDIRECT_URI: 'http://localhost:3000/callback',
      }),
    ).toThrow(/FRANCECONNECT_ISSUER_URL/);
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

  it('rejects the legacy service-provider-example client in current sandbox mode', () => {
    expect(() =>
      validateEnv({
        ...baseConfig,
        FRANCECONNECT_MODE: 'sandbox',
        FRANCECONNECT_CLIENT_ID:
          '211286433e39cce01db448d80181bdfd005554b19cd51b3fe7943f6b3b86ab6e',
        FRANCECONNECT_CLIENT_SECRET: 'legacy-public-secret-for-tests',
        FRANCECONNECT_REDIRECT_URI: 'http://localhost:3000/login-callback',
      }),
    ).toThrow(/legacy FranceConnect service-provider-example client_id/);
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

  it('defaults Stripe payments to deterministic mock mode', () => {
    const config = validateEnv(baseConfig);

    expect(config.STRIPE_PAYMENT_MODE).toBe('mock');
    expect(config.STRIPE_API_KEY).toBe('');
    expect(config.STRIPE_WEBHOOK_SECRET).toBe('');
  });

  it('requires Stripe credentials when checkout mode is enabled', () => {
    expect(() =>
      validateEnv({
        ...baseConfig,
        STRIPE_PAYMENT_MODE: 'checkout',
      }),
    ).toThrow(/STRIPE_API_KEY/);

    expect(() =>
      validateEnv({
        ...baseConfig,
        STRIPE_PAYMENT_MODE: 'checkout',
        STRIPE_API_KEY: 'rk_test_123',
      }),
    ).toThrow(/STRIPE_WEBHOOK_SECRET/);
  });

  it('accepts Stripe checkout mode with configured credentials', () => {
    const config = validateEnv({
      ...baseConfig,
      STRIPE_PAYMENT_MODE: 'checkout',
      STRIPE_API_KEY: 'rk_test_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
    });

    expect(config.STRIPE_PAYMENT_MODE).toBe('checkout');
    expect(config.STRIPE_API_KEY).toBe('rk_test_123');
    expect(config.STRIPE_WEBHOOK_SECRET).toBe('whsec_test_123');
  });
});
