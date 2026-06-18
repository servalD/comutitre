import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCgvuAcceptances1750200000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cgvu_acceptances',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'contractId', type: 'uuid' },
          { name: 'productCgvuVersion', type: 'varchar' },
          { name: 'supportCguVersion', type: 'varchar', isNullable: true },
          { name: 'acceptedByUserId', type: 'uuid' },
          { name: 'actorRole', type: 'varchar' },
          { name: 'channel', type: 'varchar', default: "'web'" },
          { name: 'yousignSignatureRequestId', type: 'varchar' },
          { name: 'signedAt', type: 'timestamptz' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'cgvu_acceptances',
      new TableIndex({
        name: 'IDX_cgvu_acceptances_contractId',
        columnNames: ['contractId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cgvu_acceptances');
  }
}
