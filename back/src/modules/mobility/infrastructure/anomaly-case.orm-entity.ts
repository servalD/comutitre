import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnomalyStatus } from '../domain/enums/anomaly-status.enum';

@Entity({ name: 'anomaly_cases' })
export class AnomalyCaseOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'uuid' })
  transportRightId: string;

  @Column({ type: 'uuid' })
  supportId: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  severity: string;

  @Column({ type: 'varchar', default: AnomalyStatus.OPEN })
  status: AnomalyStatus;

  @Column({ type: 'text' })
  summary: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
