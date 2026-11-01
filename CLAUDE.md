# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

The repository holds the Wellness Ecosystem: one shared backend, one admin, the apps' Android clients, and product-planning material for the planned multi-app portfolio. There is no root build, package manager or test runner; each coded project has its own.

```
backend/              the one backend for every app (Express + TS + PostgreSQL, :4500)
admin/                the one admin UI for every app (Next.js 16 + Tailwind, :3000)
mobile/               one folder per app; each holds its Android project in android/
  Foodvisor/          android/, design/, docs/, foods data dump
  TalentBaby/         android/, ui/ (design), docs/, feature list ("BabyGrow" in the strategy)
  HeightIncrease/     android/, design/
design-references/    screenshot-only references for future apps (no code)
docs/                 strategy, architecture, app specs, ecosystem diagram
```

| Path | Contents |
| --- | --- |
| `backend/` | **The one backend**: a modular monolith with platform modules plus one module per app under `/apps/{app}`. Architecture: `docs/Backend_Architecture.md` |
| `admin/` | **The one admin**. Sections: Platform (accounts and roles, subscriptions, review queue, recommendations, analytics, audit log), Foodvisor, BabyGrow, HeightIncrease |
| `mobile/<App>/android/` | Native Android Java apps. Open this folder in Android Studio |
| `design-references/` | `DailyYoga/`, `DownDog/`, `FaceYoga/`, `HairTry/`, `Youcam Makeup/` |
| `docs/Wellness_Ecosystem_2027_English.md` | Portfolio strategy: app categories, launch order, shared platform design, data-sharing boundaries, Wellness Pass, roadmap |
| `docs/app-specs/NN-*.md` | Feature specs for candidate apps (baby grow, women's health, calorie/API, yoga, AI health tracking, height, AR hair, workout, world cuisines) |
| `docs/ecosystem-diagram/` | `build_wellness_ecosystem_svg.js` and the `Entire_Wellness_System.svg`/`.png` it describes |

The apps' own legacy backends and admin panels were removed after their migration to the platform. They remain in git history (commit `5e32ba8`, where the apps were top-level folders and each Android project was `<App>/mobile/`).

## Working in a sub-project

**Before editing, read the folder's own guide:**

- `backend/CLAUDE.md`
- `admin/README.md`
- `mobile/Foodvisor/CLAUDE.md`, plus `mobile/Foodvisor/AGENTS.md`
- `mobile/TalentBaby/CLAUDE.md`, plus `mobile/TalentBaby/.cursorrules`
- `mobile/HeightIncrease/android/README.md`

New backend work for any app goes in `backend/`, and new admin screens go in `admin/`. What is not migrated yet is listed in `docs/Backend_Architecture.md` section 8.

- **Next.js 16 in the admin:** it has breaking changes (see `admin/AGENTS.md`). Read `node_modules/next/dist/docs/` before writing admin code.
- **Stay in scope:** keep changes inside the project the task concerns, and follow each project's own conventions. The Android apps are unrelated codebases.
- **Verification:** none of the projects has automated unit tests. Verify with:
  - Backend: in `backend/`, run `npm run typecheck && npm run lint`, then `npm run smoke` against a running server.
  - Admin: in `admin/`, run `npm run build` and `npm run lint`.
  - Android apps: in `mobile/<App>/android/`, run `gradlew.bat assembleDebug` with JDK 17 (`JAVA_HOME=~/.jdks/temurin-17`).
- **Reaching the backend from Android:** the emulator reaches the backend on the host machine through `http://10.0.2.2:4500`.
- **Local stack:**
  1. In `backend/`, run `npm run db:local`, `npm run seed`, then `npm run dev`. The legacy content imports are `import:legacy:foodvisor`, `import:legacy:talentbaby` and `import:legacy:height`.
  2. In `admin/`, run `npm run dev` and sign in as `admin@wellness.local` / `Admin123!`.

## Ecosystem-level conventions

These come from `docs/Wellness_Ecosystem_2027_English.md`. Respect them in any cross-app work.

- **Data-sharing boundaries:** account, entitlements, settings and consented interests may be shared centrally. Child growth records, meal and health logs, body measurements and skin data stay inside their app. They cross apps only with explicit, purpose-specific consent, and are never pooled for marketing.
- **Shared platform:** one modular backend (not microservices) providing Account, Billing, Analytics, Content, Routine, Notification and Recommendation modules on PostgreSQL. It is implemented in `backend/`, and `admin/` manages it. The mobile apps keep their existing stacks.
- **Naming:** the strategy doc spells the apps "BabyGrow" and "FoodVisior". The code folders are `mobile/TalentBaby/` and `mobile/Foodvisor/`.
- **App catalog:** app codes, categories and lifecycle are defined in `backend/src/config/app-catalog.ts` (synced into `identity.apps` on migrate).

## Ecosystem diagram

The app portfolio diagram is generated from data in `docs/ecosystem-diagram/build_wellness_ecosystem_svg.js`, so edit the `categories` and `journeys` arrays there rather than the SVG itself. Each app's status is one of `coded`, `reported`, `design` or `planned`. Regenerate with:

```bash
node docs/ecosystem-diagram/build_wellness_ecosystem_svg.js   # writes Entire_Wellness_System.svg next to the script
```

The `.png` beside it is exported separately; the script does not produce it.

## Repo hygiene

- Root `.gitignore` excludes `node_modules/`, lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) and `.env*` files. Copy the `.env.example` files instead of committing env files.
- Large binary assets are committed, including screenshots, design zips, an APK and `mobile/Foodvisor/foods.7z`. Don't modify or rename the files in the screenshot and design folders.
- Migrated images live in `backend/public/static/{foodvisor,babygrow}/images`.
