import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActorType } from '../domain/enums/actor-type.enum';

@Entity({ name: 'timeline_events' })
export class TimelineEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ type: 'uuid', nullable: true })
  supportId: string | null;

  @Column({ type: 'varchar' })
  actorType: ActorType;

  @Column({ type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
