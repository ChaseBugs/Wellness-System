/**
 * One-time (idempotent) import of the legacy TalentBaby content into the platform database:
 *   - activities, recipes, bedtime stories, daily updates and sleep/feeding guides -> content.items (app "babygrow")
 *   - milestone definitions -> babygrow.milestone_definitions
 *
 *   npm run import:legacy:talentbaby [-- --snapshot database/legacy/talentbaby-content.json]
 *
 * The snapshot was rebuilt from TalentBaby/backend's SQL files and seed scripts (see its `source` field).
 * Legacy content had doctor_verified = false everywhere but was shown to families with an "unverified"
 * badge, so it is imported as published and not expert reviewed. Images were copied to
 * public/static/babygrow/images, so legacy "/images/..." URLs become "/static/babygrow/images/...".
 *
 * Content rows are upserted on source_ref ("talentbaby:<table>:<id>") and milestones on key
 * ("legacy-<id>"): re-running refreshes them and keeps their ids (so bookmarks and logs survive).
 */
import fs from "fs";
import path from "path";
import type pg from "pg";
import { closeDatabase, connectDatabase, getPool } from "../config/database.js";
import { normalizeSteps } from "../modules/platform/content/recipe-format.js";
import logger, { EMOJIS } from "../utils/logger.js";
import { runMigrations } from "../utils/migrations.js";

type LegacyRow = Record<string, unknown>;

interface Snapshot {
  activities: LegacyRow[];
  milestoneDefinitions: LegacyRow[];
  recipes: LegacyRow[];
  stories: LegacyRow[];
  dailyUpdates: LegacyRow[];
  sleepGuides: LegacyRow[];
  feedingGuides: LegacyRow[];
}

/** A content.items row; keys are column names. */
interface ContentRow {
  source_ref: string;
  content_type: string;
  title: string;
  summary: string | null;
  body: string | null;
  category: string | null;
  tags: string[];
  duration_minutes: number | null;
  steps: unknown[];
  media: Record<string, string>;
  attributes: Record<string, unknown>;
  locale: string;
  is_premium: boolean;
}

const APP = "babygrow";
const BATCH_SIZE = 200;
const CONTENT_COLUMNS = [
  "source_ref", "content_type", "title", "summary", "body", "category", "tags", "duration_minutes",
  "steps", "media", "attributes", "locale", "is_premium"
] as const;
const JSON_COLUMNS = new Set(["steps", "media", "attributes"]);

const text = (value: unknown): string | null => (typeof value === "string" && value.trim().length > 0 ? value : null);
const num = (value: unknown): number | null => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
};
const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []);
const assetUrl = (value: unknown): string | null => {
  const url = text(value);
  return url && url.startsWith("/images/") ? `/static/babygrow${url}` : url;
};

/** Drops empty values so attributes and media only hold what the legacy row had. */
function compact<T extends Record<string, unknown>>(record: T): Record<string, NonNullable<T[keyof T]>> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0))
  ) as Record<string, NonNullable<T[keyof T]>>;
}

const ref = (table: string, row: LegacyRow) => `talentbaby:${table}:${String(row.id)}`;
const locale = (row: LegacyRow) => text(row.language) ?? "en";

function activityRow(row: LegacyRow): ContentRow {
  return {
    source_ref: ref("activities", row),
    content_type: "activity",
    title: String(row.title),
    summary: text(row.description),
    body: text(row.instructions),
    category: text(row.category),
    tags: text(row.sub_category) ? [String(row.sub_category)] : [],
    duration_minutes: num(row.duration_minutes),
    steps: [],
    media: compact({
      imageUrl: assetUrl(row.image_url),
      videoUrl: assetUrl(row.video_url),
      videoThumbnailUrl: assetUrl(row.video_thumbnail_url)
    }),
    attributes: compact({
      ageMonthsMin: num(row.month_min) ?? num(row.age_range_min_months),
      ageMonthsMax: num(row.month_max) ?? num(row.age_range_max_months),
      subCategory: text(row.sub_category),
      difficultyLevel: text(row.difficulty_level),
      materialsNeeded: strings(row.materials_needed),
      learningOutcomes: strings(row.learning_outcomes),
      benefits: strings(row.benefits),
      frequency: text(row.frequency),
      doneCount: num(row.done_count)
    }),
    locale: locale(row),
    is_premium: row.is_premium === true
  };
}

