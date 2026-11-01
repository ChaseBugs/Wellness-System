# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Talent Baby (the "BabyGrow" app in the Wellness Ecosystem) is a baby growth tracking and talent development app. This folder holds the **Android app** (`android/`). Its backend and admin are part of the Wellness Platform:

- **Backend:** `backend/` at the repo root, app code `babygrow`, module `src/modules/apps/babygrow`. New backend work goes there. Read `backend/CLAUDE.md` first.
- **Admin:** the unified Wellness admin `admin/` at the repo root, section `/babygrow` (activities, milestones, recipes, stories, guides, babies, caregivers).
- The legacy Express + PostgreSQL `backend/` and the standalone `web-admin/` were removed after the migration. They remain in git history (commit `5e32ba8`). Their content was imported with `npm run import:legacy:talentbaby` (snapshot: `backend/database/legacy/talentbaby-content.json`).
- Legacy features not on the platform yet: community, points/ranks, doctors, expert classes, wisdom articles, admin messages, family invitations, nutrition food catalog, calorie analysis, offline content sync. See `docs/Backend_Architecture.md` section 8.

## Mobile development

Open `android/` in Android Studio or build from the command line with JDK 17: `gradlew.bat assembleDebug`.

- **API base URL:** `http://10.0.2.2:4500/api/v1/` from the emulator (`utils/ApiClient.java`); use `http://<local-ip>:4500/api/v1/` on a device.
- BabyGrow endpoints are under `apps/babygrow/`. Accounts use the platform's `auth/register`, `auth/login` and `auth/refresh`, and every request sends `X-App-Code: babygrow`.
- Ids are UUID strings. The active child id is stored in `TokenManager`.
- Responses use the platform envelope `{ success, data, meta }`, which `ApiResponse<T>` reads.
- Min SDK: 24, Target SDK: 33.

## Mobile architecture

Activity-based Android app with an MVVM structure in progress:

- **Activities** (`activities/`): full-screen flows such as Login, SignUp, GetStarted onboarding, AddBaby, and the detail screens.
- **Fragments** (`fragments/`): tab content (Home, Activities, Articles, Recipes, Profile).
- **UI packages** (`ui/`): `home/`, `milestones/`, `splash/`, `tips/`, `tracker/`.
- **Adapters** (`adapters/`): RecyclerView adapters.
- **Network** (`network/ApiService.java`): Retrofit interface for all API calls.
- **Utils:**
  - `ApiClient.java`: Retrofit + OkHttp.
  - `AuthInterceptor.java`: bearer token and app code.
  - `TokenAuthenticator.java`: refreshes the access token on 401.
  - `TokenManager.java`: tokens, user id, active child.
- **Models:** classes whose `@SerializedName` values match the platform's camelCase responses.

`MainActivity` hosts a 4-tab bottom nav (Home, Milestones, Tracker, Tips) plus a navigation drawer. `SplashActivity` → `GetStartedWelcomeActivity` for new users, or `MainActivity` if already logged in. `LoginActivity` is still a UI-only OTP stub; sign-up calls the platform.

## Key conventions

- All user-facing text uses string resources (`@string/...`), never hardcoded strings. Supported language: English (`res/values/strings.xml`).
- Use Material Design components. Padding is 24dp for content and 16dp for cards; card radius is 12-16dp.
- Content (activities, recipes, articles, ...) is English only. Don't add localized columns or non-English seed text.

## Implementation status

The app's core screens (tracker, activities and daily plan, milestones, recipes, articles, stories, growth) call the platform. See `FINAL_FEATURE_LIST.md` for the full feature list and phases.
