import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface ActivityMilestone {
  id: number;
  baby_id: number;
  activity_id: number;
  milestone_type: string; // 'first_completion', 'streak', 'mastery', 'custom'
  milestone_date: Date;
  description?: string;
  metadata?: any;
  created_at: Date;
}

export class ActivityMilestoneService {
  async trackActivityMilestone(
    babyId: number,
    userId: number,
    activityId: number,
    milestoneType: string,
    description?: string
  ): Promise<ActivityMilestone> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Check if this is a first completion
    if (milestoneType === 'first_completion') {
      const existing = await database.query(
        `SELECT id FROM activity_milestones 
         WHERE baby_id = $1 AND activity_id = $2 AND milestone_type = 'first_completion'`,
        [babyId, activityId]
      );

      if (existing.rows.length > 0) {
        const error: AppError = new Error('First completion milestone already exists');
        error.statusCode = 409;
        error.isOperational = true;
        throw error;
      }
    }

    // Create milestone
    const result = await database.query(
      `INSERT INTO activity_milestones 
       (baby_id, activity_id, milestone_type, milestone_date, description)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)
       RETURNING *`,
      [babyId, activityId, milestoneType, description || null]
    );

    return result.rows[0];
  }

  async getActivityMilestones(babyId: number, userId: number, activityId?: number): Promise<ActivityMilestone[]> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    let query = 'SELECT * FROM activity_milestones WHERE baby_id = $1';
    const params: any[] = [babyId];

    if (activityId) {
      query += ' AND activity_id = $2';
      params.push(activityId);
    }

    query += ' ORDER BY milestone_date DESC';

    const result = await database.query(query, params);
    return result.rows;
  }

  async checkAndCreateStreakMilestone(babyId: number, activityId: number): Promise<ActivityMilestone | null> {
    // Check for consecutive days of activity completion
    const streakResult = await database.query(
      `SELECT COUNT(DISTINCT DATE(completed_date)) as streak_days
       FROM baby_activities
       WHERE baby_id = $1 AND activity_id = $2 AND completed_date IS NOT NULL
       AND completed_date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(completed_date)
       ORDER BY DATE(completed_date) DESC`,
      [babyId, activityId]
    );

    const streakDays = streakResult.rows.length;

    // Create milestone for 3, 7, 14, 30 day streaks
    if ([3, 7, 14, 30].includes(streakDays)) {
      const existing = await database.query(
        `SELECT id FROM activity_milestones 
         WHERE baby_id = $1 AND activity_id = $2 
         AND milestone_type = 'streak' 
         AND metadata->>'streak_days' = $3`,
        [babyId, activityId, streakDays.toString()]
      );

      if (existing.rows.length === 0) {
        const result = await database.query(
          `INSERT INTO activity_milestones 
           (baby_id, activity_id, milestone_type, milestone_date, description, metadata)
           VALUES ($1, $2, 'streak', CURRENT_DATE, $3, $4)
           RETURNING *`,
          [
            babyId,
            activityId,
            `${streakDays}-day activity streak achieved!`,
            JSON.stringify({ streak_days: streakDays }),
          ]
        );
        return result.rows[0];
      }
    }

    return null;
  }

  private async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const result = await database.query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    return result.rows.length > 0;
  }
}
