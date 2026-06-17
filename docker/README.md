# Docker — images & Compose local

Les Dockerfiles sont dans chaque app (`back/Dockerfile`, `front/Dockerfile`). Ce dossier contient les fichiers Compose et le stack Swarm.

## Images

Les deux images sont multi-stage et tournent **non-root** :

| Image | Base | Port | Healthcheck |
| --- | --- | --- | --- |
| `comutitre-back` | `node:22-alpine`, user `node` | 3000 | `GET /health` |
| `comutitre-front` | `nginx-unprivileged:1.27-alpine`, uid 101 | 8080 | `GET /` |

## Fichiers Compose

| Fichier | Usage |
| --- | --- |
| `docker-compose.dev.yml` | Dev live-reload : back (watch), front (vite), Postgres. Lit `../.env.dev`. |
| `docker-compose.test.yml` | Postgres éphémère (tmpfs) sur `:5433` pour les tests e2e. |
| `docker-compose.build.yml` | Build des images de prod en local ou en CI. |

## Dev

```bash
cp .env.dev.example .env.dev   # remplir DYNAMIC_ENVIRONMENT_ID etc.
docker compose -f docker/docker-compose.dev.yml up
# back  → http://localhost:3000  (GET /health, swagger sur /api/docs)
# front → http://localhost:5173
```

## Tests e2e

```bash
docker compose -f docker/docker-compose.test.yml up -d
cp .env.test.example .env.test
pnpm --dir back test:e2e
docker compose -f docker/docker-compose.test.yml down
```

## Build des images de prod

```bash
export BACK_IMAGE=ghcr.io/<owner>/comutitre-back:<tag>
export FRONT_IMAGE=ghcr.io/<owner>/comutitre-front:<tag>
docker compose -f docker/docker-compose.build.yml build
```

En CI, c'est le job `Release` (`.github/workflows/release.yml`) qui build, scan Trivy et push vers GHCR à chaque merge sur `main`.

## Stack Swarm — `stack.swarm.yml`

Voir [`../terraform/README.md`](../terraform/README.md) et [`../ansible/README.md`](../ansible/README.md) pour le provisionnement complet.

Routage Traefik (par chemin, cert Let's Encrypt sur IP publique) :

| Chemin | Service |
| --- | --- |
| `/.well-known/acme-challenge/*` (HTTP) | `certbot` standalone (port 8080 interne) |
| `/api/*` (HTTPS) | `back` |
| `/*` (HTTPS) | `front` |
| HTTP (reste) | redirect → HTTPS |
