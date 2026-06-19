export enum PaymentProvider {
  STRIPE = 'stripe',
  MOCK = 'mock',
}

export enum ContractPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export type ContractPaymentPayMode = 'quarterly' | 'monthly';

export class ContractPayment {
  constructor(
    public readonly id: string,
    public readonly contractId: string,
    public readonly userId: string,
    public readonly provider: PaymentProvider,
    public readonly checkoutSessionId: string,
    public paymentIntentId: string | null,
    public providerEventId: string | null,
    public status: ContractPaymentStatus,
    public readonly amountCents: number,
    public readonly currency: string,
    public readonly payMode: ContractPaymentPayMode,
    public readonly checkoutUrl: string | null,
    public paidAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  markPaid(params: {
    paymentIntentId: string | null;
    providerEventId: string;
    paidAt: Date;
  }): void {
    if (this.status === ContractPaymentStatus.PAID) {
      return;
    }

    this.status = ContractPaymentStatus.PAID;
    this.paymentIntentId = params.paymentIntentId;
    this.providerEventId = params.providerEventId;
    this.paidAt = params.paidAt;
    this.updatedAt = params.paidAt;
  }
}
