# Repository Guidelines

## Project Structure & Module Organization

This folder holds the Foodvisor Android app (`android/`), its mobile reference screenshots (`design/`) and the foods data dump (`foods.js`, `foods.7z`). The backend and the admin moved to the Wellness Platform: `backend/` at the repo root (module `src/modules/apps/foodvisor`) and the unified admin `admin/` (section `/foodvisor`). Keep Foodvisor-specific files inside `mobile/Foodvisor/`; sibling app folders are unrelated projects.

## Build, Test, and Development Commands

- Mobile: from `android/`, `gradlew.bat assembleDebug` (JDK 17). The emulator reaches the platform at `http://10.0.2.2:4500`.
- Backend: from the root `backend/`, `npm run dev`; verify with `npm run typecheck`, `npm run lint` and `npm run smoke`.
- Admin: from the root `admin/`, `npm run dev`; verify with `npm run build`.

## Coding Style & Naming Conventions

Follow the conventions of the project you change: the Android app's existing Java structure here, and the platform's own `CLAUDE.md`/`README.md` for backend and admin code. Preserve screenshot names in `design/`.

## Testing Guidelines

No automated unit tests are configured. Before merging, build the mobile app, run the platform smoke test, and manually exercise the affected admin page.

## Commit & Pull Request Guidelines

Use specific, imperative summaries: `add foodvisor onboarding screenshots` or `organize foodvisor meal scan assets`. Pull requests should include a brief description, list changed folders, note any added or removed screenshots, and attach before/after examples when visual assets change.

## Agent-Specific Instructions

Respect the wider monorepo. Scope searches, status checks, and edits to `mobile/Foodvisor/` unless the task explicitly requires platform changes. Do not modify or restore unrelated sibling project files.
