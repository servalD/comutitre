import { ContractStatus } from '../../../contracts/domain/contract';
import {
  ContractPayment,
  ContractPaymentStatus,
  PaymentProvider,
} from '../../domain/contract-payment';
import { ConfirmStripeContractPaymentUseCase } from './confirm-stripe-contract-payment.use-case';

const NOW = new Date('2026-06-19T10:00:00.000Z');

function payment(status = ContractPaymentStatus.PENDING): ContractPayment {
  return new ContractPayment(
    'payment-1',
    'contract-1',
    'user-1',
    PaymentProvider.STRIPE,
    'cs_test_123',
    null,
    null,
    status,
    38400,
    'eur',
    'quarterly',
    'https://checkout.stripe.com/c/pay/cs_test_123',
    null,
    NOW,
    NOW,
  );
}

describe('ConfirmStripeContractPaymentUseCase', () => {
  it('marks the payment as paid and confirms the subscription contract', async () => {
    const contractPayment = payment();
    const paymentRepo = {
      findByProviderEventId: jest.fn().mockResolvedValue(null),
      findByCheckoutSessionId: jest.fn().mockResolvedValue(contractPayment),
      save: jest.fn((saved) => Promise.resolve(saved)),
    };
    const confirmContractPayment = {
      execute: jest.fn().mockResolvedValue({
        alreadyConfirmed: false,
        mobilityIdentityId: 'identity-1',
        status: ContractStatus.EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE,
      }),
    };
    const useCase = new ConfirmStripeContractPaymentUseCase(
      paymentRepo,
      confirmContractPayment,
    );

    await expect(
      useCase.execute({
        eventId: 'evt_1',
        session: {
          amount_total: 38400,
          currency: 'eur',
          id: 'cs_test_123',
          payment_intent: 'pi_1',
          payment_status: 'paid',
        },
      }),
    ).resolves.toEqual({
      alreadyProcessed: false,
      confirmed: true,
      mobilityIdentityId: 'identity-1',
      status: ContractStatus.EN_ATTENTE_DE_VALIDATION_DOCUMENTAIRE,
    });

    expect(contractPayment.status).toBe(ContractPaymentStatus.PAID);
    expect(contractPayment.providerEventId).toBe('evt_1');
    expect(contractPayment.paymentIntentId).toBe('pi_1');
    expect(paymentRepo.save).toHaveBeenCalledWith(contractPayment);
    expect(confirmContractPayment.execute).toHaveBeenCalledWith(
      'contract-1',
      'user-1',
    );
  });

  it('keeps the payment retryable when contract confirmation fails', async () => {
    const contractPayment = payment();
    const paymentRepo = {
      findByProviderEventId: jest.fn().mockResolvedValue(null),
      findByCheckoutSessionId: jest.fn().mockResolvedValue(contractPayment),
      save: jest.fn(),
    };
    const confirmContractPayment = {
      execute: jest.fn().mockRejectedValue(new Error('database unavailable')),
    };
    const useCase = new ConfirmStripeContractPaymentUseCase(
      paymentRepo,
      confirmContractPayment,
    );

    await expect(
      useCase.execute({
        eventId: 'evt_1',
        session: {
          id: 'cs_test_123',
          payment_intent: 'pi_1',
          payment_status: 'paid',
        },
      }),
    ).rejects.toThrow('database unavailable');

    expect(contractPayment.status).toBe(ContractPaymentStatus.PENDING);
    expect(contractPayment.providerEventId).toBeNull();
    expect(paymentRepo.save).not.toHaveBeenCalled();
  });

  it('ignores duplicate Stripe events without confirming twice', async () => {
    const paymentRepo = {
      findByProviderEventId: jest
        .fn()
        .mockResolvedValue(payment(ContractPaymentStatus.PAID)),
      findByCheckoutSessionId: jest.fn(),
      save: jest.fn(),
    };
    const confirmContractPayment = { execute: jest.fn() };
    const useCase = new ConfirmStripeContractPaymentUseCase(
      paymentRepo,
      confirmContractPayment,
    );

    await expect(
      useCase.execute({
        eventId: 'evt_1',
        session: {
          id: 'cs_test_123',
          payment_intent: 'pi_1',
          payment_status: 'paid',
        },
      }),
    ).resolves.toEqual({
      alreadyProcessed: true,
      confirmed: false,
      mobilityIdentityId: null,
      status: 'duplicate',
    });
    expect(confirmContractPayment.execute).not.toHaveBeenCalled();
    expect(paymentRepo.save).not.toHaveBeenCalled();
  });

  it('ignores a new completed event for an already paid Checkout Session', async () => {
    const paymentRepo = {
      findByProviderEventId: jest.fn().mockResolvedValue(null),
      findByCheckoutSessionId: jest
        .fn()
        .mockResolvedValue(payment(ContractPaymentStatus.PAID)),
      save: jest.fn(),
    };
    const confirmContractPayment = { execute: jest.fn() };
    const useCase = new ConfirmStripeContractPaymentUseCase(
      paymentRepo,
      confirmContractPayment,
    );

    await expect(
      useCase.execute({
        eventId: 'evt_2',
        session: {
          id: 'cs_test_123',
          payment_intent: 'pi_1',
          payment_status: 'paid',
        },
      }),
    ).resolves.toEqual({
      alreadyProcessed: true,
      confirmed: false,
      mobilityIdentityId: null,
      status: 'already_paid',
    });
    expect(confirmContractPayment.execute).not.toHaveBeenCalled();
    expect(paymentRepo.save).not.toHaveBeenCalled();
  });

  it('ignores Checkout Sessions that are not paid yet', async () => {
    const paymentRepo = {
      findByProviderEventId: jest.fn().mockResolvedValue(null),
      findByCheckoutSessionId: jest.fn().mockResolvedValue(payment()),
      save: jest.fn(),
    };
    const confirmContractPayment = { execute: jest.fn() };
    const useCase = new ConfirmStripeContractPaymentUseCase(
      paymentRepo,
      confirmContractPayment,
    );

    await expect(
      useCase.execute({
        eventId: 'evt_1',
        session: {
          id: 'cs_test_123',
          payment_intent: null,
          payment_status: 'unpaid',
        },
      }),
    ).resolves.toEqual({
      alreadyProcessed: false,
      confirmed: false,
      mobilityIdentityId: null,
      status: 'unpaid',
    });
    expect(confirmContractPayment.execute).not.toHaveBeenCalled();
  });
});
