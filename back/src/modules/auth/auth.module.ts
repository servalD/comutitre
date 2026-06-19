import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from '../../infrastructure/config/env.validation';
import { MobilityModule } from '../mobility/mobility.module';
import { UsersModule } from '../users/users.module';
import { TokenVerifier } from './application/ports/token-verifier.port';
import { AuthenticateBearerUseCase } from './application/use-cases/authenticate-bearer.use-case';
import { FranceConnectLoginUseCase } from './application/use-cases/franceconnect-login.use-case';
import { FranceConnectCallbackUseCase } from './application/use-cases/franceconnect-callback.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginWithCredentialsUseCase } from './application/use-cases/login-with-credentials.use-case';
import { CheckIdentityMatchUseCase } from './application/use-cases/check-identity-match.use-case';
import { RequestRecoveryUseCase } from './application/use-cases/request-recovery.use-case';
import { CompleteRecoveryUseCase } from './application/use-cases/complete-recovery.use-case';
import { RecoverableIdentityLookupService } from './application/services/recoverable-identity-lookup.service';
import { AppJwtService } from './infrastructure/app-jwt.service';
import { CompositeTokenVerifier } from './infrastructure/composite-token-verifier';
import { DynamicTokenVerifier } from './infrastructure/dynamic-token-verifier';
import { DynamicExternalJwtService } from './infrastructure/dynamic-external-jwt.service';
import { FranceConnectService } from './infrastructure/franceconnect.service';
import { RecoveryRequestOrmEntity } from './infrastructure/recovery-request.orm-entity';
import { RecoveryRequestRepository } from './infrastructure/recovery-request.repository';
import { AuthController } from './presentation/auth.controller';
import { FranceConnectPublicCallbackController } from './presentation/franceconnect-public-callback.controller';

@Module({
  imports: [
    UsersModule,
    MobilityModule,
    TypeOrmModule.forFeature([RecoveryRequestOrmEntity]),
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
    DynamicExternalJwtService,
    FranceConnectService,
    { provide: TokenVerifier, useClass: CompositeTokenVerifier },
    AuthenticateBearerUseCase,
    FranceConnectLoginUseCase,
    FranceConnectCallbackUseCase,
    RegisterUseCase,
    LoginWithCredentialsUseCase,
    RecoverableIdentityLookupService,
    CheckIdentityMatchUseCase,
    RequestRecoveryUseCase,
    CompleteRecoveryUseCase,
    RecoveryRequestRepository,
  ],
  // AuthenticateBearerUseCase is consumed by the global AuthGuard (AppModule).
  exports: [AuthenticateBearerUseCase],
})
export class AuthModule {}
