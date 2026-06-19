import { readFileSync } from 'node:fs';
import { z } from 'zod';

const booleanFromEnv = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
      }
      if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
      }
    }
    return value;
  }, z.boolean());

const FRANCECONNECT_SANDBOX_CALLBACK_URIS = new Set([
  'http://localhost:3000/callback',
  'http://localhost:3000/login-callback',
  'http://localhost:4242/callback',
  'http://localhost:4242/login-callback',
  'http://localhost:8080/callback',
  'http://localhost:8080/login-callback',
  'http://localhost:1337/callback',
  'http://localhost:1337/login-callback',
]);

const FRANCECONNECT_SANDBOX_ISSUER_URL =
  'https://fcp-low.sbx.dev-franceconnect.fr/api/v2';

const FRANCECONNECT_LEGACY_PUBLIC_CLIENT_ID =
  '211286433e39cce01db448d80181bdfd005554b19cd51b3fe7943f6b3b86ab6e';

/**
 * Docker/Swarm secrets are mounted as files. For any `FOO_FILE` variable whose
 * `FOO` is not already set, read the file and expose its trimmed content as
 * `FOO`. This lets prod inject APP_JWT_SECRET / DATABASE_PASSWORD as secrets
 * without baking them into the image or env.
 */
const expandFileSecrets = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const expanded = { ...config };
  for (const [key, value] of Object.entries(config)) {
    if (!key.endsWith('_FILE') || typeof value !== 'string') {
      continue;
    }
    const target = key.slice(0, -'_FILE'.length);
    if (expanded[target] === undefined) {
      expanded[target] = readFileSync(value, 'utf8').trim();
    }
  }
  return expanded;
};

/**
 * Single source of truth for environment configuration. Validated at startup
 * (fail-fast): a missing or malformed variable crashes the app immediately
 * rather than surfacing as a confusing runtime error later.
 */
