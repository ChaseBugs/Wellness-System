# Wellness Platform Backend: Architecture

One backend serves every app in the Wellness Ecosystem (see `Wellness_Ecosystem_2027_English.md`). It is a **modular monolith**: one Express + TypeScript service and one PostgreSQL database, split into independent modules. The strategy recommends this setup for a small team. A module can be moved into its own service later, once usage or operations justify it.

Code: [`backend/`](../backend/) at the repo root. For setup and the API map, see its [README](../backend/README.md).

## 1. Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Shape | One deployable service, one module per capability and per app | The strategy says to start with one modular backend. Modules keep apps independent without the operating cost of microservices |
| Database | PostgreSQL, **one schema per module** | The strategy names PostgreSQL. Schemas keep each app's data visibly separate, and foreign keys still work across them |
| Style | Foodvisor's `BACKEND_STRUCTURE_RULES.md` + TalentBaby's layering | Route → Controller → Service → `I*Repository` → parameterized SQL. Copies Foodvisor's Winston logger, error classes, response envelope and request-id. Uses TalentBaby's `BaseController` and premium-guard pattern |
| Identity | One Wellness account across all apps | Shared login, purchase restore across apps, cross-app journeys |
| App identity | `X-App-Code` header on platform endpoints; implied by the path under `/apps/{app}` | Analytics, recommendations and reminders always know which app is calling |

## 2. Module map

| Module | Kind | Base path | DB schema | Responsibility |
| --- | --- | --- | --- | --- |
| identity | platform | `/auth`, `/users`, `/catalog`, `/consents` | `identity` | Accounts, JWT + rotating refresh tokens, app installs, cross-app consents, account deletion |
| subscription | platform | `/subscriptions` | `billing` | App Pro and Wellness Pass plans, server-side purchase verification, entitlements, restore, store notifications |
| content | platform | `/content` | `content` | Content Factory: one CMS for recipes, exercise guides, articles, tutorials and audio, with an expert-review workflow |
| routine | platform | `/routine` (editor) | `routine` | Routine Engine: exercises → routines → sessions → progress. Mounted inside each routine app |
| analytics | platform | `/analytics` | `analytics` | Event ingestion, active users, D1/D7/D30 retention |
| notification | platform | `/notifications` | `notify` | Push device registry, per-app reminder schedules, push delivery (`PushService` port for app campaigns) and the delivery log |
| recommendation | platform | `/recommendations` | `reco` | Cross-app recommendation rules, frequency caps, interaction tracking, CTR stats |
| media | platform | `/media` | (disk: `public/static`) | Admin image uploads (signature-checked), served at `/static` |
| admin | platform | `/admin` | `admin` (views over identity, billing) | Unified admin back office (admins only): accounts and roles (no self role change), purchases, plans, audit log, platform overview |
| babygrow | app | `/apps/babygrow` | `babygrow` (+ content) | Children, caregiver sharing, caregiver profile and active child, growth records, care logs with feeding/sleep/diaper views, monthly milestones (yes/almost/no) and report, activity library with a four-slot daily plan, recipes, articles, stories, bookmarks, premium growth report, and the TalentBaby content admin (`/admin/*`) |
| foodvisor | app | `/apps/foodvisor` | `foodvisor` | Food composition DB, meal logging, WS/T 578 daily targets, LP diet optimizer, intake analysis, body metrics, Sasang questionnaire, profile and weight history, and the reference-data admin (`/admin/*`) |
| height-increase | app | `/apps/height-increase` | `height` (+ routine, content) | Height measurements and observed trend, profile, daily logs, goals, reports, public catalog (home, exercises, training plans, articles, banners), posture programs, and the HeightIncrease admin (`/admin/*`) |
| healthy-recipes | app | `/apps/healthy-recipes` | `recipes` (+ content) | Recipe discovery, saved recipes, seven-day meal plans, shopping lists |
| daily-workout | app | `/apps/daily-workout` | (routine) | Programs, sessions and weekly progress on the Routine Engine |
| daily-yoga | app | `/apps/daily-yoga` | (routine) | Classes, sessions and streaks on the Routine Engine |

