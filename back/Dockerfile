# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Hardened multi-stage build for the NestJS back.
#   - builder: install all deps, compile, then prune to production deps
#   - runner:  minimal Alpine image running as the non-root `node` user
# ---------------------------------------------------------------------------

FROM node:22-alpine AS builder

# pnpm via corepack (version pinned by package.json "packageManager" if present)
RUN corepack enable
WORKDIR /app

# Install dependencies first to maximise layer caching.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build && pnpm prune --prod


FROM node:22-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Patch OpenSSL (CVE-2026-31789) while still root, then drop privileges.
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3

# Drop privileges: the base image ships a non-root `node` user.
USER node

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "dist/main"]
