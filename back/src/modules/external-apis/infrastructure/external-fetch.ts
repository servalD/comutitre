import { ConfigService } from '@nestjs/config';
import { Env } from '../../../infrastructure/config/env.validation';

export const externalFetchSignal = (
  config: ConfigService<Env, true>,
): AbortSignal =>
  AbortSignal.timeout(config.get('EXTERNAL_API_TIMEOUT_MS', { infer: true }));
