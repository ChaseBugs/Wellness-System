# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Talent Baby is a baby growth tracking and talent development application consisting of:
- **Backend** (`backend/`): Express.js + TypeScript + PostgreSQL REST API — substantially complete
- **Mobile** (`mobile/`): Android Native (Java) app — early stage, most features pending implementation

## Backend Commands

All commands run from `backend/`:

```bash
npm run dev          # Start development server (nodemon + ts-node, port 3004)
npm run build        # Compile TypeScript → dist/
npm start            # Start production server
npm run lint         # ESLint on src/**/*.ts
npm run format       # Prettier format src/**/*.ts

# Database setup (first time)
createdb talent_baby_db
psql -U postgres -d talent_baby_db -f database/schema.sql
npm run setup-db     # Alternative: ts-node setup script
npm run migrate      # Run migrations
npm run seed         # Seed initial data
```

**Environment variables** (create `backend/.env`):
- `PORT` (default: 3004), `NODE_ENV`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `LOG_LEVEL`

**Dev endpoints**: Swagger UI at `http://localhost:3004/api-docs`, health at `http://localhost:3004/health`

## Mobile Development

Open `mobile/` in Android Studio, sync Gradle, then run on emulator or device.

- **Emulator API base URL**: `http://10.0.2.2:3004`
- **Physical device**: `http://<local-ip>:3004`
- Min SDK: 24, Target SDK: 33

## Backend Architecture

Strict layered architecture — follow this dependency direction:

```
Routes → Controllers → Services → Repositories → Database (PostgreSQL)
```

- **Routes** (`src/routes/`, 50+ files): Define endpoints under `/api/v1`
- **Controllers** (`src/controllers/`): Handle HTTP, call services
- **Services** (`src/services/`): Business logic
- **Repositories** (`src/repositories/`): Raw SQL via parameterized queries (no ORM)
- **Middleware** (`src/middleware/`): Auth (JWT), error handling, premium checks, action logging
- **Database**: `database/schema.sql` defines 30+ tables; migrations in `database/migrations/`

When adding a new API endpoint, create/update files in all four layers (route → controller → service → repository) plus Swagger JSDoc in the route file.

## Mobile Architecture

Activity-based Android app with MVVM structure in progress:
- **Activities** (`activities/`): Full-screen flows (Login, SignUp, GetStarted onboarding, AddBaby, detail screens)
- **Fragments** (`fragments/`): Tab content — HomeFragment, ActivitiesFragment, ArticlesFragment, RecipesFragment, ProfileFragment
- **UI packages** (`ui/`): MVVM-style sub-packages — `home/`, `milestones/`, `splash/`, `tips/`, `tracker/`
- **Adapters** (`adapters/`): RecyclerView adapters — ActivityAdapter, ArticleAdapter, BabyAdapter, RecipeAdapter, TodayActivityAdapter
- **Network** (`network/ApiService.java`): Retrofit interface for all API calls
- **Utils**: `ApiClient.java` (Retrofit + OkHttp, 30s timeouts), `AuthInterceptor.java` (injects JWT Bearer), `TokenManager.java` (SharedPreferences token + userId)
- **Models**: Data classes matching backend API responses

`MainActivity` hosts a 4-tab bottom nav (Home, Milestones, Tracker, Tips) plus a NavigationDrawer sidebar. `SplashActivity` → `GetStartedWelcomeActivity` for new users, or `MainActivity` if already logged in.

## Key Conventions

**Backend**:
- TypeScript strict mode enabled
- All user-facing strings validated with `express-validator`
- Document all endpoints with Swagger JSDoc annotations in route files
- Log important events via Winston (`src/utils/logger.ts`)

**Mobile**:
- All user-facing text must use string resources (`@string/...`), never hardcoded
- Supported language: English (`res/values/strings.xml`)
- Use Material Design components for UI; consistent padding 24dp content / 16dp cards, card radius 12-16dp

**Database schema changes**: Create a migration file, add it to `database/migrations/`, then run `npm run migrate`.

**Language rule**: Database seed data and content (recipes, nutrition foods, articles, etc.) must be in **English only**. Do not add localized (`name_ko` or similar) columns or non-English seed text into the database.

## Implementation Status

Backend is complete for most features. Mobile is pending implementation for all features.

Priority order per `.cursorrules`:
1. **Phase 1 (MVP)**: Baby Tracker (feeding/sleep/diaper/growth), Activity System, Daily Plan, Milestones, Video Content, Recipes, Articles, Expert Classes, Memories, Talent Development
2. **Phase 2**: Pregnancy Tracking, Calculators, Notifications
3. **Phase 3**: Community, Analytics, Registry, Family Sharing

Unique differentiators: Video-to-Activities linking, 7-category Talent Development System, Activity Completion Videos.

See `FINAL_FEATURE_LIST.md` for complete feature specs and status tracking.
