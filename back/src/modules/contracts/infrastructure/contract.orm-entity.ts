import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContractStatus } from '../domain/contract';

@Entity({ name: 'subscription_contracts' })
@Index(['userId'])
@Index(['yousignSignatureRequestId'])
export class ContractOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  productCode: string;

  @Column({ type: 'varchar', default: ContractStatus.BROUILLON })
  status: ContractStatus;

  @Column({ type: 'varchar' })
  holderFirstName: string;

  @Column({ type: 'varchar' })
  holderLastName: string;

  @Column({ type: 'varchar' })
  holderEmail: string;

  @Column({ type: 'varchar', nullable: true })
  payerFirstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  payerLastName: string | null;

  @Column({ type: 'varchar', nullable: true })
  payerEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  legalRepEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  yousignSignatureRequestId: string | null;

  @Column({ type: 'text', nullable: true })
  yousignSignatureLink: string | null;

  @Column({ type: 'varchar', default: '2025-v1' })
  cgvuVersion: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
