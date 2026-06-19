import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SupportStatus } from '../domain/enums/support-status.enum';
import { SupportType } from '../domain/enums/support-type.enum';

@Entity({ name: 'supports' })
export class SupportOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ type: 'varchar', default: SupportType.PHYSICAL_CARD })
  type: SupportType;

  @Column({ type: 'varchar', default: SupportStatus.PENDING_ACTIVATION })
  status: SupportStatus;

  @Column({ type: 'varchar', nullable: true })
  publicKey: string | null;

  @Column({ type: 'varchar', nullable: true })
  walletAddress: string | null;

  @Column({ type: 'varchar', nullable: true })
  supportCommitment: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
