# Admin Polish + Backend Hardening — Design (Sub-project B)

**Date:** 2026-05-08
**Sub-project:** B (Sub-project A — reference data layer — is shipped)
**Status:** Approved, proceeding to plan

## Problem & Goal

After Sub-project A, the six reference collections have real data and a typed filter API, but the admin UI is utilitarian (basic tables, no charts, no filter UX, no bulk actions, no verification queue) and the backend has thin error handling, no audit trail, no sort, no bulk endpoints. Sub-project B raises both the admin UX and backend quality so admins can review the doctor-verified queue effectively and recover provenance for any change.

## Scope

In: dashboard rebuild, ResourceManager bulk-select / filter chips / action bar, sidebar verification badges, visual polish, six backend hardening items.

Out (deliberate): real authentication (still localStorage pseudo-session), test suite (CLAUDE.md verification = `npm run build`), OpenAPI rewrite, command palette, dark mode, mobile-app frontend, recommendation engine wiring.

## Backend hardening

### B1. Extended `/api/dashboard`

Single round-trip used by dashboard tiles, sidebar badges, recent feed:

```ts
{
  totals: {
    foods, recipes, activities, users, mealLogs, weightEntries, programs,
    referenceSources, nutrientIntakeRules, conditionDietRules,
    riskAssessmentRules, nutritionTerminology, dataValidationRules
  },
  unverified: { /* same keys, count where doctor_verified=false */ },
  recentAdditions: [{ resource: "foods", id, label, createdAt }, ... up to 12],
  trend: { last30Days: [{ date: "YYYY-MM-DD", total }, ...] }
}
```

`label` is the resource's name-ish field via a tiny mapping (foods → koreanName, condition rules → conditionLabel, etc.). `recentAdditions` is computed by `Promise.all` of `Model.find().sort({createdAt:-1}).limit(2)` per resource, merged and resorted to 12.

### B2. Bulk endpoints — opt-in via `createCrudRouter` flag

Extend signature:
```ts
createCrudRouter(model, searchFields, filterableFields, options?: {
  sortableFields?: string[],
  bulkActions?: boolean
})
```

When `bulkActions: true`:
- `PATCH /bulk-verify` body `{ ids: string[], doctor_verified: boolean }` → `{ matched, modified }`
- `DELETE /bulk` body `{ ids: string[] }` → `{ deleted }`

Both cap `ids.length` at 500. Wired on the 7 filterable routes only (foods + 6 reference). NOT on users / meal-logs / weight-entries — those collections shouldn't be bulk-mutated by admins.

### B3. Sort

`?sort=field` ascending, `?sort=-field` descending. Whitelist via `sortableFields` option. Default stays `createdAt:-1`. Each filterable route gets a sortable list (e.g., for foods: `koreanName, category, createdAt, doctor_verified`).

### B4. Consistent error response shape

Single error middleware in `app.ts`. Normalize all errors:

```ts
{ error: { code: string, message: string, details?: any, reqId: string } }
```

- Mongoose `ValidationError` → `code: "validation_error"`, `details: { field: msg }`
- Mongoose `CastError` (bad ObjectId) → `code: "invalid_id"`
- Resource-not-found (404 from CRUD router) → `code: "not_found"`
- Express body parse error → `code: "bad_request"`
- Anything else → `code: "internal_error"`, message hidden in production (`process.env.NODE_ENV === "production"`)

Removes the inconsistent `{ message }` and `{ message: "Resource not found" }` shapes. Frontend updated to display `error.message` and surface `reqId` in toasts for debugging.

### B5. Audit log collection

New `AuditLog` model: `{ action, resource, ids: string[], before?, after?, by, reqId, at }`. Written by middleware on every PUT, DELETE, POST, and bulk action on the filterable routes. `by` reads `req.headers['x-admin-user']`; web-admin sends it from localStorage. `before`/`after` captured for PUT only (single-record). Bulk actions store ids and counts only — not full diffs.

Capped collection (size: 256MB) so it can't grow unbounded. A future Sub-project can add a UI to browse it.

