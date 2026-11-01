# Wellness Platform Backend

This is one modular backend (Express + TypeScript + PostgreSQL) for every app in the Wellness Ecosystem. It has shared platform modules (accounts, subscriptions, content, routines, analytics, notifications, recommendations) and one module per app under `/apps/{appCode}`.

The architecture and design decisions are in [`../docs/Backend_Architecture.md`](../docs/Backend_Architecture.md).

## Setup

You need Node.js 20+ and PostgreSQL 14+.

```bash
npm install
cp .env.example .env

# PostgreSQL — pick one:
npm run db:local          # real Postgres from npm binaries, data in .pgdata/ (no Docker needed)
docker compose up -d      # or Docker

npm run seed              # migrations + admin, plans, recommendation rules, sample content
npm run dev               # http://localhost:4500, API docs at /api-docs
npm run smoke             # end-to-end check of every module against the running server
```

- **Seeded admin:** `admin@wellness.local` / `Admin123!` (set with `SEED_ADMIN_*`).
- **Stopping the local database:** `npm run db:local:stop`.
- **`npm run db:local` on Windows:** the server starts through `pg_ctl`, so it also works from an elevated shell.

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | `tsx watch` on port 4500 (runs migrations on boot unless `AUTO_MIGRATE=false`) |
| `build` / `start` | Compile to `dist/` and run the compiled server |
| `typecheck` / `lint` / `format` | `tsc --noEmit`, ESLint, Prettier |
| `migrate` | Apply new `database/migrations/*.sql` and sync the app catalog |
| `seed` | Idempotent seed. Sample content (marked `[Sample]`, unreviewed) is never seeded in production |
| `smoke` | End-to-end API test (`SMOKE_BASE_URL` overrides the target) |
| `db:local` / `db:local:stop` | Start or stop the embedded PostgreSQL |
| `import:legacy:foodvisor` | Idempotent import of the legacy Foodvisor data (seed modules + `../mobile/Foodvisor/foods.js`, or `--foods <path>`) |
| `import:legacy:talentbaby` | Idempotent import of the TalentBaby content snapshot (`database/legacy/talentbaby-content.json`) |
| `import:legacy:height` | Idempotent import of the HeightIncrease content snapshot (`database/legacy/heightincrease-content.json`) |

## API map

All paths are under `/api/v1`. Platform endpoints identify the calling app with the `X-App-Code` header (e.g. `foodvisor`).

| Area | Endpoints |
| --- | --- |
| Identity | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` · `GET/PATCH/DELETE /users/me` · `GET /users/me/apps` · `POST /users/me/apps/{app}/open` · `GET /catalog/apps` · `GET/POST/DELETE /consents` |
| Subscriptions | `GET /subscriptions/plans` · `GET /subscriptions/entitlements` · `GET /subscriptions/eligibility` · `POST /subscriptions/purchases/verify` · `POST /subscriptions/purchases/restore` · `POST /subscriptions/webhooks/{store}` |
| Content | `GET /content`, `/content/{id}` · editor: `/content/manage/items[...]` (submit / review / publish / archive) |
| Routine (editor) | `/routine/exercises[...]`, `/routine/routines[...]` (review / publish / archive) |
| Analytics | `POST /analytics/events` · admin: `GET /analytics/kpis` |
| Notifications | `/notifications/devices`, `/notifications/reminders` |
| Recommendations | `GET /recommendations` · `POST /recommendations/{ruleId}/interactions` · admin: `/recommendations/rules`, `/recommendations/stats` |
| BabyGrow | `/apps/babygrow/profile(/active-child)` · `/children[/{id}/caregivers, /growth-records(/report), /care-logs(/summary), /feedings, /sleeps, /diapers, /milestones(/report), /activities, /daily-activities(/{slot}/complete), /daily-updates/today, /recipes]` · `/milestone-definitions(/month/{m})` · `/activities`, `/daily-updates`, `/recipes(/age-group/{g}, /favorites)`, `/articles(/search, /bookmarked)`, `/stories(/bookmarked)` · admin: `/apps/babygrow/admin/{dashboard,activities,milestone-definitions,recipes,stories,articles,daily-updates,guides,children,parents}` |
| Foodvisor | `/apps/foodvisor/foods` (+ `/barcode/{code}`), `/meal-logs`, `/nutrition-goal`, `/daily-summary`, `/profile`, `/weight-entries`, `/daily-targets/me`, `/diet-optimizer/optimize`, `/daily-intake/analyze`, `/human-type-surveys` · public: `/health-metrics/calculate`, `/daily-targets`, `/daily-targets/resolve`, `/programs`, `/human-type/questions` · admin: `/apps/foodvisor/admin/{dashboard,foods,recipes,users,meal-logs,...}` |
| Media | `POST /media/images` (editor; base64 JSON, max 8MB), files served at `/static/...` |
| Admin (platform) | admin only: `GET /admin/overview` · `/admin/{accounts,purchases,plans,audit-logs}` (Resource kit list contract; accounts allow `PATCH` of `displayName`/`role`, never your own role) |
| HeightIncrease | public: `/apps/height-increase/home`, `/exercises`, `/training-plans`, `/articles`, `/banners` · `/measurements`, `/profile`, `/logs`, `/reports`, `/goals` + routine endpoints · admin: `/apps/height-increase/admin/{stats,users,exercises,training-plans,articles,banners,notifications,goals,logs,settings}` |
| Healthy Recipes | `/apps/healthy-recipes/recipes`, `/saved-recipes`, `/meal-plans(/{id}/shopping-list)` |
| Daily Workout / Daily Yoga | `/apps/{daily-workout,daily-yoga}/routines`, `/sessions`, `/sessions/{id}/complete`, `/progress` |

The full OpenAPI spec is served at `/api-docs` (UI) and `/api-docs.json`.

## Purchases in development

The `dev` store treats `purchaseToken` as the transaction id and is disabled when `NODE_ENV=production`. Example:

```bash
POST /api/v1/subscriptions/purchases/verify
{ "store": "dev", "productId": "dev.wellness_pass_monthly", "purchaseToken": "any-unique-id" }
```

Simulate a refund with `POST /api/v1/subscriptions/webhooks/dev` and the body `{ "originalTransactionId": "any-unique-id", "type": "REFUNDED" }`. Apple and Google verification return `501` until they are implemented (see the architecture doc, section 8).
