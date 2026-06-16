# Guards & RBAC rules

Two **global** guards run on every request, registered in `app.module.ts` via `APP_GUARD`
**in this order** (auth before authorization):

1. **`AuthGuard`** — authenticates the request.
   - Skips routes decorated `@Public()`.
   - Extracts the `Authorization: Bearer <token>` header.
   - Verifies the token (see `modules/auth`) and **syncs** the local user.
   - Attaches the domain `User` to `request.user`. Missing/invalid token ⇒ `401`.

2. **`RolesGuard`** — authorizes the request.
   - Routes without `@Roles(...)` pass through.
   - Otherwise the authenticated user must hold at least one required role, else `403`.

## Decorators (in `src/shared/decorators`)

| Decorator | Use |
| --- | --- |
| `@Public()` | Mark a route/controller as not requiring authentication. |
| `@Roles(Role.ADMIN, ...)` | Require one of the given app roles (RBAC). |
| `@CurrentUser()` | Inject the authenticated domain `User` into a handler param. |

## Rules

- **Default-deny**: every route is protected unless explicitly `@Public()`. Don't disable the
  global guards; opt out per-route instead.
- **Roles are app-managed** (`Role` enum, stored in our DB) — never trust roles coming from a
  provider token. Promote/demote via the admin endpoint / `SetUserRoleUseCase`.
- Put authorization on the **route or controller**, not inside use-cases. Use-cases assume the
  caller is already authorized.

## Example

```ts
@Controller('users')
export class UsersController {
  @Get('me')
  me(@CurrentUser() user: User) { ... }      // any authenticated user

  @Get()
  @Roles(Role.ADMIN)                          // admins only
  findAll() { ... }
}
```
