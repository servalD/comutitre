import { BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeWebhookController } from './stripe-webhook.controller';

function req(rawBody?: Buffer): RawBodyRequest<Request> {
  return { rawBody } as RawBodyRequest<Request>;
}

describe('StripeWebhookController', () => {
  it('rejects requests without a raw body', async () => {
    const controller = new StripeWebhookController(
      { constructEvent: jest.fn() },
      { execute: jest.fn() },
      { get: jest.fn().mockReturnValue('whsec_test') },
    );

    await expect(
      controller.handleStripeWebhook(req(), 'stripe-signature'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid Stripe signatures', async () => {
    const controller = new StripeWebhookController(
      {
        constructEvent: jest.fn(() => {
          throw new Error('Invalid signature');
        }),
      },
      { execute: jest.fn() },
      { get: jest.fn().mockReturnValue('whsec_test') },
    );

    await expect(
      controller.handleStripeWebhook(req(Buffer.from('{}')), 'bad-signature'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirms paid Checkout Sessions', async () => {
    const confirmStripePayment = {
      execute: jest.fn().mockResolvedValue({
        alreadyProcessed: false,
        confirmed: true,
        mobilityIdentityId: 'identity-1',
        status: 'en_attente_de_validation_documentaire',
      }),
    };
    const session = {
      id: 'cs_test_123',
      object: 'checkout.session',
      payment_status: 'paid',
    };
    const controller = new StripeWebhookController(
      {
        constructEvent: jest.fn().mockReturnValue({
          data: { object: session },
          id: 'evt_1',
          type: 'checkout.session.completed',
        }),
      },
      confirmStripePayment,
      { get: jest.fn().mockReturnValue('whsec_test') },
    );

    await expect(
      controller.handleStripeWebhook(
        req(Buffer.from('{}')),
        'stripe-signature',
      ),
    ).resolves.toEqual({ received: true });
    expect(confirmStripePayment.execute).toHaveBeenCalledWith({
      eventId: 'evt_1',
      session,
    });
  });

  it('confirms delayed Checkout Sessions when asynchronous payment succeeds', async () => {
    const confirmStripePayment = {
      execute: jest.fn().mockResolvedValue({
        alreadyProcessed: false,
        confirmed: true,
        mobilityIdentityId: 'identity-1',
        status: 'en_attente_de_validation_documentaire',
      }),
    };
    const session = {
      id: 'cs_test_delayed',
      object: 'checkout.session',
      payment_status: 'paid',
    };
    const controller = new StripeWebhookController(
      {
        constructEvent: jest.fn().mockReturnValue({
          data: { object: session },
          id: 'evt_async_1',
          type: 'checkout.session.async_payment_succeeded',
        }),
      },
      confirmStripePayment,
      { get: jest.fn().mockReturnValue('whsec_test') },
    );

    await expect(
      controller.handleStripeWebhook(
        req(Buffer.from('{}')),
        'stripe-signature',
      ),
    ).resolves.toEqual({ received: true });
    expect(confirmStripePayment.execute).toHaveBeenCalledWith({
      eventId: 'evt_async_1',
      session,
    });
  });

  it('acknowledges unrelated Stripe events without side effects', async () => {
    const confirmStripePayment = { execute: jest.fn() };
    const controller = new StripeWebhookController(
      {
        constructEvent: jest.fn().mockReturnValue({
          data: { object: {} },
          id: 'evt_2',
          type: 'payment_intent.succeeded',
        }),
      },
      confirmStripePayment,
      { get: jest.fn().mockReturnValue('whsec_test') },
    );

    await expect(
      controller.handleStripeWebhook(
        req(Buffer.from('{}')),
        'stripe-signature',
      ),
    ).resolves.toEqual({ received: true });
    expect(confirmStripePayment.execute).not.toHaveBeenCalled();
  });
});
