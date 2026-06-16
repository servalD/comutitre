import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Env } from '../../../infrastructure/config/env.validation';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { User } from '../../users/domain/user';
import { toUserResponse } from '../../users/presentation/user.presenter';
import type { UserResponse } from '../../users/presentation/user.presenter';
import { FranceConnectLoginUseCase } from '../application/use-cases/franceconnect-login.use-case';
import { FranceConnectCallbackUseCase } from '../application/use-cases/franceconnect-callback.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly franceConnectLogin: FranceConnectLoginUseCase,
    private readonly franceConnectCallback: FranceConnectCallbackUseCase,
  ) {}

  /** Returns the current authenticated user (works for both providers). */
  @Get('me')
  me(@CurrentUser() user: User): UserResponse {
    return toUserResponse(user);
  }

  /** Step 1: redirect the user to FranceConnect to authenticate. */
  @Public()
  @Get('franceconnect/login')
  login(@Res() res: Response): void {
    const { authorizationUrl } = this.franceConnectLogin.execute();
    res.redirect(authorizationUrl);
  }

  /** Step 2: FranceConnect redirects here; we issue an app token and hand it to the front. */
  @Public()
  @Get('franceconnect/callback')
  async callback(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const { accessToken } = await this.franceConnectCallback.execute(code);
    const frontendUrl = this.config.get('FRONTEND_URL', { infer: true });
    // Hand the token to the SPA via fragment (kept out of server logs / Referer).
    res.redirect(`${frontendUrl}/auth/callback#access_token=${accessToken}`);
  }
}
