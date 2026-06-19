import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRecoveryRequests1750300000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'recovery_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'email', type: 'varchar' },
          { name: 'passwordHash', type: 'varchar' },
          { name: 'verificationCode', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'expiresAt', type: 'timestamptz' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'completedAt', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'recovery_requests',
      new TableIndex({
        name: 'IDX_recovery_requests_email_status',
        columnNames: ['email', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('recovery_requests');
  }
}
