import { Injectable } from '@nestjs/common';
import {
  ConfirmContractPaymentResult,
  ConfirmContractPaymentUseCase,
} from './confirm-contract-payment.use-case';

export type ConfirmMockPaymentResult = ConfirmContractPaymentResult;

@Injectable()
export class ConfirmMockPaymentUseCase {
  constructor(private readonly confirmPayment: ConfirmContractPaymentUseCase) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<ConfirmMockPaymentResult> {
    return this.confirmPayment.execute(contractId, userId);
  }
}
