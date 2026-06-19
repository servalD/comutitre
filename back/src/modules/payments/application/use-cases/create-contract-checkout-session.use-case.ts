import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Env } from '../../../../infrastructure/config/env.validation';
import { ConfirmContractPaymentUseCase } from '../../../contracts/application/use-cases/confirm-contract-payment.use-case';
import { ContractStatus } from '../../../contracts/domain/contract';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import {
  ContractPayment,
  ContractPaymentPayMode,
  ContractPaymentStatus,
  PaymentProvider,
} from '../../domain/contract-payment';
import { ContractPaymentRepository } from '../../domain/contract-payment.repository';
import { paymentCatalogEntryForContract } from '../../domain/subscription-payment-catalog';
import { StripeCheckoutGateway } from '../../infrastructure/stripe-checkout.gateway';

export interface CreateContractCheckoutSessionResult {
  mode: 'mock' | 'checkout';
  sessionId: string | null;
  url: string;
}

export interface CreateContractCheckoutSessionCommand {
  payMode: ContractPaymentPayMode;
}

@Injectable()
export class CreateContractCheckoutSessionUseCase {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly paymentRepo: ContractPaymentRepository,
    private readonly stripeGateway: StripeCheckoutGateway,
    private readonly confirmContractPayment: ConfirmContractPaymentUseCase,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async execute(
    contractId: string,
    userId: string,
    command: CreateContractCheckoutSessionCommand,
  ): Promise<CreateContractCheckoutSessionResult> {
    const contract = await this.contractRepo.findById(contractId);
    if (!contract) throw new NotFoundException('Contrat introuvable');

    if (contract.userId !== userId) {
      throw new ForbiddenException('Acces refuse');
    }

    if (contract.status !== ContractStatus.EN_ATTENTE_PAIEMENT) {
      throw new BadRequestException(
        `Le paiement ne peut pas etre demarre dans l'etat actuel : ${contract.status}`,
      );
    }

    const paymentMode = this.config.get('STRIPE_PAYMENT_MODE', {
      infer: true,
    });
    if (paymentMode === 'mock') {
      return this.confirmInMockMode(contract.id, userId);
    }

    const catalogEntry = paymentCatalogEntryForContract(contract);
    if (catalogEntry.amountCents <= 0) {
      throw new BadRequestException(
        'Ce produit ne peut pas etre paye par Stripe Checkout',
      );
    }

    const frontendUrl = this.config.get('FRONTEND_URL', { infer: true });
    const session = await this.stripeGateway.createCheckoutSession({
      cancel_url: this.checkoutUrl(
        'STRIPE_CANCEL_URL',
        `${frontendUrl}/dossier/paiement?contractId=${contract.id}&checkout=cancel`,
        contract.id,
      ),
      client_reference_id: contract.id,
      customer_email: contract.payerEmail ?? contract.holderEmail,
      line_items: [
        {
          price_data: {
            currency: catalogEntry.currency,
            product_data: {
              name: catalogEntry.label,
            },
            unit_amount: catalogEntry.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        contractId: contract.id,
        payMode: command.payMode,
        userId,
      },
      mode: 'payment',
      success_url: this.checkoutUrl(
        'STRIPE_SUCCESS_URL',
        `${frontendUrl}/dossier/validation?contractId=${contract.id}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        contract.id,
      ),
    });

    if (!session.url) {
      throw new BadRequestException('Stripe Checkout did not return a URL');
    }

    const now = new Date();
    await this.paymentRepo.save(
      new ContractPayment(
        randomUUID(),
        contract.id,
        userId,
        PaymentProvider.STRIPE,
        session.id,
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
        null,
        ContractPaymentStatus.PENDING,
        catalogEntry.amountCents,
        catalogEntry.currency,
        command.payMode,
        session.url,
        null,
        now,
        now,
      ),
    );

    return {
      mode: 'checkout',
      sessionId: session.id,
      url: session.url,
    };
  }

  private async confirmInMockMode(
    contractId: string,
    userId: string,
  ): Promise<CreateContractCheckoutSessionResult> {
    const result = await this.confirmContractPayment.execute(
      contractId,
      userId,
    );
    const frontendUrl = this.config.get('FRONTEND_URL', { infer: true });
    const url = result.mobilityIdentityId
      ? `${frontendUrl}/foyer/${result.mobilityIdentityId}`
      : `${frontendUrl}/dossier/validation?contractId=${contractId}&checkout=mock`;

    return {
      mode: 'mock',
      sessionId: null,
      url,
    };
  }

  private checkoutUrl(
    envKey: 'STRIPE_SUCCESS_URL' | 'STRIPE_CANCEL_URL',
    fallback: string,
    contractId: string,
  ): string {
    const template = this.config.get(envKey, { infer: true });
    const value = template || fallback;
    return value
      .replaceAll('{contractId}', contractId)
      .replaceAll('{CHECKOUT_SESSION_ID}', '{CHECKOUT_SESSION_ID}');
  }
}
