import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { PermissionSet } from '../domain/permission-set';
import { RelationshipStatus } from '../domain/enums/relationship-status.enum';
import { RelationshipType } from '../domain/enums/relationship-type.enum';

@Entity({ name: 'relationships' })
@Index(['accountId', 'mobilityIdentityId', 'relationshipType'], {
  unique: true,
})
export class RelationshipOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'varchar' })
  relationshipType: RelationshipType;

  @Column({ type: 'jsonb' })
  permissions: PermissionSet;

  @Column({ type: 'varchar', default: RelationshipStatus.ACTIVE })
  status: RelationshipStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;
}
