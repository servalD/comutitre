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
- `DynamicTokenVerifier` verifies it (RS256) against Dynamic's per-environment JWKS:
  `https://app.dynamic.xyz/api/v0/sdk/${DYNAMIC_ENVIRONMENT_ID}/.well-known/jwks`.
- We **do not** issue Dynamic tokens.

## Provider 2 — FranceConnect (OIDC, back = Relying Party)

- `GET /auth/franceconnect/login` → redirects to FranceConnect's authorize endpoint.
- `GET /auth/franceconnect/callback` → exchanges the code for an identity, syncs the user, and
  issues an **app session JWT** (our own token, `AppJwtService`), handed to the SPA via URL fragment.
- Subsequent API calls send that app token as a Bearer; it is verified by `AppJwtService`.

### FranceConnect modes

`FRANCECONNECT_MODE=mock` short-circuits the OIDC calls with a deterministic fake identity so the
full flow can be exercised without real credentials.

`FRANCECONNECT_MODE=sandbox` uses FranceConnect's public integration credentials configured in the
untracked local `.env.dev` file and the allowlisted callback `http://localhost:3000/callback`. If
FranceConnect is unavailable or returns an error during the demo,
`FRANCECONNECT_FALLBACK_TO_MOCK=true` issues the same app JWT from a mock identity so the user
journey can continue.

`FRANCECONNECT_MODE=live` is reserved for provisioned credentials and should disable mock fallback in
production.

**TODO before going live:**

- Provision `FRANCECONNECT_CLIENT_ID` / `FRANCECONNECT_CLIENT_SECRET` / issuer URL, set
  `FRANCECONNECT_MODE=live`.
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
