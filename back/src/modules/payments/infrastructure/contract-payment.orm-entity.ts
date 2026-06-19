import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ContractPaymentStatus,
  PaymentProvider,
} from '../domain/contract-payment';
import type { ContractPaymentPayMode } from '../domain/contract-payment';

@Entity({ name: 'contract_payments' })
@Index(['contractId'])
@Index(['userId'])
@Index(['checkoutSessionId'], { unique: true })
@Index(['providerEventId'], { unique: true })
export class ContractPaymentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  contractId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  provider: PaymentProvider;

  @Column({ type: 'varchar' })
  checkoutSessionId: string;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId: string | null;

  @Column({ type: 'varchar', nullable: true })
  providerEventId: string | null;

  @Column({ type: 'varchar' })
  status: ContractPaymentStatus;

  @Column({ type: 'integer' })
  amountCents: number;

  @Column({ type: 'varchar', default: 'eur' })
  currency: string;

  @Column({ type: 'varchar' })
  payMode: ContractPaymentPayMode;

  @Column({ type: 'text', nullable: true })
  checkoutUrl: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
