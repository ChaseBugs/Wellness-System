import { database } from '../config/database';
import { AssessmentRepository } from '../repositories/assessment.repository';
import { AppError } from '../middleware/errorHandler';

export class TalentAssessmentService {
  private assessmentRepository: AssessmentRepository;

  constructor() {
    this.assessmentRepository = new AssessmentRepository();
  }

  async getQuestions(babyId: number, talentCategoryId: number, userId: number): Promise<any[]> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Get baby's age in months
    const babyResult = await database.query('SELECT birth_date FROM babies WHERE id = $1', [babyId]);
    if (babyResult.rows.length === 0) {
      throw new Error('Baby not found');
    }

    const birthDate = new Date(babyResult.rows[0].birth_date);
    const today = new Date();
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    return await this.assessmentRepository.getQuestionsByTalentCategory(talentCategoryId, ageInMonths);
  }

  async createAssessment(
    babyId: number,
    talentCategoryId: number,
    userId: number,
    answers: { question_id: number; answer_value: string }[]
  ): Promise<any> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Get baby's age in months
    const babyResult = await database.query('SELECT birth_date FROM babies WHERE id = $1', [babyId]);
    const birthDate = new Date(babyResult.rows[0].birth_date);
    const today = new Date();
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // Create assessment
    const assessmentResult = await database.query(
      `INSERT INTO talent_assessments (baby_id, talent_category_id, assessment_date, age_in_months)
       VALUES ($1, $2, CURRENT_DATE, $3)
       RETURNING *`,
      [babyId, talentCategoryId, ageInMonths]
    );

    const assessment = assessmentResult.rows[0];

    // Save answers
    await this.assessmentRepository.saveAnswers(assessment.id, answers);

    // Calculate score
    const score = await this.assessmentRepository.calculateScore(assessment.id);

    // Update assessment with score
    const updatedResult = await database.query(
      `UPDATE talent_assessments SET score = $1 WHERE id = $2 RETURNING *`,
      [score, assessment.id]
    );

    // Generate recommendations based on score
    const recommendations = await this.generateRecommendations(talentCategoryId, score, ageInMonths);

    // Update with recommendations
    const finalResult = await database.query(
      `UPDATE talent_assessments SET recommendations = $1 WHERE id = $2 RETURNING *`,
      [recommendations, assessment.id]
    );

    return finalResult.rows[0];
  }

  async getAssessmentHistory(babyId: number, talentCategoryId: number, userId: number): Promise<any[]> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const result = await database.query(
      `SELECT * FROM talent_assessments 
       WHERE baby_id = $1 AND talent_category_id = $2 
       ORDER BY assessment_date DESC`,
      [babyId, talentCategoryId]
    );

    return result.rows;
  }

  private async generateRecommendations(talentCategoryId: number, score: number, ageInMonths: number): Promise<string> {
    // Enhanced recommendation generation with activity suggestions
    const categoryResult = await database.query(
      'SELECT name FROM talent_categories WHERE id = $1',
      [talentCategoryId]
    );
    const categoryName = categoryResult.rows[0]?.name || 'this area';

    // Get recommended activities for this talent category
    const activitiesResult = await database.query(
      `SELECT a.title, a.description 
       FROM activities a
       JOIN activity_talent_categories atc ON a.id = atc.activity_id
       WHERE atc.talent_category_id = $1 
       AND a.age_range_min_months <= $2 AND a.age_range_max_months >= $2
       LIMIT 3`,
      [talentCategoryId, ageInMonths]
    );

    let recommendation = '';
    if (score >= 80) {
      recommendation = `Your baby shows exceptional potential in ${categoryName}. Continue providing challenging activities to maintain and enhance their skills.`;
    } else if (score >= 70) {
      recommendation = `Your baby shows strong potential in ${categoryName}. Keep engaging them with activities that build on their strengths.`;
    } else if (score >= 60) {
      recommendation = `Your baby is developing well in ${categoryName}. Try introducing more activities to further enhance their skills.`;
    } else {
      recommendation = `Your baby is still developing in ${categoryName}. Focus on age-appropriate activities to support growth.`;
    }

    // Add activity suggestions
    if (activitiesResult.rows.length > 0) {
      recommendation += ` Suggested activities: ${activitiesResult.rows.map((a: any) => a.title).join(', ')}.`;
    }

    return recommendation;
  }

  private async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const result = await database.query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    return result.rows.length > 0;
  }
}
