import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Env } from '../../../infrastructure/config/env.validation';

export abstract class StripeCheckoutGateway {
  abstract createCheckoutSession(
    params: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Checkout.Session>;
  abstract constructEvent(
    rawBody: Buffer,
    signature: string,
    webhookSecret: string,
  ): Stripe.Event;
}

@Injectable()
export class StripeCheckoutGatewayImpl extends StripeCheckoutGateway {
  private stripe: Stripe | null = null;

  constructor(private readonly config: ConfigService<Env, true>) {
    super();
  }

  async createCheckoutSession(
    params: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Checkout.Session> {
    return this.client().checkout.sessions.create(params);
  }

  constructEvent(
    rawBody: Buffer,
    signature: string,
    webhookSecret: string,
  ): Stripe.Event {
    return this.client().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  private client(): Stripe {
    if (this.stripe) return this.stripe;

    const apiKey = this.config.get('STRIPE_API_KEY', { infer: true });
    if (!apiKey) {
      throw new BadRequestException('Stripe checkout is not configured');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2026-05-27.dahlia',
    });
    return this.stripe;
  }
}
