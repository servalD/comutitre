import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfirmContractPaymentUseCase } from '../../../contracts/application/use-cases/confirm-contract-payment.use-case';
import { ContractPaymentStatus } from '../../domain/contract-payment';
import { ContractPaymentRepository } from '../../domain/contract-payment.repository';

export interface ConfirmStripeContractPaymentCommand {
  eventId: string;
  session: Pick<
    Stripe.Checkout.Session,
    'amount_total' | 'currency' | 'id' | 'payment_intent' | 'payment_status'
  >;
}

export interface ConfirmStripeContractPaymentResult {
  alreadyProcessed: boolean;
  confirmed: boolean;
  mobilityIdentityId: string | null;
  status: string;
}

@Injectable()
export class ConfirmStripeContractPaymentUseCase {
  constructor(
    private readonly paymentRepo: ContractPaymentRepository,
    private readonly confirmContractPayment: ConfirmContractPaymentUseCase,
  ) {}

  async execute(
    command: ConfirmStripeContractPaymentCommand,
  ): Promise<ConfirmStripeContractPaymentResult> {
    const existingEvent = await this.paymentRepo.findByProviderEventId(
      command.eventId,
    );
    if (existingEvent) {
      return {
        alreadyProcessed: true,
        confirmed: false,
        mobilityIdentityId: null,
        status: 'duplicate',
      };
    }

    if (command.session.payment_status !== 'paid') {
      return {
        alreadyProcessed: false,
        confirmed: false,
        mobilityIdentityId: null,
        status: command.session.payment_status ?? 'unpaid',
      };
    }

    const payment = await this.paymentRepo.findByCheckoutSessionId(
      command.session.id,
    );
    if (!payment) {
      return {
        alreadyProcessed: false,
        confirmed: false,
        mobilityIdentityId: null,
        status: 'unknown_session',
      };
    }

    if (payment.status === ContractPaymentStatus.PAID) {
      return {
        alreadyProcessed: true,
        confirmed: false,
        mobilityIdentityId: null,
        status: 'already_paid',
      };
    }

    const result = await this.confirmContractPayment.execute(
      payment.contractId,
      payment.userId,
    );

    payment.markPaid({
      paidAt: new Date(),
      paymentIntentId:
        typeof command.session.payment_intent === 'string'
          ? command.session.payment_intent
          : null,
      providerEventId: command.eventId,
    });
    await this.paymentRepo.save(payment);

    return {
      alreadyProcessed: false,
      confirmed: true,
      mobilityIdentityId: result.mobilityIdentityId,
      status: result.status,
    };
  }
}
