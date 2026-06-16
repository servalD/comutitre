# Architecture rules (back)

This back follows a **clean / hexagonal architecture**. These rules are mandatory — keep new
code consistent with them.

## Layers & the dependency rule

```
presentation  ─▶  application  ─▶  domain
                       ▲
infrastructure ────────┘   (implements ports defined in domain/application)
```

Dependencies point **inward only**:

| Layer | Folder | Responsibility | May import |
| --- | --- | --- | --- |
| **domain** | `modules/<m>/domain` | Pure business models + repository **ports** (abstract classes). | nothing framework-specific |
| **application** | `modules/<m>/application` | Use-cases (one class, one `execute()`), DTOs. Orchestrates domain via ports. | domain |
| **infrastructure** | `modules/<m>/infrastructure` | Adapters: TypeORM entities/repositories, external clients, verifiers. | domain, application |
| **presentation** | `modules/<m>/presentation` | Controllers, presenters. HTTP in/out only. | application, domain |

**The domain layer must never import from `@nestjs/*`, `typeorm`, or any other framework.**
If you find yourself doing so, the logic belongs in another layer.

## Ports & adapters

- A **port** is an `abstract class` in `domain` (e.g. `UserRepository`) used as the DI token.
- The **adapter** lives in `infrastructure` (e.g. `TypeOrmUserRepository extends UserRepository`).
- Bind them in the module:

  ```ts
  providers: [{ provide: UserRepository, useClass: TypeOrmUserRepository }]
  ```

This keeps use-cases testable with in-memory fakes (see `InMemoryUserRepository`) and free of DB
concerns.

## Domain model vs ORM entity

The persisted shape (`*.orm-entity.ts`, decorated with TypeORM) is **separate** from the domain
model (`domain/<name>.ts`, a plain class). The adapter maps between them (`toDomain`). Never leak
ORM entities out of the infrastructure layer.

## Use-cases

- One use-case per file, named `*.use-case.ts`, class `XxxUseCase`, single public `execute(...)`.
- No HTTP/DB types in the signature — only domain types / primitives.
- Controllers call use-cases; they contain **no business logic** themselves.

## DTOs & validation

- Request DTOs live in `application/dto`, validated with `class-validator`.
- A global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
  is applied in `main.ts`.

## Naming conventions

`*.use-case.ts` · `*.controller.ts` · `*.repository.ts` (port) · `*-<tech>.repository.ts` (adapter,
e.g. `typeorm-user.repository.ts`) · `*.orm-entity.ts` · `*.module.ts` · `*.spec.ts` / `*.e2e-spec.ts`.

## How to add a new module

1. `modules/<name>/domain/` — model(s) + repository port.
2. `modules/<name>/application/` — use-cases + DTOs.
3. `modules/<name>/infrastructure/` — ORM entity + adapter (+ any external client).
4. `modules/<name>/presentation/` — controller + presenter.
5. `modules/<name>/<name>.module.ts` — register `TypeOrmModule.forFeature([...])`, bind ports to
   adapters, declare use-cases, export what other modules need.
6. Add a migration for any new table (see `infrastructure/database/README.md`).
7. Add unit tests (use-cases with fakes) and, if it exposes routes, an e2e test.

## Cross-cutting code

- Auth decorators/guards/enums shared across modules live in `src/shared`.
- App-wide infrastructure (config, database) lives in `src/infrastructure`.
