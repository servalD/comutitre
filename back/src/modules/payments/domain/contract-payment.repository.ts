import { ContractPayment } from './contract-payment';

export abstract class ContractPaymentRepository {
  abstract save(payment: ContractPayment): Promise<ContractPayment>;
  abstract findByCheckoutSessionId(
    checkoutSessionId: string,
  ): Promise<ContractPayment | null>;
  abstract findByProviderEventId(
    providerEventId: string,
  ): Promise<ContractPayment | null>;
}
