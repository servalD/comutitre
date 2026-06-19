import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateContractPayments1750400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contract_payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'contractId', type: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'provider', type: 'varchar' },
          { name: 'checkoutSessionId', type: 'varchar' },
          { name: 'paymentIntentId', type: 'varchar', isNullable: true },
          { name: 'providerEventId', type: 'varchar', isNullable: true },
          { name: 'status', type: 'varchar' },
          { name: 'amountCents', type: 'integer' },
          { name: 'currency', type: 'varchar', default: "'eur'" },
          { name: 'payMode', type: 'varchar' },
          { name: 'checkoutUrl', type: 'text', isNullable: true },
          { name: 'paidAt', type: 'timestamptz', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'contract_payments',
      new TableIndex({
        name: 'IDX_contract_payments_contractId',
        columnNames: ['contractId'],
      }),
    );
    await queryRunner.createIndex(
      'contract_payments',
      new TableIndex({
        name: 'IDX_contract_payments_userId',
        columnNames: ['userId'],
      }),
    );
    await queryRunner.createIndex(
      'contract_payments',
      new TableIndex({
        name: 'UQ_contract_payments_checkoutSessionId',
        columnNames: ['checkoutSessionId'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'contract_payments',
      new TableIndex({
        name: 'UQ_contract_payments_providerEventId',
        columnNames: ['providerEventId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contract_payments');
  }
}
