import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ValidationResult } from '../domain/enums/validation-result.enum';

@Entity({ name: 'validation_events' })
export class ValidationEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'uuid' })
  transportRightId: string;

  @Column({ type: 'uuid' })
  supportId: string;

  @Column({ type: 'varchar' })
  stationId: string;

  @Column({ type: 'varchar' })
  validatorId: string;

  @Column({ type: 'varchar' })
  result: ValidationResult;

  @Column({ type: 'varchar', nullable: true })
  reasonCode: string | null;

  @Column({ type: 'timestamptz' })
  occurredAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
