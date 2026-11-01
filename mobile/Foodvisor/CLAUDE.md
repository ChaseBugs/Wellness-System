# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Where Foodvisor lives now

Foodvisor runs on the Wellness Platform:

- **Backend:** `backend/` (repo root), module `src/modules/apps/foodvisor`, at `http://localhost:4500/api/v1/apps/foodvisor`. Read `backend/CLAUDE.md` before backend work.
- **Admin:** the unified Wellness admin `admin/` (repo root), section `/foodvisor`. It calls `/apps/foodvisor/admin/<resource>` through the platform Resource kit.

The legacy Express + MongoDB `backend/` and the standalone `web-admin/` were removed after the migration. They are in git history (commit `5e32ba8`) if something needs to be looked up.

## What is in this folder

| Path | Contents |
| --- | --- |
| `android/` | Native Android (Java) app; calls the platform API (see `android/README.md`) |
| `design/` | Mobile reference screenshots. Don't rename or modify. `design/ui/*.png` is shown on the admin's UI Workflows page |
| `foods.js`, `foods.7z` | Mongo shell dump of the foods collection, read by the platform's `npm run import:legacy:foodvisor` |
| `docs/` | Planning notes from the legacy implementation (historical) |
| `FOOD_SCRAPING_DATA.md`, `reference.md` | Data-source notes |

## Repository scope

This `mobile/Foodvisor/` directory is part of a wider monorepo. Scope searches, status checks and edits to `mobile/Foodvisor/` unless the task needs the platform (root `backend/` and `admin/`). Sibling app folders are unrelated projects.

## Data quality rule

USDA FoodData Central is the **primary** source for nutrition values (calories, macros, vitamins, minerals, GI, daily-value %). ComprehensiveFoodDatabase lists only contribute names, brands, categories and offline image coverage; they are not authoritative for nutrition. Don't backfill nutrition fields from them. New or imported records start unverified (`doctorVerified: false`) and an admin reviews them.

## Verification

- Mobile: from `android/`, run `gradlew.bat assembleDebug` with JDK 17.
- Backend and admin: see `backend/CLAUDE.md` (`typecheck`, `lint`, `smoke`) and `admin/README.md` (`build`, `lint`).

## Commit style

Recent history is terse (`updated`, `initial version`). Prefer specific imperative summaries (`add foodvisor onboarding screenshots`).
