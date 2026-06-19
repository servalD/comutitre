import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import Stripe from 'stripe';
import { Env } from '../../../infrastructure/config/env.validation';
import { Public } from '../../../shared/decorators/public.decorator';
import { ConfirmStripeContractPaymentUseCase } from '../application/use-cases/confirm-stripe-contract-payment.use-case';
import { StripeCheckoutGateway } from '../infrastructure/stripe-checkout.gateway';

@ApiTags('webhooks')
@Controller('webhooks')
export class StripeWebhookController {
  constructor(
    private readonly stripeGateway: StripeCheckoutGateway,
    private readonly confirmStripePayment: ConfirmStripeContractPaymentUseCase,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post('stripe')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook Stripe Checkout' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', {
      infer: true,
    });
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook is not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeGateway.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await this.confirmStripePayment.execute({
        eventId: event.id,
        session: event.data.object,
      });
    }

    return { received: true };
  }
}