**One admin for everything.** `admin/` (repo root, Next.js) is the only admin UI. Its Platform section uses `/admin/*` plus the existing review (`/content/manage/items/*`, `/routine/*`), recommendation and KPI endpoints. Its app sections use each app module's Resource-kit routes under `/apps/<app>/admin/*`. New app admin screens are added there, not as separate admin projects.

All 21 portfolio apps are listed in `src/config/app-catalog.ts`. That file is the single source of truth, and it is synced into `identity.apps` on every migrate run. Apps without their own module can already use accounts, subscriptions, analytics, content and reminders.

## 3. Inside a module

```
src/modules/<platform|apps>/<module>/
├── models/          entity + Create*/Update* inputs + *Response DTOs
├── domain/          I<Entity>Repository interfaces and narrow ports onto other modules
├── repositories/    parameterized SQL only (the only layer that touches pg)
├── services/        business rules; throw AppError subclasses
├── controllers/     extend BaseController; read req, call one service method, sendSuccess
├── validators/      express-validator chains
├── routes/          wire dependencies + @openapi JSDoc (collected into /api-docs)
└── <module>-module.ts   exports the WellnessModule registered in module-registry.ts
```

Every response uses the Foodvisor envelope: `{ success: true, data, meta }` or `{ success: false, error: { code, message, details?, reqId }, meta }`. Postgres constraint violations are mapped to 400 or 409, never to a 500.

## 4. Rules between modules

```
apps/*  ──may use──►  platform/*  (services through factories or narrow ports)
apps/*  ──never──►    another app module
platform/*  ──never──► apps/*
```

- A module that needs another module's data declares a **narrow port interface in its own `domain/`**. Examples are `RecipeReader`, `ConsentChecker`, `ActivitySummaryReader` and `IntentSignalReader`. The route file wires in the other module's service or repository, which matches the interface structurally.
- Platform factories (`createEntitlementChecker`, `createContentItemService`, `createRoutineService`, `createSessionService`) are the supported entry points for app modules.

## 5. Data boundaries and consent

These follow the strategy's "data to share and data to keep separate" section:

- **Shared centrally:** account, installs, entitlements, locale and notification settings, consented interests.
- **Kept inside the app schema:** child records (`babygrow`), meals (`foodvisor`), body measurements (`height`), workout sessions (`routine`, scoped by `app_code`).
- **Cross-app reads need an explicit, revocable consent:** `identity.consents` holds (source app → target app, scope). Scopes are summary-level only (`goals`, `activity_summary`, `nutrition_summary`, `growth_summary`). Example: Foodvisor's daily summary shows Daily Workout or Daily Yoga minutes only while the matching `activity_summary` consent is active. It shows minutes only, never invented calorie burn.
- **Recommendations use behavioural signals only:** events in the source app, installs and the opt-out flag. They never read health or child records. Users can opt out with `crossAppRecommendations: false`.
- **Account deletion** (`DELETE /users/me`) cascades through every schema.
- **BabyGrow** checks access per child through `caregivers` (owner > editor > viewer). Children the caller can't see are reported as 404, so their existence is not revealed.

## 6. Key flows

**Auth.** Access JWTs are short-lived (15 min by default). Refresh tokens are opaque, stored as SHA-256 hashes and rotated on every use. Presenting a refresh token that was already rotated revokes all of that account's sessions. Login and register are rate-limited.

**Wellness Pass and entitlements.**
1. The client calls `GET /subscriptions/eligibility?planCode=` before selling, which blocks duplicate subscriptions.
2. After a store purchase, the client sends the receipt or token to `POST /subscriptions/purchases/verify`. The server asks the store's verifier and then upserts `billing.purchases`. Each `(store, original_transaction_id)` can belong to only one account.
3. Access = an active or grace-period purchase whose plan lists the app in `billing.plan_apps` (one app for App Pro, every eligible app for Wellness Pass). A purchase made in any app unlocks its apps everywhere, and `POST /purchases/restore` re-links it from another app.
4. Store notifications (`POST /subscriptions/webhooks/{store}`) apply renewals, refunds, revocations and expiries. Every change is appended to `billing.purchase_events`.

