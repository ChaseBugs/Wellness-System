# Reference Data Layer — Design

**Date:** 2026-05-08
**Sub-project:** A (of two — Sub-project B is admin polish + dashboard, deferred)
**Status:** Approved, ready for implementation plan

## Problem & Goal

The `reference/` folder contains 46+ Chinese national nutrition standard PDFs (WST series) and disease food guidelines. Six MongoDB collections already exist with schemas and admin pages wired (`referenceSources`, `nutrientIntakeRules`, `conditionDietRules`, `riskAssessmentRules`, `nutritionTerminology`, `dataValidationRules`) but they are empty. Sub-project A imports curated reference data into these collections and extends the CRUD API with typed filters so a future admin/dashboard layer (Sub-project B) and recommendation engine can query by condition, age, gender, nutrient, etc.

## Non-goals

- Admin UI polish, dashboard, charts, command palette, bulk-verify — Sub-project B.
- Filter UI controls inside admin pages — Sub-project B.
- Wiring `conditionDietRules` into a recommendation/scoring engine — future project.
- Wiring `dataValidationRules` to actually validate Food records at write time — future project.
- OCR / runtime PDF parsing — all data is hand-curated TS modules.
- A separate mobile app or consumer frontend — none exists in repo.
- A translation review workflow UI — the `doctor_verified` flag is the queue, but the UI is Sub-project B.

## Architecture & file layout

```
backend/src/data/reference/                    # checked-in curated source data (TS modules)
  reference-sources.ts
  wst578-nutrient-intake-rules.ts              # WST578.1–578.5 DRI tables
  wst-risk-assessment-rules.ts                 # WST428/586/611/612/801/423 thresholds
  condition-diet-rules.ts                      # 6 食养指南 + 9 WST 膳食指导 → curated rules
  wst476-nutrition-terminology.ts
  wst464-data-validation-rules.ts

backend/src/scripts/
  import-reference-sources.ts
  import-nutrient-intake-rules.ts
  import-risk-assessment-rules.ts
  import-condition-diet-rules.ts
  import-nutrition-terminology.ts
  import-data-validation-rules.ts
  import-reference-all.ts                      # orchestrator
```

Existing convention `backend/src/scripts/import-*.ts` is preserved (matches all current `import:*` npm entries). `backend/scripts/` stays for build-time tooling like `clean-dist.mjs`.

Each `import-*.ts`:
- Connects via the existing `connectDatabase()` helper (same pattern as `migrate.ts`).
- Reads its data module from `backend/src/data/reference/`.
- Calls `Model.bulkWrite()` with `updateOne({ filter: { <uniqueKey>: x }, update: { $set: row }, upsert: true })`. **Idempotent re-runs.**
- Logs a one-line summary: `[import:nutrient-intake-rules] upserted=600 inserted=600 updated=0`.
- Exits non-zero on bulkWrite error.
- Does **not** run on server startup. Explicit npm commands only.

Data modules export typed arrays:

```ts
export const nutrientIntakeRules: NutrientIntakeRuleSeed[] = [ ... ];
```

Where `NutrientIntakeRuleSeed` is a local TS interface mirroring the Mongoose schema's required fields. Editing in IDE has full type safety.

## Per-collection scope

| Collection | Source standards | Approx rows | Key fields populated |
| --- | --- | --- | --- |
| `referenceSources` | filesystem walk of `reference/` + manual metadata | ~46 | sourceKey, title, standardCode, year, category, topic, conditionKey, filePath (relative to repo root), language=`zh-CN`, dataSource |
| `nutrientIntakeRules` | WST578.1–578.5 (DRI tables, 2017–2018) | ~600 | ~30 nutrients × ~10 ageGroups × 2 genders × 2–3 referenceTypes (RNI / AI / EAR / UL) |
| `riskAssessmentRules` | WST428, WST586, WST611, WST612, WST801, WST423 | ~80 | adult BMI cut-offs (4), child overweight/obesity by age+gender (~30), child waist (~12), child height eval (~12), pregnancy weight gain by pre-BMI (~5), child <7 growth (~20) |
| `conditionDietRules` | 6 食养指南 (2023/2024) + WST429/430/556/557/558/559/560/601/678 | ~120 | 6 main conditions × ~15–20 curated rules each (avoid/prefer foods, sodium/sugar/purine targets, caution tags, recommendationKo+Zh) |
| `nutritionTerminology` | WST476-2015, WST464-2015 | ~80 | top nutrient/food terms with chineseTerm, englishTerm, koreanTerm (NK), abbreviation, unit, definitionKo, aliases |
| `dataValidationRules` | WST464-2015 | ~30 | targetCollection=`foods`, fieldPath, ruleType (required/unit/range), expectedUnit, min/max, messageKo |

