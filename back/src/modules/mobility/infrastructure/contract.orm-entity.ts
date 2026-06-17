import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContractStatus } from '../domain/enums/contract-status.enum';
import { ProductType } from '../domain/enums/product-type.enum';
import { RenewalMode } from '../domain/enums/renewal-mode.enum';

@Entity({ name: 'contracts' })
export class ContractOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'uuid', nullable: true })
  payerAccountId: string | null;

  @Column({ type: 'varchar' })
  productType: ProductType;

  @Column({ type: 'varchar', default: ContractStatus.DRAFT })
  status: ContractStatus;

  @Column({ type: 'timestamptz' })
  validFrom: Date;

  @Column({ type: 'timestamptz' })
  validTo: Date;

  @Column({ type: 'varchar', default: RenewalMode.MANUAL })
  renewalMode: RenewalMode;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentTariff: number;

  @Column({ type: 'varchar', nullable: true })
  cgvVersionAccepted: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
