# Comutitre — Back (NestJS)

Clean-architecture NestJS API. Before writing code, read the rules docs:

- [`src/ARCHITECTURE.md`](src/ARCHITECTURE.md) — layers, dependency rule, how to add a module.
- [`src/modules/auth/README.md`](src/modules/auth/README.md) — auth providers (Dynamic + FranceConnect).
- [`src/shared/guards/README.md`](src/shared/guards/README.md) — guards & RBAC.
- [`src/infrastructure/database/README.md`](src/infrastructure/database/README.md) — TypeORM & migrations.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm start:dev` | Run with watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm test` | Unit tests (no DB) |
| `pnpm test:e2e` | e2e tests (needs Postgres on `:5433`, see root README) |
| `pnpm lint` | ESLint (autofix) |
| `pnpm migration:generate src/infrastructure/database/migrations/<Name>` | Generate a migration from entity changes |
| `pnpm migration:run` | Apply pending migrations (dev) |
| `pnpm migration:revert` | Revert the last migration |

## Environment

All configuration is validated at startup by `src/infrastructure/config/env.validation.ts`
(missing/invalid vars crash the app immediately). See `../.env.example` for the full list.
Secrets may be supplied as files via the `<NAME>_FILE` convention (Docker/Swarm secrets).

## Endpoints (overview)

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | public |
| GET | `/api/docs` | public — Swagger UI (documentation API) |
| GET | `/auth/franceconnect/login` | public — redirects to FranceConnect |
| GET | `/auth/franceconnect/callback` | public — issues an app session token |
| GET | `/auth/me` | authenticated |
| GET | `/users/me` | authenticated |
| GET | `/users` | `ADMIN` |
| PATCH | `/users/:id/roles` | `ADMIN` |

