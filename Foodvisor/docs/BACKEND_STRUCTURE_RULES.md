# Backend Structure Rules

Reusable conventions for building Express + TypeScript + PostgreSQL backends, extracted from the Smartify Smart-Home-Backend. Apply these rules to any new Node backend that should share the same shape.

Stack assumptions:
- **Runtime**: Node.js + Express 4
- **Language**: TypeScript (strict mode)
- **DB**: PostgreSQL via `pg` (`Pool`)
- **Auth**: JWT via middleware
- **Validation**: express-validator
- **Docs**: Swagger UI (`swagger-jsdoc` + `swagger-ui-express`)
- **Logging**: Winston (see `LOGGING_STRUCTURE_RULES.md`)

---

## 1. Folder Layout

```
src/
├── app.ts                       # Express app + bootstrap (middleware + route registration + server start)
├── config/                      # Env loading, database pool, third-party clients
│   ├── database.ts
│   └── env.ts
├── controllers/                 # HTTP layer: parse req, call service, send response. NO business logic.
├── services/                    # Business logic. Throws domain errors. Depends on repository interfaces.
├── repositories/                # SQL only. Implements an `I*Repository` interface from `domain/`.
├── domain/
│   └── repositories/            # `I<Entity>Repository.ts` interfaces (Dependency Inversion)
├── models/                      # Entity types + `Create*Input`, `Update*Input`, `*Response` DTOs
├── routes/                      # Express routers. Wires DI, attaches middleware, declares Swagger.
├── middleware/                  # auth, validation, error-handler, request-logger, etc.
├── validators/                  # express-validator chains, one file per resource
├── utils/                       # response helpers, custom error classes, logger, migrations
├── types/                       # Ambient declarations (e.g. `express.d.ts` for `req.user`)
└── swagger/                     # Swagger spec assembly
```

Top-level siblings of `src/`:
```
database/        # SQL schema + migration files
scripts/         # One-off CLI scripts (seed, password reset, etc.)
docs/            # Project docs (this file lives here)
logs/            # Winston output (gitignored)
dist/            # Compiled JS (gitignored)
```

**Rule:** Every new resource gets one file in each of: `models/`, `domain/repositories/`, `repositories/`, `services/`, `controllers/`, `routes/`, `validators/`. No exceptions for "small" resources — symmetry beats brevity.

---

## 2. Layered Request Flow

```
HTTP request
    │
    ▼
Route ── middleware (auth → validate) ──► Controller ──► Service ──► Repository ──► pg.Pool
    │                                          │            │             │
    │                                          │            │             └── parameterized SQL
    │                                          │            └── business rules, throws domain errors
    │                                          └── parses req, calls sendSuccess/sendError
    └── declares Swagger, wires DI
```

**Hard rules per layer:**

| Layer       | MUST                                                                   | MUST NOT                                                |
|-------------|------------------------------------------------------------------------|---------------------------------------------------------|
| Route       | Wire DI, attach `authenticate` + `validate(...)`, declare Swagger      | Contain logic, touch `pg.Pool`                          |
| Controller  | Read `req`, call exactly one service method, send response, `next(err)`| Contain business rules, run SQL, format DB rows         |
| Service     | Apply business rules, orchestrate repos, throw domain errors           | Touch `pg.Pool` directly, read `req`/`res`              |
| Repository  | Run parameterized SQL, return entity types                             | Throw HTTP errors, contain business rules               |
| Domain      | Declare `I*Repository` interfaces                                      | Import concrete repos                                   |

If a controller has more than ~10 lines of logic, push it down. If a repository starts deciding *what* to do (vs *how* to fetch), push it up.

---

## 3. Dependency Injection

**Pattern:** Constructor-based DI. Services depend on **interfaces** from `domain/repositories/`, never concrete repository classes. Wiring happens at the **route file**, not in `app.ts`.

```ts
// src/routes/home-routes.ts
const homeRepository = new HomeRepository(getPool());        // concrete
const homeService = new HomeService(homeRepository);          // accepts IHomeRepository
const homeController = new HomeController(homeService);

router.get('/', authenticate, homeController.getHomes);
```

```ts
// src/services/home-service.ts
export class HomeService {
  constructor(private homeRepository: IHomeRepository) {}
}
```

**Why interfaces:** swappable repos (mocks for tests, alt storage), and services stay framework-agnostic.

**Controller methods are arrow-property fields**, not class methods, so `this` survives Express's binding:
```ts
getHomes = async (req, res, next) => { ... };   // ✅
async getHomes(req, res, next) { ... }          // ❌ loses `this`
```

---

## 4. Naming Conventions

