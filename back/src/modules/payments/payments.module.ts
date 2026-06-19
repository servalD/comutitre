import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsModule } from '../contracts/contracts.module';
import { CreateContractCheckoutSessionUseCase } from './application/use-cases/create-contract-checkout-session.use-case';
import { ConfirmStripeContractPaymentUseCase } from './application/use-cases/confirm-stripe-contract-payment.use-case';
import { ContractPaymentRepository } from './domain/contract-payment.repository';
import { ContractPaymentOrmEntity } from './infrastructure/contract-payment.orm-entity';
import {
  StripeCheckoutGateway,
  StripeCheckoutGatewayImpl,
} from './infrastructure/stripe-checkout.gateway';
import { TypeOrmContractPaymentRepository } from './infrastructure/typeorm-contract-payment.repository';
import { PaymentsController } from './presentation/payments.controller';
import { StripeWebhookController } from './presentation/stripe-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractPaymentOrmEntity]),
    ContractsModule,
  ],
  controllers: [PaymentsController, StripeWebhookController],
  providers: [
    {
      provide: ContractPaymentRepository,
      useClass: TypeOrmContractPaymentRepository,
    },
    {
      provide: StripeCheckoutGateway,
      useClass: StripeCheckoutGatewayImpl,
    },
    CreateContractCheckoutSessionUseCase,
    ConfirmStripeContractPaymentUseCase,
  ],
})
export class PaymentsModule {}
