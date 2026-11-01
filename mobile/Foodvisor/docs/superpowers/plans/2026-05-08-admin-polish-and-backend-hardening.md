# Admin Polish + Backend Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the backend (request IDs, consistent errors, audit log, sort, bulk endpoints, extended dashboard) and elevate the admin UI (dashboard rebuild, filter chips, bulk-select + action bar, sidebar verification badges, visual polish).

**Architecture:** Backend keeps the generic `createCrudRouter` pattern but gains options for sort + bulk; new error and request-id middleware sits in `app.ts`. Frontend stays hand-rolled CSS + custom components — adds tiny native-SVG chart components, a `resourceConfigs.ts` single-source-of-truth, and ResourceManager extensions that are opt-in via that config.

**Tech Stack:** Express 4 + Mongoose 8 + winston (already installed) + crypto.randomUUID; Next.js 15 + React 19 + lucide-react + native SVG (no Recharts).

**Verification model:** Per `CLAUDE.md`, no test suite — verify via `npm run build` + targeted curl/spot-checks. No git commits during execution per user preference.

---

## File Map

### Backend

| File | Status | Responsibility |
| --- | --- | --- |
| `backend/src/middleware/request-id.ts` | NEW | Assign `req.id` from `x-request-id` header or `randomUUID()` |
| `backend/src/middleware/error-handler.ts` | NEW | Single error middleware → `{ error: { code, message, details?, reqId } }` |
| `backend/src/middleware/audit-log.ts` | NEW | Express middleware that records mutating ops to `auditLogs` collection |
| `backend/src/models/audit-log.ts` | NEW | Mongoose model for capped `auditLogs` collection |
| `backend/src/routes/crud.ts` | MODIFY | Add `sortableFields` + `bulkActions` options; mount `PATCH /bulk-verify` + `DELETE /bulk` |
| `backend/src/routes/index.ts` | MODIFY | Pass new options to relevant routes; mount audit middleware on filterable routes |
| `backend/src/routes/dashboard.ts` | REWRITE | New shape: `totals`, `unverified`, `recentAdditions`, `trend.last30Days` |
| `backend/src/app.ts` | MODIFY | Mount `requestId` + `errorHandler` |
| `backend/src/lib/logger.ts` | MODIFY (or NEW if absent) | Winston format includes `reqId` when provided |

### Frontend

| File | Status | Responsibility |
| --- | --- | --- |
| `web-admin/lib/resourceConfigs.ts` | NEW | Per-resource: filters, bulkActions, sortable, recentLabelField |
| `web-admin/lib/api.ts` | MODIFY | Helpers for `bulk-verify`, `bulk-delete`; surface `error.code` + `reqId` |
| `web-admin/lib/useDashboardStats.ts` | NEW | Client hook polling `/api/dashboard` every 60s |
| `web-admin/components/charts/BarMini.tsx` | NEW | Horizontal SVG bar chart |
| `web-admin/components/charts/Sparkline.tsx` | NEW | 30-day SVG polyline |
| `web-admin/components/charts/Ring.tsx` | NEW | SVG donut |
| `web-admin/components/dashboard/KpiCard.tsx` | NEW | Reusable stat card |
| `web-admin/components/dashboard/VerificationQueueCard.tsx` | NEW | Per-resource unverified count list |
| `web-admin/components/dashboard/RecentFeedCard.tsx` | NEW | 12 recent records list |
| `web-admin/components/filters/FilterBar.tsx` | NEW | Chips + selects + range input row |
| `web-admin/components/BulkActionBar.tsx` | NEW | Fixed bottom action bar |
| `web-admin/components/ResourceManager.tsx` | MODIFY | Bulk-select column, selection state, filter slot, sort slot |
| `web-admin/components/Sidebar.tsx` | MODIFY | Per-nav-item badge from useDashboardStats |
| `web-admin/components/EmptyState.tsx` | NEW | Icon + message + optional action |
| `web-admin/components/Skeleton.tsx` | NEW | Shimmering placeholder rows |
| `web-admin/components/TopBar.tsx` | MODIFY | Density toggle (comfy / compact) persisted in localStorage |
| `web-admin/app/(admin)/page.tsx` | REWRITE | Use new dashboard endpoint + chart components |
| `web-admin/app/globals.css` | MODIFY | Type scale tokens, density tokens, sticky headers, status pills, motion |

---

## Backend Phase

### Task 1: Request ID middleware + Winston format

**Files:**
- Create: `backend/src/middleware/request-id.ts`
- Modify: `backend/src/lib/logger.ts` (or wherever winston is configured)
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Locate the existing logger**

Run: `Grep` for `winston` in `backend/src/`. Identify the file that creates the logger (likely `backend/src/lib/logger.ts` or inline in `app.ts`).

- [ ] **Step 2: Create `backend/src/middleware/request-id.ts`**

```ts
import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.headers["x-request-id"];
  req.id = typeof incoming === "string" && incoming.length > 0 && incoming.length <= 128
    ? incoming
    : randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
}
```

- [ ] **Step 3: Mount the middleware FIRST in `backend/src/app.ts`**

Find the first middleware mount (likely `app.use(helmet())` or `app.use(cors(...))`). Insert BEFORE it:

```ts
import { requestId } from "./middleware/request-id.js";
// ...
app.use(requestId);
```

- [ ] **Step 4: Verify TypeScript compiles**

Run from `backend/`: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Verify the response header is set**

Run from `backend/` (with backend running on :4000): `curl -is http://127.0.0.1:4000/api/health | grep -i x-request-id`
Expected: a line like `x-request-id: <uuid>`.

---

### Task 2: Consistent error middleware

**Files:**
- Create: `backend/src/middleware/error-handler.ts`
- Modify: `backend/src/app.ts` (mount LAST)
- Modify: `backend/src/routes/crud.ts` (router 404 path uses new shape)

- [ ] **Step 1: Create `backend/src/middleware/error-handler.ts`**

```ts
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

type AppError = { status: number; code: string; message: string; details?: unknown };

function classify(err: unknown): AppError {
  if (err instanceof mongoose.Error.ValidationError) {
    const details: Record<string, string> = {};
    for (const [field, e] of Object.entries(err.errors)) {
      details[field] = (e as mongoose.Error.ValidatorError).message;
    }
    return { status: 400, code: "validation_error", message: "Validation failed", details };
  }
  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, code: "invalid_id", message: `Invalid ${err.path}: ${err.value}` };
  }
  if (err && typeof err === "object" && "status" in err && typeof (err as any).status === "number") {
    const e = err as { status: number; code?: string; message?: string };
    return {
      status: e.status,
      code: e.code ?? (e.status === 404 ? "not_found" : "error"),
      message: e.message ?? "Error"
    };
  }
  if (err instanceof SyntaxError && (err as any).status === 400 && "body" in err) {
    return { status: 400, code: "bad_request", message: "Invalid JSON body" };
  }
  return { status: 500, code: "internal_error", message: "Internal server error" };
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const app = classify(err);
  const isProd = process.env.NODE_ENV === "production";

  if (app.status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", { reqId: req.id, code: app.code, err });
  }

  res.status(app.status).json({
    error: {
      code: app.code,
      message: isProd && app.status >= 500 ? "Internal server error" : app.message,
      details: app.details,
      reqId: req.id
    }
  });
}
```

- [ ] **Step 2: Mount as the LAST middleware in `backend/src/app.ts`**

Add after all `app.use(apiRouter)` / route mounts:

```ts
import { errorHandler } from "./middleware/error-handler.js";
// ... after all routes
app.use(errorHandler);
```

- [ ] **Step 3: Update `backend/src/routes/crud.ts` 404 path**

Replace the four `res.status(404).json({ message: "Resource not found" })` calls with:

```ts
res.status(404).json({ error: { code: "not_found", message: "Resource not found", reqId: req.id } });
```

(Keep them inline; they short-circuit before reaching `errorHandler`.)

- [ ] **Step 4: Verify shapes**

Run from `backend/` with server running:
```bash
curl -s 'http://127.0.0.1:4000/api/foods/000000000000000000000000' | python -c "import sys,json; d=json.load(sys.stdin); print(d)"
```
Expected: `{'error': {'code': 'not_found', 'message': 'Resource not found', 'reqId': '<uuid>'}}`

```bash
curl -s 'http://127.0.0.1:4000/api/foods/notanobjectid' | python -c "import sys,json; d=json.load(sys.stdin); print(d)"
```
Expected: `{'error': {'code': 'invalid_id', ...}}`

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{}' 'http://127.0.0.1:4000/api/condition-diet-rules' | python -c "import sys,json; d=json.load(sys.stdin); print(d)"
```
Expected: `{'error': {'code': 'validation_error', 'message': 'Validation failed', 'details': {...}, 'reqId': ...}}`

---

### Task 3: AuditLog model

**Files:**
- Create: `backend/src/models/audit-log.ts`

- [ ] **Step 1: Create the model**

```ts
import mongoose, { Schema, type Model } from "mongoose";

const auditLogSchema = new Schema(
  {
    action: { type: String, required: true, trim: true, index: true },   // "create" | "update" | "delete" | "bulk-verify" | "bulk-delete"
    resource: { type: String, required: true, trim: true, index: true }, // e.g. "foods", "condition-diet-rules"
    ids: [{ type: String }],
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    by: { type: String, trim: true, index: true },
    reqId: { type: String, trim: true, index: true },
    at: { type: Date, default: () => new Date(), index: true }
  },
  {
    timestamps: false,
    collection: "auditLogs",
    capped: { size: 256 * 1024 * 1024, max: 250_000 }   // 256 MB / 250k entries
  }
);

