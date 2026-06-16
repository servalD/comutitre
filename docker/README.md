# Docker, Compose & Swarm

Per-app Dockerfiles live next to each app (`back/Dockerfile`, `front/Dockerfile`). This folder
holds the Compose files and the Swarm stack.

## Images (hardening)

Both images are multi-stage and run **non-root**:

- **back** — `node:22-alpine`; builds, prunes to prod deps, runs as `node`; `HEALTHCHECK` on
  `/health`.
- **front** — builds the Vite bundle, served by **`nginx-unprivileged`** (uid 101, port `8080`)
  with `nginx.conf` (SPA fallback + security headers).

## Compose files

| File | Purpose |
| --- | --- |
| `docker-compose.dev.yml` | Live-reload dev: back (watch), front (vite), Postgres. Uses `../.env.dev`. |
| `docker-compose.test.yml` | Ephemeral Postgres (tmpfs) on `:5433` for e2e. |
| `docker-compose.prod.yml` | Single-host prod: `migrate` → `back` → `front` → `db`. Uses `../.env.prod`. |
| `docker-compose.build.yml` | Builds the prod images locally / in CI. |

### Dev

```bash
cp ../.env.dev.example ../.env.dev   # then edit
docker compose -f docker-compose.dev.yml up
```

### Test (e2e)

```bash
docker compose -f docker-compose.test.yml up -d
cp ../.env.test.example ../.env.test
pnpm --dir ../back test:e2e
docker compose -f docker-compose.test.yml down
```

### Prod (single host)

```bash
cp ../.env.prod.example ../.env.prod   # fill secrets
export BACK_IMAGE=ghcr.io/<owner>/comutitre-back:<tag>
export FRONT_IMAGE=ghcr.io/<owner>/comutitre-front:<tag>
docker compose -f docker-compose.prod.yml up -d
```

The `migrate` service applies migrations and exits; `back` only starts once it completes.

## Production with Docker Swarm

`stack.prod.yml` is Swarm-native: replicas, rolling `update_config` (start-first), resource limits,
healthchecks, overlay networks, and **Docker secrets** for the DB password and app JWT secret
(mounted as files, consumed via the `<NAME>_FILE` convention).

```bash
# Initialize a swarm (once):
docker swarm init

# Create the secrets (once):
printf '%s' "$(openssl rand -base64 32)" | docker secret create comutitre_app_jwt_secret -
printf '%s' 'your-strong-db-password'    | docker secret create comutitre_db_password -

# Deploy:
export BACK_IMAGE=ghcr.io/<owner>/comutitre-back:<tag>
export FRONT_IMAGE=ghcr.io/<owner>/comutitre-front:<tag>
export DYNAMIC_ENVIRONMENT_ID=... FRANCECONNECT_CLIENT_ID=... # etc.
docker stack deploy -c stack.prod.yml comutitre

# Inspect / tear down:
docker stack services comutitre
docker stack rm comutitre
```