### B6. Request ID + structured logging

`requestId` middleware: `req.id = req.headers['x-request-id'] ?? crypto.randomUUID()`. Adds `x-request-id` response header. Winston format extended to include `reqId` automatically when in async context (use `cls-hooked` if needed; if too heavy, just pass `req.id` explicitly to log calls in error middleware — pragmatic over pretty).

## Frontend: dashboard

### Layout (single page, three vertical sections)

```
Hero strip:           [Total records] [Unverified count] [Verified %] (Ring)
Records by collection:  horizontal BarMini chart (13 collections)
Verification queue + 30-day trend:  side-by-side cards
Recent additions:    list of 12 most recent records across collections
```

### Components (all in `web-admin/components/charts/` and `components/dashboard/`)

- `KpiCard.tsx` — `{ label, value, icon, trend?, ring? }`
- `BarMini.tsx` — `{ items: [{label, value, href?}], max? }` — horizontal SVG bars; click navigates
- `Sparkline.tsx` — `{ points: number[], height?, stroke? }` — SVG polyline ~25 LOC
- `Ring.tsx` — `{ value, total, size? }` — SVG donut ~20 LOC
- `VerificationQueueCard.tsx` — list of `{resource, count}` linking to `/<resource>?doctor_verified=false`
- `RecentFeedCard.tsx` — 12 items with icon, label, relative time

No Recharts dependency. If we hit a chart that's painful in raw SVG, that's the trigger to add it — not before.

### Data flow