export const AuditLog =
  (mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema)) as Model<any>;
```

- [ ] **Step 2: Type-check**

Run from `backend/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 4: Audit-log middleware

**Files:**
- Create: `backend/src/middleware/audit-log.ts`

- [ ] **Step 1: Create the middleware factory**

```ts
import type { Request, Response, NextFunction } from "express";
import { AuditLog } from "../models/audit-log.js";

type Action = "create" | "update" | "delete" | "bulk-verify" | "bulk-delete";

function methodToAction(method: string, path: string): Action | null {
  if (method === "POST" && !path.includes("/bulk")) return "create";
  if (method === "PUT") return "update";
  if (method === "DELETE" && !path.includes("/bulk")) return "delete";
  if (method === "PATCH" && path.endsWith("/bulk-verify")) return "bulk-verify";
  if (method === "DELETE" && path.endsWith("/bulk")) return "bulk-delete";
  return null;
}

export function auditLog(resource: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const action = methodToAction(req.method, req.originalUrl);
    if (!action) return next();

    const by = (req.headers["x-admin-user"] as string) || "anonymous";
    const reqId = req.id;

    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      const ids: string[] = [];
      if (req.params?.id) ids.push(req.params.id);
      if (Array.isArray((req.body as any)?.ids)) ids.push(...((req.body as any).ids as string[]).slice(0, 500));

      const before = (res.locals as any).__auditBefore;
      const after = (res.locals as any).__auditAfter;

      // Fire-and-forget; never block the response.
      AuditLog.create({ action, resource, ids, before, after, by, reqId }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[audit-log] failed to write", { reqId, err });
      });
    });

    next();
  };
}
```

- [ ] **Step 2: Type-check**

Run from `backend/`: `npx tsc --noEmit`
Expected: exit 0.

(Wired in Task 6.)

---

### Task 5: Extend `createCrudRouter` with sort + bulk options

**Files:**
- Modify: `backend/src/routes/crud.ts`

- [ ] **Step 1: Replace the file with the extended version**

Full content (overwrite):

```ts
import { Router, type Request } from "express";
import type { Model } from "mongoose";

const RANGE_SUFFIXES = { _gte: "$gte", _lte: "$lte" } as const;

function coerceValue(model: Model<any>, fieldName: string, raw: string): unknown {
  const path = model.schema.path(fieldName);
  const instance = path?.instance;
  if (instance === "Number") return Number(raw);
  if (instance === "Boolean") return raw === "true";
  return raw;
}

function buildFilters(model: Model<any>, query: Record<string, unknown>, allowed: Set<string>) {
  const filters: Record<string, unknown> = {};
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    if (key === "q" || key === "page" || key === "limit" || key === "sort") continue;
    const valueStr = String(rawValue);

    let suffixMatch: keyof typeof RANGE_SUFFIXES | null = null;
    for (const suffix of Object.keys(RANGE_SUFFIXES) as (keyof typeof RANGE_SUFFIXES)[]) {
      if (key.endsWith(suffix)) { suffixMatch = suffix; break; }
    }

    if (suffixMatch) {
      const baseField = key.slice(0, -suffixMatch.length);
      if (!allowed.has(baseField)) continue;
      const op = RANGE_SUFFIXES[suffixMatch];
      const coerced = coerceValue(model, baseField, valueStr);
      filters[baseField] = { ...(filters[baseField] as object || {}), [op]: coerced };
      continue;
    }

    if (!allowed.has(key)) continue;
    if (valueStr.includes(",")) {
      const values = valueStr.split(",").map((v) => v.trim()).filter(Boolean).map((v) => coerceValue(model, key, v));
      filters[key] = { $in: values };
    } else {
      filters[key] = coerceValue(model, key, valueStr);
    }
  }
  return filters;
}

function parseSort(req: Request, sortable: Set<string>): Record<string, 1 | -1> {
  const raw = String(req.query.sort ?? "").trim();
  if (!raw) return { createdAt: -1 };
  const desc = raw.startsWith("-");
  const field = desc ? raw.slice(1) : raw;
  if (!sortable.has(field)) return { createdAt: -1 };
  return { [field]: desc ? -1 : 1 };
}

function notFound(req: Request) {
  return { status: 404, code: "not_found", message: "Resource not found", reqId: req.id };
}

export type CrudOptions = {
  sortableFields?: string[];
  bulkActions?: boolean;
};

export function createCrudRouter(
  model: Model<any>,
  searchFields: string[] = [],
  filterableFields: string[] = [],
  options: CrudOptions = {}
) {
  const router = Router();
  const allowed = new Set(filterableFields);
  const sortable = new Set([...(options.sortableFields ?? []), "createdAt"]);

  router.get("/", async (req, res, next) => {
    try {
      const page = Math.max(Number(req.query.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 500);
      const q = String(req.query.q ?? "").trim();

      const filters = buildFilters(model, req.query as Record<string, unknown>, allowed);
      const textFilter = q
        ? { $or: searchFields.map((field) => ({ [field]: { $regex: q, $options: "i" } })) }
        : null;
      const filter = textFilter
        ? (Object.keys(filters).length ? { $and: [filters, textFilter] } : textFilter)
        : filters;

      const sort = parseSort(req, sortable);

      const [items, total] = await Promise.all([
        model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
        model.countDocuments(filter)
      ]);

      res.json({ items, total, page, limit });
    } catch (error) { next(error); }
  });

  if (options.bulkActions) {
    router.patch("/bulk-verify", async (req, res, next) => {
      try {
        const { ids, doctor_verified } = req.body as { ids?: unknown; doctor_verified?: unknown };
        if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string") || ids.length > 500) {
          return next({ status: 400, code: "bad_request", message: "ids must be a string[] of length <= 500" });
        }
        if (typeof doctor_verified !== "boolean") {
          return next({ status: 400, code: "bad_request", message: "doctor_verified must be boolean" });
        }
        if (ids.length === 0) {
          return res.json({ matched: 0, modified: 0 });
        }
        const result = await model.updateMany({ _id: { $in: ids } }, { $set: { doctor_verified } });
        res.json({ matched: (result as any).matchedCount ?? 0, modified: (result as any).modifiedCount ?? 0 });
      } catch (error) { next(error); }
    });

    router.delete("/bulk", async (req, res, next) => {
      try {
        const { ids } = req.body as { ids?: unknown };
        if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string") || ids.length > 500) {
          return next({ status: 400, code: "bad_request", message: "ids must be a string[] of length <= 500" });
        }
        if (ids.length === 0) {
          return res.json({ deleted: 0 });
        }
        const result = await model.deleteMany({ _id: { $in: ids } });
        res.json({ deleted: (result as any).deletedCount ?? 0 });
      } catch (error) { next(error); }
    });
  }

  router.get("/:id", async (req, res, next) => {
    try {
      const item = await model.findById(req.params.id).lean();
      if (!item) return next(notFound(req));
      res.json(item);
    } catch (error) { next(error); }
  });

  router.post("/", async (req, res, next) => {
    try {
      const item = await model.create({ doctor_verified: false, ...req.body });
      res.status(201).json(item);
    } catch (error) { next(error); }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return next(notFound(req));
      res.json(item);
    } catch (error) { next(error); }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const item = await model.findByIdAndDelete(req.params.id);
      if (!item) return next(notFound(req));
      res.status(204).send();
    } catch (error) { next(error); }
  });

  return router;
}
```

Note: bulk routes are mounted BEFORE `/:id` to avoid Express treating "bulk" / "bulk-verify" as an id.

- [ ] **Step 2: Type-check**

Run from `backend/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 6: Wire bulk + sort + audit per route

**Files:**
- Modify: `backend/src/routes/index.ts`

- [ ] **Step 1: Import `auditLog` middleware**

At the top of `backend/src/routes/index.ts`, add:

```ts
import { auditLog } from "../middleware/audit-log.js";
```

- [ ] **Step 2: Replace the foods + 6 reference route mounts**

Find lines that look like `apiRouter.use("/foods", foodsRouter);` through the reference mounts (currently `backend/src/routes/index.ts:83-89`). Replace with:

```ts
apiRouter.use("/foods", auditLog("foods"), foodsRouter);

const referenceSourcesRouter = createCrudRouter(
  ReferenceSource,
  ["sourceKey", "title", "standardCode", "category", "topic", "conditionKey", "dataSource"],
  ["category", "topic", "conditionKey", "year", "dataSource", "doctor_verified"],
  { sortableFields: ["title", "standardCode", "year", "category", "createdAt"], bulkActions: true }
);
apiRouter.use("/reference-sources", auditLog("reference-sources"), referenceSourcesRouter);

const nutrientIntakeRulesRouter = createCrudRouter(
  NutrientIntakeRule,
  ["ruleKey", "standardCode", "nutrientKey", "nutrientLabel", "referenceType", "ageGroup", "gender", "lifeStage", "dataSource"],
  ["standardCode", "nutrientKey", "referenceType", "ageGroup", "ageMin", "ageMax", "gender", "lifeStage", "populationGroup", "dataSource", "doctor_verified"],
  { sortableFields: ["nutrientKey", "ageMin", "value", "createdAt"], bulkActions: true }
);
apiRouter.use("/nutrient-intake-rules", auditLog("nutrient-intake-rules"), nutrientIntakeRulesRouter);

