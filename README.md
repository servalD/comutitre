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

## Documentation

| Sujet | Lien |
| --- | --- |
| Dev, test, build Docker | [docker/README.md](docker/README.md) |
| Infra Azure (Terraform) | [terraform/README.md](terraform/README.md) |
| Config Swarm & déploiement (Ansible) | [ansible/README.md](ansible/README.md) |
| Architecture back (hexagonale) | [back/src/ARCHITECTURE.md](back/src/ARCHITECTURE.md) |
| Auth & providers | [back/src/modules/auth/README.md](back/src/modules/auth/README.md) |
| Guards & RBAC | [back/src/shared/guards/README.md](back/src/shared/guards/README.md) |
| Base de données & migrations | [back/src/infrastructure/database/README.md](back/src/infrastructure/database/README.md) |

## Layout

```
front/                  Vite + React SPA
back/                   NestJS API (clean architecture)
  src/ARCHITECTURE.md       architecture rules — read before adding code
  src/modules/auth/README.md       auth & providers rules
  src/shared/guards/README.md      guards & RBAC rules
  src/infrastructure/database/README.md  TypeORM & migrations rules
docker/                 Dockerfiles live next to each app; compose & swarm here
  README.md                 how to run dev / test / prod / swarm
docs/                   functional specifications and technical guides
.github/workflows/      CI (tests), Trivy (security), Release (build+push to GHCR)
docker/                 Compose files (dev/test/build) + stack Swarm
terraform/              Infra Azure (3 VMs, VNet, NSG)
ansible/                Config Swarm + déploiement stack
.github/workflows/      CI (tests), Trivy (sécurité), Release (build+push GHCR)
```

## Infrastructure

```
Internet
   │  :80/:443
   ▼
┌──────────────────────────────────────────────────────┐
│  Azure — Docker Swarm (3 nœuds managers)             │
│                                                      │
│  node1 [ingress=true]        node2          node3    │
│  ┌─────────────────────┐                             │
│  │ Traefik :80/:443    │                             │
│  │  ├─ /api/*  ──────────────► back (2 replicas)    │
│  │  ├─ /*      ──────────────► front (2 replicas)   │
│  │  └─ /.well-known/*         certbot :8080          │
│  │       (ACME challenge)  │                         │
│  │ certbot (Let's Encrypt) │    db (Postgres, 1)     │
│  │  cert IP, 6 j, auto-   │    ▲                    │
│  │  renew, deploy-hook     │    └── back             │
│  └─────────────────────┘                             │
│                                                      │
│  Overlay networks : frontend (Traefik↔back/front)    │
│                     backend  (back↔db)               │
└──────────────────────────────────────────────────────┘

Provisionnement : Terraform (infra Azure) → Ansible (Swarm + stack)
CI/CD           : push main → build+scan+push GHCR → SSH deploy (migrations → back → front)
```

→ Détails : [docker/README.md](docker/README.md) · [terraform/README.md](terraform/README.md) · [ansible/README.md](ansible/README.md)

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

- **CI** — lint + build + unit + e2e (back), lint + build (front)
- **Trivy** — scan repo + images ; bloque sur HIGH/CRITICAL
- **Release** (merge sur `main`) — build images → scan → push `ghcr.io/<owner>/comutitre-{back,front}:<sha>` → deploy Swarm via SSH (migrations → back → front)