Page is a Server Component, fetches `/api/dashboard` once. Client islands for `Sparkline` and `RecentFeed` only if they need interactivity (they don't initially — keep static).

## Frontend: ResourceManager enhancements

Three augmentations to the existing component, **all opt-in via per-resource config**.

### Per-resource config

`web-admin/lib/resourceConfigs.ts`:

```ts
type ResourceConfig = {
  endpoint: string;
  filters: Array<
    | { type: "chip", key: string, label: string, value: string }
    | { type: "select", key: string, label: string, options: { value: string, label: string }[] }
    | { type: "range", key: string, label: string }   // emits ?<key>_gte=&<key>_lte=
  >;
  bulkActions: Array<"verify" | "unverify" | "delete">;
  sortable: string[];   // field names available in the sort dropdown
  recentLabelField: string;   // for dashboard recentAdditions
};

export const resourceConfigs: Record<string, ResourceConfig> = { ... };
```

One file, all 7 admin pages reference it. Adding a filter to a page = editing config, not the component.

### Filter bar

Above the existing search/limit toolbar:
- Pill chips for chip filters: clicking toggles the chip and `?<key>=<value>` in the URL
- Dropdown selects for select filters
- Range pair (min/max numeric inputs) for range filters
- Active filters shown as dismissible chips with × button
- "Clear all" link when ≥1 filter active

### Bulk-select column

- Leftmost column with checkbox header and row checkboxes
- Header checkbox = "select all on this page" (not all pages)
- Selected ids stored in `Set<string>` component state, persisted across pagination via React state (not URL — too noisy)
- A subtle banner appears: "3 selected on this page · 47 total selected" when crossing pages

### Bottom action bar

- Slides up from page bottom (`position: fixed`) when `selectedIds.size ≥ 1`
- Shows count + buttons matching `bulkActions`: "Mark verified", "Mark unverified", "Delete"
- Destructive actions (Delete + Unverify) confirm via Modal before calling
- After action: refresh list, show toast with success/failure summary, clear selection

### Sidebar verification badges

`Sidebar.tsx` reads from a shared `useDashboardStats()` hook (calls `/api/dashboard`, refreshes every 60s, falls back gracefully if endpoint errors). Each nav item with an `unverified > 0` value shows a small red-ish circle badge with the count. Clicking the nav item already filters the page; the badge is informational only.

## Frontend: visual polish

Surgical, not a redesign. All in `globals.css`:

- **Type scale tokens:** `--text-xs: 11px`, `--text-sm: 13px`, `--text-base: 14px`, `--text-lg: 16px`, `--text-xl: 18px`, `--text-2xl: 22px`. Use throughout instead of ad-hoc px values.
- **Density:** `--row-pad: 12px 16px` (comfy, default) vs `8px 12px` (compact). Toggle in TopBar; persists in localStorage as `admin.density = "comfy" | "compact"`. Applied via `data-density="..."` on `body`.
- **Sticky table header** + sticky first column when bulk-select is on (`position: sticky; top: 0` for thead, plus z-index).
- **Empty state component** — icon + message + optional primary action. Used by ResourceManager when items.length===0 after a search/filter.
- **Skeleton loaders** — replace "Loading..." text with shimmering grey placeholder rows for first paint. ResourceManager only.
- **Motion** — consistent 160ms ease-out for hover, focus, action-bar slide. Add `@media (prefers-reduced-motion: reduce)` overrides.
- **Status pills** — `--success`, `--info`, `--warning`, `--danger` tokens for verified/draft/needs-review badges. Verified state renders as a green dot + "Verified", unverified as amber dot + "Needs review".

Out of scope: dark mode, custom column visibility, saved view presets.

## Verification

Per `CLAUDE.md`: `npm run build` is the verification step.

1. `npm run build` from repo root passes.
2. `npm run import:reference-guidelines` still works idempotently (Sub-project A regression check).
3. Backend curl checks:
   - `GET /api/dashboard` returns the new shape with `totals`, `unverified`, `recentAdditions`, `trend.last30Days`.
   - `PATCH /api/condition-diet-rules/bulk-verify` with 3 ids flips `doctor_verified` and the next dashboard call shows lower unverified count.
   - `DELETE /api/foods/bulk` with empty `ids: []` returns `{ deleted: 0 }` not error.
   - `GET /api/foods?sort=-koreanName&limit=5` returns 5 items in descending koreanName.
   - `POST /api/foods` with missing required fields returns the new shape: `{ error: { code: "validation_error", message, details, reqId } }`.
   - `GET /api/foods/notanobjectid` returns `{ error: { code: "invalid_id", ... } }`.
4. Frontend smoke:
   - Dashboard renders with non-zero numbers, at least one bar chart visible, ring shows verified %.
   - Open `/foods`, click "Unverified only" chip — URL gains `?doctor_verified=false`, results refresh.
   - Select 3 rows — action bar slides up, count = 3.
   - Click "Mark verified" — modal confirms, items update, badge in sidebar decreases by 3.
   - Toggle density to compact in TopBar — rows visibly tighten, persists across reload.

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Audit log writes slow down hot paths | Async `setImmediate(...)`; failures logged but don't fail the original request. Capped collection prevents unbounded growth. |
| Bulk endpoints misused for arbitrary mutations | Body schema validates `ids` is `string[]` of ObjectIds, max 500; `bulk-verify` only sets `doctor_verified` field — no other fields accepted. |
| Sidebar badge polling spams the API | 60s interval, single shared hook, `Cache-Control: max-age=30` on dashboard endpoint, AbortController on unmount. |
| Native SVG charts can't handle a future requirement (e.g. tooltip stacking) | Recharts is a 1-PR escape hatch; chart components share a `ChartProps` shape so swapping internals is local. |
| Density / theme toggles cause layout shift | Tokens defined on `body[data-density]`; switch is a CSS-only re-render, no JS layout calc. |
| Error middleware swallows stack traces in dev | Stack traces logged via Winston in dev with full context; only response body is sanitized. |

## Acceptance

Ships when:
- B1–B6 backend items are wired and curl-verified.
- Dashboard renders the new shape with charts.
- ResourceManager filter chips, bulk-select, action bar, and sidebar badges all work end-to-end on at least 2 representative resources (`/foods` and `/condition-diet-rules`); the per-resource config exists for all 7 filterable routes.
- Visual polish tokens applied site-wide (typography, density toggle, sticky headers, empty state, skeleton, status pills).
- `npm run build` passes from repo root.
