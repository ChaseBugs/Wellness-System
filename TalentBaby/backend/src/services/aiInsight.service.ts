import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class AIInsightService {
  async generateInsight(babyId: number, userId: number, insightType: string): Promise<any> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Generate insight based on type
    let insight: any = {};

    if (insightType === 'talent') {
      insight = await this.generateTalentInsight(babyId);
    } else if (insightType === 'development') {
      insight = await this.generateDevelopmentInsight(babyId);
    } else if (insightType === 'recommendation') {
      insight = await this.generateRecommendationInsight(babyId);
    }

    // Save insight to database
    const result = await database.query(
      `INSERT INTO ai_insights 
       (baby_id, insight_type, title, content, related_talent_category_id, related_activity_ids)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        babyId,
        insightType,
        insight.title,
        insight.content,
        insight.related_talent_category_id || null,
        insight.related_activity_ids || [],
      ]
    );

    return result.rows[0];
  }

  async getInsights(babyId: number, userId: number, insightType?: string): Promise<any[]> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    let query = 'SELECT * FROM ai_insights WHERE baby_id = $1';
    const params: any[] = [babyId];

    if (insightType) {
      query += ' AND insight_type = $2';
      params.push(insightType);
    }

    query += ' ORDER BY generated_at DESC';

    const result = await database.query(query, params);
    return result.rows;
  }

  private async generateTalentInsight(babyId: number): Promise<any> {
    // Get latest talent assessments
    const assessmentsResult = await database.query(
      `SELECT ta.*, tc.name as talent_category_name 
       FROM talent_assessments ta
       JOIN talent_categories tc ON ta.talent_category_id = tc.id
       WHERE ta.baby_id = $1
       ORDER BY ta.assessment_date DESC
       LIMIT 3`,
      [babyId]
    );

    if (assessmentsResult.rows.length === 0) {
      return {
        title: 'Start Talent Assessments',
        content: 'Complete talent assessments to get personalized insights about your baby\'s development.',
      };
    }

    const topTalent = assessmentsResult.rows[0];
    return {
      title: `Strong ${topTalent.talent_category_name} Potential`,
      content: `Based on recent assessments, your baby shows strong potential in ${topTalent.talent_category_name}. Continue engaging with activities that support this area.`,
      related_talent_category_id: topTalent.talent_category_id,
    };
  }

  private async generateDevelopmentInsight(babyId: number): Promise<any> {
    // Get recent milestones
    const milestonesResult = await database.query(
      `SELECT COUNT(*) as count, milestone_type 
       FROM milestones 
       WHERE baby_id = $1 
       GROUP BY milestone_type`,
      [babyId]
    );

    const totalMilestones = milestonesResult.rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0);

    return {
      title: 'Development Progress',
      content: `Your baby has achieved ${totalMilestones} milestones across different areas. Keep tracking progress to see development patterns.`,
    };
  }

  private async generateRecommendationInsight(babyId: number): Promise<any> {
    // Get baby age
    const babyResult = await database.query('SELECT birth_date FROM babies WHERE id = $1', [babyId]);
    if (babyResult.rows.length === 0) {
      throw new Error('Baby not found');
    }

    const birthDate = new Date(babyResult.rows[0].birth_date);
    const ageInMonths = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // Get recommended activities
    const activitiesResult = await database.query(
      `SELECT id FROM activities 
       WHERE age_range_min_months <= $1 AND age_range_max_months >= $1 
       LIMIT 5`,
      [ageInMonths]
    );

    return {
      title: 'Personalized Activity Recommendations',
      content: `Based on your baby's age (${ageInMonths} months), we recommend trying these activities to support development.`,
      related_activity_ids: activitiesResult.rows.map((r: any) => r.id),
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
