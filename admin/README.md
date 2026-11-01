# Wellness Admin

One admin for the whole Wellness Platform. It replaces the separate Foodvisor, TalentBaby and
HeightIncrease admins and talks only to the platform backend (`../backend`, port 4500).

## Run

```bash
# 1. backend (in ../backend): npm run db:local && npm run seed && npm run dev
# 2. admin
npm install
copy .env.example .env.local   # only if the API is not http://localhost:4500/api/v1
npm run dev                    # http://localhost:3000
```

Sign in with a platform editor or admin account (seeded: `admin@wellness.local` / `Admin123!`).
Admins see every section; editors see the app sections only.

Verify with `npm run build` (it type-checks) and `npm run lint`.

## Sections

| Section | Route | API |
| --- | --- | --- |
| Platform (admins) | `/platform` overview, `review`, `accounts`, `subscriptions`, `recommendations`, `analytics`, `audit-log` | `/admin/*`, `/content/manage/items/*`, `/routine/*`, `/recommendations/*`, `/analytics/kpis` |
| Foodvisor | `/foodvisor/*` | `/apps/foodvisor/admin/*` |
| BabyGrow (TalentBaby) | `/babygrow/*` | `/apps/babygrow/admin/*` |
| HeightIncrease | `/height/*` | `/apps/height-increase/admin/*`, review/publish on `/routine/*` |

## Code layout

- `components/shell/`: the shared sidebar (with the app switcher), top bar and auth guard. Sections and menu
  items are listed in `lib/navigation.ts`.
- `components/` (top level): Foodvisor's design-system components. `ResourceManager` is the generic
  Resource-kit table/form. Pass `apiBase` (one of `ADMIN_BASES` in `lib/api.ts`), the
  `canCreate`/`canEdit`/`canDelete` switches and `rowActions`. The platform, Foodvisor and HeightIncrease
  pages use it.
- `components/babygrow/`, `lib/babygrow/`, `hooks/`, `types/babygrow.ts`: the BabyGrow pages, ported
  from the TalentBaby admin. They are Tailwind screens using axios, with the mappers in
  `lib/babygrow/resources.ts`.
- `lib/height/resources.ts`: the HeightIncrease resource configs.
- `lib/auth.ts` holds one session for every section. Both API clients (fetch in `lib/api.ts` and axios in
  `lib/babygrow/api.ts`) share a single in-flight token refresh. Reusing a rotated refresh token would
  make the platform revoke the account's sessions.

## Styling

`app/foodvisor.css` is Foodvisor's stylesheet. Its element rules (`button`, `input`, `table`, …) are
scoped with `:where(.fv)` (no added specificity, so class rules keep winning as in the original), which the shell adds around every section except BabyGrow, so Tailwind's base styles
apply on the BabyGrow pages. Class names in the two systems don't overlap.
