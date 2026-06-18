import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthProvider } from '../domain/user';
import { Role } from '../../../shared/enums/role.enum';

/**
 * Persistence model (TypeORM). Kept separate from the {@link User} domain model:
 * the adapter maps between the two so the domain stays free of ORM concerns.
 */
@Entity({ name: 'users' })
@Index(['provider', 'providerSubject'], { unique: true })
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  provider: AuthProvider;

  @Column({ type: 'varchar' })
  providerSubject: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  walletAddress: string | null;

  @Column({ type: 'varchar', nullable: true })
  displayName: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Column({ type: 'simple-array' })
  roles: Role[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
