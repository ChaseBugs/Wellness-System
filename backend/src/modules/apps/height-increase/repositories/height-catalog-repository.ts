import type pg from "pg";
import type { IHeightCatalogRepository } from "../domain/height-ports.js";
import type { Banner, CatalogExercise, CatalogPlan } from "../models/height-catalog.js";

const APP = "height-increase";
const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []);
const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);
const str = (value: unknown): string | null => (typeof value === "string" && value ? value : null);

/** Read-only catalog of what HeightIncrease users may see: live banners and published Routine Engine content. */
export class HeightCatalogRepository implements IHeightCatalogRepository {
  constructor(private pool: pg.Pool) {}

  async activeBanners(placement?: string): Promise<Banner[]> {
    const result = await this.pool.query(
      `SELECT id, title, subtitle, placement, image_url AS "imageUrl", icon, cta_label AS "ctaLabel", cta_url AS "ctaUrl",
              background_color AS "backgroundColor", priority
       FROM height.banners
       WHERE is_active AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())
         AND ($1::text IS NULL OR placement = $1)
       ORDER BY priority DESC, created_at DESC LIMIT 20`,
      [placement ?? null]
    );
    return result.rows;
  }

  async publishedExercises(filters: { category?: string; level?: string }): Promise<CatalogExercise[]> {
    const result = await this.pool.query(
      `SELECT * FROM routine.exercises
       WHERE $1 = ANY(app_codes) AND status = 'published'
         AND ($2::text IS NULL OR attributes->>'category' = $2) AND ($3::text IS NULL OR difficulty = $3)
       ORDER BY coalesce((attributes->>'sortOrder')::numeric, 0), name`,
      [APP, filters.category ?? null, filters.level ?? null]
    );
    return result.rows.map((row) => {
      const a = row.attributes as Record<string, unknown>;
      const media = row.media as Record<string, unknown>;
      return {
        id: row.id,
        title: row.name,
        description: row.description,
        category: str(a.category),
        durationSeconds: row.default_duration_seconds,
        calories: num(a.calories),
        difficulty: row.difficulty,
        ageGroup: str(a.ageGroup),
        imageUrl: str(media.imageUrl),
        videoUrl: str(media.videoUrl),
        equipment: strings(a.equipment),
        targetAreas: row.body_areas,
        steps: strings(a.steps),
        tips: strings(a.tips),
        safetyNotes: row.safety_notes,
        expertReviewed: row.expert_reviewed
      };
    });
  }

  async publishedPlans(filters: { type?: string; level?: string; limit: number }): Promise<CatalogPlan[]> {
    const result = await this.pool.query(
      `SELECT r.*, (SELECT count(*)::int FROM routine.routine_steps s WHERE s.routine_id = r.id) AS step_count
       FROM routine.routines r
       WHERE r.app_code = $1 AND r.status = 'published'
         AND ($2::text IS NULL OR r.attributes->>'type' = $2) AND ($3::text IS NULL OR r.level = $3)
       ORDER BY coalesce((r.attributes->>'sortOrder')::numeric, 0), r.created_at DESC LIMIT $4`,
      [APP, filters.type ?? null, filters.level ?? null, filters.limit]
    );
    return result.rows.map((row) => {
      const a = row.attributes as Record<string, unknown>;
      return {
        id: row.id,
        title: row.title,
        subtitle: str(a.subtitle),
        description: row.description,
        level: row.level,
        type: str(a.type),
        bannerImageUrl: str(a.bannerImageUrl),
        icon: str(a.icon),
        estimatedMinutes: row.estimated_minutes,
        isPremium: row.is_premium,
        stepCount: row.step_count
      };
    });
  }
}
