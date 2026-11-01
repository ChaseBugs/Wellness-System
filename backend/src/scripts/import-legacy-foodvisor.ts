/**
 * One-time (idempotent) import of the legacy Foodvisor data into the platform database:
 *   - reference seeds that lived in Foodvisor/backend/src/data (now src/modules/apps/foodvisor/data):
 *     WS/T 578 intake rules, reference sources, condition diets, risk thresholds, terminology,
 *     validation rules, daily value profiles, the Sasang questionnaire
 *   - the foods collection from the Navicat dump mobile/Foodvisor/foods.js (MongoDB shell syntax)
 *
 *   npm run import:legacy:foodvisor [-- --foods ../mobile/Foodvisor/foods.js]
 *
 * Rows are upserted on their natural keys, so re-running refreshes them instead of duplicating.
 * Activities (MET table) and LP nutrition constraints came from an external "food data" folder that is
 * not in the repository; their tables stay empty until that source is available.
 */
import fs from "fs";
import path from "path";
import type pg from "pg";
import vm from "vm";
import { closeDatabase, connectDatabase, getPool } from "../config/database.js";
import { dailyValueProfiles } from "../modules/apps/foodvisor/data/dailyValueProfiles.js";
import { foodDictionary } from "../modules/apps/foodvisor/data/foodDictionary.js";
import { humanTypeQuestions } from "../modules/apps/foodvisor/data/humanTypeQuestions.js";
import {
  conditionDietConditions,
  conditionDietRules,
  dataValidationRules,
  nutritionTerminology,
  referenceSources,
  riskAssessmentRules
} from "../modules/apps/foodvisor/data/referenceGuidelineSeeds.js";
import { wst578NutrientRules } from "../modules/apps/foodvisor/data/wst578NutrientRules.js";
import logger, { EMOJIS } from "../utils/logger.js";
import { runMigrations } from "../utils/migrations.js";

type LegacyRecord = Record<string, unknown>;
type ColumnTypes = Map<string, string>;

const BATCH_SIZE = 250;
const SKIPPED_KEYS = new Set(["_id", "__v", "id"]);
// Legacy field names whose column is not simply the snake_case form.
const KEY_OVERRIDES: Record<string, string> = { order: "sort_order", name: "korean_name" };

const quote = (identifier: string) => `"${identifier.replace(/"/g, "")}"`;
const toSnake = (key: string) => key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);

