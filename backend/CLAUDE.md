# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the shared modular backend for every Wellness Ecosystem app. Its only admin UI is `../admin` (the unified Wellness admin); add admin screens there and admin APIs here (`/admin/*` for platform-wide data, `/apps/<app>/admin/*` per app). Read [`../docs/Backend_Architecture.md`](../docs/Backend_Architecture.md) for the module map, data boundaries and key flows before changing behaviour across modules.

## Commands

Run these from `backend/`:

```bash
npm run db:local      # embedded PostgreSQL on DATABASE_URL (no Docker on this machine); db:local:stop to stop
npm run seed          # migrations + idempotent seed (admin@wellness.local / Admin123!)
npm run dev           # tsx watch on :4500, Swagger at /api-docs
npm run typecheck     # tsc --noEmit
npm run lint
npm run smoke         # end-to-end test of every module; needs the server running
npm run build         # compile to dist/ (Swagger is read from the compiled route files)
npm run import:legacy:foodvisor   # idempotent import of the legacy Foodvisor data (seed modules + ../mobile/Foodvisor/foods.js)
npm run import:legacy:talentbaby  # BabyGrow content from database/legacy/talentbaby-content.json
npm run import:legacy:height      # HeightIncrease content from database/legacy/heightincrease-content.json
```

The legacy imports upsert on `source_ref` (or natural keys), so re-running them refreshes rows and keeps their ids.

There is no unit-test framework. Before finishing a change, the verification step is `typecheck` + `lint` + `smoke` against a running server. When you add behaviour, extend `src/scripts/smoke-test.ts`.

## Conventions

These follow `mobile/Foodvisor/docs/BACKEND_STRUCTURE_RULES.md` and `LOGGING_STRUCTURE_RULES.md`, adapted to modules:

- **Module layout:** each module lives in `src/modules/{platform,apps}/<module>/`, with `models/`, `domain/`, `repositories/`, `services/`, `controllers/`, `validators/`, `routes/` and a `<module>-module.ts` registered in `src/modules/module-registry.ts`.
- **Layers:** Route (dependency wiring, middleware, `@openapi` JSDoc) → Controller (extends `BaseController`, one service call, `sendSuccess`) → Service (rules, throws `AppError` subclasses from `utils/errors.ts`, maps to `*Response` DTOs) → Repository (the only layer that touches `pg`).
- **SQL:** queries are always parameterized. For dynamic inserts and updates, use `buildInsert`/`buildUpdate` from `utils/sql.ts` with a `ColumnMap` whitelist. Mark jsonb columns `{ column, json: true }`, or arrays get sent as Postgres arrays. Multi-statement writes go in a `withTransaction` inside the repository.
- **ESM:** imports use `.js` extensions (NodeNext). Files are kebab-case, and repository interfaces are `domain/I<Entity>Repository.ts`.
- **Config and logging:** read env only through `config/env.ts`. Log with the Winston logger and its domain helpers (`logger.billing`, `logger.consent`, …); `console` is a lint error.
- **Migrations:** these are SQL files in `database/migrations/`. Platform files are `0NN_platform_*.sql` and app files are `1NN_app_*.sql`. They are append-only: never edit an applied migration, add a new one.

## Admin CRUD: the Resource kit

Admin-managed tables with plain CRUD go through `src/shared/resource-kit`. These are reference data, catalogs and content lists, for example the Foodvisor nutrition tables. A resource is one `defineResource({...})` entry, a whitelist of API field → column specs, mounted with `createResourceRouter`. The kit reproduces the legacy Foodvisor admin contract (`?q=&page=&limit=&sort=-f&f=a,b&f_gte=`, `PATCH /bulk-verify`, `DELETE /bulk`). It also forces review flags false on create, lets only admins change them, and writes `admin.audit_logs`.

- Use `view` for joined read models, `readOnly` for computed or joined fields, `operations` to disable create/update/delete, `scope` + `createDefaults` to expose a slice of a shared table (Foodvisor recipes inside `content.items`), and `updateSideEffects` for code-defined SET fragments.
- `jsonKey` maps a flat API field onto one key of a jsonb column (e.g. `imageUrl` in `media`, `category` in `attributes`). Writes merge only the keys sent; filters and sorts cast the key to the field type. Don't expose the whole jsonb column in the same resource. A `readOnly` field's `column` may be a code-defined SQL expression (e.g. `(status = 'published')`).
- Routine Engine content in the kit (HeightIncrease exercises and plans) keeps the engine's rule: edits send it back to draft, and review/publish stay on `/routine/{exercises|routines}/:id/*`.
- User-facing features never use the kit. They keep the layered files.

Uploaded images go through the media module (`POST /media/images`) and are served from `public/static` at `/static`. Migrated images are in `public/static/foodvisor/images` and `public/static/babygrow/images`.

## Module boundaries

These are enforced by review, not tooling:

- Platform modules never import app modules, and app modules never import each other, not even their types.
- To use another module, declare a narrow port interface in your module's `domain/`, or use the platform factories (`createEntitlementChecker`, `createContentItemService`, `createRoutineService`, `createSessionService`).
- App data lives in the app's own Postgres schema. Reading another app's data needs an active consent from `identity.consents` (see Foodvisor's `DailySummaryService`).
- App codes come only from `src/config/app-catalog.ts`. To add an app, follow section 7 of the architecture doc.

## Product rules from the strategy (keep these)

- New content, exercises, routines, foods and milestone definitions start **unreviewed**. Publishing requires an expert (admin) review. Editing reviewed content sends it back to review.
- Don't add height predictions, growth percentiles or calorie-burn estimates unless they are backed by a validated standard. Nutrition values come from reviewed recipe data or the food reference table, never from guesses.
- Child and health data never feed recommendations or marketing. Recommendations use only analytics events, installs and the user's opt-out flag.
- The `dev` purchase store must stay disabled in production. Apple and Google verifiers return 501 until they are really implemented; never trust client receipts unverified.
- The `log` push provider (pretends delivery succeeded) is refused in production, like the dev store. Push sends go through `notify.deliveries` claims so they stay idempotent; promotional pushes need `marketing_opt_in`, and app campaigns respect the app's own notification setting.
- Scheduled work goes in a module's `jobs` (see `shared/scheduler.ts`), never in a bare `setInterval`. Jobs must be idempotent.
