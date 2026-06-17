import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from '../config/env.validation';
import { ContractOrmEntity } from '../../modules/mobility/infrastructure/contract.orm-entity';
import { DocumentOrmEntity } from '../../modules/mobility/infrastructure/document.orm-entity';
import { MobilityIdentityOrmEntity } from '../../modules/mobility/infrastructure/mobility-identity.orm-entity';
import { RelationshipOrmEntity } from '../../modules/mobility/infrastructure/relationship.orm-entity';
import { SupportOrmEntity } from '../../modules/mobility/infrastructure/support.orm-entity';
import { TimelineEventOrmEntity } from '../../modules/mobility/infrastructure/timeline-event.orm-entity';
import { UserOrmEntity } from '../../modules/users/infrastructure/user.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', { infer: true }),
        port: config.get('DATABASE_PORT', { infer: true }),
        database: config.get('DATABASE_NAME', { infer: true }),
        username: config.get('DATABASE_USER', { infer: true }),
        password: config.get('DATABASE_PASSWORD', { infer: true }),
        entities: [
          UserOrmEntity,
          MobilityIdentityOrmEntity,
          RelationshipOrmEntity,
          ContractOrmEntity,
          DocumentOrmEntity,
          SupportOrmEntity,
          TimelineEventOrmEntity,
        ],
        migrations: [__dirname + '/migrations/*.{ts,js}'],
        // Never auto-sync schema: migrations are the single source of truth.
        synchronize: false,
        // Migrations are applied explicitly (CLI in dev, the `migrate` service in
        // prod, and runMigrations() in e2e) rather than on every boot.
        migrationsRun: false,
        autoLoadEntities: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
