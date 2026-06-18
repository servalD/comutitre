import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentStatus } from '../domain/enums/document-status.enum';
import { DocumentType } from '../domain/enums/document-type.enum';

@Entity({ name: 'documents' })
export class DocumentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mobilityIdentityId: string;

  @Column({ type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ type: 'varchar' })
  type: DocumentType;

  @Column({ type: 'varchar', default: DocumentStatus.UPLOADED })
  status: DocumentStatus;

  @Column({ type: 'varchar', nullable: true })
  refusalReason: string | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  uploadedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  verifiedBy: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
