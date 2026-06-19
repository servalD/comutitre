import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { DataSource, DataSourceOptions } from 'typeorm';
import { CgvuAcceptanceOrmEntity } from '../../modules/contracts/infrastructure/cgvu-acceptance.orm-entity';
import { ContractOrmEntity as SubscriptionContractOrmEntity } from '../../modules/contracts/infrastructure/contract.orm-entity';
import { JustificatifOrmEntity } from '../../modules/justificatifs/infrastructure/justificatif.orm-entity';
import { ContractOrmEntity as MobilityContractOrmEntity } from '../../modules/mobility/infrastructure/contract.orm-entity';
import { DocumentOrmEntity } from '../../modules/mobility/infrastructure/document.orm-entity';
import { AnomalyCaseOrmEntity } from '../../modules/mobility/infrastructure/anomaly-case.orm-entity';
import { MobilityIdentityOrmEntity } from '../../modules/mobility/infrastructure/mobility-identity.orm-entity';
import { ProofEventOrmEntity } from '../../modules/mobility/infrastructure/proof-event.orm-entity';
import { RelationshipOrmEntity } from '../../modules/mobility/infrastructure/relationship.orm-entity';
import { SupportOrmEntity } from '../../modules/mobility/infrastructure/support.orm-entity';
import { TimelineEventOrmEntity } from '../../modules/mobility/infrastructure/timeline-event.orm-entity';
import { TransportRightOrmEntity } from '../../modules/mobility/infrastructure/transport-right.orm-entity';
import { ValidationEventOrmEntity } from '../../modules/mobility/infrastructure/validation-event.orm-entity';
import { RecoveryRequestOrmEntity } from '../../modules/auth/infrastructure/recovery-request.orm-entity';
import { UserOrmEntity } from '../../modules/users/infrastructure/user.orm-entity';

/** Read an env var, falling back to the file referenced by `<NAME>_FILE` (Docker secrets). */
const fromEnvOrFile = (name: string, fallback: string): string => {
  const direct = process.env[name];
  if (direct) {
    return direct;
  }
  const file = process.env[`${name}_FILE`];
  if (file) {
    return readFileSync(file, 'utf8').trim();
  }
  return fallback;
};

/**
 * Standalone DataSource used by the TypeORM CLI for migrations.
 * The running app builds its own connection via {@link DatabaseModule}; both
 * share the same options below so dev and prod stay consistent.
 *
 * Dev:  pnpm migration:run   (ts-node, this file)
 * Prod: node ... migration:run -d dist/infrastructure/database/typeorm.config.js
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  database: process.env.DATABASE_NAME ?? 'comutitre',
  username: process.env.DATABASE_USER ?? 'comutitre',
  password: fromEnvOrFile('DATABASE_PASSWORD', 'comutitre'),
  entities: [
    UserOrmEntity,
    MobilityIdentityOrmEntity,
    RelationshipOrmEntity,
    MobilityContractOrmEntity,
    DocumentOrmEntity,
    SupportOrmEntity,
    TimelineEventOrmEntity,
    TransportRightOrmEntity,
    ProofEventOrmEntity,
    ValidationEventOrmEntity,
    AnomalyCaseOrmEntity,
    SubscriptionContractOrmEntity,
    CgvuAcceptanceOrmEntity,
    JustificatifOrmEntity,
    RecoveryRequestOrmEntity,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
