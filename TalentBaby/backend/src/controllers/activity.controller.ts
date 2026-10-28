import { BaseController } from './base.controller';
import { database } from '../config/database';
import { AppError } from '../utils/AppError';

export class ActivityController extends BaseController {

  // GET /activities?month=3&category=physical&sub_category=Gross+Motor&search=
  getActivities = this.handle(async (req, res) => {
    const month      = req.query.month       ? parseInt(req.query.month as string, 10)       : undefined;
    const category   = req.query.category    as string | undefined;
    const subCat     = req.query.sub_category as string | undefined;
    const search     = req.query.search      as string | undefined;
    const lang       = (req.query.lang as string) || null;

    let query = 'SELECT * FROM activities WHERE 1=1';
    const params: unknown[] = [];
    let i = 1;

    if (lang) {
      query += ` AND language = $${i}`;
      params.push(lang);
      i++;
    }

    if (month !== undefined && !isNaN(month)) {
      query += ` AND month_min <= $${i} AND month_max >= $${i}`;
      params.push(month);
      i++;
    }

    if (category && category !== 'all') {
      query += ` AND category = $${i}`;
      params.push(category);
      i++;
    }

    if (subCat) {
      query += ` AND sub_category = $${i}`;
      params.push(subCat);
      i++;
    }

    if (search) {
      query += ` AND (title ILIKE $${i} OR description ILIKE $${i})`;
      params.push(`%${search}%`);
      i++;
    }

    query += ' ORDER BY month_min, category, done_count DESC';

    const result = await database.query(query, params);
    this.ok(res, result.rows);
  });

  // GET /activities/sub-categories — returns list of all sub-categories grouped by category
  getSubCategories = this.handle(async (_req, res) => {
    const result = await database.query(
      `SELECT DISTINCT category, sub_category
       FROM activities
       WHERE sub_category IS NOT NULL
       ORDER BY category, sub_category`
    );
    // Group by category
    const grouped: Record<string, string[]> = {};
    for (const row of result.rows as { category: string; sub_category: string }[]) {
      if (!grouped[row.category]) grouped[row.category] = [];
      if (!grouped[row.category].includes(row.sub_category)) {
        grouped[row.category].push(row.sub_category);
      }
    }
    this.ok(res, grouped);
  });

  // GET /activities/:id
  getActivity = this.handle(async (req, res) => {
    const id = this.intParam(req, 'id');
    const result = await database.query('SELECT * FROM activities WHERE id = $1', [id]);
    if (result.rows.length === 0) throw AppError.notFound('Activity not found.');
    this.ok(res, result.rows[0]);
  });

  // GET /activities/baby/:babyId?month=
  getBabyActivities = this.handle(async (req, res) => {
    const babyId = this.intParam(req, 'babyId');
    const month  = this.intQuery(req, 'month');

    let query = `
      SELECT
        ba.*,
        a.title, a.description, a.category, a.sub_category,
        a.month_min, a.month_max, a.duration_minutes, a.difficulty_level,
        a.benefits, a.frequency, a.materials_needed, a.instructions,
        a.image_url, a.video_url, a.done_count, a.is_premium
      FROM baby_activities ba
      JOIN activities a ON ba.activity_id = a.id
      WHERE ba.baby_id = $1`;
    const params: unknown[] = [babyId];
    let i = 2;

    if (month !== undefined) {
      query += ` AND a.month_min <= $${i} AND a.month_max >= $${i}`;
      params.push(month);
      i++;
    }

    query += ' ORDER BY ba.completed_date DESC NULLS LAST, ba.created_at DESC';

    const result = await database.query(query, params);
    this.ok(res, result.rows);
  });