function recipeRow(row: LegacyRow): ContentRow {
  const nutritionInfo = row.nutrition_info && typeof row.nutrition_info === "object" ? (row.nutrition_info as Record<string, unknown>) : {};
  const ingredientRows = Array.isArray(row.ingredient_rows) && row.ingredient_rows.length > 0 ? (row.ingredient_rows as LegacyRow[]) : null;
  const ingredients = ingredientRows
    ? ingredientRows.map((entry) =>
        compact({ name: String(entry.name), amount: num(entry.amount), unit: text(entry.unit), notes: text(entry.notes), imageUrl: assetUrl(entry.imageUrl) })
      )
    : strings(row.ingredients);
  const prep = num(row.prep_time_minutes);
  const cooking = num(row.cooking_time_minutes);
  return {
    source_ref: ref("recipes", row),
    content_type: "recipe",
    title: String(row.title),
    summary: text(row.description),
    body: null,
    category: text(row.recipe_type),
    tags: [text(row.target), text(row.meal_slot)].filter((tag): tag is string => tag !== null),
    duration_minutes: prep === null && cooking === null ? null : (prep ?? 0) + (cooking ?? 0),
    steps: normalizeSteps(strings(row.instructions)),
    media: compact({ imageUrl: assetUrl(row.image_url) }),
    attributes: compact({
      ageMonthsMin: num(row.age_range_min_months),
      ageMonthsMax: num(row.age_range_max_months),
      recipeType: text(row.recipe_type),
      target: text(row.target),
      mealSlot: text(row.meal_slot),
      ageGroup: text(row.baby_age_group),
      prepTimeMinutes: prep,
      cookingTimeMinutes: cooking,
      calories: num(nutritionInfo.calories),
      nutritionInfo: Object.keys(nutritionInfo).length > 0 ? nutritionInfo : null,
      ingredients
    }),
    locale: locale(row),
    is_premium: false
  };
}

function storyRow(row: LegacyRow): ContentRow {
  return {
    source_ref: ref("bedtime_stories", row),
    content_type: "story",
    title: String(row.title),
    summary: text(row.description),
    body: text(row.content),
    category: text(row.category),
    tags: row.is_featured === true ? ["featured"] : [],
    duration_minutes: num(row.duration_minutes),
    steps: [],
    media: compact({ imageUrl: assetUrl(row.image_url), audioUrl: assetUrl(row.audio_url) }),
    attributes: compact({
      ageMonthsMin: num(row.age_min_months),
      ageMonthsMax: num(row.age_max_months),
      author: text(row.author),
      isFeatured: row.is_featured === true
    }),
    locale: locale(row),
    is_premium: false
  };
}

function dailyUpdateRow(row: LegacyRow): ContentRow {
  // Legacy daily updates matched one exact month.
  const month = num(row.age_in_months);
  return {
    source_ref: ref("daily_updates_content", row),
    content_type: "daily_update",
    title: String(row.title),
    summary: null,
    body: text(row.content),
    category: text(row.content_type),
    tags: [],
    duration_minutes: null,
    steps: [],
    media: compact({ imageUrl: assetUrl(row.image_url), videoUrl: assetUrl(row.video_url) }),
    attributes: compact({ ageMonthsMin: month, ageMonthsMax: month }),
    locale: locale(row),
    is_premium: false
  };
}

function guideRow(table: "sleep_guides" | "feeding_guides", row: LegacyRow): ContentRow {
  return {
    source_ref: ref(table, row),
    content_type: "guide",
    title: String(row.title),
    summary: text(row.description),
    body: text(row.overview),
    category: table === "sleep_guides" ? "sleep" : "feeding",
    tags: [],
    duration_minutes: null,
    steps: normalizeSteps(strings(row.tips)),
    media: {},
    attributes: compact({
      ageMonthsMin: num(row.age_min_months),
      ageMonthsMax: num(row.age_max_months),
      scheduleRecommendations: row.schedule_recommendations ?? null,
      commonChallenges: strings(row.common_challenges),
      foodIntroductionTimeline: Array.isArray(row.food_introduction_timeline) ? row.food_introduction_timeline : null,
      adequacyAssessmentQuestions: Array.isArray(row.adequacy_assessment_questions) ? row.adequacy_assessment_questions : null
    }),
    locale: locale(row),
    is_premium: false
  };
}

