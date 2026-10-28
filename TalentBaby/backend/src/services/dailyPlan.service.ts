import { DailyPlanRepository, DailyPlan } from '../repositories/dailyPlan.repository';
import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class DailyPlanService {
  private dailyPlanRepository: DailyPlanRepository;

  constructor() {
    this.dailyPlanRepository = new DailyPlanRepository();
  }

  async getDailyPlan(babyId: number, userId: number, date: Date): Promise<DailyPlan> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    let plan = await this.dailyPlanRepository.findByBabyIdAndDate(babyId, date);

    // If no plan exists, generate one
    if (!plan) {
      plan = await this.generateDailyPlan(babyId, date);
    }

    // Get activity details
    if (plan.activities && plan.activities.length > 0) {
      const activitiesResult = await database.query(
        `SELECT * FROM activities WHERE id = ANY($1::int[])`,
        [plan.activities]
      );
      return { ...plan, activityDetails: activitiesResult.rows } as any;
    }

    return plan;
  }

  async generateDailyPlan(babyId: number, date: Date): Promise<DailyPlan> {
    // Get baby's age in months
    const babyResult = await database.query('SELECT birth_date FROM babies WHERE id = $1', [babyId]);
    if (babyResult.rows.length === 0) {
      throw new Error('Baby not found');
    }

    const birthDate = new Date(babyResult.rows[0].birth_date);
    const ageInMonths = Math.floor((date.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // Get baby's talent assessments to personalize recommendations
    const talentResult = await database.query(
      `SELECT talent_category_id FROM talent_assessments 
       WHERE baby_id = $1 
       ORDER BY assessment_date DESC 
       LIMIT 3`,
      [babyId]
    );
    const talentCategoryIds = talentResult.rows.map((r: any) => r.talent_category_id);

    // Get recommended activities based on age and talents
    let query = `
      SELECT * FROM activities 
      WHERE age_range_min_months <= $1 AND age_range_max_months >= $1
    `;
    const params: any[] = [ageInMonths];
    let paramIndex = 2;

    // If we have talent categories, prefer activities that match
    if (talentCategoryIds.length > 0) {
      // This is simplified - in production, you'd have a better matching algorithm
      query += ` ORDER BY RANDOM() LIMIT 5`;
    } else {
      query += ` ORDER BY RANDOM() LIMIT 5`;
    }

    const activitiesResult = await database.query(query, params);
    const activityIds = activitiesResult.rows.map((a: any) => a.id);

    // Generate the plan
    const plan = await this.dailyPlanRepository.generateDailyPlan(babyId, date, activityIds);

    // Get daily tips for activities
    const tips = await this.getDailyActivityTips(babyId, ageInMonths);

    return { ...plan, tips } as any;
  }

  async getDailyActivityTips(babyId: number, ageInMonths: number): Promise<any> {
    // Get tips from daily updates
    const { DailyUpdateService } = await import('./dailyUpdate.service');
    const dailyUpdateService = new DailyUpdateService();
    const updates = await dailyUpdateService.getDailyUpdates(babyId);

    // Get activity recommendations
    const activityTips = updates.updates?.activity || null;

    // Get talent-based recommendations
    const talentResult = await database.query(
      `SELECT tc.name, ta.score 
       FROM talent_assessments ta
       JOIN talent_categories tc ON ta.talent_category_id = tc.id
       WHERE ta.baby_id = $1
       ORDER BY ta.assessment_date DESC
       LIMIT 1`,
      [babyId]
    );

    let talentTip = null;
    if (talentResult.rows.length > 0) {
      const topTalent = talentResult.rows[0];
      if (topTalent.score >= 70) {
        talentTip = `Your baby shows strong potential in ${topTalent.name}. Try activities that challenge this talent area.`;
      } else {
        talentTip = `Focus on activities that support ${topTalent.name} development.`;
      }
    }

    return {
      activity_tip: activityTips,
      talent_tip: talentTip,
      development_info: updates.updates?.development || null,
      safety_reminder: updates.updates?.safety || null,
    };
  }

  async updateDailyPlan(planId: number, userId: number, updates: Partial<DailyPlan>): Promise<DailyPlan> {
    const plan = await this.dailyPlanRepository.findByBabyIdAndDate(
      updates.baby_id!,
      updates.plan_date!
    );
    
    if (!plan || plan.id !== planId) {
      const error: AppError = new Error('Daily plan not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const isOwner = await this.verifyBabyOwnership(plan.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return await this.dailyPlanRepository.update(planId, updates);
  }

  async getDailyPlans(babyId: number, userId: number, startDate?: Date, endDate?: Date): Promise<DailyPlan[]> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.dailyPlanRepository.findByBabyId(babyId, startDate, endDate);
  }

  private async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const result = await database.query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    return result.rows.length > 0;
  }
}
