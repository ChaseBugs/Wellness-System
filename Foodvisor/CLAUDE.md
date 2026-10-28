# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Scope

This `foodvisor/` directory is part of a wider monorepo. **Scope all searches, status checks, and edits to `foodvisor/`** unless the task explicitly requires parent-level changes. Sibling folders are unrelated projects — do not modify them.

## Architecture

Two-package workspace orchestrated by the root `package.json`:

- `backend/` — Express 4 + TypeScript (ESM) + Mongoose 8 REST API on port 4000. Run via `tsx`; built to `dist/` via `tsc`.
- `web-admin/` — Next.js 15 App Router + React 19 admin on port 3000.
- `design/` — mobile reference screenshots (don't rename).
- `food data/` — large external datasets (USDA FDC, ComprehensiveFoodDatabase, food-material, etc.) consumed by importer scripts.

### Backend conventions

- **Generic CRUD router** (`backend/src/routes/crud.ts`): `createCrudRouter(model, searchFields)` produces `GET /` (with `?q=`, `?page=`, `?limit≤500`), `GET/PUT/DELETE /:id`, `POST /`. Adding a new resource = define a Mongoose model in `models/content.ts` and one line in `routes/index.ts`. Don't hand-roll routes unless behavior diverges.
- **`doctor_verified` review flag** is on every content schema (foods, recipes, activities, users, meal-logs, weight-entries, programs, daily-value-profiles, recipe-ingredients). All `POST /` requests force `doctor_verified: false` for medical-review workflows. Preserve this when seeding or importing.
- **All models live in one file** (`backend/src/models/content.ts`) and are exported by name. Schemas embed reusable sub-schemas (`macroSchema`, `vitaminSchema`, `mineralSchema`, `dailyValuePercentSchema`).
- **Server bootstrap** (`backend/src/server.ts`) connects Mongo, runs `migrateFoodDictionary({ skipFoods: true })` on every start, and serves `/images` statically from `backend/public/images`. OpenAPI is at `/api-docs`, JSON at `/api-docs.json`.
- **ESM imports use `.js` extensions** even for `.ts` source files (NodeNext resolution) — e.g. `from "./db.js"`. Keep this when adding files.
- Database defaults to `mongodb://127.0.0.1:27017/foodvisor`. CORS allowlist via `CORS_ORIGIN` (comma-separated).

### Web-admin conventions

- **Generic ResourceManager** (`web-admin/components/ResourceManager.tsx`) drives every CRUD page from a `ResourceField[]` + `ResourceColumn[]` config. New admin pages = a route under `app/(admin)/<resource>/page.tsx` that renders `<ResourceManager endpoint="/<resource>" ... />`. The `FoodsManager` is a richer custom variant for foods.
- **API base URL** is `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/api`); use `apiFetch` from `lib/api.ts` (it handles `204` and JSON errors).
- **Auth is a local pseudo-session** in `localStorage` (`lib/auth.ts`) — no real backend auth. Don't add auth headers expecting the backend to validate them.
- Image columns prepend the API origin (stripping `/api`) when paths start with `/`.

## Common Commands

Run from `foodvisor/`:

```bash
npm run install:all      # install backend + web-admin deps
docker compose up -d mongo
npm run seed             # backend/src/migrate.ts --download-images
npm run dev:backend      # tsx watch on :4000
npm run dev:admin        # next dev on :3000
npm run build            # tsc + next build (use this as the verification step — no test suite)
```

Run from `foodvisor/backend/` for data work:

```bash
npm run migrate                       # food dictionary migration only
npm run import:comprehensive          # ComprehensiveFoodDatabase import (see env vars below)
npm run import:usda                   # USDA FoodData Central API import
npm run import:food-material          # food-material dataset import
npm run download:real-food-images     # scrape real images
npm run normalize:food-names
npm run translate:food-names:deepseek
```

## Importer Environment Variables

`import:comprehensive` is configurable (see `FOOD_SCRAPING_DATA.md` for the full table):

| Var | Default | Notes |
| --- | --- | --- |
| `CFD_DATA_ROOT` | `../food data/ComprehensiveFoodDatabase-master` | dataset path |
| `CFD_SOURCES` | `usda_no_branded,usda_branded,menustat` | which lists |
| `CFD_IMPORT_LIMIT` | unlimited | cap per run (use small values for testing) |
| `CFD_BATCH_SIZE` | `1000` | bulk-write batch |
| `CFD_IMAGE_MODE` | `generated` | SVG placeholder per record |

Windows shell is bash here, but examples in `FOOD_SCRAPING_DATA.md` use PowerShell `$env:NAME='...'` syntax — translate to `NAME=... npm run ...` if running under bash. Menustat import is the known-pending source (~110k rows).

## Data Quality Rule

USDA FoodData Central is the **primary** source for nutrition values (calories, macros, vitamins, minerals, GI, daily-value %). ComprehensiveFoodDatabase local lists only contribute names/brands/categories and offline image coverage — they are not authoritative for nutrition. Don't backfill nutrition fields from CFD; mark records `doctor_verified: false` and let admins review.

## Testing

No automated tests are configured. Verification = `npm run build` from the root, then manually hit `GET /api/health` and exercise the affected admin CRUD page. If you add tests, place backend tests under `backend/src/**/*.test.ts` and admin tests beside components or under `web-admin/tests/`.

## Commit Style

Recent history is terse (`updated`, `initial version`). Prefer specific imperative summaries (`add foodvisor onboarding screenshots`, `fix CFD batch size cap`).
