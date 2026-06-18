import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActorRole } from '../domain/contract';

@Entity({ name: 'cgvu_acceptances' })
@Index(['contractId'])
export class CgvuAcceptanceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  contractId: string;

  @Column({ type: 'varchar' })
  productCgvuVersion: string;

  @Column({ type: 'varchar', nullable: true })
  supportCguVersion: string | null;

  @Column({ type: 'uuid' })
  acceptedByUserId: string;

  @Column({ type: 'varchar' })
  actorRole: ActorRole;

  @Column({ type: 'varchar', default: 'web' })
  channel: string;

  @Column({ type: 'varchar' })
  yousignSignatureRequestId: string;

  @Column({ type: 'timestamptz' })
  signedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