| Kind                    | Convention                       | Example                          |
|-------------------------|----------------------------------|----------------------------------|
| Filenames               | `kebab-case.ts`                  | `home-invitation-service.ts`     |
| Classes                 | `PascalCase`                     | `HomeInvitationService`          |
| Methods/variables       | `camelCase`                      | `getPrimaryHome`                 |
| Interfaces (repo)       | `I<Entity>Repository`            | `IHomeRepository`                |
| Controller files        | `<resource>-controller.ts`       | `device-controller.ts`           |
| Service files           | `<resource>-service.ts`          | `device-service.ts`              |
| Repository files        | `<resource>-repository.ts`       | `device-repository.ts`           |
| Route files             | `<resource>-routes.ts`           | `device-routes.ts`               |
| Validator files         | `<resource>-validator.ts`        | `device-validator.ts`            |
| DTO suffixes            | `Create*Input`, `Update*Input`, `*Response` | `CreateHomeInput`, `HomeResponse` |

**Rule:** One resource = one consistent stem across all seven layer files. `home-controller.ts`, `home-service.ts`, `home-repository.ts`, etc.

---

## 5. Standard API Response Shape

Every response — success or failure — uses one of two envelopes, produced by helpers in `src/utils/response.ts`:

```ts
// success
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-05-08T12:34:56.000Z" }
}

// error
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Home not found" },
  "meta": { "timestamp": "2026-05-08T12:34:56.000Z" }
}
```

```ts
import { sendSuccess, sendError } from '../utils/response';

sendSuccess(res, home, 200);
sendError(res, 'VALIDATION_ERROR', 'Invalid home ID', 400);
```

**Error codes are SCREAMING_SNAKE_CASE strings**, stable across versions: `NOT_FOUND`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`, etc.

**Services throw, controllers don't format:** services throw custom error classes from `utils/errors.ts` (e.g. `NotFoundError`, `ValidationError`, `UnauthorizedError`); the global `errorHandler` middleware converts them to the error envelope. Controllers only call `next(error)` in `catch`.

```ts
// service
if (!home) throw new NotFoundError('Home');

// controller
} catch (error) {
  next(error);
}
```

---

## 6. Models / DTOs

For each resource, `models/<resource>.ts` exports:

```ts
export interface Home {                  // entity (matches DB row, camelCased)
  id: number;
  userId: number;
  name: string;
  // ...
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHomeInput { ... } // POST body
export interface UpdateHomeInput { ... } // PATCH/PUT body
export interface HomeResponse { ... }    // what the API returns (often == entity but explicit)
```

**Rule:** Services convert entities → `*Response` via a private `toXResponse(entity)` method before returning. Controllers never see raw DB rows. This decouples the API contract from the schema.

---

## 7. Validation

- Use `express-validator` chains in `validators/<resource>-validator.ts`.
- Apply with the shared `validate` middleware in routes — never inside controllers.
- Validation errors automatically become `400 VALIDATION_ERROR` responses.

```ts
// validators/home-validator.ts
export const createHomeValidation = [
  body('name').isString().isLength({ min: 1, max: 100 }),
  body('address').optional().isString(),
];

// routes/home-routes.ts
router.post('/', authenticate, validate(createHomeValidation), homeController.createHome);
```

---

## 8. Middleware Order in `app.ts`

Order matters. Use exactly this sequence:

```ts
app.use(cors({ ... }));           // 1. CORS first (before helmet, for Swagger)
app.use(helmet({ ... }));         // 2. Security headers
app.use(express.json());          // 3. Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(compression());           // 4. Response compression
app.use(requestLogger);           // 5. Log incoming/outgoing
app.use(userActionLogger);        // 6. (optional) audit middleware

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, opts));   // 7. Swagger
app.get('/health', healthHandler);                                    // 8. Health check

app.use(`${apiPrefix}/users`, userRoutes);                            // 9. API routes
// ...