### Conditions covered in `conditionDietRules`

Two tiers, totalling ~120 rows:

- **Primary (6 conditions × ~15 rules each ≈ 90 rows)** — full curation: `hypertension`, `hyperlipidemia`, `diabetes_adult`, `obesity_adult`, `obesity_child`, `hyperuricemia_gout`. Drawn from the 2023/2024 食养指南 series.
- **Secondary (6 conditions × ~5 rules each ≈ 30 rows)** — lighter curation, key avoid/prefer rules only: `ckd`, `stroke`, `cancer`, `elderly`, `gestational_diabetes`, `infant_complementary_feeding`. Drawn from the WST 膳食指导 series.

Each rule is one of: prefer-food (foodTagsPrefer), avoid-food (foodTagsAvoid), nutrient target (comparator + targetValue/Min/Max + unit), caution tag.

### Provenance on every seeded row

- `dataSource` — short tag, e.g. `Chinese Nutrition Standard Compilation 20231205 - WST578.1-2017`.
- `sourceNote` — one-sentence Korean note for admin reviewers.
- `sourceRefs` — array containing the `sourceKey` from `referenceSources` (string foreign key) so admins can filter "show me all rules from WST429".
- `doctor_verified: false` — every seeded row enters the review queue.

### Korean text policy

- `koreanName`, `koreanTerm`, `recommendationKo`, `messageKo`, `interpretationKo`, `sourceNote`, etc. use **North Korean Korean (Joseon language)** orthography and vocabulary.
- For nutrient terms where standard Korean and North Korean differ (e.g. protein vs protein, calcium vs Calcium), use the NK form. Where they don't differ, the term is identical.
- All seeded rows are `doctor_verified: false` so reviewers can validate translations later.

### Curation honesty

DRI tables (WST578) and threshold tables (WST428/586/etc.) are well-defined published reference values transcribed verbatim. Condition diet rules are curated *interpretations* of guideline prose — `doctor_verified=false` exists specifically so a clinician can validate before they drive recommendation logic in a future project.

### Excluded from `referenceSources`

- 问answer (Q&A companion) PDFs — narrative supplements, no structured rows.
- `封面前言和目录.docx` — table of contents.
- `WST426.1-2013` / `WST426.2-2013` (dietary survey methodology) — methodology, not lookup data.
- `营养健康食堂/餐厅/学校建设指南` — facility certification, not nutrition data.
- `WST424-2013` (anthropometry methods) — measurement procedures, not thresholds.

## CRUD filter API extension

Today `createCrudRouter(model, searchFields)` supports only `?q=text&page=&limit=`. Extend the signature:

```ts
createCrudRouter(model, searchFields, filterableFields?: string[])
```

### Querystring contract

- Any querystring key that appears in `filterableFields` becomes a Mongo filter. Anything else is ignored (prevents arbitrary query injection).
- Values are exact-match for strings/numbers/booleans. Comma-separated values become `$in`. Example: `?conditionKey=hypertension&gender=female,all`.
- Range hooks for numeric fields use `_gte` / `_lte` suffix: `?ageMin_gte=19&ageMax_lte=50`. The base field name (without suffix) must be in `filterableFields`. Only `_gte` and `_lte` supported — no other operators.
- Booleans accept `true` / `false` strings, parsed to `Boolean`.
- Numbers parsed via `Number()` if the schema field is numeric (introspected via `model.schema.path(fieldName).instance`).
- The existing `?q=` text search composes with filters via `$and`.
- `?page=` and `?limit=` continue to work as before.

### Per-route whitelist

| Route | filterableFields |
| --- | --- |
| `/foods` | `category, foodGroup, foodSubgroup, doctor_verified, dataSource` |
| `/nutrient-intake-rules` | `standardCode, nutrientKey, referenceType, ageGroup, ageMin, ageMax, gender, lifeStage, populationGroup, dataSource, doctor_verified` |
| `/condition-diet-rules` | `conditionKey, ruleType, comparator, nutrientKey, dataSource, doctor_verified` |
| `/risk-assessment-rules` | `standardCode, metricKey, populationGroup, ageMin, ageMax, gender, dataSource, doctor_verified` |
| `/nutrition-terminology` | `category, dataSource, doctor_verified` |
| `/data-validation-rules` | `targetCollection, ruleType, required, dataSource, doctor_verified` |
| `/reference-sources` | `category, topic, conditionKey, year, dataSource, doctor_verified` |

Existing routes (recipes, activities, users, etc.) get no filter whitelist in this cycle — pass `undefined` (no behavior change).

### Why this design

