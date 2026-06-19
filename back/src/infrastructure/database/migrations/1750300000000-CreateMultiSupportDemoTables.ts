import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateMultiSupportDemoTables1750300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('supports', [
      new TableColumn({
        name: 'walletAddress',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'supportCommitment',
        type: 'varchar',
        isNullable: true,
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'transport_rights',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'contractId', type: 'uuid' },
          { name: 'productType', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'active'" },
          { name: 'validFrom', type: 'timestamptz' },
          { name: 'validTo', type: 'timestamptz' },
          { name: 'rightCommitment', type: 'varchar' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['mobilityIdentityId'],
            referencedTableName: 'mobility_identities',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['contractId'],
            referencedTableName: 'contracts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'support_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'transportRightId', type: 'uuid' },
          { name: 'supportId', type: 'uuid', isNullable: true },
          { name: 'type', type: 'varchar' },
          { name: 'eventHash', type: 'varchar' },
          { name: 'previousHash', type: 'varchar', isNullable: true },
          { name: 'payload', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['mobilityIdentityId'],
            referencedTableName: 'mobility_identities',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['transportRightId'],
            referencedTableName: 'transport_rights',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['supportId'],
            referencedTableName: 'supports',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'validation_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'transportRightId', type: 'uuid' },
          { name: 'supportId', type: 'uuid' },
          { name: 'stationId', type: 'varchar' },
          { name: 'validatorId', type: 'varchar' },
          { name: 'result', type: 'varchar' },
          { name: 'reasonCode', type: 'varchar', isNullable: true },
          { name: 'occurredAt', type: 'timestamptz' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['mobilityIdentityId'],
            referencedTableName: 'mobility_identities',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['transportRightId'],
            referencedTableName: 'transport_rights',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['supportId'],
            referencedTableName: 'supports',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'anomaly_cases',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'transportRightId', type: 'uuid' },
          { name: 'supportId', type: 'uuid' },
          { name: 'type', type: 'varchar' },
          { name: 'severity', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'open'" },
          { name: 'summary', type: 'text' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['mobilityIdentityId'],
            referencedTableName: 'mobility_identities',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['transportRightId'],
            referencedTableName: 'transport_rights',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['supportId'],
            referencedTableName: 'supports',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('anomaly_cases');
    await queryRunner.dropTable('validation_events');
    await queryRunner.dropTable('support_events');
    await queryRunner.dropTable('transport_rights');
    await queryRunner.dropColumn('supports', 'supportCommitment');
    await queryRunner.dropColumn('supports', 'walletAddress');
  }
}
