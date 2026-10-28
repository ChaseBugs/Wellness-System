# Repository Guidelines

## Project Structure & Module Organization

This folder contains a Foodvisor-style platform. `design/` stores the mobile reference screenshots, `backend/` contains the Express.js TypeScript API, and `web-admin/` contains the Next.js TypeScript admin panel. Keep Foodvisor-specific files inside `foodvisor/`; sibling folders are unrelated projects.

## Build, Test, and Development Commands

Use these commands from `foodvisor/`:

- `npm run install:all` installs backend and admin dependencies.
- `docker compose up -d mongo` starts MongoDB.
- `npm run seed` loads Foodvisor seed data with `doctor_verified: false`.
- `npm run dev:backend` starts the API on port `4000`.
- `npm run dev:admin` starts the admin on port `3000`.
- `npm run build` builds both packages.

## Coding Style & Naming Conventions

Use strict TypeScript. Backend code uses ES modules, Express routers, and Mongoose models. Admin code uses Next App Router components. Prefer 2-space indentation, descriptive camelCase variables, PascalCase React components, and kebab-case route folders. Preserve screenshot names in `design/`.

## Testing Guidelines

No automated tests are configured yet. Before merging, run `npm run build` and manually verify API endpoints such as `GET /api/health` and admin CRUD flows. If tests are added, place backend tests under `backend/src/**/*.test.ts` and admin tests beside components or under `web-admin/tests/`.

## Commit & Pull Request Guidelines

Recent commits use very short messages such as `updated`, `updated images`, and `initial version`. Improve on that by using specific, imperative summaries: `add foodvisor onboarding screenshots` or `organize foodvisor meal scan assets`. Pull requests should include a brief description, list changed folders, note any added or removed screenshots, and attach before/after examples when visual assets change.

## Agent-Specific Instructions

Respect the wider monorepo. Scope searches, status checks, and edits to `foodvisor/` unless the task explicitly requires parent-level changes. Do not modify or restore unrelated sibling project files.
