import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class ReportService {
  async generateGrowthReport(babyId: number, userId: number, startDate: Date, endDate: Date): Promise<any> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const growthResult = await database.query(
      `SELECT * FROM growth_records 
       WHERE baby_id = $1 AND record_date >= $2 AND record_date <= $3
       ORDER BY record_date ASC`,
      [babyId, startDate, endDate]
    );

    return {
      type: 'growth',
      period: { start: startDate, end: endDate },
      records: growthResult.rows,
      summary: this.calculateGrowthSummary(growthResult.rows),
    };
  }

  async generateFeedingReport(babyId: number, userId: number, startDate: Date, endDate: Date): Promise<any> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const feedingResult = await database.query(
      `SELECT 
        feeding_type,
        COUNT(*) as total_feedings,
        AVG(duration_minutes) as avg_duration,
        SUM(amount_ml) as total_amount_ml
       FROM feedings
       WHERE baby_id = $1 AND feeding_date >= $2 AND feeding_date <= $3
       GROUP BY feeding_type`,
      [babyId, startDate, endDate]
    );

    return {
      type: 'feeding',
      period: { start: startDate, end: endDate },
      summary: feedingResult.rows,
    };
  }

  async generateSleepReport(babyId: number, userId: number, startDate: Date, endDate: Date): Promise<any> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const sleepResult = await database.query(
      `SELECT 
        sleep_type,
        COUNT(*) as total_sessions,
        AVG(duration_minutes) as avg_duration,
        SUM(duration_minutes) as total_duration
       FROM sleep_sessions
       WHERE baby_id = $1 AND start_time >= $2 AND start_time <= $3
       GROUP BY sleep_type`,
      [babyId, startDate, endDate]
    );

    return {
      type: 'sleep',
      period: { start: startDate, end: endDate },
      summary: sleepResult.rows,
    };
  }

  async generateDevelopmentReport(babyId: number, userId: number): Promise<any> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Get milestones
    const milestonesResult = await database.query(
      'SELECT * FROM milestones WHERE baby_id = $1 ORDER BY achieved_date DESC',
      [babyId]
    );

    // Get talent assessments
    const assessmentsResult = await database.query(
      `SELECT ta.*, tc.name as talent_category_name 
       FROM talent_assessments ta
       JOIN talent_categories tc ON ta.talent_category_id = tc.id
       WHERE ta.baby_id = $1
       ORDER BY ta.assessment_date DESC`,
      [babyId]
    );

    return {
      type: 'development',
      milestones: milestonesResult.rows,
      talent_assessments: assessmentsResult.rows,
    };
  }

  private calculateGrowthSummary(records: any[]): any {
    if (records.length === 0) {
      return { avg_weight: 0, avg_height: 0, avg_head_circumference: 0 };
    }

    const weights = records.filter((r) => r.weight_kg).map((r) => parseFloat(r.weight_kg));
    const heights = records.filter((r) => r.height_cm).map((r) => parseFloat(r.height_cm));
    const headCircs = records.filter((r) => r.head_circumference_cm).map((r) => parseFloat(r.head_circumference_cm));

    return {
      avg_weight: weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0,
      avg_height: heights.length > 0 ? heights.reduce((a, b) => a + b, 0) / heights.length : 0,
      avg_head_circumference: headCircs.length > 0 ? headCircs.reduce((a, b) => a + b, 0) / headCircs.length : 0,
      total_records: records.length,
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
