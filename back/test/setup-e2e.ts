import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load the repo-root test environment (DB on :5433, mock providers).
// dotenv does not override variables already present, so CI can supply its own
// (e.g. DATABASE_HOST/PORT pointing at the postgres service) via the job env.
config({ path: resolve(__dirname, '../../.env.test') });
config({ path: resolve(__dirname, '../.env.test') });