**Content Factory review.** Workflow: `draft → in_review → approved (admin/expert) → published`. New content is always an unreviewed draft, matching Foodvisor's `doctor_verified` rule. Recipes must have servings and ingredients before review. Editing published content sends it back to review. Premium items are returned `locked` (no body, steps or attributes) without an entitlement for one of their apps.

**Routine Engine.** Exercises and routines publish only with an expert sign-off, and a routine also needs every exercise in it reviewed and published. `createRoutineAppRouter(appCode)` mounts the same player API (`/routines`, `/sessions`, `/progress`) inside each routine app, scoped to that app. Premium routines need that app's entitlement before a session can start.

**Recommendations.** A rule (source app → target app) fires only when all of these hold:
- its `trigger_event` happened in the source app within `lookback_days`;
- the target app isn't installed;
- the user hasn't opted out;
- the user didn't dismiss it in the last 30 days;
- it is under `max_impressions_per_week`.

The seed loads the strategy's recommendation matrix. Clients report `impression`, `click`, `dismiss` and `install`, which drive `/recommendations/stats` (CTR, install rate).

**Push delivery.** Modules register `jobs` on their `WellnessModule`; `shared/scheduler.ts` runs them every `SCHEDULER_INTERVAL_SECONDS` in the server process. The notification module's job sends reminders that are due in their own timezone (up to `PUSH_REMINDER_GRACE_MINUTES` late). The HeightIncrease job sends campaigns whose `scheduled_at` has come (up to 24 hours late), and admins can also send one immediately (`POST /apps/height-increase/admin/notifications/:id/send`). Every send claims a `notify.deliveries` row unique per (source, source id, user, occurrence) before the provider is called, so a reminder fires at most once per local day and a campaign at most once per user, even across restarts or overlapping runs. Campaigns go only to users who allow HeightIncrease notifications, and promotions only to accounts with `marketing_opt_in`. Tokens the provider rejects are deleted. Admins read the log at `GET /notifications/deliveries` and can run the reminder job with `POST /notifications/dispatch`.

## 7. Adding an app module

1. Set `backendModule: true` for the app in `src/config/app-catalog.ts`.
2. Add `database/migrations/1NN_app_<app>.sql` with its own schema. User FKs reference `identity.users(id) ON DELETE CASCADE`.
3. Create `src/modules/apps/<app>/` with the layer folders above and `<app>-module.ts`. Use `fixedAppContext("<app>")` and `authenticate` on its router.
4. Reuse platform engines rather than rebuilding them: the Routine Engine for exercise-type apps (Stretch & Posture, Face Yoga), the Content Factory for content apps (Makeup Tutorial, Cookies & Baking).
5. Register the module in `src/modules/module-registry.ts`, then run `npm run typecheck` and `npm run smoke`.

## 8. Not built yet

Each item below has a placeholder or a clear seam in the code:

- **Apple and Google purchase verification:** `AppleStoreVerifier` and `GooglePlayVerifier` return 501 until App Store Server API and Play Developer API credentials are wired in. The `dev` store simulates purchases outside production.
- **Store product IDs:** only `dev.*` SKUs are seeded. Real IDs get added to `billing.plan_store_products` once they exist in App Store Connect and Play Console.
- **Push provider:** the scheduler sends due reminders and scheduled campaigns, and every send is recorded once in `notify.deliveries`, but the only working provider is the development `log` provider. `FcmPushSender` fails every send (recorded as `failed`) until Firebase credentials are wired in, and the apps don't register FCM tokens yet.
- **AI food-photo analysis:** Foodvisor accepts `source: "photo"` items from the client. The server-side analysis pipeline isn't built.
- **Growth percentiles:** these need a validated standard (e.g. WHO tables). None are computed on purpose.
- **Expert review of imported content:** all imported TalentBaby milestones and library items, and HeightIncrease articles, are live but not expert reviewed (the apps show the unverified state). Imported HeightIncrease exercises and training plans are drafts until an expert reviews and publishes them through the Routine Engine.
- **TalentBaby features not migrated:** community, points and ranks, doctors, expert classes, wisdom articles, admin messages, family invitations, the nutrition food catalog, calorie analysis, content topics, analytics and offline content sync (`/content-sync`). They have no admin screens, and the mobile app no longer calls the sync endpoint. See section 9.
- **Activities (MET table) and LP nutrition constraints:** their legacy importers read an external `food data` folder that is not in the repository. The tables exist and are editable in the admin, but they are empty. Until constraints exist, the optimizer needs `constraints` or a `targetProfile` in the request.
- **Automated test suite:** today, verification is `npm run smoke`, an end-to-end script that drives every module.
- **Timezones:** streaks and the routine/activity summaries use UTC days. Care logs and the meal summary already take a `timezone` parameter.

