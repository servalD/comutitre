# Comutitre

Monorepo: a **Vite + React** front (`front/`) and a **NestJS** back (`back/`) built on a
clean (hexagonal) architecture with PostgreSQL + TypeORM.

Authentication is delegated to external identity providers:

- **Dynamic.xyz** — the front authenticates the user; the back **verifies** the issued JWT
  against Dynamic's JWKS.
- **FranceConnect** (OIDC) — the back is the Relying Party and issues its own session JWT.
  Currently runs in **mock mode** (`FRANCECONNECT_MODE=mock`) until real credentials exist.

Roles (RBAC: `USER` / `ADMIN`) are **app-managed** in our own database.

> Stripe payments are planned but not implemented yet (see the back architecture doc).

## Layout

```
front/                  Vite + React SPA (not implemented in this iteration)
back/                   NestJS API (clean architecture)
  src/ARCHITECTURE.md       architecture rules — read before adding code
  src/modules/auth/README.md       auth & providers rules
  src/shared/guards/README.md      guards & RBAC rules
  src/infrastructure/database/README.md  TypeORM & migrations rules
docker/                 Dockerfiles live next to each app; compose & swarm here
  README.md                 how to run dev / test / prod / swarm
.github/workflows/      CI (tests), Trivy (security), Release (build+push to GHCR)
```

## Quickstart (local, dev stack)

```bash
cp .env.dev.example .env.dev   # fill DYNAMIC_ENVIRONMENT_ID etc.
docker compose -f docker/docker-compose.dev.yml up
# back  -> http://localhost:3000  (GET /health)
# front -> http://localhost:5173
```

## Back without Docker

```bash
cd back
pnpm install
# point DATABASE_* at a running Postgres, then:
pnpm migration:run
pnpm start:dev
```

## Tests

```bash
cd back
pnpm test                                            # unit
docker compose -f ../docker/docker-compose.test.yml up -d
cp ../.env.test.example ../.env.test
pnpm test:e2e                                         # e2e (Postgres on :5433)
```

## CI/CD

- **CI** runs lint + build + unit + e2e (against a Postgres service) for the back, and lint + build for the front.
- **Trivy** scans the repo (deps, misconfig, secrets) and the built images; fails on HIGH/CRITICAL.
- **Release** (on merge to `main`) builds the hardened images, scans them, and pushes to
  `ghcr.io/<owner>/comutitre-back` and `-front`.
