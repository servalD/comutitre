import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'support_events' })
export class ProofEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'uuid' })
  transportRightId: string;

  @Column({ type: 'uuid', nullable: true })
  supportId: string | null;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  eventHash: string;

  @Column({ type: 'varchar', nullable: true })
  previousHash: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
