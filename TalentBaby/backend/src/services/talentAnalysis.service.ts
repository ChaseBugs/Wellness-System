import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class TalentAnalysisService {
  async analyzeBabyTalent(babyId: number, userId: number): Promise<any> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Get all talent assessments
    const assessmentsResult = await database.query(
      `SELECT ta.*, tc.name as talent_category_name, tc.description as talent_category_description
       FROM talent_assessments ta
       JOIN talent_categories tc ON ta.talent_category_id = tc.id
       WHERE ta.baby_id = $1
       ORDER BY ta.assessment_date DESC`,
      [babyId]
    );

    if (assessmentsResult.rows.length === 0) {
      return {
        message: 'No assessments found. Complete talent assessments to get analysis.',
        recommendations: ['Complete at least one talent assessment to get personalized analysis.'],
      };
    }

    // Analyze talent strengths
    const strengths = this.identifyStrengths(assessmentsResult.rows);
    const areasForGrowth = this.identifyAreasForGrowth(assessmentsResult.rows);
    const recommendations = this.generateTalentRecommendations(assessmentsResult.rows, strengths, areasForGrowth);
    const progressTrends = await this.analyzeProgressTrends(babyId);

    return {
      overall_analysis: {
        total_assessments: assessmentsResult.rows.length,
        average_score: this.calculateAverageScore(assessmentsResult.rows),
        top_talents: strengths.slice(0, 3),
        developing_talents: areasForGrowth.slice(0, 3),
      },
      strengths,
      areas_for_growth: areasForGrowth,
      recommendations,
      progress_trends: progressTrends,
      detailed_scores: assessmentsResult.rows.map((a: any) => ({
        talent_category: a.talent_category_name,
        score: a.score,
        assessment_date: a.assessment_date,
        recommendations: a.recommendations,
      })),
    };
  }

  private identifyStrengths(assessments: any[]): any[] {
    return assessments
      .filter((a) => a.score >= 70)
      .sort((a, b) => b.score - a.score)
      .map((a) => ({
        talent_category: a.talent_category_name,
        score: a.score,
        level: this.getTalentLevel(a.score),
      }));
  }

  private identifyAreasForGrowth(assessments: any[]): any[] {
    return assessments
      .filter((a) => a.score < 70)
      .sort((a, b) => a.score - b.score)
      .map((a) => ({
        talent_category: a.talent_category_name,
        score: a.score,
        level: this.getTalentLevel(a.score),
        improvement_potential: 'high',
      }));
  }

  private getTalentLevel(score: number): string {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Strong';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Developing';
    return 'Early Stage';
  }

  private calculateAverageScore(assessments: any[]): number {
    if (assessments.length === 0) return 0;
    const sum = assessments.reduce((acc, a) => acc + (a.score || 0), 0);
    return Math.round(sum / assessments.length);
  }

  private generateTalentRecommendations(assessments: any[], strengths: any[], areasForGrowth: any[]): string[] {
    const recommendations: string[] = [];

    if (strengths.length > 0) {
      recommendations.push(
        `Continue nurturing ${strengths[0].talent_category} - your baby shows strong potential in this area.`
      );
    }

    if (areasForGrowth.length > 0) {
      recommendations.push(
        `Focus on activities that support ${areasForGrowth[0].talent_category} development.`
      );
    }

    recommendations.push('Complete regular assessments to track talent development over time.');
    recommendations.push('Try activities from different talent categories to ensure well-rounded development.');

    return recommendations;
  }

  private async analyzeProgressTrends(babyId: number): Promise<any> {
    const result = await database.query(
      `SELECT 
        tc.name as talent_category,
        ta.assessment_date,
        ta.score
       FROM talent_assessments ta
       JOIN talent_categories tc ON ta.talent_category_id = tc.id
       WHERE ta.baby_id = $1
       ORDER BY ta.assessment_date ASC`,
      [babyId]
    );

    // Group by talent category and calculate trends
    const trends: any = {};
    result.rows.forEach((row: any) => {
      if (!trends[row.talent_category]) {
        trends[row.talent_category] = [];
      }
      trends[row.talent_category].push({
        date: row.assessment_date,
        score: row.score,
      });
    });

    // Calculate trend direction for each category
    const trendAnalysis: any[] = [];
    Object.keys(trends).forEach((category) => {
      const scores = trends[category];
      if (scores.length >= 2) {
        const firstScore = scores[0].score;
        const lastScore = scores[scores.length - 1].score;
        const change = lastScore - firstScore;
        trendAnalysis.push({
          talent_category: category,
          trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
          change,
          data_points: scores,
        });
      }
    });

    return trendAnalysis;
  }

  private async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const result = await database.query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    return result.rows.length > 0;
  }
}
