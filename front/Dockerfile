# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Hardened multi-stage build for the Vite/React front.
#   - builder: install deps and produce the static bundle
#   - runner:  unprivileged nginx (uid 101, listens on 8080) serving the SPA
# ---------------------------------------------------------------------------

FROM node:22-alpine AS builder

RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Vite inlines env vars at build time. In prod the SPA and API share an origin
# behind Traefik, so default to the relative `/api` (overridable via --build-arg).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build


# nginx-unprivileged already runs as a non-root user and never needs root.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

# Patch OpenSSL (CVE-2026-31789) — upgrade as root before dropping privileges.
USER root
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Explicit non-root user (uid 101) — satisfies Trivy DS-0002.
USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1
