import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class AdvancedAnalyticsService {
  async getComprehensiveAnalytics(babyId: number, userId: number, startDate: Date, endDate: Date): Promise<any> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Get all analytics data
    const [feedingStats, sleepStats, diaperStats, growthStats, milestoneStats, activityStats] = await Promise.all([
      this.getFeedingAnalytics(babyId, startDate, endDate),
      this.getSleepAnalytics(babyId, startDate, endDate),
      this.getDiaperAnalytics(babyId, startDate, endDate),
      this.getGrowthAnalytics(babyId, startDate, endDate),
      this.getMilestoneAnalytics(babyId, startDate, endDate),
      this.getActivityAnalytics(babyId, startDate, endDate),
    ]);

    return {
      period: { start: startDate, end: endDate },
      feeding: feedingStats,
      sleep: sleepStats,
      diaper: diaperStats,
      growth: growthStats,
      milestones: milestoneStats,
      activities: activityStats,
      summary: this.generateSummary(feedingStats, sleepStats, diaperStats, growthStats, milestoneStats, activityStats),
    };
  }

  private async getFeedingAnalytics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const result = await database.query(
      `SELECT 
        COUNT(*) as total_feedings,
        AVG(duration_minutes) as avg_duration,
        SUM(amount_ml) as total_amount_ml,
        feeding_type,
        COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM feeding_date) BETWEEN 6 AND 12) as morning_count,
        COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM feeding_date) BETWEEN 12 AND 18) as afternoon_count,
        COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM feeding_date) BETWEEN 18 AND 24) as evening_count
       FROM feedings
       WHERE baby_id = $1 AND feeding_date >= $2 AND feeding_date <= $3
       GROUP BY feeding_type`,
      [babyId, startDate, endDate]
    );
    return result.rows;
  }

  private async getSleepAnalytics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const result = await database.query(
      `SELECT 
        COUNT(*) as total_sessions,
        AVG(duration_minutes) as avg_duration,
        SUM(duration_minutes) as total_minutes,
        sleep_type,
        AVG(quality_rating) as avg_quality
       FROM sleep_sessions
       WHERE baby_id = $1 AND start_time >= $2 AND start_time <= $3
       GROUP BY sleep_type`,
      [babyId, startDate, endDate]
    );
    return result.rows;
  }

  private async getDiaperAnalytics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const result = await database.query(
      `SELECT 
        COUNT(*) as total_changes,
        COUNT(*) FILTER (WHERE diaper_type = 'wet') as wet_count,
        COUNT(*) FILTER (WHERE diaper_type = 'dirty') as dirty_count,
        COUNT(*) FILTER (WHERE diaper_type = 'both') as both_count
       FROM diaper_changes
       WHERE baby_id = $1 AND change_time >= $2 AND change_time <= $3`,
      [babyId, startDate, endDate]
    );
    return result.rows[0] || {};
  }

  private async getGrowthAnalytics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const result = await database.query(
      `SELECT 
        COUNT(*) as total_records,
        AVG(weight_kg) as avg_weight,
        AVG(height_cm) as avg_height,
        MAX(weight_kg) as max_weight,
        MAX(height_cm) as max_height,
        MIN(weight_kg) as min_weight,
        MIN(height_cm) as min_height
       FROM growth_records
       WHERE baby_id = $1 AND record_date >= $2 AND record_date <= $3`,
      [babyId, startDate, endDate]
    );
    return result.rows[0] || {};
  }

  private async getMilestoneAnalytics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const result = await database.query(
      `SELECT 
        COUNT(*) as total_milestones,
        milestone_type,
        COUNT(*) as count
       FROM milestones
       WHERE baby_id = $1 AND achieved_date >= $2 AND achieved_date <= $3
       GROUP BY milestone_type`,
      [babyId, startDate, endDate]
    );
    return result.rows;
  }

  private async getActivityAnalytics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const result = await database.query(
      `SELECT 
        COUNT(*) as total_activities,
        COUNT(*) FILTER (WHERE completed_date IS NOT NULL) as completed_count,
        AVG(rating) as avg_rating
       FROM baby_activities
       WHERE baby_id = $1 AND assigned_date >= $2 AND assigned_date <= $3`,
      [babyId, startDate, endDate]
    );
    return result.rows[0] || {};
  }

  private generateSummary(...stats: any[]): any {
    return {
      overall_health: 'Good',
      development_pace: 'On Track',
      recommendations: [
        'Continue tracking daily activities',
        'Review milestones regularly',
        'Maintain consistent feeding and sleep schedules',
      ],
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
