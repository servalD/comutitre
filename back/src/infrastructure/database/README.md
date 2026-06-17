# Database & migrations rules (TypeORM + PostgreSQL)

## Two layers, one schema

- **Domain model** (`modules/<m>/domain/<name>.ts`): plain class, no TypeORM.
- **ORM entity** (`modules/<m>/infrastructure/<name>.orm-entity.ts`): `@Entity()` persistence shape.
- The repository **adapter** maps between them. Keep ORM entities inside infrastructure.

## Connections

- The running app connects via `database.module.ts` (`TypeOrmModule.forRootAsync`, reads
  `DATABASE_*` from the validated config).
- The TypeORM **CLI** (migrations) uses the standalone `typeorm.config.ts` DataSource. Both share
  the same options so dev and prod behave identically.
- Both support Docker secrets through `DATABASE_PASSWORD_FILE` (the `<NAME>_FILE` convention).

## Migrations are the single source of truth

- **`synchronize` is always `false`.** Never enable schema auto-sync, in any environment.
- Schema changes ⇒ a migration in `infrastructure/database/migrations/`.

### Workflow

```bash
# 1. Change/add an ORM entity.
# 2. Generate a migration from the diff:
pnpm migration:generate src/infrastructure/database/migrations/AddSomething
# 3. Review the generated SQL, then apply:
pnpm migration:run
# Revert the last one if needed:
pnpm migration:revert
```

### Where migrations run

| Environment | How |
| --- | --- |
| dev | `pnpm migration:run` (ts-node) |
| e2e | `dataSource.runMigrations()` in the test bootstrap |
| prod (swarm) | the `migrate` service in `stack.swarm.yml`, run via CI before rolling update |

## Conventions

- UUID primary keys (`gen_random_uuid()` — built into Postgres 13+).
- Timestamps via `@CreateDateColumn` / `@UpdateDateColumn` (`timestamptz`).
- Add explicit unique indexes for natural keys (e.g. `(provider, providerSubject)`).
- Migration class name matches its file: `Name<timestamp>`.
