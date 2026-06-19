import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransportRightStatus } from '../domain/enums/transport-right-status.enum';

@Entity({ name: 'transport_rights' })
export class TransportRightOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'uuid' })
  contractId: string;

  @Column({ type: 'varchar' })
  productType: string;

  @Column({ type: 'varchar', default: TransportRightStatus.ACTIVE })
  status: TransportRightStatus;

  @Column({ type: 'timestamptz' })
  validFrom: Date;

  @Column({ type: 'timestamptz' })
  validTo: Date;

  @Column({ type: 'varchar' })
  rightCommitment: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
