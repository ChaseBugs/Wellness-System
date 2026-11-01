/**
 * One-time (idempotent) import of the legacy HeightIncrease content into the platform database:
 *   - exercises and training plans -> Routine Engine (routine.exercises, routine.routines + steps)
 *   - articles -> Content Factory (content.items, app "height-increase")
 *   - banners, push campaigns and app settings -> the `height` schema
 *
 *   npm run import:legacy:height [-- --snapshot database/legacy/heightincrease-content.json]
 *
 * The snapshot was captured from HeightIncrease/backend/src/seed.js (its only data source; the legacy
 * app had no production data). User accounts, logs and goals were demo data and are not imported.
 *
 * Review rules follow the platform, not the legacy flags:
 *   - Exercises and plans arrive as unreviewed drafts. The Routine Engine only publishes movement
 *     content after an expert sign-off (POST /routine/{exercises|routines}/:id/review, then /publish).
 *   - Articles keep their legacy visibility (published when isPublished) and arrive not expert reviewed,
 *     like BabyGrow content.
 * Rows are upserted on source_ref ("heightincrease:<collection>:<legacy id>") or, for settings, on key.
 */
import fs from "fs";
import path from "path";
import type pg from "pg";
import { closeDatabase, connectDatabase, getPool } from "../config/database.js";
import logger, { EMOJIS } from "../utils/logger.js";
import { runMigrations } from "../utils/migrations.js";
import { withTransaction } from "../utils/sql.js";

type LegacyDoc = Record<string, unknown> & { _id: string };

interface Snapshot {
  Exercise: LegacyDoc[];
  TrainingPlan: LegacyDoc[];
  Article: LegacyDoc[];
  Banner: LegacyDoc[];
  Notification: LegacyDoc[];
  AppSetting: LegacyDoc[];
}

const APP = "height-increase";
const ref = (collection: string, doc: LegacyDoc) => `heightincrease:${collection}:${doc._id}`;
const text = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value : null);
const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);
const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []);
const positive = (value: unknown) => (typeof value === "number" && value > 0 ? Math.round(value) : null);

/** Drops empty values so attributes only hold what the legacy document had. */
function compact(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== null && value !== undefined));
}

