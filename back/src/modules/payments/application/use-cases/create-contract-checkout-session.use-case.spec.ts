import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type Stripe from 'stripe';
import { Contract, ContractStatus } from '../../../contracts/domain/contract';
import { CreateContractCheckoutSessionUseCase } from './create-contract-checkout-session.use-case';

const NOW = new Date('2026-06-19T10:00:00.000Z');

function contract(params?: {
  userId?: string;
  status?: ContractStatus;
  productCode?: string;
}): Contract {
  return new Contract(
    'contract-1',
    params?.userId ?? 'user-1',
    params?.productCode ?? 'imagine_r_junior',
    params?.status ?? ContractStatus.EN_ATTENTE_PAIEMENT,
    'Lea',
    'Martin',
    'lea@example.fr',
    'Lina',
    'Martin',
    'payer@example.fr',
    null,
    'sig-1',
    null,
    '2025-v1',
    NOW,
    NOW,
  );
}

function config(mode: 'mock' | 'checkout' = 'checkout') {
  const values: Record<string, string> = {
    STRIPE_PAYMENT_MODE: mode,
    FRONTEND_URL: 'http://localhost:5173',
    STRIPE_SUCCESS_URL: '',
    STRIPE_CANCEL_URL: '',
  };

  return {
    get: jest.fn((key: string) => values[key]),
  };
}

describe('CreateContractCheckoutSessionUseCase', () => {
  it('creates a Stripe Checkout Session with contract metadata and dynamic payment methods', async () => {
    const createCheckoutSession = jest
      .fn<
        Promise<Stripe.Checkout.Session>,
        [Stripe.Checkout.SessionCreateParams]
      >()
      .mockResolvedValue({
        id: 'cs_test_123',
        object: 'checkout.session',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      } as Stripe.Checkout.Session);
    const stripeGateway = {
      createCheckoutSession,
    };
    const paymentRepo = {
      save: jest.fn((payment) => Promise.resolve(payment)),
    };
    const useCase = new CreateContractCheckoutSessionUseCase(
      { findById: jest.fn().mockResolvedValue(contract()) },
      paymentRepo,
      stripeGateway,
      { execute: jest.fn() },
      config(),
    );

    const result = await useCase.execute('contract-1', 'user-1', {
      payMode: 'quarterly',
    });

    expect(result).toEqual({
      mode: 'checkout',
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: 'contract-1',
        customer_email: 'payer@example.fr',
        mode: 'payment',
        metadata: {
          contractId: 'contract-1',
          payMode: 'quarterly',
          userId: 'user-1',
        },
      }),
    );
    const params = createCheckoutSession.mock.calls[0][0];
    expect(params).not.toHaveProperty('payment_method_types');
    expect(params.line_items[0].price_data.unit_amount).toBe(38400);
    expect(paymentRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        amountCents: 38400,
        checkoutSessionId: 'cs_test_123',
        contractId: 'contract-1',
        currency: 'eur',
        payMode: 'quarterly',
        provider: 'stripe',
        status: 'pending',
        userId: 'user-1',
      }),
    );
  });

  it('uses the mock confirmation fallback when Stripe checkout is disabled', async () => {
    const confirmContractPayment = {
      execute: jest.fn().mockResolvedValue({
        mobilityIdentityId: 'identity-1',
        status: ContractStatus.EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE,
      }),
    };
    const stripeGateway = { createCheckoutSession: jest.fn() };
    const useCase = new CreateContractCheckoutSessionUseCase(
      { findById: jest.fn().mockResolvedValue(contract()) },
      { save: jest.fn() },
      stripeGateway,
      confirmContractPayment,
      config('mock'),
    );

    await expect(
      useCase.execute('contract-1', 'user-1', { payMode: 'monthly' }),
    ).resolves.toEqual({
      mode: 'mock',
      sessionId: null,
      url: 'http://localhost:5173/foyer/identity-1',
    });
    expect(confirmContractPayment.execute).toHaveBeenCalledWith(
      'contract-1',
      'user-1',
    );
    expect(stripeGateway.createCheckoutSession).not.toHaveBeenCalled();
  });

  it('refuses checkout for a missing contract', async () => {
    const useCase = new CreateContractCheckoutSessionUseCase(
      { findById: jest.fn().mockResolvedValue(null) },
      { save: jest.fn() },
      { createCheckoutSession: jest.fn() },
      { execute: jest.fn() },
      config(),
    );

    await expect(
      useCase.execute('contract-1', 'user-1', { payMode: 'quarterly' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses checkout for another user contract', async () => {
    const useCase = new CreateContractCheckoutSessionUseCase(
      { findById: jest.fn().mockResolvedValue(contract({ userId: 'user-2' })) },
      { save: jest.fn() },
      { createCheckoutSession: jest.fn() },
      { execute: jest.fn() },
      config(),
    );

    await expect(
      useCase.execute('contract-1', 'user-1', { payMode: 'quarterly' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses checkout when the contract is not awaiting payment', async () => {
    const useCase = new CreateContractCheckoutSessionUseCase(
      {
        findById: jest
          .fn()
          .mockResolvedValue(
            contract({ status: ContractStatus.EN_ATTENTE_DE_JUSTIFICATIF }),
          ),
      },
      { save: jest.fn() },
      { createCheckoutSession: jest.fn() },
      { execute: jest.fn() },
      config(),
    );

    await expect(
      useCase.execute('contract-1', 'user-1', { payMode: 'quarterly' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
