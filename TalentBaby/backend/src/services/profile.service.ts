import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class ProfileService {
  async getBabyProfiles(userId: number): Promise<any[]> {
    const result = await database.query(
      'SELECT * FROM babies WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async switchActiveProfile(userId: number, babyId: number): Promise<any> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Update user's active baby preference (if you have a user_preferences table)
    // For now, we'll just return the baby profile
    const babyResult = await database.query('SELECT * FROM babies WHERE id = $1', [babyId]);
    return babyResult.rows[0];
  }

  async getProfileSpecificData(babyId: number, userId: number, dataType: string): Promise<any> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    switch (dataType) {
      case 'summary':
        return await this.getProfileSummary(babyId);
      case 'stats':
        return await this.getProfileStats(babyId);
      case 'recent':
        return await this.getRecentActivity(babyId);
      default:
        throw new Error('Invalid data type');
    }
  }

  private async getProfileSummary(babyId: number): Promise<any> {
    const [baby, growth, milestones, activities] = await Promise.all([
      database.query('SELECT * FROM babies WHERE id = $1', [babyId]),
      database.query(
        'SELECT * FROM growth_records WHERE baby_id = $1 ORDER BY record_date DESC LIMIT 1',
        [babyId]
      ),
      database.query(
        'SELECT COUNT(*) as count FROM milestones WHERE baby_id = $1',
        [babyId]
      ),
      database.query(
        'SELECT COUNT(*) as count FROM baby_activities WHERE baby_id = $1 AND completed_date IS NOT NULL',
        [babyId]
      ),
    ]);

    return {
      baby: baby.rows[0],
      latest_growth: growth.rows[0] || null,
      total_milestones: parseInt(milestones.rows[0].count),
      completed_activities: parseInt(activities.rows[0].count),
    };
  }

  private async getProfileStats(babyId: number): Promise<any> {
    const [feedings, sleep, diaper] = await Promise.all([
      database.query(
        `SELECT COUNT(*) as count, AVG(amount_ml) as avg_amount 
         FROM feedings 
         WHERE baby_id = $1 AND feeding_date >= CURRENT_DATE - INTERVAL '7 days'`,
        [babyId]
      ),
      database.query(
        `SELECT COUNT(*) as count, AVG(duration_minutes) as avg_duration 
         FROM sleep_sessions 
         WHERE baby_id = $1 AND start_time >= CURRENT_DATE - INTERVAL '7 days'`,
        [babyId]
      ),
      database.query(
        `SELECT COUNT(*) as count 
         FROM diaper_changes 
         WHERE baby_id = $1 AND change_time >= CURRENT_DATE - INTERVAL '7 days'`,
        [babyId]
      ),
    ]);

    return {
      feedings: {
        count: parseInt(feedings.rows[0].count),
        avg_amount: parseFloat(feedings.rows[0].avg_amount) || 0,
      },
      sleep: {
        count: parseInt(sleep.rows[0].count),
        avg_duration: parseFloat(sleep.rows[0].avg_duration) || 0,
      },
      diaper_changes: parseInt(diaper.rows[0].count),
    };
  }

  private async getRecentActivity(babyId: number): Promise<any> {
    const [recentFeedings, recentSleep, recentMilestones] = await Promise.all([
      database.query(
        'SELECT * FROM feedings WHERE baby_id = $1 ORDER BY feeding_date DESC LIMIT 5',
        [babyId]
      ),
      database.query(
        'SELECT * FROM sleep_sessions WHERE baby_id = $1 ORDER BY start_time DESC LIMIT 5',
        [babyId]
      ),
      database.query(
        'SELECT * FROM milestones WHERE baby_id = $1 ORDER BY achieved_date DESC LIMIT 5',
        [babyId]
      ),
    ]);

    return {
      recent_feedings: recentFeedings.rows,
      recent_sleep: recentSleep.rows,
      recent_milestones: recentMilestones.rows,
    };
  }

  private async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const result = await database.query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    return result.rows.length > 0;
  }
}
