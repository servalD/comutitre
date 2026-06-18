import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Env } from '../../../infrastructure/config/env.validation';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { User } from '../../users/domain/user';
import {
  toUserResponse,
  UserResponse,
} from '../../users/presentation/user.presenter';
import { FranceConnectLoginUseCase } from '../application/use-cases/franceconnect-login.use-case';
import { FranceConnectCallbackUseCase } from '../application/use-cases/franceconnect-callback.use-case';
import { RegisterRequest } from '../application/dto/register.request';
import { LoginRequest } from '../application/dto/login.request';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginWithCredentialsUseCase } from '../application/use-cases/login-with-credentials.use-case';
import { buildFranceConnectErrorRedirectUrl } from './franceconnect-error-redirect';

class TokenResponse {
  accessToken: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly franceConnectLogin: FranceConnectLoginUseCase,
    private readonly franceConnectCallback: FranceConnectCallbackUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginWithCredentials: LoginWithCredentialsUseCase,
  ) {}

  /** Returns the current authenticated user (works for both providers). */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Utilisateur authentifié courant' })
  @ApiOkResponse({ type: UserResponse })
  me(@CurrentUser() user: User): UserResponse {
    return toUserResponse(user);
  }

  /** Create a local (email + password) account. */
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Créer un compte avec e-mail et mot de passe' })
  @ApiCreatedResponse({ type: TokenResponse })
  @ApiConflictResponse({ description: 'E-mail déjà utilisé' })
  async register(@Body() dto: RegisterRequest): Promise<TokenResponse> {
    return this.registerUseCase.execute(dto);
  }

  /** Authenticate with email + password. */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion avec e-mail et mot de passe' })
  @ApiOkResponse({ type: TokenResponse })
  @ApiUnauthorizedResponse({ description: 'Identifiants incorrects' })
  async login(@Body() dto: LoginRequest): Promise<TokenResponse> {
    return this.loginWithCredentials.execute(dto);
  }

  /** Step 1: redirect the user to FranceConnect to authenticate. */
  @Public()
  @Get('franceconnect/login')
  @ApiOperation({
    summary: 'Redirige vers FranceConnect pour authentification',
  })
  startFranceConnectLogin(@Res() res: Response): void {
    const { authorizationUrl } = this.franceConnectLogin.execute();
    res.redirect(authorizationUrl);
  }

  /** Step 2: FranceConnect redirects here; we issue an app token and hand it to the front. */
  @Public()
  @Get('franceconnect/callback')
  @ApiOperation({
    summary: 'Callback FranceConnect : émet un token applicatif',
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
    // Hand the token to the SPA via fragment (kept out of server logs / Referer).
    res.redirect(`${frontendUrl}/auth/callback#access_token=${accessToken}`);
  }
}
