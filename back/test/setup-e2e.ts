import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(__dirname, '../..');
const backRoot = resolve(__dirname, '..');

// Load optional .env.test (repo root or back/). dotenv does not override existing vars.
for (const envPath of [
  resolve(repoRoot, '.env.test'),
  resolve(backRoot, '.env.test'),
]) {
  if (existsSync(envPath)) {
    config({ path: envPath });
  }
}

/** Defaults for local e2e when no .env.test is present. CI supplies its own via job env. */
const E2E_ENV_DEFAULTS: Record<string, string> = {
  NODE_ENV: 'test',
  PORT: '3001',
  CORS_ORIGIN: 'http://localhost:5173',
  FRONTEND_URL: 'http://localhost:5173',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5433',
  DATABASE_NAME: 'comutitre_test',
  DATABASE_USER: 'comutitre_test',
  DATABASE_PASSWORD: 'comutitre_test',
  APP_JWT_SECRET: 'test-only-secret-change-me-please-32',
  APP_JWT_EXPIRES_IN: '1h',
  DYNAMIC_ENVIRONMENT_ID: 'test-environment-id',
  FRANCECONNECT_MODE: 'mock',
  FRANCECONNECT_CLIENT_ID: 'placeholder-client-id',
  FRANCECONNECT_CLIENT_SECRET: 'placeholder-client-secret',
  FRANCECONNECT_ISSUER_URL: 'https://fcp.integ01.dev-franceconnect.fr/api/v1',
  FRANCECONNECT_REDIRECT_URI:
    'http://localhost:3001/auth/franceconnect/callback',
  FRANCECONNECT_FALLBACK_TO_MOCK: 'true',
  EXTERNAL_API_ADDRESS_MODE: 'mock',
  EXTERNAL_API_GEO_MODE: 'mock',
  EXTERNAL_API_COMPANY_MODE: 'mock',
  EXTERNAL_API_EDUCATION_MODE: 'mock',
  EXTERNAL_API_ELIGIBILITY_MODE: 'mock',
  EXTERNAL_API_INTERNAL_MOBILITY_MODE: 'mock',
  EXTERNAL_API_TIMEOUT_MS: '5000',
};

for (const [key, value] of Object.entries(E2E_ENV_DEFAULTS)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}