async function upsertContent(pool: pg.Pool, label: string, rows: ContentRow[]): Promise<void> {
  let written = 0;
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const values: unknown[] = [];
    const tuples = batch.map((row) => {
      const placeholders = CONTENT_COLUMNS.map((column) => {
        values.push(JSON_COLUMNS.has(column) ? JSON.stringify(row[column]) : row[column]);
        return `$${values.length}`;
      });
      values.push([APP]);
      return `(${placeholders.join(", ")}, $${values.length}, 'published', false, now())`;
    });
    const updates = CONTENT_COLUMNS.filter((column) => column !== "source_ref").map((column) => `${column} = EXCLUDED.${column}`);
    const result = await pool.query(
      `INSERT INTO content.items (${CONTENT_COLUMNS.join(", ")}, app_codes, review_status, expert_reviewed, published_at)
       VALUES ${tuples.join(", ")}
       ON CONFLICT (source_ref) WHERE source_ref IS NOT NULL
       DO UPDATE SET ${updates.join(", ")}, updated_at = now()`,
      values
    );
    written += result.rowCount ?? 0;
  }
  logger.infoWithEmoji(EMOJIS.SUCCESS, `Imported ${label}`, "IMPORT", { rows: written });
}

async function upsertMilestones(pool: pg.Pool, rows: LegacyRow[]): Promise<void> {
  let written = 0;
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const values: unknown[] = [];
    const tuples = batch.map((row) => {
      const month = Math.min(72, Math.max(1, num(row.month) ?? 1));
      const fields = [`legacy-${String(row.id)}`, row.milestone_type, row.title, text(row.description), month, text(row.question), text(row.related_activity), num(row.display_order) ?? 0];
      const placeholders = fields.map((value) => {
        values.push(value);
        return `$${values.length}`;
      });
      // age_months_min/max mirror the month so age-window queries keep working.
      return `(${placeholders.join(", ")}, ${placeholders[4]}, ${placeholders[4]}, 'TalentBaby legacy seed', true, false)`;
    });
    const result = await pool.query(
      `INSERT INTO babygrow.milestone_definitions
         (key, domain, title, description, month, question, related_activity, display_order, age_months_min, age_months_max, source, is_published, expert_reviewed)
       VALUES ${tuples.join(", ")}
       ON CONFLICT (key) DO UPDATE SET
         domain = EXCLUDED.domain, title = EXCLUDED.title, description = EXCLUDED.description, month = EXCLUDED.month,
         question = EXCLUDED.question, related_activity = EXCLUDED.related_activity, display_order = EXCLUDED.display_order,
         age_months_min = EXCLUDED.age_months_min, age_months_max = EXCLUDED.age_months_max, updated_at = now()`,
      values
    );
    written += result.rowCount ?? 0;
  }
  logger.infoWithEmoji(EMOJIS.SUCCESS, "Imported milestone definitions", "IMPORT", { rows: written });
}

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const snapshotPath = path.resolve(argValue("--snapshot") ?? path.join(process.cwd(), "database", "legacy", "talentbaby-content.json"));
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as Snapshot;

  await connectDatabase();
  const pool = getPool();
  await runMigrations(pool);

  await upsertContent(pool, "activities", snapshot.activities.map(activityRow));
  await upsertContent(pool, "recipes", snapshot.recipes.map(recipeRow));
  await upsertContent(pool, "stories", snapshot.stories.map(storyRow));
  await upsertContent(pool, "daily updates", snapshot.dailyUpdates.map(dailyUpdateRow));
  await upsertContent(pool, "guides", [
    ...snapshot.sleepGuides.map((row) => guideRow("sleep_guides", row)),
    ...snapshot.feedingGuides.map((row) => guideRow("feeding_guides", row))
  ]);
  await upsertMilestones(pool, snapshot.milestoneDefinitions);
}

main()
  .catch((error: unknown) => {
    logger.errorWithEmoji(EMOJIS.ERROR, "Legacy TalentBaby import failed", "IMPORT", {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
