# Auth rules (providers & sessions)

The back **never stores passwords**. Authentication is delegated to external providers; the back
verifies their proof and maps it to a **local user** with app-managed roles.

## Normalized identity

Every provider is reduced to an `ExternalIdentity` (`domain/external-identity.ts`):
`{ provider, subject, email, walletAddress, displayName }`. The rest of the app only ever sees
this — never raw provider tokens.

## Provider 1 — Dynamic.xyz (Bearer tokens)

- The **front** authenticates with Dynamic and obtains a JWT.
- The front sends it as `Authorization: Bearer <token>` on API calls.
- `DynamicTokenVerifier` verifies it (RS256) against `DYNAMIC_JWKS_URL`, checks the
  environment issuer (`DYNAMIC_TOKEN_ISSUER`, default `app.dynamic.xyz/<env>`),
  `DYNAMIC_TOKEN_AUDIENCE` (default: the Dynamic environment ID), `environment_id` when present,
  and requires `scope` to include
  `user:basic`.
- For the hackathon third-party auth flow, the SPA can call
  `POST /auth/dynamic/external-jwt` after FranceConnect login. The backend refuses local users
  and non-sandbox Dynamic environments, then issues a short JWT dedicated to Dynamic with
  `aud=dynamic` and exposes its public key at
  `GET /auth/dynamic/.well-known/jwks.json`.

Dynamic dashboard values for the sandbox:

```text
Environment ID: 0ac8438d-93b8-41dc-baba-e830a96687bc
Environment kind: sandbox
JWKS Endpoint: https://app.dynamicauth.com/api/v0/sdk/0ac8438d-93b8-41dc-baba-e830a96687bc/.well-known/jwks
Minimum API version: 2026_04_01
Incoming token issuer: app.dynamic.xyz/0ac8438d-93b8-41dc-baba-e830a96687bc
Incoming token audience: 0ac8438d-93b8-41dc-baba-e830a96687bc

Third-party auth issuer: http://localhost:3000/api/auth/dynamic
Third-party auth JWKS URL: http://localhost:3000/api/auth/dynamic/.well-known/jwks.json
Third-party auth audience: dynamic
Third-party auth private key: set DYNAMIC_EXTERNAL_JWT_PRIVATE_KEY for stable JWKS across restarts
```

## Provider 2 — FranceConnect (OIDC, back = Relying Party)

- `GET /auth/franceconnect/login` → redirects to FranceConnect's authorize endpoint.
- `GET /auth/franceconnect/callback` → exchanges the code for an identity, syncs the user, and
  issues an **app session JWT** (our own token, `AppJwtService`), handed to the SPA via URL fragment.
- Subsequent API calls send that app token as a Bearer; it is verified by `AppJwtService`.

### FranceConnect modes

`FRANCECONNECT_MODE=mock` short-circuits the OIDC calls with a deterministic fake identity so the
full flow can be exercised without real credentials.

`FRANCECONNECT_MODE=sandbox` targets the current FranceConnect v2 sandbox and requires
client credentials provisioned from the FranceConnect partner space. The public
`france-connect/service-provider-example` client is a legacy limited-use client; against the current
v2 sandbox it returns `Y04EA6EF` (`client_id` unknown or misconfigured). If FranceConnect is
unavailable after a valid callback reaches us, `FRANCECONNECT_FALLBACK_TO_MOCK=true` issues the same
app JWT from a mock identity so the user journey can continue.

For the hackathon demo, keep `FRANCECONNECT_MODE=mock` unless a valid v2 sandbox client has been
provisioned. This keeps the primary flow independent from external habilitation and sandbox
availability.

`FRANCECONNECT_MODE=live` is reserved for provisioned credentials and should disable mock fallback in
production.

**TODO before going live:**

- Provision `FRANCECONNECT_CLIENT_ID` / `FRANCECONNECT_CLIENT_SECRET` / issuer URL, set
  `FRANCECONNECT_MODE=sandbox` or `FRANCECONNECT_MODE=live` depending on the target environment.
- Persist and validate `state` + `nonce` (CSRF/replay) — see `FranceConnectLoginUseCase`.
- Verify the FranceConnect ID-token signature and `nonce` in `exchangeCodeLive`.

## Token routing

`CompositeTokenVerifier` inspects the (unverified) `iss` claim and routes:

- `iss === "comutitre"` → app session token → `AppJwtService`.
- otherwise → Dynamic token → `DynamicTokenVerifier`.

It is bound to the `TokenVerifier` port and is what the global `AuthGuard` calls. In e2e tests the
`TokenVerifier` provider is overridden with a fake.

## User sync & roles

`SyncUserUseCase` (find-or-create by `provider` + `subject`) runs on every authenticated request.
New users get `[USER]`; re-sync never downgrades roles. Roles are app-managed — see
[`../../shared/guards/README.md`](../../shared/guards/README.md).

## Adding another provider

1. Implement a verifier (Bearer) or an OIDC service that returns an `ExternalIdentity`.
2. Add the provider to `AuthProvider` (in `modules/users/domain/user.ts`).
3. Route it (extend `CompositeTokenVerifier`) and/or add controller endpoints.
4. Everything downstream (sync, guards, RBAC) works unchanged.