const conditionDietRulesRouter = createCrudRouter(
  ConditionDietRule,
  ["ruleKey", "conditionKey", "conditionLabel", "ruleType", "nutrientKey", "recommendationKo", "dataSource"],
  ["conditionKey", "ruleType", "comparator", "nutrientKey", "dataSource", "doctor_verified"],
  { sortableFields: ["conditionKey", "ruleType", "priority", "createdAt"], bulkActions: true }
);
apiRouter.use("/condition-diet-rules", auditLog("condition-diet-rules"), conditionDietRulesRouter);

const riskAssessmentRulesRouter = createCrudRouter(
  RiskAssessmentRule,
  ["ruleKey", "standardCode", "metricKey", "metricLabel", "populationGroup", "interpretationKo", "dataSource"],
  ["standardCode", "metricKey", "populationGroup", "ageMin", "ageMax", "gender", "dataSource", "doctor_verified"],
  { sortableFields: ["standardCode", "metricKey", "populationGroup", "createdAt"], bulkActions: true }
);
apiRouter.use("/risk-assessment-rules", auditLog("risk-assessment-rules"), riskAssessmentRulesRouter);

const nutritionTerminologyRouter = createCrudRouter(
  NutritionTerminology,
  ["termKey", "category", "chineseTerm", "englishTerm", "koreanTerm", "abbreviation", "dataSource"],
  ["category", "dataSource", "doctor_verified"],
  { sortableFields: ["termKey", "category", "chineseTerm", "createdAt"], bulkActions: true }
);
apiRouter.use("/nutrition-terminology", auditLog("nutrition-terminology"), nutritionTerminologyRouter);

const dataValidationRulesRouter = createCrudRouter(
  DataValidationRule,
  ["ruleKey", "targetCollection", "fieldPath", "ruleType", "messageKo", "dataSource"],
  ["targetCollection", "ruleType", "required", "dataSource", "doctor_verified"],
  { sortableFields: ["targetCollection", "fieldPath", "ruleType", "createdAt"], bulkActions: true }
);
apiRouter.use("/data-validation-rules", auditLog("data-validation-rules"), dataValidationRulesRouter);
```

- [ ] **Step 3: Update foodsRouter constructor** at `backend/src/routes/index.ts:39`:

Replace:
```ts
const foodsRouter = createCrudRouter(Food, ["koreanName", "chineseName", "brand", "category", "foodGroup", "foodSubgroup", "tags"], ["category", "foodGroup", "foodSubgroup", "doctor_verified", "dataSource"]);
```
with:
```ts
const foodsRouter = createCrudRouter(
  Food,
  ["koreanName", "chineseName", "brand", "category", "foodGroup", "foodSubgroup", "tags"],
  ["category", "foodGroup", "foodSubgroup", "doctor_verified", "dataSource"],
  { sortableFields: ["koreanName", "chineseName", "category", "createdAt"], bulkActions: true }
);
```

- [ ] **Step 4: Type-check**

Run from `backend/`: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Curl the bulk endpoint with empty ids**

(Backend running.) Run:
```bash
curl -s -X PATCH -H 'Content-Type: application/json' -d '{"ids":[],"doctor_verified":true}' http://127.0.0.1:4000/api/condition-diet-rules/bulk-verify
```
Expected: `{"matched":0,"modified":0}`

- [ ] **Step 6: Curl bulk-verify on a real id**

Get one id:
```bash
ID=$(curl -s 'http://127.0.0.1:4000/api/condition-diet-rules?limit=1' | python -c "import sys,json; d=json.load(sys.stdin); print(d['items'][0]['_id'])")
curl -s -X PATCH -H 'Content-Type: application/json' -d "{\"ids\":[\"$ID\"],\"doctor_verified\":false}" http://127.0.0.1:4000/api/condition-diet-rules/bulk-verify
```
Expected: `{"matched":1,"modified":1}` (or `0` if it was already false; matched is 1 either way).

---

### Task 7: Rewrite `/api/dashboard`

**Files:**
- Modify: `backend/src/routes/dashboard.ts`

- [ ] **Step 1: Replace the file**

Full content (overwrite):

```ts
import { Router } from "express";
import { Activity } from "../models/activity.js";
import { ConditionDietRule } from "../models/condition-diet-rule.js";
import { DataValidationRule } from "../models/data-validation-rule.js";
import { Food } from "../models/food.js";
import { MealLog } from "../models/meal-log.js";
import { NutrientIntakeRule } from "../models/nutrient-intake-rule.js";
import { NutritionTerminology } from "../models/nutrition-terminology.js";
import { Program } from "../models/program.js";
import { Recipe } from "../models/recipe.js";
import { ReferenceSource } from "../models/reference-source.js";
import { RiskAssessmentRule } from "../models/risk-assessment-rule.js";
import { User } from "../models/user.js";
import { WeightEntry } from "../models/weight-entry.js";

export const dashboardRouter = Router();

const RESOURCES = [
  { key: "foods", model: Food, labelField: "koreanName" },
  { key: "recipes", model: Recipe, labelField: "title" },
  { key: "activities", model: Activity, labelField: "name" },
  { key: "users", model: User, labelField: "name" },
  { key: "mealLogs", model: MealLog, labelField: "foodName" },
  { key: "weightEntries", model: WeightEntry, labelField: "userName" },
  { key: "programs", model: Program, labelField: "title" },
  { key: "referenceSources", model: ReferenceSource, labelField: "title" },
  { key: "nutrientIntakeRules", model: NutrientIntakeRule, labelField: "ruleKey" },
  { key: "conditionDietRules", model: ConditionDietRule, labelField: "ruleKey" },
  { key: "riskAssessmentRules", model: RiskAssessmentRule, labelField: "metricLabel" },
  { key: "nutritionTerminology", model: NutritionTerminology, labelField: "chineseTerm" },
  { key: "dataValidationRules", model: DataValidationRule, labelField: "fieldPath" }
] as const;

dashboardRouter.get("/", async (_req, res, next) => {
  try {
    const totalsArr = await Promise.all(RESOURCES.map((r) => r.model.countDocuments()));
    const unverifiedArr = await Promise.all(RESOURCES.map((r) =>
      r.model.schema.path("doctor_verified") ? r.model.countDocuments({ doctor_verified: false }) : Promise.resolve(0)
    ));

    const totals: Record<string, number> = {};
    const unverified: Record<string, number> = {};
    RESOURCES.forEach((r, i) => {
      totals[r.key] = totalsArr[i];
      unverified[r.key] = unverifiedArr[i];
    });

    const caloriesAgg = await MealLog.aggregate([{ $group: { _id: null, total: { $sum: "$calories" } } }]);
    totals.caloriesLogged = caloriesAgg[0]?.total ?? 0;

    const recentRaw = await Promise.all(
      RESOURCES.map(async (r) => {
        const items = await r.model.find().sort({ createdAt: -1 }).limit(2).lean() as Array<Record<string, unknown>>;
        return items.map((it) => ({
          resource: r.key,
          id: String(it._id),
          label: String(it[r.labelField] ?? it.name ?? it.title ?? "(no label)"),
          createdAt: it.createdAt
        }));
      })
    );
    const recentAdditions = recentRaw.flat()
      .filter((x) => x.createdAt)
      .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
      .slice(0, 12);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const days: { date: string; total: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo); d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ date: iso, total: 0 });
    }
    const trendCounts = await Promise.all(
      RESOURCES.map((r) => r.model.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, c: { $sum: 1 } } }
      ]))
    );
    const dayMap = new Map(days.map((d) => [d.date, d]));
    trendCounts.flat().forEach((row: any) => {
      const d = dayMap.get(row._id);
      if (d) d.total += row.c;
    });

    res.json({ totals, unverified, recentAdditions, trend: { last30Days: days } });
  } catch (error) {
    next(error);
  }
});
```

- [ ] **Step 2: Curl the new shape**

```bash
curl -s 'http://127.0.0.1:4000/api/dashboard' | python -c "import sys,json; d=json.load(sys.stdin); print('totals keys:', sorted(d['totals'].keys())); print('unverified keys:', sorted(d['unverified'].keys())); print('recent count:', len(d['recentAdditions'])); print('trend len:', len(d['trend']['last30Days']))"
```
Expected: 14 totals keys (13 resources + caloriesLogged), 13 unverified keys, recent ≤12, trend len 30.

---

## Frontend Phase

### Task 8: Create `resourceConfigs.ts`

**Files:**
- Create: `web-admin/lib/resourceConfigs.ts`

- [ ] **Step 1: Create the file**

```ts
export type FilterChip = { type: "chip"; key: string; label: string; value: string };
export type FilterSelect = { type: "select"; key: string; label: string; options: { value: string; label: string }[] };
export type FilterRange = { type: "range"; key: string; label: string };
export type FilterDef = FilterChip | FilterSelect | FilterRange;

export type BulkAction = "verify" | "unverify" | "delete";

export type ResourceConfig = {
  endpoint: string;
  filters: FilterDef[];
  bulkActions: BulkAction[];
  sortable: { value: string; label: string }[];
  recentLabelField: string;
};

const conditionOptions = [
  "hypertension","hyperlipidemia","diabetes","adult_obesity","child_obesity","gout_hyperuricemia",
  "ckd","stroke","cancer","elderly","gestational_diabetes","infant_complementary_feeding"
].map((v) => ({ value: v, label: v }));