Keeps the generic-router API tiny and predictable. No regex, no operators beyond exact-match / `_gte` / `_lte`. If anyone needs richer querying we add a custom route, not a query DSL.

## NPM scripts & orchestration

Add to `backend/package.json`:

```json
"import:reference-sources":      "tsx src/scripts/import-reference-sources.ts",
"import:nutrient-intake-rules":  "tsx src/scripts/import-nutrient-intake-rules.ts",
"import:risk-assessment-rules":  "tsx src/scripts/import-risk-assessment-rules.ts",
"import:condition-diet-rules":   "tsx src/scripts/import-condition-diet-rules.ts",
"import:nutrition-terminology":  "tsx src/scripts/import-nutrition-terminology.ts",
"import:data-validation-rules":  "tsx src/scripts/import-data-validation-rules.ts",
"import:reference-all":          "tsx src/scripts/import-reference-all.ts"
```

`import-reference-all.ts` runs the six in this order, sequentially, for predictable logs:

1. `referenceSources` first — other scripts cross-reference its `sourceKey` values via `sourceRefs`.
2. `nutritionTerminology`
3. `nutrientIntakeRules`
4. `riskAssessmentRules`
5. `dataValidationRules`
6. `conditionDietRules` last — may reference terminology and nutrient keys.

### Filesystem walker for `referenceSources`

- Uses Node `fs/promises` to recursively scan `reference/`.
- Parses filename for standard code via regex like `^(\d+-)?(WST[\d.]+-\d{4})\s*(.*)\.pdf$`.
- Falls back to a manual override map for files that don't match the WST pattern (e.g. `成人高血压食养指南（2023年版）.pdf` → conditionKey=`hypertension`, year=2023, category=`disease_food_guide`).
- Stores `filePath` relative to repo root, e.g. `reference/1711103428637300/营养标准汇编20231205/第一部分 营养素摄入量/1-WST578.1-2017 中国居民膳食营养素参考摄入量 第1部分：宏量营养素.pdf`.
- Excludes (per the list above) 问答 PDFs, `封面前言和目录.docx`, methodology PDFs, facility-construction guides.
- Generates `sourceKey` from standardCode if available, else a slug of the filename.
- Emits one row per kept PDF.

## Verification

Per `CLAUDE.md`: `npm run build` is the verification step. No test suite.

1. `npm run build` from repo root passes (TypeScript compiles, Next.js builds).
2. From `backend/`: `npm run import:reference-all` against a local Mongo runs to completion, prints expected row counts (~46, ~600, ~80, ~120, ~80, ~30 across the six), exits 0.
3. Re-run `npm run import:reference-all` — second run upserts 0 inserts, all updates (idempotency check).
4. Spot checks via `curl` against the running backend:
   - `GET /api/reference-sources?category=营养标准&year=2018` returns ≥10 items.
   - `GET /api/nutrient-intake-rules?nutrientKey=protein&gender=male&ageMin_gte=19&ageMax_lte=50` returns the adult-male protein rule.
   - `GET /api/condition-diet-rules?conditionKey=hypertension` returns ~15 rules.
5. Spot checks in admin UI: open each of the six pages and confirm rows render and the edit modal saves a change without errors.
6. Confirm every seeded row has `doctor_verified: false` via `GET /api/<resource>?doctor_verified=false&limit=1` returning the same total as the all-rows query.

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Hand-curated condition rules misrepresent guideline prose | Every seeded row has `doctor_verified: false`; consumed only via reviewed records in future scoring engine. |
| Re-running an importer creates duplicates if a unique key collides | Each schema already has a unique `*Key` field (`ruleKey`, `sourceKey`, `termKey`, …); bulkWrite uses upsert by that key. |
| Filename parser miscategorizes a PDF (year/code unreadable) | Manual override map covers known filename variants; unparsed files are logged as warnings but still seeded with a slug-based sourceKey. |
| North Korean Korean translations contain South-Korean-only terms by accident | `doctor_verified=false` and a downstream review queue (Sub-project B) catch these before any user sees them. |
| Generic filter API gets misused for arbitrary querying | Whitelist per route; no operators beyond `_gte`/`_lte`; numbers/booleans coerced via Mongoose schema introspection. |

## Acceptance summary

This sub-project ships when:

- All six `import:*` scripts and `import:reference-all` exist and run idempotently.
- All six collections are populated with row counts in the ranges in the table above, every row `doctor_verified=false` with `dataSource` and `sourceRefs` set.
- `createCrudRouter` accepts `filterableFields` and the seven routes in the whitelist table use it.
- Verification commands all pass.
- Sub-project B (admin polish + dashboard) is unblocked because real data is now queryable.
