import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from '../domain/address';
import { IdentityStatus } from '../domain/enums/identity-status.enum';
import { Profile } from '../domain/enums/profile.enum';

@Entity({ name: 'mobility_identities' })
export class MobilityIdentityOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'date' })
  birthDate: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  address: Address | null;

  @Column({ type: 'varchar' })
  currentProfile: Profile;

  @Column({ type: 'varchar', default: IdentityStatus.ACTIVE })
  status: IdentityStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