const referenceTypeOptions = ["RNI","EAR","AI","UL","AMDR","EER","PI","SPL"].map((v) => ({ value: v, label: v }));
const genderOptions = [{ value: "all", label: "all" }, { value: "male", label: "male" }, { value: "female", label: "female" }];

export const resourceConfigs: Record<string, ResourceConfig> = {
  foods: {
    endpoint: "/foods",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "foodGroup", label: "Food group", options: [
        { value: "grain", label: "Grain" }, { value: "vegetable", label: "Vegetable" },
        { value: "fruit", label: "Fruit" }, { value: "meat", label: "Meat" },
        { value: "dairy", label: "Dairy" }, { value: "fat", label: "Fat" }, { value: "beverage", label: "Beverage" }
      ] }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "-createdAt", label: "Oldest" },
      { value: "koreanName", label: "Name (A→Z)" }, { value: "-koreanName", label: "Name (Z→A)" },
      { value: "category", label: "Category" }
    ],
    recentLabelField: "koreanName"
  },
  "reference-sources": {
    endpoint: "/reference-sources",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "category", label: "Category", options: [
        { value: "nutrient_intake", label: "Nutrient intake" },
        { value: "condition_diet", label: "Condition diet" },
        { value: "clinical_diet_guidance", label: "Clinical guidance" },
        { value: "assessment", label: "Assessment" },
        { value: "terminology", label: "Terminology" },
        { value: "data_validation", label: "Data validation" }
      ] },
      { type: "range", key: "year", label: "Year" }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "title", label: "Title (A→Z)" },
      { value: "year", label: "Year (asc)" }, { value: "-year", label: "Year (desc)" }, { value: "standardCode", label: "Code" }
    ],
    recentLabelField: "title"
  },
  "nutrient-intake-rules": {
    endpoint: "/nutrient-intake-rules",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "referenceType", label: "Reference", options: referenceTypeOptions },
      { type: "select", key: "gender", label: "Gender", options: genderOptions },
      { type: "range", key: "ageMin", label: "Age min" }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "nutrientKey", label: "Nutrient" },
      { value: "ageMin", label: "Age (asc)" }, { value: "value", label: "Value (asc)" }
    ],
    recentLabelField: "ruleKey"
  },
  "condition-diet-rules": {
    endpoint: "/condition-diet-rules",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "conditionKey", label: "Condition", options: conditionOptions },
      { type: "select", key: "comparator", label: "Comparator", options: ["eq","lt","lte","gt","gte","range","avoid","prefer"].map((v) => ({ value: v, label: v })) }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "conditionKey", label: "Condition" },
      { value: "priority", label: "Priority" }, { value: "ruleType", label: "Rule type" }
    ],
    recentLabelField: "ruleKey"
  },
  "risk-assessment-rules": {
    endpoint: "/risk-assessment-rules",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "populationGroup", label: "Population", options: [
        { value: "adult", label: "Adult" }, { value: "child_adolescent", label: "Child/adolescent" }, { value: "pregnant", label: "Pregnant" }
      ] },
      { type: "select", key: "gender", label: "Gender", options: genderOptions }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "standardCode", label: "Code" }, { value: "metricKey", label: "Metric" }
    ],
    recentLabelField: "metricLabel"
  },
  "nutrition-terminology": {
    endpoint: "/nutrition-terminology",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "category", label: "Category", options: [
        { value: "nutrition_reference", label: "Reference value" }
      ] }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "termKey", label: "Term key" }, { value: "chineseTerm", label: "Chinese" }
    ],
    recentLabelField: "chineseTerm"
  },
  "data-validation-rules": {
    endpoint: "/data-validation-rules",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "targetCollection", label: "Target", options: [{ value: "foods", label: "foods" }] },
      { type: "select", key: "ruleType", label: "Rule type", options: [
        { value: "serving_basis", label: "serving_basis" }, { value: "non_negative_number", label: "non_negative_number" },
        { value: "source_required", label: "source_required" }, { value: "source_trace", label: "source_trace" }
      ] }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "fieldPath", label: "Field path" }
    ],
    recentLabelField: "fieldPath"
  }
};
```

- [ ] **Step 2: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 9: API helper extensions

**Files:**
- Modify: `web-admin/lib/api.ts`

- [ ] **Step 1: Read the existing file**

Use `Read` on `web-admin/lib/api.ts` to see the current shape.

- [ ] **Step 2: Append helpers**

Append (after existing exports):

```ts
export type ApiError = { code: string; message: string; details?: any; reqId?: string };

export async function bulkVerify(endpoint: string, ids: string[], doctor_verified: boolean) {
  return apiFetch<{ matched: number; modified: number }>(`${endpoint}/bulk-verify`, {
    method: "PATCH",
    body: JSON.stringify({ ids, doctor_verified })
  });
}

export async function bulkDelete(endpoint: string, ids: string[]) {
  return apiFetch<{ deleted: number }>(`${endpoint}/bulk`, {
    method: "DELETE",
    body: JSON.stringify({ ids })
  });
}
```

- [ ] **Step 3: Update `apiFetch` to surface `error.code` if the response shape includes it**

Find the existing error-throwing branch (likely something like `throw new Error(json.message ?? ...)`). Replace its error throw with:

```ts
if (!response.ok) {
  const e = (json && (json as any).error) as ApiError | undefined;
  const err: any = new Error(e?.message ?? `HTTP ${response.status}`);
  err.code = e?.code;
  err.details = e?.details;
  err.reqId = e?.reqId;
  err.status = response.status;
  throw err;
}
```

- [ ] **Step 4: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 10: Chart components

**Files:**
- Create: `web-admin/components/charts/BarMini.tsx`
- Create: `web-admin/components/charts/Sparkline.tsx`
- Create: `web-admin/components/charts/Ring.tsx`

- [ ] **Step 1: Create BarMini**

```tsx
type Item = { label: string; value: number; href?: string };