async function columnTypes(pool: pg.Pool, table: string): Promise<ColumnTypes> {
  const [schema, name] = table.split(".");
  const result = await pool.query<{ column_name: string; data_type: string; is_generated: string }>(
    `SELECT column_name, data_type, is_generated FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
    [schema, name]
  );
  return new Map(result.rows.filter((row) => row.is_generated !== "ALWAYS").map((row) => [row.column_name, row.data_type]));
}

function toColumnValue(dataType: string, value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (dataType === "jsonb" || dataType === "json") return JSON.stringify(value);
  if (dataType === "ARRAY") return (Array.isArray(value) ? value : [value]).filter((item) => item !== null && item !== "").map(String);
  if (dataType === "numeric" || dataType === "integer" || dataType === "bigint") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (dataType === "boolean") return Boolean(value);
  return value;
}

/** Maps a legacy camelCase document onto existing columns; unknown keys are counted, not guessed. */
function toRow(record: LegacyRecord, columns: ColumnTypes, dropped: Map<string, number>, keyOverrides = KEY_OVERRIDES): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (SKIPPED_KEYS.has(key) || value === undefined) continue;
    const column = keyOverrides[key] ?? toSnake(key);
    const dataType = columns.get(column);
    if (!dataType) {
      dropped.set(key, (dropped.get(key) ?? 0) + 1);
      continue;
    }
    row[column] = toColumnValue(dataType, value);
  }
  return row;
}

async function upsert(pool: pg.Pool, table: string, conflictColumns: string[], rows: Array<Record<string, unknown>>): Promise<number> {
  // Last row wins when the source repeats a natural key (one INSERT cannot touch a row twice).
  const unique = new Map<string, Record<string, unknown>>();
  for (const row of rows) unique.set(conflictColumns.map((column) => String(row[column])).join("|"), row);
  const deduped = [...unique.values()];

  for (let start = 0; start < deduped.length; start += BATCH_SIZE) {
    const batch = deduped.slice(start, start + BATCH_SIZE);
    const columns = [...new Set(batch.flatMap((row) => Object.keys(row)))];
    const values: unknown[] = [];
    const tuples = batch.map((row) =>
      `(${columns
        .map((column) => {
          if (!(column in row)) return "DEFAULT";
          values.push(row[column]);
          return `$${values.length}`;
        })
        .join(", ")})`
    );
    const updates = columns
      .filter((column) => !conflictColumns.includes(column) && column !== "created_at")
      .map((column) => `${quote(column)} = EXCLUDED.${quote(column)}`);
    // Legacy documents that carry their own updatedAt keep it; everything else is stamped now.
    if (!columns.includes("updated_at")) updates.push("updated_at = now()");
    await pool.query(
      `INSERT INTO ${table} (${columns.map(quote).join(", ")}) VALUES ${tuples.join(", ")}
       ON CONFLICT (${conflictColumns.map(quote).join(", ")}) DO UPDATE SET ${updates.join(", ")}`,
      values
    );
  }
  return deduped.length;
}

async function importSeeds(pool: pg.Pool, table: string, conflict: string[], records: readonly object[]): Promise<void> {
  const columns = await columnTypes(pool, table);
  const dropped = new Map<string, number>();
  const rows = records.map((record) => toRow(record as LegacyRecord, columns, dropped, { order: "sort_order" }));
  const count = await upsert(pool, table, conflict, rows);
  logger.successWithEmoji(EMOJIS.SEED, `Imported ${table}`, "IMPORT", { rows: count, droppedKeys: Object.fromEntries(dropped) });
}

/** Evaluates the Navicat dump with stub Mongo shell helpers and collects inserted documents. */
function readFoodsDump(dumpPath: string): LegacyRecord[] {
  const documents: LegacyRecord[] = [];
  const collection = {
    drop: () => undefined,
    createIndex: () => undefined,
    insert: (docs: LegacyRecord | LegacyRecord[]) => documents.push(...(Array.isArray(docs) ? docs : [docs])),
    insertMany: (docs: LegacyRecord[]) => documents.push(...docs)
  };
  const sandbox = {
    db: { getCollection: () => collection, createCollection: () => undefined },
    ObjectId: (hex: string) => ({ $oid: hex }),
    ISODate: (value: string) => new Date(value),
    Int32: (value: string) => Number(value)
  };
  // Strip the UTF-8 byte-order mark Navicat writes at the start of the dump.
  const raw = fs.readFileSync(dumpPath, "utf8");
  const source = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  vm.runInNewContext(source, sandbox, { filename: path.basename(dumpPath), timeout: 120_000 });
  return documents;
}

async function importFoods(pool: pg.Pool, dumpPath: string): Promise<void> {
  const columns = await columnTypes(pool, "foodvisor.foods");
  const dropped = new Map<string, number>();
  const seenFdcIds = new Set<number>();
  const rows: Array<Record<string, unknown>> = [];

  const pushFood = (document: LegacyRecord, legacyId: string) => {
    const row = toRow({ ...document, koreanName: document.koreanName ?? document.name, name: undefined }, columns, dropped);
    row.legacy_id = legacyId;
    // Legacy files were served from Foodvisor/backend/public/images; the platform serves them under /static.
    if (typeof row.image_url === "string" && row.image_url.startsWith("/images/")) {
      row.image_url = `/static/foodvisor${row.image_url}`;
    }
    // fdc_id is unique; a repeated USDA id is kept on the first food only.
    const fdcId = row.fdc_id as number | null | undefined;
    if (typeof fdcId === "number") {
      if (seenFdcIds.has(fdcId)) row.fdc_id = null;
      else seenFdcIds.add(fdcId);
    }
    if (!row.korean_name || !row.category) return;
    rows.push(row);
  };

  const dumped = readFoodsDump(dumpPath);
  for (const document of dumped) pushFood(document, String((document._id as { $oid?: string })?.$oid ?? document._id));

  // Dictionary foods the dump does not already contain (matched by name).
  const dumpedNames = new Set(rows.map((row) => String(row.korean_name).toLowerCase()));
  let dictionaryAdded = 0;
  for (const food of foodDictionary as unknown as LegacyRecord[]) {
    const name = String(food.koreanName ?? food.name ?? "");
    if (!name || dumpedNames.has(name.toLowerCase())) continue;
    pushFood({ ...food, dataSource: food.dataSource ?? "foodvisor_dictionary" }, `dictionary:${name}`);
    dictionaryAdded++;
  }

  const count = await upsert(pool, "foodvisor.foods", ["legacy_id"], rows);
  logger.successWithEmoji(EMOJIS.SEED, "Imported foodvisor.foods", "IMPORT", {
    rows: count,
    fromDump: dumped.length,
    fromDictionary: dictionaryAdded,
    droppedKeys: Object.fromEntries(dropped)
  });
}

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  await connectDatabase();
  const pool = getPool();
  await runMigrations(pool);

  await importSeeds(pool, "foodvisor.reference_sources", ["source_key"], referenceSources);
  await importSeeds(pool, "foodvisor.nutrient_intake_rules", ["rule_key"], wst578NutrientRules);
  await importSeeds(pool, "foodvisor.condition_diet_conditions", ["condition_key"], conditionDietConditions);
  await importSeeds(pool, "foodvisor.condition_diet_rules", ["rule_key"], conditionDietRules);
  await importSeeds(pool, "foodvisor.risk_assessment_rules", ["rule_key"], riskAssessmentRules);
  await importSeeds(pool, "foodvisor.nutrition_terminology", ["term_key"], nutritionTerminology);
  await importSeeds(pool, "foodvisor.data_validation_rules", ["rule_key"], dataValidationRules);
  await importSeeds(pool, "foodvisor.daily_value_profiles", ["profile_key"], dailyValueProfiles);
  await importSeeds(pool, "foodvisor.human_type_questions", ["question_id"], humanTypeQuestions);

  const dumpPath = path.resolve(argValue("--foods") ?? process.env.FOODVISOR_FOODS_DUMP ?? path.join(process.cwd(), "..", "mobile", "Foodvisor", "foods.js"));
  if (fs.existsSync(dumpPath)) await importFoods(pool, dumpPath);
  else logger.warnWithEmoji(EMOJIS.WARN, "Foods dump not found; skipped foods", "IMPORT", { dumpPath });
}

main()
  .catch((error: unknown) => {
    logger.errorWithEmoji(EMOJIS.ERROR, "Legacy Foodvisor import failed", "IMPORT", {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
