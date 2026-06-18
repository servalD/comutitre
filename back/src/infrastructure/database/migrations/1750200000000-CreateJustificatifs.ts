import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateJustificatifs1750200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'justificatifs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'contractId', type: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'type', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'recu'" },
          { name: 'filePath', type: 'text' },
          { name: 'originalFilename', type: 'varchar' },
          { name: 'yousignVerificationId', type: 'varchar', isNullable: true },
          { name: 'yousignStatus', type: 'varchar', isNullable: true },
          { name: 'yousignStatusCodes', type: 'text', isNullable: true },
          { name: 'agentDecision', type: 'varchar', isNullable: true },
          { name: 'agentMotif', type: 'text', isNullable: true },
          { name: 'decidedBy', type: 'uuid', isNullable: true },
          { name: 'decidedAt', type: 'timestamptz', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'justificatifs',
      new TableIndex({
        name: 'IDX_justificatifs_contractId',
        columnNames: ['contractId'],
      }),
    );
    await queryRunner.createIndex(
      'justificatifs',
      new TableIndex({
        name: 'IDX_justificatifs_yousignVerificationId',
        columnNames: ['yousignVerificationId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('justificatifs');
  }
}
