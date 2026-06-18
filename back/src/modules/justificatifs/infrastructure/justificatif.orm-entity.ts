import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JustificatifStatus, JustificatifType } from '../domain/justificatif';

@Entity({ name: 'justificatifs' })
@Index(['contractId'])
@Index(['yousignVerificationId'])
export class JustificatifOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  contractId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  type: JustificatifType;

  @Column({ type: 'varchar', default: JustificatifStatus.RECU })
  status: JustificatifStatus;

  @Column({ type: 'text' })
  filePath: string;

  @Column({ type: 'varchar' })
  originalFilename: string;

  @Column({ type: 'varchar', nullable: true })
  yousignVerificationId: string | null;

  @Column({ type: 'varchar', nullable: true })
  yousignStatus: string | null;

  @Column({ type: 'simple-array', nullable: true })
  yousignStatusCodes: string[];

  @Column({ type: 'varchar', nullable: true })
  agentDecision: string | null;

  @Column({ type: 'text', nullable: true })
  agentMotif: string | null;

  @Column({ type: 'uuid', nullable: true })
  decidedBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  decidedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