export default function BarMini({ items, max }: { items: Item[]; max?: number }) {
  const m = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="bar-mini">
      {items.map((it) => {
        const pct = Math.max(2, (it.value / m) * 100);
        const inner = (
          <>
            <span className="bar-mini-label">{it.label}</span>
            <span className="bar-mini-track"><span className="bar-mini-fill" style={{ width: `${pct}%` }} /></span>
            <span className="bar-mini-value">{it.value.toLocaleString()}</span>
          </>
        );
        return (
          <li key={it.label} className="bar-mini-row">
            {it.href ? <a href={it.href}>{inner}</a> : inner}
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 2: Create Sparkline**

```tsx
export default function Sparkline({ points, height = 32, stroke = "var(--accent)" }: { points: number[]; height?: number; stroke?: string }) {
  if (!points.length) return null;
  const w = Math.max(60, points.length * 4);
  const max = Math.max(1, ...points);
  const min = Math.min(0, ...points);
  const range = max - min || 1;
  const path = points.map((v, i) => {
    const x = (i / (points.length - 1 || 1)) * w;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className="sparkline" width={w} height={height} viewBox={`0 0 ${w} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}
```

- [ ] **Step 3: Create Ring**

```tsx
export default function Ring({ value, total, size = 56 }: { value: number; total: number; size?: number }) {
  const safeTotal = Math.max(1, total);
  const pct = Math.min(1, value / safeTotal);
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct);
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${Math.round(pct * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={4}
              strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
      <text x="50%" y="54%" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">{Math.round(pct * 100)}%</text>
    </svg>
  );
}
```

- [ ] **Step 4: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 11: Dashboard subcomponents

**Files:**
- Create: `web-admin/components/dashboard/KpiCard.tsx`
- Create: `web-admin/components/dashboard/VerificationQueueCard.tsx`
- Create: `web-admin/components/dashboard/RecentFeedCard.tsx`

- [ ] **Step 1: KpiCard**

```tsx
import type { ComponentType } from "react";

type IconType = ComponentType<{ size?: number }>;

export default function KpiCard({
  label, value, icon: Icon, sub, accent = false
}: { label: string; value: string | number; icon?: IconType; sub?: string; accent?: boolean }) {
  return (
    <article className={`kpi-card ${accent ? "kpi-accent" : ""}`}>
      {Icon ? <span className="kpi-icon"><Icon size={20} /></span> : null}
      <strong className="kpi-value">{typeof value === "number" ? value.toLocaleString() : value}</strong>
      <span className="kpi-label">{label}</span>
      {sub ? <span className="kpi-sub">{sub}</span> : null}
    </article>
  );
}
```

- [ ] **Step 2: VerificationQueueCard**

```tsx
type Row = { resource: string; label: string; count: number; href: string };

export default function VerificationQueueCard({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => b.count - a.count).filter((r) => r.count > 0);
  return (
    <section className="dashboard-card">
      <h3>Verification queue</h3>
      {sorted.length === 0 ? (
        <p className="dashboard-empty">All clear — nothing pending review.</p>
      ) : (
        <ul className="queue-list">
          {sorted.map((r) => (
            <li key={r.resource}>
              <a href={r.href}>
                <span>{r.label}</span>
                <strong>{r.count.toLocaleString()}</strong>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 3: RecentFeedCard**

```tsx
type Item = { resource: string; id: string; label: string; createdAt: string };

const RESOURCE_HREF: Record<string, string> = {
  foods: "/foods", recipes: "/recipes", activities: "/activities", users: "/users",
  mealLogs: "/meal-logs", weightEntries: "/weight-entries",
  referenceSources: "/reference-sources", nutrientIntakeRules: "/nutrient-intake-rules",
  conditionDietRules: "/condition-diet-rules", riskAssessmentRules: "/risk-assessment-rules",
  nutritionTerminology: "/nutrition-terminology", dataValidationRules: "/data-validation-rules",
  programs: "/programs"
};

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default function RecentFeedCard({ items }: { items: Item[] }) {
  return (
    <section className="dashboard-card">
      <h3>Recent additions</h3>
      <ul className="recent-list">
        {items.map((it) => (
          <li key={`${it.resource}-${it.id}`}>
            <a href={RESOURCE_HREF[it.resource] ?? "/"}>
              <span className="recent-resource">{it.resource}</span>
              <span className="recent-label">{it.label}</span>
              <span className="recent-time">{relativeTime(it.createdAt)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 12: Rebuild dashboard page

**Files:**
- Modify: `web-admin/app/(admin)/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { Activity, Apple, BookOpen, ClipboardCheck, ClipboardList, FileQuestion, LibraryBig, Ruler, Salad, Scale, ShieldCheck, Target, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import VerificationQueueCard from "@/components/dashboard/VerificationQueueCard";
import RecentFeedCard from "@/components/dashboard/RecentFeedCard";
import BarMini from "@/components/charts/BarMini";
import Sparkline from "@/components/charts/Sparkline";
import Ring from "@/components/charts/Ring";
import { apiFetch } from "@/lib/api";

type DashboardData = {
  totals: Record<string, number>;
  unverified: Record<string, number>;
  recentAdditions: Array<{ resource: string; id: string; label: string; createdAt: string }>;
  trend: { last30Days: Array<{ date: string; total: number }> };
};

const FALLBACK: DashboardData = {
  totals: {}, unverified: {}, recentAdditions: [], trend: { last30Days: [] }
};

const RESOURCE_META: Record<string, { label: string; href: string }> = {
  foods: { label: "Foods", href: "/foods" },
  recipes: { label: "Recipes", href: "/recipes" },
  activities: { label: "Activities", href: "/activities" },
  users: { label: "Users", href: "/users" },
  mealLogs: { label: "Meal logs", href: "/meal-logs" },
  weightEntries: { label: "Weight entries", href: "/weight-entries" },
  programs: { label: "Programs", href: "/programs" },
  referenceSources: { label: "Reference sources", href: "/reference-sources" },
  nutrientIntakeRules: { label: "Nutrient intake rules", href: "/nutrient-intake-rules" },
  conditionDietRules: { label: "Condition diet rules", href: "/condition-diet-rules" },
  riskAssessmentRules: { label: "Risk assessment rules", href: "/risk-assessment-rules" },
  nutritionTerminology: { label: "Nutrition terminology", href: "/nutrition-terminology" },
  dataValidationRules: { label: "Data validation rules", href: "/data-validation-rules" }
};

export default async function DashboardPage() {
  const data = await apiFetch<DashboardData>("/dashboard").catch(() => FALLBACK);

  const totalRecords = Object.entries(data.totals).filter(([k]) => k !== "caloriesLogged").reduce((s, [, v]) => s + (v as number), 0);
  const totalUnverified = Object.values(data.unverified).reduce((s, v) => s + (v as number), 0);
  const verified = totalRecords - totalUnverified;

  const barItems = Object.keys(RESOURCE_META).map((k) => ({
    label: RESOURCE_META[k].label,
    value: data.totals[k] ?? 0,
    href: `${RESOURCE_META[k].href}?doctor_verified=false`
  })).sort((a, b) => b.value - a.value);

  const queueRows = Object.keys(RESOURCE_META).map((k) => ({
    resource: k,
    label: RESOURCE_META[k].label,
    count: data.unverified[k] ?? 0,
    href: `${RESOURCE_META[k].href}?doctor_verified=false`
  }));

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Total records, doctor-verification queue, and recent activity across every collection."
      />

      <div className="dashboard-hero">
        <KpiCard label="Total records" value={totalRecords} icon={LibraryBig} accent />
        <KpiCard label="Pending review" value={totalUnverified} icon={ShieldCheck} sub="doctor_verified = false" />
        <article className="dashboard-card kpi-ring-card">
          <Ring value={verified} total={Math.max(1, totalRecords)} size={72} />
          <div>
            <strong>Verified</strong>
            <span>{verified.toLocaleString()} of {totalRecords.toLocaleString()}</span>
          </div>
        </article>
        <article className="dashboard-card">
          <h3>30-day additions</h3>
          <Sparkline points={data.trend.last30Days.map((d) => d.total)} height={56} />
          <p className="dashboard-sub">{data.trend.last30Days.reduce((s, d) => s + d.total, 0).toLocaleString()} new records</p>
        </article>
      </div>

      <section className="dashboard-card">
        <h3>Records by collection</h3>
        <BarMini items={barItems} />
      </section>

      <div className="dashboard-grid">
        <VerificationQueueCard rows={queueRows} />
        <RecentFeedCard items={data.recentAdditions} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build the admin**

Run from `web-admin/`: `npx next build` (or from repo root `npm run build`).
Expected: exit 0.

- [ ] **Step 3: Visual smoke**

Start backend (`npm run dev` in `backend/`) and admin (`npm run dev` in `web-admin/`). Open `http://localhost:3000/`. Confirm:
- 4 hero KPI cards visible (Total / Pending / Ring / Sparkline)
- BarMini chart shows 13 bars sorted descending
- Verification queue + recent feed cards beneath
- No console errors

---

### Task 13: useDashboardStats hook

**Files:**
- Create: `web-admin/lib/useDashboardStats.ts`

- [ ] **Step 1: Create the hook**

```ts
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "./api";

export type DashboardStats = {
  totals: Record<string, number>;
  unverified: Record<string, number>;
};

const EMPTY: DashboardStats = { totals: {}, unverified: {} };

let cached: DashboardStats = EMPTY;
let cachedAt = 0;
const TTL_MS = 60_000;

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(cached);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      if (Date.now() - cachedAt < TTL_MS && cached !== EMPTY) {
        setStats(cached);
        return;
      }
      try {
        const data = await apiFetch<DashboardStats>("/dashboard");
        cached = { totals: data.totals, unverified: data.unverified };
        cachedAt = Date.now();
        if (!controller.signal.aborted) setStats(cached);
      } catch {
        // ignore — keep last known
      }
    }

    load();
    timer = setInterval(load, TTL_MS);

    return () => { controller.abort(); if (timer) clearInterval(timer); };
  }, []);

  return stats;
}
```

- [ ] **Step 2: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 14: Sidebar verification badges

**Files:**
- Modify: `web-admin/components/Sidebar.tsx`
- Modify: `web-admin/lib/navigation.ts`

- [ ] **Step 1: Add a `statKey` to nav items**

Update `navigation.ts` to add an optional `statKey` mapping nav hrefs to dashboard keys:

```ts
import { Activity, Apple, BookOpen, ClipboardCheck, ClipboardList, FileQuestion, LayoutDashboard, LibraryBig, Ruler, Salad, ShieldCheck, Target, Users } from "lucide-react";

export const navItems = [
  { group: null, href: "/", label: "Dashboard", icon: LayoutDashboard, statKey: undefined as string | undefined },
  { group: "Nutrition", href: "/foods", label: "Foods", icon: Apple, statKey: "foods" },
  { group: "Nutrition", href: "/daily-value-profiles", label: "Daily Values", icon: Target, statKey: undefined },
  { group: "Nutrition", href: "/nutrient-intake-rules", label: "Nutrient Intake Rules", icon: ClipboardCheck, statKey: "nutrientIntakeRules" },
  { group: "Nutrition", href: "/nutrition-constraints", label: "Nutrition Constraints", icon: Ruler, statKey: undefined },
  { group: "Nutrition", href: "/condition-diet-rules", label: "Condition Diet Rules", icon: ShieldCheck, statKey: "conditionDietRules" },
  { group: "Nutrition", href: "/nutrition-terminology", label: "Nutrition Terms", icon: BookOpen, statKey: "nutritionTerminology" },
  { group: "Nutrition", href: "/data-validation-rules", label: "Data Validation", icon: Ruler, statKey: "dataValidationRules" },
  { group: "Nutrition", href: "/reference-sources", label: "Reference Sources", icon: LibraryBig, statKey: "referenceSources" },
  { group: "Nutrition", href: "/recipes", label: "Recipes", icon: Salad, statKey: "recipes" },
  { group: "Nutrition", href: "/recipe-ingredients", label: "Recipe Ingredients", icon: Apple, statKey: undefined },
  { group: "Activity", href: "/activities", label: "Activities", icon: Activity, statKey: "activities" },
  { group: "People", href: "/users", label: "Users", icon: Users, statKey: "users" },
  { group: "People", href: "/human-type-qa", label: "Human Type QA", icon: FileQuestion, statKey: undefined },
  { group: "People", href: "/human-type-surveys", label: "Human Type Surveys", icon: ClipboardList, statKey: undefined },
  { group: "People", href: "/risk-assessment-rules", label: "Risk Rules", icon: ShieldCheck, statKey: "riskAssessmentRules" },
  { group: "People", href: "/meal-logs", label: "Meal Logs", icon: BookOpen, statKey: "mealLogs" }
] as const;
```

- [ ] **Step 2: Update Sidebar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { useDashboardStats } from "@/lib/useDashboardStats";

export default function Sidebar() {
  const pathname = usePathname();
  const { unverified } = useDashboardStats();
  let lastGroup: string | null | undefined;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">F</span>
        <div>
          <strong>Foodvisor</strong>
          <small>Admin Panel</small>
        </div>
      </div>

      <nav className="nav">
        {navItems.map(({ group, href, label, icon: Icon, statKey }) => {
          const showGroup = group && group !== lastGroup;
          lastGroup = group;
          const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
          const badge = statKey ? unverified[statKey] : 0;

          return (
            <div key={href}>
              {showGroup ? <div className="nav-group">{group}</div> : null}
              <Link className={active ? "active" : ""} href={href}>
                <Icon size={17} />
                <span>{label}</span>
                {badge > 0 ? <span className="nav-badge" aria-label={`${badge} unverified`}>{badge > 99 ? "99+" : badge}</span> : null}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

(CSS for `.nav-badge` is added in Task 18.)

---

### Task 15: FilterBar component

**Files:**
- Create: `web-admin/components/filters/FilterBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { X } from "lucide-react";
import type { FilterDef } from "@/lib/resourceConfigs";

export type FilterValues = Record<string, string>;

export default function FilterBar({
  filters, values, onChange
}: { filters: FilterDef[]; values: FilterValues; onChange: (next: FilterValues) => void }) {
  if (!filters.length) return null;

  function set(key: string, v: string) {
    const next = { ...values };
    if (!v) delete next[key]; else next[key] = v;
    onChange(next);
  }

  function toggleChip(f: Extract<FilterDef, { type: "chip" }>) {
    set(f.key, values[f.key] === f.value ? "" : f.value);
  }

  return (
    <div className="filter-bar">
      {filters.map((f) => {
        if (f.type === "chip") {
          const active = values[f.key] === f.value;
          return (
            <button key={f.key + f.value} type="button" className={`filter-chip ${active ? "active" : ""}`} onClick={() => toggleChip(f)}>
              {f.label}
            </button>
          );
        }
        if (f.type === "select") {
          return (
            <label key={f.key} className="filter-select">
              <span>{f.label}</span>
              <select value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">All</option>
                {f.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
          );
        }
        if (f.type === "range") {
          return (
            <span key={f.key} className="filter-range">
              <span>{f.label}</span>
              <input type="number" placeholder="min" value={values[`${f.key}_gte`] ?? ""} onChange={(e) => set(`${f.key}_gte`, e.target.value)} />
              <input type="number" placeholder="max" value={values[`${f.key}_lte`] ?? ""} onChange={(e) => set(`${f.key}_lte`, e.target.value)} />
            </span>
          );
        }
        return null;
      })}
      {Object.keys(values).length > 0 ? (
        <button type="button" className="filter-clear" onClick={() => onChange({})}><X size={14} /> Clear</button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 16: BulkActionBar + ResourceManager extensions

**Files:**
- Create: `web-admin/components/BulkActionBar.tsx`
- Modify: `web-admin/components/ResourceManager.tsx`

- [ ] **Step 1: Create BulkActionBar**

```tsx
"use client";

import { Check, ShieldOff, Trash2, X } from "lucide-react";
import type { BulkAction } from "@/lib/resourceConfigs";

export default function BulkActionBar({
  selectedCount, actions, onAction, onClear
}: { selectedCount: number; actions: BulkAction[]; onAction: (a: BulkAction) => void; onClear: () => void }) {
  if (selectedCount === 0) return null;
  return (
    <div className="bulk-action-bar" role="region" aria-label="Bulk actions">
      <span className="bulk-count"><strong>{selectedCount}</strong> selected</span>
      {actions.includes("verify") ? (
        <button className="primary" type="button" onClick={() => onAction("verify")}><Check size={16} /> Mark verified</button>
      ) : null}
      {actions.includes("unverify") ? (
        <button type="button" onClick={() => onAction("unverify")}><ShieldOff size={16} /> Mark unverified</button>
      ) : null}
      {actions.includes("delete") ? (
        <button type="button" className="danger" onClick={() => onAction("delete")}><Trash2 size={16} /> Delete</button>
      ) : null}
      <button type="button" className="bulk-clear" onClick={onClear}><X size={16} /> Clear</button>
    </div>
  );
}
```

- [ ] **Step 2: Read current ResourceManager**

Use `Read` on `web-admin/components/ResourceManager.tsx` to refresh the file contents in context.

- [ ] **Step 3: Update Props and add bulk + filter integration**

Replace the `Props` type and the component body with this version (the extension keeps existing prop names so all 7 admin pages keep working without changes; new props are optional):

```tsx
"use client";

import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import BulkActionBar from "@/components/BulkActionBar";
import FilterBar, { type FilterValues } from "@/components/filters/FilterBar";
import { API_URL, apiFetch, bulkDelete, bulkVerify, ResourceColumn, ResourceField } from "@/lib/api";
import type { BulkAction, FilterDef } from "@/lib/resourceConfigs";

type Props = {
  title: string;
  description: string;
  endpoint: string;
  columns: ResourceColumn[];
  fields: ResourceField[];
  searchPlaceholder: string;
  filters?: FilterDef[];
  bulkActions?: BulkAction[];
  sortable?: { value: string; label: string }[];
};

type ApiList = {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
};

function getValue(item: Record<string, unknown>, key: string) {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) return (value as Record<string, unknown>)[part];
    return "";
  }, item);
}

function setNested(target: Record<string, unknown>, key: string, value: unknown) {
  const parts = key.split(".");
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  });
  cursor[parts[parts.length - 1]] = value;
}

function formatValue(value: unknown, column: ResourceColumn, onImageClick?: (src: string) => void) {
  if (column.kind === "boolean") {
    return value ? <span className="badge ok"><Check size={14} /> true</span> : <span className="badge"><X size={14} /> false</span>;
  }
  if (column.kind === "date" && value) return new Date(String(value)).toLocaleDateString();
  if (column.kind === "image") {
    if (!value) return <span className="no-image">No image</span>;
    const src = String(value);
    const apiOrigin = API_URL.replace(/\/api\/?$/, "");
    const resolvedSrc = src.startsWith("/") ? `${apiOrigin}${src}` : src;
    return <button className="image-button" onClick={() => onImageClick?.(resolvedSrc)} type="button" aria-label="Open image preview"><img className="table-image" src={resolvedSrc} alt="" /></button>;
  }
  if (Array.isArray(value)) {
    const text = value.join(", "); return text.length > 48 ? `${text.slice(0, 48)}...` : text;
  }
  if (typeof value === "object" && value !== null) {
    const text = JSON.stringify(value); return text.length > 48 ? `${text.slice(0, 48)}...` : text;
  }
  const text = String(value ?? ""); return text.length > 64 ? `${text.slice(0, 64)}...` : text;
}

export function ResourceManager({ title, description, endpoint, columns, fields, searchPlaceholder, filters = [], bulkActions = [], sortable = [] }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sort, setSort] = useState("");
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ action: BulkAction } | null>(null);

  const blankForm = useMemo(() => fields.reduce<Record<string, unknown>>((acc, field) => {
    setNested(acc, field.name, field.type === "boolean" ? false : "");
    return acc;
  }, {}), [fields]);

  async function load(nextPage = page) {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: String(limit) });
      if (query) params.set("q", query);
      if (sort) params.set("sort", sort);
      Object.entries(filterValues).forEach(([k, v]) => { if (v) params.set(k, v); });
      const data = await apiFetch<ApiList>(`${endpoint}?${params.toString()}`);
      setItems(data.items); setTotal(data.total); setPage(data.page || nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(1); /* eslint-disable-line */ }, [endpoint, limit, sort, JSON.stringify(filterValues)]);

  function toggleId(id: string) {
    const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next);
  }
  function toggleAllOnPage() {
    const pageIds = items.map((i) => String(i._id));
    const next = new Set(selected);
    const allSelected = pageIds.every((id) => next.has(id));
    if (allSelected) pageIds.forEach((id) => next.delete(id));
    else pageIds.forEach((id) => next.add(id));
    setSelected(next);
  }

  async function runBulk(action: BulkAction) {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    try {
      if (action === "delete") {
        await bulkDelete(endpoint, ids);
      } else {
        await bulkVerify(endpoint, ids, action === "verify");
      }
      setSelected(new Set()); setConfirmAction(null); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk action failed");
    }
  }

  function normalizePayload(formData: FormData) {
    const payload: Record<string, unknown> = {};
    fields.forEach((field) => {
      const raw = formData.get(field.name);
      let value: unknown = raw;
      if (field.type === "number") value = Number(raw || 0);
      if (field.type === "boolean") value = raw === "true";
      if (field.type === "tags") value = String(raw ?? "").split(",").map((t) => t.trim()).filter(Boolean);
      if (field.type === "textarea") {
        const text = String(raw ?? "").trim();
        if (text.startsWith("[") || text.startsWith("{")) { try { value = JSON.parse(text); } catch { value = text; } }
      }
      if (field.type === "date" && raw) value = new Date(String(raw)).toISOString();
      setNested(payload, field.name, value);
    });
    return payload;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = normalizePayload(new FormData(event.currentTarget));
    const id = editing?._id;
    await apiFetch(id ? `${endpoint}/${id}` : endpoint, { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    setEditing(null); await load();
  }

  async function remove(id: unknown) { await apiFetch(`${endpoint}/${id}`, { method: "DELETE" }); await load(); }

  const formSource = editing ?? blankForm;
  const pages = Math.max(Math.ceil(total / limit), 1);
  const start = total ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);
  const pageIds = items.map((i) => String(i._id));
  const pageAllSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  return (
    <section className="page">
      <PageHeader
        title={title} subtitle={description}
        action={<button className="primary" onClick={() => setEditing(blankForm)} type="button"><Plus size={16} /> Add</button>}
      />

      <section className="panel">
        <div className="toolbar">
          <label className="search-field">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(1)} placeholder={searchPlaceholder} />
          </label>
          <button onClick={() => load(1)} type="button">Search</button>
          {sortable.length ? (
            <select className="sort-select" value={sort} onChange={(e) => { setPage(1); setSort(e.target.value); }}>
              <option value="">Default order</option>
              {sortable.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          ) : null}
          <select className="limit-select" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
            <option value={25}>25</option><option value={50}>50</option><option value={100}>100</option><option value={250}>250</option><option value={500}>500</option>
          </select>
          <span>{loading ? "Loading..." : `${start}-${end} of ${total}`}</span>
        </div>

        <FilterBar filters={filters} values={filterValues} onChange={(v) => { setPage(1); setFilterValues(v); }} />

        {error && <p className="error">{error}</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {bulkActions.length ? (
                  <th className="select-col"><input type="checkbox" checked={pageAllSelected} onChange={toggleAllOnPage} aria-label="Select all on this page" /></th>
                ) : null}
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const id = String(item._id);
                return (
                  <tr key={id} className={selected.has(id) ? "row-selected" : ""}>
                    {bulkActions.length ? (
                      <td className="select-col"><input type="checkbox" checked={selected.has(id)} onChange={() => toggleId(id)} aria-label="Select row" /></td>
                    ) : null}
                    {columns.map((c) => <td key={c.key}>{formatValue(getValue(item, c.key), c, setPreviewImage)}</td>)}
                    <td className="row-actions">
                      <button onClick={() => setEditing(item)} type="button" aria-label="Edit record"><Pencil size={15} /> Edit</button>
                      <button onClick={() => remove(item._id)} type="button" aria-label="Delete"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
              {!loading && items.length === 0 ? (
                <tr><td className="empty-row" colSpan={(bulkActions.length ? 1 : 0) + columns.length + 1}>No records match the current filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button disabled={page <= 1 || loading} onClick={() => load(1)} type="button">First</button>
          <button disabled={page <= 1 || loading} onClick={() => load(page - 1)} type="button">Previous</button>
          <span>Page {page} / {pages}</span>
          <button disabled={page >= pages || loading} onClick={() => load(page + 1)} type="button">Next</button>
          <button disabled={page >= pages || loading} onClick={() => load(pages)} type="button">Last</button>
        </div>
      </section>

      <BulkActionBar
        selectedCount={selected.size} actions={bulkActions}
        onAction={(a) => { if (a === "delete" || a === "unverify") setConfirmAction({ action: a }); else runBulk(a); }}
        onClear={() => setSelected(new Set())}
      />

      {previewImage && (
        <button className="image-preview-backdrop" onClick={() => setPreviewImage("")} type="button" aria-label="Close image preview">
          <img className="image-preview" src={previewImage} alt="" />
        </button>
      )}

      {confirmAction && (
        <Modal onClose={() => setConfirmAction(null)}>
          <div className="confirm">
            <h2>Confirm {confirmAction.action}</h2>
            <p>{confirmAction.action === "delete"
              ? `Delete ${selected.size} record${selected.size === 1 ? "" : "s"}? This cannot be undone.`
              : `Mark ${selected.size} record${selected.size === 1 ? "" : "s"} as unverified?`}</p>
            <div className="editor-actions">
              <button type="button" onClick={() => setConfirmAction(null)}><X size={16} /> Cancel</button>
              <button className={confirmAction.action === "delete" ? "danger" : "primary"} type="button" onClick={() => runBulk(confirmAction.action)}>
                <Check size={16} /> Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <form className="editor" onSubmit={submit}>
            <div className="modal-head">
              <h2>{editing._id ? `Edit ${title}` : `Add ${title}`}</h2>
              <button type="button" onClick={() => setEditing(null)}><X size={16} /> Close</button>
            </div>
            <div className="editor-grid">
              {fields.map((field) => {
                const value = getValue(formSource, field.name);
                const isSourceField = field.name === "chineseName" || field.name === "cautions" || field.name === "sourceNote";
                const isLongField = field.type === "textarea" || field.name === "benefits" || field.name === "dietUseNote";
                return (
                  <label key={field.name} className={`${isSourceField ? "source-field" : ""} ${isLongField ? "wide-field" : ""}`.trim()}>
                    <span>{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea name={field.name} defaultValue={typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value ?? "")} required={field.required} />
                    ) : field.type === "select" ? (
                      <select name={field.name} defaultValue={String(value ?? "")} required={field.required}>
                        <option value="">Select</option>
                        {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === "boolean" ? (
                      <select name={field.name} defaultValue={String(Boolean(value))}>
                        <option value="false">false</option><option value="true">true</option>
                      </select>
                    ) : (
                      <input name={field.name} type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} step={field.type === "number" ? "any" : undefined}
                             defaultValue={Array.isArray(value) ? value.join(", ") : String(value ?? "")} required={field.required} />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="editor-actions">
              <button type="button" onClick={() => setEditing(null)}><X size={16} /> Cancel</button>
              <button className="primary" type="submit"><Check size={16} /> Save</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 17: Wire each admin page to its config

**Files:**
- Modify each of:
  - `web-admin/app/(admin)/foods/page.tsx`
  - `web-admin/app/(admin)/reference-sources/page.tsx`
  - `web-admin/app/(admin)/nutrient-intake-rules/page.tsx`
  - `web-admin/app/(admin)/condition-diet-rules/page.tsx`
  - `web-admin/app/(admin)/risk-assessment-rules/page.tsx`
  - `web-admin/app/(admin)/nutrition-terminology/page.tsx`
  - `web-admin/app/(admin)/data-validation-rules/page.tsx`

- [ ] **Step 1: For each non-foods page, add the three new props**

Open each page (e.g. `condition-diet-rules/page.tsx`). Where it currently renders `<ResourceManager ... />`, add three props from the matching `resourceConfigs[<key>]`:

```tsx
import { resourceConfigs } from "@/lib/resourceConfigs";
const cfg = resourceConfigs["condition-diet-rules"];

// inside JSX:
<ResourceManager
  /* existing props */
  filters={cfg.filters}
  bulkActions={cfg.bulkActions}
  sortable={cfg.sortable}
/>
```

Do this for all 6 reference pages.

- [ ] **Step 2: Foods page (custom FoodsManager) — add at minimum filters + sortable**

Foods uses `FoodsManager` not the generic `ResourceManager`. Read `web-admin/components/FoodsManager.tsx`. If it already has its own filter UX, defer wiring there to a future cycle and just ensure the page does not regress. If the FoodsManager just calls `ResourceManager`, pass the same three props.

- [ ] **Step 3: Type-check**

Run from `web-admin/`: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Smoke**

Visit `http://localhost:3000/condition-diet-rules`:
- Filter chip "Unverified only" visible at top of panel
- Condition select dropdown visible
- Sort select with `Newest / Condition / Priority / Rule type` visible
- Click "Unverified only" — URL adds `?doctor_verified=false`, list refreshes
- Pick "Condition: ckd" — list shows 5 items
- Select 2 rows via checkboxes — bottom action bar slides up
- Click "Mark verified" — list refreshes, count drops, sidebar badge for "Condition Diet Rules" decreases

---

### Task 18: Visual polish — tokens, density, sticky header, badges, status pills

**Files:**
- Modify: `web-admin/app/globals.css`

- [ ] **Step 1: Read current `globals.css`** to refresh context.

Use `Read` on `web-admin/app/globals.css`.

- [ ] **Step 2: At the top of `:root`, add type & density tokens**

Find the `:root { ... }` block (lines 1-16). Append these lines BEFORE the closing brace:

```css
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 22px;
  --row-pad: 12px 16px;
  --motion: 160ms ease-out;
  --success: #16a34a;
  --info: #2563eb;
  --danger-strong: #b91c1c;
```

- [ ] **Step 3: Density rule**

After the `:root` block, add:

```css
body[data-density="compact"] {
  --row-pad: 8px 12px;
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

- [ ] **Step 4: Update existing table cell padding to use the token**

Search globals.css for `.data-table td` and `.data-table th`. Wherever they have a `padding:` line, replace the value with `var(--row-pad)`.

- [ ] **Step 5: Append new component styles at the END of the file**

```css
/* Sticky table header */
.data-table thead th {
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 1;
  box-shadow: inset 0 -1px 0 var(--line);
}
.select-col { width: 32px; text-align: center; }
.row-selected { background: var(--accent-soft); }
.empty-row { padding: 28px; text-align: center; color: var(--muted); }

/* Filter bar */
.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 8px 0 12px; border-bottom: 1px solid var(--line); margin-bottom: 12px; }
.filter-chip { border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; font-size: var(--text-sm); background: var(--surface); cursor: pointer; }
.filter-chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.filter-select { display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-sm); }
.filter-select select { border: 1px solid var(--line); border-radius: 6px; padding: 4px 8px; background: var(--surface); }
.filter-range { display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-sm); }
.filter-range input { width: 64px; border: 1px solid var(--line); border-radius: 6px; padding: 4px 6px; }
.filter-clear { background: transparent; border: none; color: var(--muted); font-size: var(--text-sm); cursor: pointer; display: inline-flex; gap: 4px; }
.filter-clear:hover { color: var(--danger); }

/* Bulk action bar */
.bulk-action-bar {
  position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
  display: flex; gap: 8px; align-items: center;
  padding: 10px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
  z-index: 50;
  animation: bulk-slide var(--motion);
}
@keyframes bulk-slide { from { transform: translate(-50%, 16px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
.bulk-count { font-size: var(--text-sm); color: var(--muted); }
.bulk-clear { background: transparent; border: none; color: var(--muted); }
button.danger { background: var(--danger-soft); border-color: var(--danger); color: var(--danger-strong); }
button.danger:hover { background: var(--danger); color: #fff; }

/* Sidebar badges */
.nav-badge {
  margin-left: auto;
  min-width: 20px; height: 20px; padding: 0 6px;
  border-radius: 999px; background: var(--danger); color: #fff;
  font-size: var(--text-xs); font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
}

/* Status pill (verified/unverified) */
.badge.ok { color: var(--success); }
.badge.warn { color: var(--warning); }

/* Dashboard layout */
.dashboard-hero { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
.dashboard-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; }
.dashboard-card h3 { margin: 0 0 12px; font-size: var(--text-lg); }
.dashboard-empty { color: var(--muted); font-size: var(--text-sm); }
.dashboard-sub { color: var(--muted); font-size: var(--text-sm); margin: 6px 0 0; }
.kpi-card { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); }
.kpi-card.kpi-accent { background: var(--accent-soft); border-color: transparent; }
.kpi-icon { color: var(--accent); }
.kpi-value { font-size: var(--text-2xl); font-weight: 800; }
.kpi-label { color: var(--muted); font-size: var(--text-sm); }
.kpi-sub { color: var(--muted); font-size: var(--text-xs); }
.kpi-ring-card { display: flex; align-items: center; gap: 12px; }
.kpi-ring-card strong { display: block; font-size: var(--text-base); }
.kpi-ring-card span { color: var(--muted); font-size: var(--text-sm); }

/* Bar mini chart */
.bar-mini { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.bar-mini-row a, .bar-mini-row { display: grid; grid-template-columns: 200px 1fr 80px; gap: 12px; align-items: center; font-size: var(--text-sm); }
.bar-mini-row a:hover .bar-mini-fill { background: var(--accent-strong); }
.bar-mini-track { height: 8px; background: var(--surface-soft); border-radius: 4px; overflow: hidden; }
.bar-mini-fill { display: block; height: 100%; background: var(--accent); transition: background var(--motion); }
.bar-mini-value { text-align: right; color: var(--muted); }

/* Sparkline + ring inherit currentColor sized by props */

/* Verification queue + recent feed */
.queue-list, .recent-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.queue-list a, .recent-list a { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; font-size: var(--text-sm); }
.queue-list a:hover, .recent-list a:hover { background: var(--surface-soft); }
.queue-list strong { margin-left: auto; color: var(--danger); }
.recent-resource { font-size: var(--text-xs); color: var(--muted); min-width: 120px; }
.recent-label { flex: 1; }
.recent-time { color: var(--muted); font-size: var(--text-xs); }

/* Confirm modal */
.confirm { padding: 16px; }
.confirm h2 { margin: 0 0 8px; }
.confirm p { color: var(--muted); margin: 0 0 16px; }
```

- [ ] **Step 6: Add density toggle to TopBar**

Read `web-admin/components/TopBar.tsx`. Add a toggle button that flips `body[data-density]` between `comfy` and `compact`, persisted in localStorage as `admin.density`. Replace the file's component with a version that includes:

```tsx
"use client";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [density, setDensity] = useState<"comfy" | "compact">("comfy");

  useEffect(() => {
    const saved = (localStorage.getItem("admin.density") as "comfy" | "compact") || "comfy";
    setDensity(saved);
    document.body.dataset.density = saved;
  }, []);

  function toggle() {
    const next = density === "comfy" ? "compact" : "comfy";
    setDensity(next);
    document.body.dataset.density = next;
    localStorage.setItem("admin.density", next);
  }

  return (
    <header className="topbar">
      <div className="topbar-spacer" />
      <button type="button" className="density-toggle" onClick={toggle} aria-label="Toggle density">
        {density === "comfy" ? "Comfy" : "Compact"}
      </button>
    </header>
  );
}
```

(If the existing TopBar has more elements, preserve them and add the toggle button.)

Add to globals.css:
```css
.topbar { display: flex; align-items: center; gap: 12px; padding: 10px 24px; border-bottom: 1px solid var(--line); background: var(--surface); }
.topbar-spacer { flex: 1; }
.density-toggle { font-size: var(--text-sm); }
```

- [ ] **Step 7: Type-check + build**

Run from `web-admin/`: `npx tsc --noEmit && npx next build`
Expected: both exit 0.

---

### Task 19: End-to-end verification

**Files:**
- No code changes.

- [ ] **Step 1: Repo-root build**

Run from repo root: `npm run build`
Expected: exit 0; admin lists all admin pages.

- [ ] **Step 2: Importer regression**

Run from `backend/`: `npm run import:reference-guidelines`
Expected: same row counts as Sub-project A's verification (`referenceSources 27, nutrientIntakeRules 1181, conditionDietRules 42, riskAssessmentRules 5, nutritionTerminology 54, dataValidationRules 8`).

- [ ] **Step 3: Backend curl pass**

```bash
# New error shape
curl -s 'http://127.0.0.1:4000/api/foods/notanobjectid' | python -c "import sys,json; d=json.load(sys.stdin); print(d['error']['code']); assert d['error']['code']=='invalid_id'"

# Sort
curl -s 'http://127.0.0.1:4000/api/condition-diet-rules?sort=conditionKey&limit=3' | python -c "import sys,json; d=json.load(sys.stdin); print([i['conditionKey'] for i in d['items']])"
# Expected: alphabetically ascending

# Bulk verify with empty ids
curl -s -X PATCH -H 'Content-Type: application/json' -d '{\"ids\":[],\"doctor_verified\":true}' 'http://127.0.0.1:4000/api/foods/bulk-verify' | python -c "import sys,json; d=json.load(sys.stdin); assert d=={'matched':0,'modified':0}; print('ok')"

# Dashboard new shape
curl -s 'http://127.0.0.1:4000/api/dashboard' | python -c "import sys,json; d=json.load(sys.stdin); assert 'totals' in d and 'unverified' in d and 'recentAdditions' in d and 'trend' in d; print('totals:', len(d['totals']), 'unverified:', len(d['unverified']), 'recent:', len(d['recentAdditions']), 'trend:', len(d['trend']['last30Days']))"

# Audit log written
curl -s -X PATCH -H 'Content-Type: application/json' -H 'x-admin-user: dev' -d '{"ids":[],"doctor_verified":true}' 'http://127.0.0.1:4000/api/condition-diet-rules/bulk-verify' >/dev/null
# Then via mongosh or another endpoint, observe AuditLog has at least one row with action="bulk-verify".
```

- [ ] **Step 4: Frontend smoke**

Open `http://localhost:3000/`:
- 4 hero KPI cards render with non-zero numbers
- BarMini shows 13 bars descending
- Verification queue card lists at least one resource
- Recent additions card shows up to 12 rows

Open `http://localhost:3000/condition-diet-rules`:
- Filter chip "Unverified only" present; clicking it adds `?doctor_verified=false`
- Sort dropdown present
- Checkbox column present, row checkboxes work
- Selecting 2 rows reveals the bulk action bar
- Clicking "Mark verified" (or "Mark unverified" for already verified rows) refreshes list and changes the sidebar badge

Toggle density in the TopBar — table rows visibly tighten; reload page — density persists.

- [ ] **Step 5: Final repo-root build to confirm clean state**

Run from repo root: `npm run build`
Expected: exit 0.

---

## Self-Review Notes

- Spec coverage:
  - B1 dashboard endpoint → Task 7
  - B2 bulk endpoints → Task 5 + Task 6
  - B3 sort → Task 5 + Task 6
  - B4 error shape → Task 2
  - B5 audit log → Tasks 3 + 4 + 6
  - B6 request id + structured logging → Task 1
  - Frontend dashboard rebuild → Tasks 8–12
  - ResourceManager bulk + filters + sort → Tasks 8–9, 15–17
  - Sidebar badges → Tasks 13–14
  - Visual polish → Task 18
- Type consistency: `bulkVerify` / `bulkDelete` helpers match server routes; `FilterValues = Record<string,string>` everywhere; `BulkAction = "verify" | "unverify" | "delete"` everywhere; `useDashboardStats` returns `{ totals, unverified }` matching `Sidebar` and dashboard usage.
- No placeholders.
- Bulk routes mounted before `/:id` (Task 5) — Express otherwise treats `bulk-verify` as an id.
- Audit middleware fire-and-forget; never blocks response (Task 4).

## Acceptance

Ships when Task 19 completes successfully — repo-root `npm run build` exits 0, importer regression passes, all curl checks return expected shapes, and the dashboard / filter / bulk / badge / density behaviors are visibly working in the browser.
