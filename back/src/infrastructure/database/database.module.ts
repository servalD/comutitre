import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from '../config/env.validation';
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
        entities: [UserOrmEntity],
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
