import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateContracts1750200000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscription_contracts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'userId', type: 'uuid' },
          { name: 'productCode', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'brouillon'" },
          { name: 'holderFirstName', type: 'varchar' },
          { name: 'holderLastName', type: 'varchar' },
          { name: 'holderEmail', type: 'varchar' },
          { name: 'payerFirstName', type: 'varchar', isNullable: true },
          { name: 'payerLastName', type: 'varchar', isNullable: true },
          { name: 'payerEmail', type: 'varchar', isNullable: true },
          { name: 'legalRepEmail', type: 'varchar', isNullable: true },
          {
            name: 'yousignSignatureRequestId',
            type: 'varchar',
            isNullable: true,
          },
          { name: 'yousignSignatureLink', type: 'text', isNullable: true },
          { name: 'cgvuVersion', type: 'varchar', default: "'2025-v1'" },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'subscription_contracts',
      new TableIndex({
        name: 'IDX_subscription_contracts_userId',
        columnNames: ['userId'],
      }),
    );
    await queryRunner.createIndex(
      'subscription_contracts',
      new TableIndex({
        name: 'IDX_subscription_contracts_yousignSignatureRequestId',
        columnNames: ['yousignSignatureRequestId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscription_contracts');
  }
}