  // POST /activities/:id/complete { baby_id, rating?, difficulty_feedback?, notes? }
  completeActivity = this.handle(async (req, res) => {
    const activityId          = this.intParam(req, 'id');
    const { baby_id, rating, difficulty_feedback, notes } = req.body as {
      baby_id: number;
      rating?: number;
      difficulty_feedback?: string;
      notes?: string;
    };

    if (!baby_id) throw AppError.badRequest('baby_id is required.');

    // Fetch activity info
    const actResult = await database.query(
      'SELECT id, title, description, month_min FROM activities WHERE id = $1',
      [activityId]
    );
    if (actResult.rows.length === 0) throw AppError.notFound('Activity not found.');
    const activity = actResult.rows[0] as {
      id: number;
      title: string;
      description: string;
      month_min: number;
    };

    // Upsert baby_activities
    const existingResult = await database.query(
      `SELECT id, milestone_saved FROM baby_activities
       WHERE baby_id = $1 AND activity_id = $2
       ORDER BY created_at DESC LIMIT 1`,
      [baby_id, activityId]
    );

    let babyActivity: { id: number; milestone_saved: boolean };

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0] as { id: number; milestone_saved: boolean };
      const updateResult = await database.query(
        `UPDATE baby_activities
         SET completed_date = NOW(), rating = $1,
             difficulty_feedback = $2, completion_notes = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [rating ?? null, difficulty_feedback ?? null, notes ?? null, existing.id]
      );
      babyActivity = updateResult.rows[0] as { id: number; milestone_saved: boolean };
    } else {
      const insertResult = await database.query(
        `INSERT INTO baby_activities
           (baby_id, activity_id, assigned_date, completed_date, rating,
            difficulty_feedback, completion_notes)
         VALUES ($1, $2, NOW(), NOW(), $3, $4, $5) RETURNING *`,
        [baby_id, activityId, rating ?? null, difficulty_feedback ?? null, notes ?? null]
      );
      babyActivity = insertResult.rows[0] as { id: number; milestone_saved: boolean };
    }

    // Increment done_count on the activity
    await database.query(
      'UPDATE activities SET done_count = done_count + 1 WHERE id = $1',
      [activityId]
    );

    // Save milestone if first time
    if (!babyActivity.milestone_saved) {
      await database.query(
        `INSERT INTO milestones
           (baby_id, milestone_type, title, description,
            expected_age_range_months, achieved_date)
         VALUES ($1, 'activity', $2, $3, $4, NOW())`,
        [
          baby_id,
          `Completed: ${activity.title}`,
          activity.description ?? '',
          activity.month_min,
        ]
      );
      await database.query(
        'UPDATE baby_activities SET milestone_saved = TRUE WHERE id = $1',
        [babyActivity.id]
      );
      babyActivity.milestone_saved = true;
    }

    this.ok(res, babyActivity);
  });

  // POST /activities/:id/difficulty { baby_id, feedback: 'too_easy'|'too_hard' }
  setDifficultyFeedback = this.handle(async (req, res) => {
    const activityId = this.intParam(req, 'id');
    const { baby_id, feedback } = req.body as { baby_id: number; feedback: string };

    if (!baby_id)   throw AppError.badRequest('baby_id is required.');
    if (!feedback)  throw AppError.badRequest('feedback is required.');

    const allowed = ['too_easy', 'too_hard', 'just_right'];
    if (!allowed.includes(feedback)) {
      throw AppError.badRequest(`feedback must be one of: ${allowed.join(', ')}`);
    }

    const result = await database.query(
      `UPDATE baby_activities
       SET difficulty_feedback = $1, updated_at = CURRENT_TIMESTAMP
       WHERE baby_id = $2 AND activity_id = $3
         AND id = (
           SELECT id FROM baby_activities
           WHERE baby_id = $2 AND activity_id = $3
           ORDER BY created_at DESC LIMIT 1
         )
       RETURNING *`,
      [feedback, baby_id, activityId]
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('No baby_activity record found. Complete the activity first.');
    }

    this.ok(res, result.rows[0]);
  });

  // ─── Daily Activities ──────────────────────────────────────────────────────

  /**
   * GET /activities/baby/:babyId/daily?date=YYYY-MM-DD
   *
   * Returns 4 activities for the baby on a given date.
   * Activities are chosen based on the baby's current age in months at that date
   * and rotated deterministically by date so each day may show different ones.
   * Once generated and stored they are returned as-is (idempotent).
   */
  getDailyActivities = this.handle(async (req, res) => {
    const babyId  = this.intParam(req, 'babyId');
    const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const lang    = (req.query.lang as string) || 'en';

    // Validate date
    const planDate = new Date(dateStr);
    if (isNaN(planDate.getTime())) throw AppError.badRequest('Invalid date format. Use YYYY-MM-DD.');

    // Check if we already have a plan for this baby/date
    const existing = await database.query(
      `SELECT bda.*, a.*,
              bda.id AS daily_id, bda.is_completed, bda.completed_at, bda.slot
       FROM baby_daily_activities bda
       JOIN activities a ON bda.activity_id = a.id
       WHERE bda.baby_id = $1 AND bda.plan_date = $2
       ORDER BY bda.slot`,
      [babyId, dateStr]
    );

    if (existing.rows.length === 4) {
      return this.ok(res, this.formatDailyRows(existing.rows));
    }

    // Fetch baby to calculate age in months at the plan date
    const babyResult = await database.query(
      'SELECT id, date_of_birth FROM babies WHERE id = $1',
      [babyId]
    );
    if (babyResult.rows.length === 0) throw AppError.notFound('Baby not found.');

    const baby = babyResult.rows[0] as { id: number; date_of_birth: string | null };
    let ageMonths = 6; // default if no birthdate

    if (baby.date_of_birth) {
      const dob    = new Date(baby.date_of_birth);
      const ref    = planDate;
      ageMonths    = Math.max(1,
        (ref.getFullYear() - dob.getFullYear()) * 12
        + (ref.getMonth() - dob.getMonth())
      );
    }

    // Clamp to 1–36
    ageMonths = Math.min(36, Math.max(1, ageMonths));

    // Fetch candidate activities for this age, ordered by category
    const candidates = await database.query(
      `SELECT * FROM activities
       WHERE month_min <= $1 AND month_max >= $1
         AND (language = $2 OR NOT EXISTS (SELECT 1 FROM activities WHERE language = $2))
       ORDER BY category, done_count DESC`,
      [ageMonths, lang]
    );

    const CATEGORIES = ['physical', 'cognitive', 'communication', 'social'];

    // Build date-based numeric seed (YYYYMMDD as integer)
    const seed = parseInt(dateStr.replace(/-/g, ''), 10);

    // For each category pick one activity deterministically by seed + rotation
    const chosen: number[] = [];
    for (let slot = 0; slot < 4; slot++) {
      const cat = CATEGORIES[slot];
      const pool = (candidates.rows as { id: number; category: string }[])
        .filter(r => r.category === cat);
      if (pool.length === 0) continue;
      const idx = (seed + slot * 37) % pool.length;
      chosen.push(pool[idx].id);
    }

    if (chosen.length === 0) {
      throw AppError.notFound('No activities found for this baby\'s age.');
    }

    // Delete any partial rows for this date (idempotent re-generation)
    await database.query(
      'DELETE FROM baby_daily_activities WHERE baby_id = $1 AND plan_date = $2',
      [babyId, dateStr]
    );

    // Insert the chosen activities
    for (let i = 0; i < chosen.length; i++) {
      await database.query(
        `INSERT INTO baby_daily_activities (baby_id, plan_date, activity_id, slot)
         VALUES ($1, $2, $3, $4)`,
        [babyId, dateStr, chosen[i], i + 1]
      );
    }

    // Re-fetch with full activity details
    const fresh = await database.query(
      `SELECT bda.id AS daily_id, bda.is_completed, bda.completed_at, bda.slot,
              a.*
       FROM baby_daily_activities bda
       JOIN activities a ON bda.activity_id = a.id
       WHERE bda.baby_id = $1 AND bda.plan_date = $2
       ORDER BY bda.slot`,
      [babyId, dateStr]
    );

    return this.ok(res, this.formatDailyRows(fresh.rows));
  });

  /**
   * POST /activities/baby/:babyId/daily/:slot/complete?date=YYYY-MM-DD
   * Marks a daily activity slot as completed.
   */
  completeDailySlot = this.handle(async (req, res) => {
    const babyId  = this.intParam(req, 'babyId');
    const slot    = this.intParam(req, 'slot');
    const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);

    if (slot < 1 || slot > 4) throw AppError.badRequest('slot must be 1–4.');

    const result = await database.query(
      `UPDATE baby_daily_activities
       SET is_completed = TRUE, completed_at = NOW()
       WHERE baby_id = $1 AND plan_date = $2 AND slot = $3
       RETURNING *`,
      [babyId, dateStr, slot]
    );

    if (result.rows.length === 0) {
      throw AppError.notFound('Daily activity slot not found. Request daily plan first.');
    }

    this.ok(res, result.rows[0]);
  });

  private formatDailyRows(rows: Record<string, unknown>[]) {
    return rows.map(r => ({
      daily_id:     r['daily_id'],
      slot:         r['slot'],
      is_completed: r['is_completed'],
      completed_at: r['completed_at'],
      activity: {
        id:               r['id'],
        title:            r['title'],
        description:      r['description'],
        category:         r['category'],
        sub_category:     r['sub_category'],
        month_min:        r['month_min'],
        month_max:        r['month_max'],
        duration_minutes: r['duration_minutes'],
        difficulty_level: r['difficulty_level'],
        benefits:         r['benefits'],
        frequency:        r['frequency'],
        materials_needed: r['materials_needed'],
        instructions:     r['instructions'],
        image_url:        r['image_url'],
        video_url:        r['video_url'],
        done_count:       r['done_count'],
        is_premium:       r['is_premium'],
        doctor_verified:  r['doctor_verified'],
      },
    }));
  }

  // ─── Admin CRUD ────────────────────────────────────────────────────────────

  createActivity = this.handle(async (req, res) => {
    const {
      title, description, category, sub_category,
      month_min, month_max, duration_minutes, difficulty_level,
      benefits, frequency, materials_needed, instructions,
      image_url, video_url, is_premium, doctor_verified, language,
    } = req.body as Record<string, unknown>;

    if (!title) throw AppError.badRequest('title is required.');

    const result = await database.query(
      `INSERT INTO activities
         (title, description, category, sub_category,
          month_min, month_max, duration_minutes, difficulty_level,
          benefits, frequency, materials_needed, instructions,
          image_url, video_url, is_premium, doctor_verified, language,
          age_range_min_months, age_range_max_months)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$5,$6)
       RETURNING *`,
      [
        title, description ?? null, category ?? null, sub_category ?? null,
        month_min ?? 1, month_max ?? 36, duration_minutes ?? null, difficulty_level ?? null,
        benefits ?? null, frequency ?? null, materials_needed ?? null, instructions ?? null,
        image_url ?? null, video_url ?? null, is_premium ?? false, doctor_verified ?? false, language ?? 'en',
      ]
    );
    this.created(res, result.rows[0]);
  });

  updateActivity = this.handle(async (req, res) => {
    const id = this.intParam(req, 'id');
    const {
      title, description, category, sub_category,
      month_min, month_max, duration_minutes, difficulty_level,
      benefits, frequency, materials_needed, instructions,
      image_url, video_url, is_premium, doctor_verified,
    } = req.body as Record<string, unknown>;

    const result = await database.query(
      `UPDATE activities SET
         title             = COALESCE($1, title),
         description       = COALESCE($2, description),
         category          = COALESCE($3, category),
         sub_category      = COALESCE($4, sub_category),
         month_min         = COALESCE($5, month_min),
         month_max         = COALESCE($6, month_max),
         age_range_min_months = COALESCE($5, month_min),
         age_range_max_months = COALESCE($6, month_max),
         duration_minutes  = COALESCE($7, duration_minutes),
         difficulty_level  = COALESCE($8, difficulty_level),
         benefits          = COALESCE($9, benefits),
         frequency         = COALESCE($10, frequency),
         materials_needed  = COALESCE($11, materials_needed),
         instructions      = COALESCE($12, instructions),
         image_url         = COALESCE($13, image_url),
         video_url         = COALESCE($14, video_url),
         is_premium        = COALESCE($15, is_premium),
         doctor_verified   = COALESCE($16, doctor_verified),
         updated_at        = CURRENT_TIMESTAMP
       WHERE id = $17 RETURNING *`,
      [
        title ?? null, description ?? null, category ?? null, sub_category ?? null,
        month_min ?? null, month_max ?? null, duration_minutes ?? null, difficulty_level ?? null,
        benefits ?? null, frequency ?? null, materials_needed ?? null, instructions ?? null,
        image_url ?? null, video_url ?? null, is_premium ?? null, doctor_verified ?? null,
        id,
      ]
    );
    if (result.rows.length === 0) throw AppError.notFound('Activity not found.');
    this.ok(res, result.rows[0]);
  });

  deleteActivity = this.handle(async (req, res) => {
    const id = this.intParam(req, 'id');
    const result = await database.query(
      'DELETE FROM activities WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) throw AppError.notFound('Activity not found.');
    this.ok(res, { message: 'Activity deleted.' });
  });
}