async function importExercises(pool: pg.Pool, docs: LegacyDoc[]): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const doc of docs) {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO routine.exercises
         (name, description, app_codes, body_areas, difficulty, default_duration_seconds, media, safety_notes,
          attributes, status, expert_reviewed, source_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::jsonb, 'draft', false, $10)
       ON CONFLICT (source_ref) WHERE source_ref IS NOT NULL DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description, body_areas = EXCLUDED.body_areas,
         difficulty = EXCLUDED.difficulty, default_duration_seconds = EXCLUDED.default_duration_seconds,
         media = EXCLUDED.media, safety_notes = EXCLUDED.safety_notes, attributes = EXCLUDED.attributes, updated_at = now()
       RETURNING id`,
      [
        doc.title,
        // The legacy first tip was the exercise's description.
        strings(doc.tips)[0] ?? null,
        [APP],
        strings(doc.targetAreas),
        text(doc.difficulty) ?? "beginner",
        positive(doc.durationSeconds),
        JSON.stringify(compact({ imageUrl: text(doc.imageUrl), videoUrl: text(doc.videoUrl) })),
        strings(doc.tips).filter((tip) => /stop|pain|dizz/i.test(tip)),
        JSON.stringify(
          compact({
            slug: text(doc.slug),
            category: text(doc.category),
            calories: num(doc.calories),
            ageGroup: text(doc.ageGroup),
            equipment: strings(doc.equipment),
            steps: strings(doc.steps),
            tips: strings(doc.tips),
            setup: doc.setup === true,
            sortOrder: num(doc.sortOrder)
          })
        ),
        ref("exercises", doc)
      ]
    );
    ids.set(doc._id, result.rows[0].id);
  }
  logger.infoWithEmoji(EMOJIS.SUCCESS, "Imported exercises (as unreviewed drafts)", "IMPORT", { rows: ids.size });
  return ids;
}

async function importPlans(pool: pg.Pool, docs: LegacyDoc[], exerciseIds: Map<string, string>): Promise<void> {
  let steps = 0;
  for (const doc of docs) {
    await withTransaction(pool, async (client) => {
      const result = await client.query<{ id: string }>(
        `INSERT INTO routine.routines
           (app_code, title, description, goal, level, estimated_minutes, tags, is_premium, attributes, status, expert_reviewed, source_ref)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'draft', false, $10)
         ON CONFLICT (source_ref) WHERE source_ref IS NOT NULL DO UPDATE SET
           title = EXCLUDED.title, description = EXCLUDED.description, goal = EXCLUDED.goal, level = EXCLUDED.level,
           estimated_minutes = EXCLUDED.estimated_minutes, tags = EXCLUDED.tags, is_premium = EXCLUDED.is_premium,
           attributes = EXCLUDED.attributes, updated_at = now()
         RETURNING id`,
        [
          APP,
          doc.title,
          text(doc.description),
          text(doc.goal),
          text(doc.level) ?? "beginner",
          positive(doc.estimatedMinutes),
          strings(doc.tags),
          doc.isPremium === true,
          JSON.stringify(
            compact({
              subtitle: text(doc.subtitle),
              type: text(doc.type),
              bannerImageUrl: text(doc.bannerImageUrl),
              icon: text(doc.icon),
              setup: doc.setup === true,
              sortOrder: num(doc.sortOrder)
            })
          ),
          ref("trainingplans", doc)
        ]
      );
      const routineId = result.rows[0].id;
      await client.query("DELETE FROM routine.routine_steps WHERE routine_id = $1", [routineId]);
      const entries = (Array.isArray(doc.exercises) ? (doc.exercises as LegacyDoc[]) : [])
        .slice()
        .sort((a, b) => (num(a.order) ?? 0) - (num(b.order) ?? 0));
      for (const [position, entry] of entries.entries()) {
        const exerciseId = exerciseIds.get(String(entry.exercise));
        if (!exerciseId) throw new Error(`Plan "${String(doc.title)}" references unknown exercise ${String(entry.exercise)}`);
        await client.query(
          `INSERT INTO routine.routine_steps (routine_id, position, exercise_id, sets, reps, duration_seconds, rest_seconds)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [routineId, position, exerciseId, positive(entry.sets), positive(entry.reps), positive(entry.durationSeconds), Math.max(0, num(entry.restSeconds) ?? 0)]
        );
        steps++;
      }
    });
  }
  logger.infoWithEmoji(EMOJIS.SUCCESS, "Imported training plans (as unreviewed drafts)", "IMPORT", { rows: docs.length, steps });
}

async function importArticles(pool: pg.Pool, docs: LegacyDoc[]): Promise<void> {
  for (const doc of docs) {
    const published = doc.isPublished !== false;
    await pool.query(
      `INSERT INTO content.items
         (content_type, app_codes, title, summary, body, category, tags, duration_minutes, media, attributes,
          review_status, expert_reviewed, published_at, source_ref)
       VALUES ('article', $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, false, $11, $12)
       ON CONFLICT (source_ref) WHERE source_ref IS NOT NULL DO UPDATE SET
         title = EXCLUDED.title, summary = EXCLUDED.summary, body = EXCLUDED.body, category = EXCLUDED.category,
         tags = EXCLUDED.tags, duration_minutes = EXCLUDED.duration_minutes, media = EXCLUDED.media,
         attributes = EXCLUDED.attributes, review_status = EXCLUDED.review_status, updated_at = now()`,
      [
        [APP],
        doc.title,
        text(doc.excerpt),
        text(doc.body),
        text(doc.category) ?? "general",
        strings(doc.tags),
        positive(doc.readMinutes),
        JSON.stringify(compact({ imageUrl: text(doc.imageUrl) })),
        JSON.stringify(
          compact({
            slug: text(doc.slug),
            author: text(doc.authorName) ?? "Height Increase Team",
            isFeatured: doc.isFeatured === true,
            setup: doc.setup === true
          })
        ),
        published ? "published" : "archived",
        published ? new Date() : null,
        ref("articles", doc)
      ]
    );
  }
  logger.infoWithEmoji(EMOJIS.SUCCESS, "Imported articles", "IMPORT", { rows: docs.length });
}

