import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Env } from '../../../infrastructure/config/env.validation';
import { Public } from '../../../shared/decorators/public.decorator';
import { FranceConnectCallbackUseCase } from '../application/use-cases/franceconnect-callback.use-case';
import { buildFranceConnectErrorRedirectUrl } from './franceconnect-error-redirect';

@ApiTags('auth')
@Controller()
export class FranceConnectPublicCallbackController {
  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly franceConnectCallback: FranceConnectCallbackUseCase,
  ) {}

  /** Compatibility callback for FranceConnect public sandbox credentials. */
  @Public()
  @Get(['callback', 'login-callback'])
  @ApiOperation({
    summary: 'Callback racine FranceConnect sandbox : émet un token applicatif',
  })
  async callback(
    @Query('code') code: string | undefined,
    @Query('error') error: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL', { infer: true });
    if (error) {
      res.redirect(
        buildFranceConnectErrorRedirectUrl(
          frontendUrl,
          error,
          errorDescription,
        ),
      );
      return;
    }

    const { accessToken } = await this.franceConnectCallback.execute({
      code,
    });
    res.redirect(`${frontendUrl}/auth/callback#access_token=${accessToken}`);
  }
}
