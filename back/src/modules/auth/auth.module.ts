import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Env } from '../../infrastructure/config/env.validation';
import { MobilityModule } from '../mobility/mobility.module';
import { UsersModule } from '../users/users.module';
import { TokenVerifier } from './application/ports/token-verifier.port';
import { AuthenticateBearerUseCase } from './application/use-cases/authenticate-bearer.use-case';
import { FranceConnectLoginUseCase } from './application/use-cases/franceconnect-login.use-case';
import { FranceConnectCallbackUseCase } from './application/use-cases/franceconnect-callback.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginWithCredentialsUseCase } from './application/use-cases/login-with-credentials.use-case';
import { AppJwtService } from './infrastructure/app-jwt.service';
import { CompositeTokenVerifier } from './infrastructure/composite-token-verifier';
import { DynamicTokenVerifier } from './infrastructure/dynamic-token-verifier';
import { FranceConnectService } from './infrastructure/franceconnect.service';
import { AuthController } from './presentation/auth.controller';
import { FranceConnectPublicCallbackController } from './presentation/franceconnect-public-callback.controller';

@Module({
  imports: [
    UsersModule,
    MobilityModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('APP_JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('APP_JWT_EXPIRES_IN', { infer: true }),
        },
      }),
    }),
  ],
  controllers: [AuthController, FranceConnectPublicCallbackController],
  providers: [
    AppJwtService,
    DynamicTokenVerifier,
    FranceConnectService,
    { provide: TokenVerifier, useClass: CompositeTokenVerifier },
    AuthenticateBearerUseCase,
    FranceConnectLoginUseCase,
    FranceConnectCallbackUseCase,
    RegisterUseCase,
    LoginWithCredentialsUseCase,
  ],
  // AuthenticateBearerUseCase is consumed by the global AuthGuard (AppModule).
  exports: [AuthenticateBearerUseCase],
})
export class AuthModule {}
