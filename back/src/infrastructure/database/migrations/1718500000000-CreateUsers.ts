import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsers1718500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'provider', type: 'varchar' },
          { name: 'providerSubject', type: 'varchar' },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'walletAddress', type: 'varchar', isNullable: true },
          { name: 'displayName', type: 'varchar', isNullable: true },
          // 'simple-array' is stored as a comma-separated text column.
          { name: 'roles', type: 'text' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_provider_subject',
        columnNames: ['provider', 'providerSubject'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_provider_subject');
    await queryRunner.dropTable('users');
  }
}