app.use(notFoundHandler);          // 10. 404
app.use(errorHandler);             // 11. Error handler ALWAYS LAST
```

**Route registration order:** more specific routes before parameterized ones. `/devices/stream` and `/devices/discovery` must come before `/devices/:id`. Same rule inside a router.

---

## 9. Database Access Rules

- **Only repositories** import `pg` or call `pool.query`. Services and controllers never touch the pool.
- **Always parameterized**: `pool.query('... WHERE id = $1', [id])`. No string interpolation, ever.
- **Transactions live in repositories** — expose a method like `transferOwnership` that internally does `BEGIN/COMMIT`, rather than leaking transaction state to services.
- Connection pool comes from `config/database.ts` via `getPool()`.
- Migrations go in `database/<NN>_<name>.sql` and are registered in `src/utils/migrations.ts`. They run on boot when `AUTO_MIGRATE=true`.

```ts
// repositories/home-repository.ts
async findById(id: number, userId: number): Promise<Home | null> {
  const result = await this.pool.query<Home>(
    'SELECT * FROM homes WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}
```

---

## 10. Adding a New Feature (End-to-End Checklist)

For resource `Foo`:

1. **Migration** — `database/NNN_create_foos.sql`, register in `src/utils/migrations.ts`.
2. **Model** — `src/models/foo.ts`: `Foo`, `CreateFooInput`, `UpdateFooInput`, `FooResponse`.
3. **Domain interface** — `src/domain/repositories/IFooRepository.ts`.
4. **Repository** — `src/repositories/foo-repository.ts` implementing `IFooRepository`.
5. **Service** — `src/services/foo-service.ts` depending on `IFooRepository`.
6. **Validator** — `src/validators/foo-validator.ts` with `createFooValidation`, `updateFooValidation`.
7. **Controller** — `src/controllers/foo-controller.ts` (arrow-property methods, `next(error)` on catch).
8. **Route** — `src/routes/foo-routes.ts`: wire DI, attach `authenticate` + `validate(...)`, declare Swagger JSDoc.
9. **Register** — add `app.use(\`${apiPrefix}/foos\`, fooRoutes)` to `app.ts` (mind ordering vs `:id` routes).
10. **Logger** — if it's a major domain (auth, device, etc.), consider adding a `logger.foo.*` namespace (see logging rules).

---

## 11. Code Style

- **Prettier**: single quotes, semicolons, 100-char width, 2-space indent.
- **ESLint**:
  - `@typescript-eslint/no-explicit-any` is **warn** (avoid `any` but allowed under pressure).
  - Unused vars allowed when prefixed with `_` (e.g. `_req`, `_unused`).
- **TypeScript**: `strict: true`. Always annotate function return types on public methods.
- **No barrel files** (`index.ts` re-exports). Import directly from the source — easier refactors, simpler dep graph.
- **Comments**: lead with **why**, not **what**. Class-level JSDoc for public services/controllers/repositories is fine; per-method JSDoc only when behavior is non-obvious.

---

## 12. Environment & Config

- All env access goes through `src/config/env.ts` — never read `process.env.X` directly outside that file.
- `env.ts` validates and exports a typed `env` object: `env.port`, `env.nodeEnv`, `env.apiVersion`, `env.autoMigrate`, etc.
- Sensible defaults for dev; missing required vars in production should fail fast at boot.
- `.env.example` checked in; `.env` gitignored.

---

## 13. Auth Convention

- JWT in `Authorization: Bearer <token>` header.
- `authenticate` middleware (in `middleware/auth.ts`) verifies the token, loads the user, and attaches `req.user`.
- `req.user` is typed via `src/types/express.d.ts` (`declare global { namespace Express { interface Request { user?: { id: number; ... } } } }`).
- Protected routes: `router.get('/...', authenticate, controller.method)`.
- Inside controllers: `req.user!.id` — non-null assertion is fine because `authenticate` would have rejected unauthenticated requests.

---

## 14. Swagger / API Docs

- Swagger UI mounted at `/api-docs`.
- Each route file uses JSDoc `@swagger` blocks above each `router.get/post/...` to declare the spec.
- The spec is assembled in `src/swagger/swagger.ts` from all route files.
- Tags group routes by resource (`Homes`, `Devices`, etc.).
- `bearerAuth` security scheme declared once globally; each protected route lists `security: [{ bearerAuth: [] }]`.

---

## 15. Anti-Patterns to Reject

- ❌ SQL inside controllers or services
- ❌ Business logic in controllers (e.g. computing derived fields, multi-repo orchestration)
- ❌ Throwing `new Error('...')` instead of a domain error class
- ❌ Returning entities directly without going through a `*Response` DTO
- ❌ Skipping the `domain/repositories/` interface and depending on the concrete repo class
- ❌ Per-route validation logic written inline in the controller
- ❌ String-interpolated SQL
- ❌ `console.log` for logging (use the Winston logger)
- ❌ Reading `process.env` outside `config/env.ts`
- ❌ Adding a "utils" function with business logic — promote it to a service

---

## Quick Reference: File Skeletons

**Route**
```ts
const repo = new FooRepository(getPool());
const service = new FooService(repo);
const controller = new FooController(service);

/**
 * @swagger
 * /foos:
 *   get:
 *     summary: List foos
 *     tags: [Foos]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authenticate, controller.list);
router.post('/', authenticate, validate(createFooValidation), controller.create);
```

**Controller**
```ts
export class FooController {
  constructor(private fooService: FooService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const foos = await this.fooService.list(req.user!.id);
      sendSuccess(res, foos, 200);
    } catch (error) {
      next(error);
    }
  };
}
```

**Service**
```ts
export class FooService {
  constructor(private fooRepository: IFooRepository) {}

  async list(userId: number): Promise<FooResponse[]> {
    const foos = await this.fooRepository.findAll(userId);
    return foos.map((f) => this.toResponse(f));
  }

  private toResponse(foo: Foo): FooResponse { /* ... */ }
}
```

**Repository**
```ts
export class FooRepository implements IFooRepository {
  constructor(private pool: Pool) {}

  async findAll(userId: number): Promise<Foo[]> {
    const result = await this.pool.query<Foo>(
      'SELECT * FROM foos WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }
}
```