## 9. Migrating the legacy backends

Each existing app's backend was moved into this platform. Each app's mobile client was switched to the new API instead of getting a compatibility layer. The three admin panels were merged into the unified admin (`admin/`). There was no production user data, so only content and reference data were imported. The legacy `backend/` and `web-admin/` folders of Foodvisor, TalentBaby and HeightIncrease were removed after verification, and the remaining app folders moved under `mobile/` (each Android project is now `mobile/<App>/android/`); they remain in git history (commit `5e32ba8`).

| App | Status | What moved |
| --- | --- | --- |
| Foodvisor | Done (legacy backend and admin removed) | Every Mongo collection now has a table in `foodvisor` (recipes go to `content.items`), and all 5 legacy services were ported as pure calculators (`calculators/`). `npm run import:legacy:foodvisor` loads the seed modules and the `foods.js` dump: 2,705 foods, 1,181 WS/T 578 rules, 28 reference sources, 12 + 42 condition diets, 7 risk rules, 54 terms, 8 validation rules, 5 daily-value profiles, 42 questionnaire items. 1,395 food images were copied to `public/static/foodvisor/images`. The unified admin's Foodvisor section uses the Resource kit under `/apps/foodvisor/admin`. The Android app calls `/apps/foodvisor/daily-targets/resolve` |
| TalentBaby | Done for the mobile app and the content admin (legacy backend and admin removed) | Every endpoint the Android app calls now lives under `/apps/babygrow` (profile, active child, children, feedings/sleeps/diapers over care logs, growth, milestones by month with yes/almost/no answers and a report, activities, the four-slot daily plan, daily updates, recipes by age group, articles, stories, bookmarks). The legacy content was rebuilt from the backend's SQL and seed scripts into `database/legacy/talentbaby-content.json`; `npm run import:legacy:talentbaby` loads 956 activities, 290 recipes, 23 stories, 16 daily updates and 8 sleep/feeding guides into `content.items` and 814 milestone definitions into `babygrow.milestone_definitions`, all live and not expert reviewed (as they were in TalentBaby). 486 images were copied to `public/static/babygrow/images`. The Android app uses UUID ids, the platform's register/login/refresh and `apps/babygrow/*`. The unified admin's BabyGrow section edits activities, milestones, recipes, stories and guides through the Resource kit (`/apps/babygrow/admin`, read model `babygrow.library_admin_view`); babies and caregivers are read-only lists. Features outside the MVP are listed in section 8 |
| HeightIncrease | Done (legacy backend and admin removed). The Android app reads the public catalog and, after email sign-in, syncs onboarding (profile gender, first measurement) and shows `/reports` | Exercises and training plans → Routine Engine (`routine.exercises`/`routines` gained `attributes` and `source_ref`), articles → Content Factory, banners, push campaigns, settings, profiles, daily logs and goals → `height` schema. `npm run import:legacy:height` loads the content captured from the legacy seed (`database/legacy/heightincrease-content.json`): 10 exercises and 3 plans as unreviewed drafts, 4 articles, 4 banners, 2 campaigns, 2 settings. The app API (`/home`, `/exercises`, `/training-plans`, `/articles`, `/banners` public; `/profile`, `/logs`, `/reports`, `/goals` signed in) replaces the legacy mobile routes. The unified admin's HeightIncrease section uses `/apps/height-increase/admin` with the legacy field names; exercises and plans are reviewed and published from their row actions or the Platform review queue |


