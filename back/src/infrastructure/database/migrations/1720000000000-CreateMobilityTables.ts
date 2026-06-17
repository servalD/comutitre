import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMobilityTables1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mobility_identities',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'firstName', type: 'varchar' },
          { name: 'lastName', type: 'varchar' },
          { name: 'birthDate', type: 'date' },
          { name: 'photoUrl', type: 'varchar', isNullable: true },
          { name: 'address', type: 'jsonb', isNullable: true },
          { name: 'currentProfile', type: 'varchar' },
          {
            name: 'status',
            type: 'varchar',
            default: "'active'",
          },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'relationships',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'accountId', type: 'uuid' },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'relationshipType', type: 'varchar' },
          { name: 'permissions', type: 'jsonb' },
          {
            name: 'status',
            type: 'varchar',
            default: "'active'",
          },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'revokedAt', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'relationships',
      new TableIndex({
        name: 'IDX_relationships_account_identity_type',
        columnNames: ['accountId', 'mobilityIdentityId', 'relationshipType'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'contracts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'payerAccountId', type: 'uuid', isNullable: true },
          { name: 'productType', type: 'varchar' },
          {
            name: 'status',
            type: 'varchar',
            default: "'draft'",
          },
          { name: 'validFrom', type: 'timestamptz' },
          { name: 'validTo', type: 'timestamptz' },
          {
            name: 'renewalMode',
            type: 'varchar',
            default: "'manual'",
          },
          { name: 'currentTariff', type: 'decimal', precision: 10, scale: 2 },
          { name: 'cgvVersionAccepted', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'contractId', type: 'uuid', isNullable: true },
          { name: 'type', type: 'varchar' },
          {
            name: 'status',
            type: 'varchar',
            default: "'uploaded'",
          },
          { name: 'refusalReason', type: 'varchar', isNullable: true },
          { name: 'uploadedAt', type: 'timestamptz', default: 'now()' },
          { name: 'verifiedAt', type: 'timestamptz', isNullable: true },
          { name: 'verifiedBy', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'supports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'contractId', type: 'uuid', isNullable: true },
          {
            name: 'type',
            type: 'varchar',
            default: "'physical_card'",
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending_activation'",
          },
          { name: 'publicKey', type: 'varchar', isNullable: true },
          { name: 'activatedAt', type: 'timestamptz', isNullable: true },
          { name: 'revokedAt', type: 'timestamptz', isNullable: true },
          { name: 'expiresAt', type: 'timestamptz', isNullable: true },
          { name: 'lastUsedAt', type: 'timestamptz', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'timeline_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'mobilityIdentityId', type: 'uuid' },
          { name: 'contractId', type: 'uuid', isNullable: true },
          { name: 'supportId', type: 'uuid', isNullable: true },
          { name: 'actorType', type: 'varchar' },
          { name: 'actorId', type: 'uuid', isNullable: true },
          { name: 'type', type: 'varchar' },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('timeline_events');
    await queryRunner.dropTable('supports');
    await queryRunner.dropTable('documents');
    await queryRunner.dropTable('contracts');
    await queryRunner.dropIndex(
      'relationships',
      'IDX_relationships_account_identity_type',
    );
    await queryRunner.dropTable('relationships');
    await queryRunner.dropTable('mobility_identities');
  }
}
