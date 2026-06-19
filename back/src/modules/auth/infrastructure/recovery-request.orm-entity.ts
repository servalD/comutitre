import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('recovery_requests')
export class RecoveryRequestOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'varchar' })
  verificationCode!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}
