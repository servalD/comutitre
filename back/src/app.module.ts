import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv } from './infrastructure/config/env.validation';
import { MistralModule } from './infrastructure/mistral/mistral.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { ExternalApisModule } from './modules/external-apis/external-apis.module';
import { JustificatifsModule } from './modules/justificatifs/justificatifs.module';
import { MobilityModule } from './modules/mobility/mobility.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RagModule } from './modules/rag/rag.module';
import { UsersModule } from './modules/users/users.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AuthGuard } from './shared/guards/auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    MistralModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    ExternalApisModule,
    MobilityModule,
    ContractsModule,
    PaymentsModule,
    JustificatifsModule,
    WebhooksModule,
    RagModule,
  ],
  controllers: [HealthController],
  providers: [
    // Order matters: AuthGuard authenticates before RolesGuard authorizes.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