async function importBanners(pool: pg.Pool, docs: LegacyDoc[]): Promise<void> {
  for (const doc of docs) {
    await pool.query(
      `INSERT INTO height.banners
         (title, subtitle, placement, image_url, icon, cta_label, cta_url, background_color, starts_at, ends_at, setup, priority, is_active, source_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, coalesce($8, '#6696f6'), $9, $10, $11, $12, $13, $14)
       ON CONFLICT (source_ref) DO UPDATE SET
         title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, placement = EXCLUDED.placement, image_url = EXCLUDED.image_url,
         icon = EXCLUDED.icon, cta_label = EXCLUDED.cta_label, cta_url = EXCLUDED.cta_url,
         background_color = EXCLUDED.background_color, priority = EXCLUDED.priority, updated_at = now()`,
      [
        doc.title,
        text(doc.subtitle),
        text(doc.placement) ?? "home-top",
        text(doc.imageUrl),
        text(doc.icon),
        text(doc.ctaLabel),
        text(doc.ctaUrl),
        text(doc.backgroundColor),
        text(doc.startsAt),
        text(doc.endsAt),
        doc.setup === true,
        num(doc.priority) ?? 0,
        doc.isActive !== false,
        ref("banners", doc)
      ]
    );
  }
  logger.infoWithEmoji(EMOJIS.SUCCESS, "Imported banners", "IMPORT", { rows: docs.length });
}

async function importNotifications(pool: pg.Pool, docs: LegacyDoc[]): Promise<void> {
  for (const doc of docs) {
    await pool.query(
      `INSERT INTO height.notifications (title, message, audience, notification_type, scheduled_at, setup, is_active, source_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (source_ref) DO UPDATE SET
         title = EXCLUDED.title, message = EXCLUDED.message, audience = EXCLUDED.audience,
         notification_type = EXCLUDED.notification_type, updated_at = now()`,
      [
        doc.title,
        doc.message,
        text(doc.audience) ?? "all",
        text(doc.type) ?? "motivation",
        text(doc.scheduledAt),
        doc.setup === true,
        doc.isActive !== false,
        ref("notifications", doc)
      ]
    );
  }
  logger.infoWithEmoji(EMOJIS.SUCCESS, "Imported push campaigns", "IMPORT", { rows: docs.length });
}

async function importSettings(pool: pg.Pool, docs: LegacyDoc[]): Promise<void> {
  for (const doc of docs) {
    await pool.query(
      `INSERT INTO height.settings (key, value, setup, description) VALUES ($1, $2::jsonb, $3, $4)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = now()`,
      [doc.key, JSON.stringify(doc.value), doc.setup === true, text(doc.description)]
    );
  }
  logger.infoWithEmoji(EMOJIS.SUCCESS, "Imported settings", "IMPORT", { rows: docs.length });
}

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const snapshotPath = path.resolve(argValue("--snapshot") ?? path.join(process.cwd(), "database", "legacy", "heightincrease-content.json"));
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as Snapshot;

  await connectDatabase();
  const pool = getPool();
  await runMigrations(pool);

  const exerciseIds = await importExercises(pool, snapshot.Exercise);
  await importPlans(pool, snapshot.TrainingPlan, exerciseIds);
  await importArticles(pool, snapshot.Article);
  await importBanners(pool, snapshot.Banner);
  await importNotifications(pool, snapshot.Notification);
  await importSettings(pool, snapshot.AppSetting);
}

main()
  .catch((error: unknown) => {
    logger.errorWithEmoji(EMOJIS.ERROR, "Legacy HeightIncrease import failed", "IMPORT", {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
