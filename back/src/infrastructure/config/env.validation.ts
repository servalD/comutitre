import { readFileSync } from 'node:fs';
import { z } from 'zod';

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
export const envSchema = z.object({
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

  // Dynamic.xyz — the back verifies tokens against this environment's JWKS
  DYNAMIC_ENVIRONMENT_ID: z.string().min(1),

  // FranceConnect (OIDC). Mocked until real credentials are provisioned.
  FRANCECONNECT_MODE: z.enum(['mock', 'live']).default('mock'),
  FRANCECONNECT_CLIENT_ID: z.string().default('placeholder-client-id'),
  FRANCECONNECT_CLIENT_SECRET: z.string().default('placeholder-client-secret'),
  FRANCECONNECT_ISSUER_URL: z
    .string()
    .default('https://fcp.integ01.dev-franceconnect.fr/api/v1'),
  FRANCECONNECT_REDIRECT_URI: z
    .string()
    .default('http://localhost:3000/auth/franceconnect/callback'),

  // YouSign API v3
  YOUSIGN_API_KEY: z.string().default(''),
  YOUSIGN_BASE_URL: z
    .string()
    .url()
    .default('https://api-sandbox.yousign.app/v3'),
  YOUSIGN_WEBHOOK_SECRET: z.string().default(''),
  YOUSIGN_DELIVERY_MODE: z.enum(['email', 'none']).default('none'),
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
