import { IsIn } from 'class-validator';
import type { ContractPaymentPayMode } from '../../domain/contract-payment';

export class CreateCheckoutSessionRequest {
  @IsIn(['quarterly', 'monthly'])
  payMode: ContractPaymentPayMode;
}