export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),

    // Database
    DATABASE_HOST: z.string().default('localhost'),
    DATABASE_PORT: z.coerce.number().int().positive().default(5432),
    DATABASE_NAME: z.string().default('comutitre'),
    DATABASE_USER: z.string().default('comutitre'),
    DATABASE_PASSWORD: z.string().default('comutitre'),

    // App session JWT (issued by us after FranceConnect login)
    APP_JWT_SECRET: z.string().min(16),
    APP_JWT_EXPIRES_IN: z.string().default('1h'),

    // Dynamic.xyz — incoming JWT verification + third-party auth external JWT.
    DYNAMIC_ENVIRONMENT_ID: z
      .string()
      .default('0ac8438d-93b8-41dc-baba-e830a96687bc'),
    DYNAMIC_ENVIRONMENT_KIND: z.enum(['sandbox', 'live']).default('sandbox'),
    DYNAMIC_JWKS_URL: z
      .string()
      .url()
      .default(
        'https://app.dynamicauth.com/api/v0/sdk/0ac8438d-93b8-41dc-baba-e830a96687bc/.well-known/jwks',
      ),
    DYNAMIC_TOKEN_ISSUER: z.string().default(''),
    DYNAMIC_TOKEN_AUDIENCE: z
      .string()
      .default('0ac8438d-93b8-41dc-baba-e830a96687bc'),
    DYNAMIC_API_VERSION: z.string().default('2026_04_01'),
    DYNAMIC_EXTERNAL_JWT_ISSUER: z
      .string()
      .url()
      .default('http://localhost:3000/api/auth/dynamic'),
    DYNAMIC_EXTERNAL_JWT_AUDIENCE: z.string().default('dynamic'),
    DYNAMIC_EXTERNAL_JWT_KID: z.string().default('comutitres-demo-1'),
    DYNAMIC_EXTERNAL_JWT_PRIVATE_KEY: z.string().default(''),

    // FranceConnect (OIDC). Mocked by default; sandbox targets current v2 with
    // provisioned partner credentials.
    FRANCECONNECT_MODE: z.enum(['mock', 'sandbox', 'live']).default('mock'),
    FRANCECONNECT_CLIENT_ID: z.string().default('placeholder-client-id'),
    FRANCECONNECT_CLIENT_SECRET: z
      .string()
      .default('placeholder-client-secret'),
    FRANCECONNECT_ISSUER_URL: z
      .string()
      .default(FRANCECONNECT_SANDBOX_ISSUER_URL),
    FRANCECONNECT_REDIRECT_URI: z
      .string()
      .default('http://localhost:3000/callback'),
    FRANCECONNECT_FALLBACK_TO_MOCK: booleanFromEnv(true),

    // External public APIs and sensitive administrative API mocks.
    EXTERNAL_API_ADDRESS_MODE: z.enum(['mock', 'live']).default('mock'),
    EXTERNAL_API_GEO_MODE: z.enum(['mock', 'live']).default('mock'),
    EXTERNAL_API_COMPANY_MODE: z.enum(['mock', 'live']).default('mock'),
    EXTERNAL_API_EDUCATION_MODE: z.enum(['mock', 'live']).default('mock'),
    EXTERNAL_API_ELIGIBILITY_MODE: z.literal('mock').default('mock'),
    EXTERNAL_API_INTERNAL_MOBILITY_MODE: z.literal('mock').default('mock'),
    EXTERNAL_API_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
    GEOPLATEFORME_GEOCODING_URL: z
      .string()
      .url()
      .default('https://data.geopf.fr/geocodage/search'),
    API_GEO_BASE_URL: z.string().url().default('https://geo.api.gouv.fr'),
    EDUCATION_OPEN_DATA_URL: z
      .string()
      .url()
      .default(
        'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records',
      ),
    SIRENE_API_BASE_URL: z
      .string()
      .url()
      .default('https://api.insee.fr/api-sirene/3.11'),
    SIRENE_API_BEARER_TOKEN: z.string().default(''),

    // YouSign API v3
    YOUSIGN_API_KEY: z.string().default(''),
    YOUSIGN_BASE_URL: z
      .string()
      .url()
      .default('https://api-sandbox.yousign.app/v3'),
    YOUSIGN_WEBHOOK_SECRET: z.string().default(''),
    YOUSIGN_DELIVERY_MODE: z.enum(['email', 'none']).default('none'),

    // Mistral AI — powers the RAG chatbot (embeddings + chat). The key may be
    // injected via MISTRAL_API_KEY_FILE (Docker/Swarm secret) thanks to the
    // _FILE expansion above. Optional so the app still boots without it; the
    // chatbot endpoint returns a clear error when it is missing.
    MISTRAL_API_KEY: z.string().min(1).optional(),
    MISTRAL_BASE_URL: z.string().url().optional(),
    MISTRAL_CHAT_MODEL: z.string().default('ministral-3b-2512'),
    MISTRAL_EMBED_MODEL: z.string().default('mistral-embed'),
    MISTRAL_VISION_MODEL: z.string().default('pixtral-12b-2409'),
  })
  .superRefine((config, ctx) => {
    if (config.FRANCECONNECT_MODE === 'sandbox') {
      if (config.NODE_ENV === 'production') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FRANCECONNECT_MODE'],
          message: 'FranceConnect sandbox mode is forbidden in production',
        });
      }

      if (
        !FRANCECONNECT_SANDBOX_CALLBACK_URIS.has(
          config.FRANCECONNECT_REDIRECT_URI,
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FRANCECONNECT_REDIRECT_URI'],
          message:
            'FRANCECONNECT_REDIRECT_URI must be one of the local FranceConnect sandbox callback URLs',
        });
      }

      if (
        config.FRANCECONNECT_ISSUER_URL !== FRANCECONNECT_SANDBOX_ISSUER_URL
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FRANCECONNECT_ISSUER_URL'],
          message:
            'FRANCECONNECT_ISSUER_URL must be the current FranceConnect sandbox issuer',
        });
      }

      if (
        config.FRANCECONNECT_CLIENT_ID === 'placeholder-client-id' ||
        config.FRANCECONNECT_CLIENT_SECRET === 'placeholder-client-secret'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FRANCECONNECT_CLIENT_ID'],
          message:
            'FranceConnect sandbox mode requires provisioned v2 sandbox credentials in the local env file',
        });
      }

      if (
        config.FRANCECONNECT_CLIENT_ID === FRANCECONNECT_LEGACY_PUBLIC_CLIENT_ID
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FRANCECONNECT_CLIENT_ID'],
          message:
            'The legacy FranceConnect service-provider-example client_id is not registered on the current v2 sandbox; use FRANCECONNECT_MODE=mock for the hackathon demo or provision v2 sandbox credentials',
        });
      }
    }

    if (
      config.FRANCECONNECT_MODE === 'live' &&
      (config.FRANCECONNECT_CLIENT_ID === 'placeholder-client-id' ||
        config.FRANCECONNECT_CLIENT_SECRET === 'placeholder-client-secret')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FRANCECONNECT_CLIENT_ID'],
        message:
          'Real FranceConnect credentials are required in live mode; use mock for demos or sandbox with provisioned credentials',
      });
    }

    if (
      config.NODE_ENV === 'production' &&
      config.FRANCECONNECT_MODE === 'live' &&
      config.FRANCECONNECT_FALLBACK_TO_MOCK
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FRANCECONNECT_FALLBACK_TO_MOCK'],
        message: 'FranceConnect mock fallback must be disabled in production',
      });
    }

    if (
      config.EXTERNAL_API_COMPANY_MODE === 'live' &&
      !config.SIRENE_API_BEARER_TOKEN.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SIRENE_API_BEARER_TOKEN'],
        message: 'SIRENE_API_BEARER_TOKEN is required in Sirene live mode',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): Env => {
  const parsed = envSchema.safeParse(expandFileSecrets(config));
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
};
