import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface AssessmentQuestion {
  id: number;
  talent_category_id: number;
  question_text: string;
  question_type: string; // 'multiple_choice', 'scale', 'yes_no', 'text'
  options: any; // JSONB
  age_range_min_months?: number;
  age_range_max_months?: number;
  weight: number;
  created_at: Date;
}

export interface AssessmentAnswer {
  id: number;
  assessment_id: number;
  question_id: number;
  answer_value: string;
  created_at: Date;
}

export class AssessmentRepository {
  async getQuestionsByTalentCategory(
    talentCategoryId: number,
    ageInMonths: number
  ): Promise<AssessmentQuestion[]> {
    const results = await prisma.assessment_questions.findMany({
      where: {
        talent_category_id: talentCategoryId,
        OR: [
          { age_range_min_months: null },
          { age_range_min_months: { lte: ageInMonths } },
        ],
        AND: [
          {
            OR: [
              { age_range_max_months: null },
              { age_range_max_months: { gte: ageInMonths } },
            ],
          },
        ],
      },
      orderBy: { id: 'asc' },
    });
    return results as unknown as AssessmentQuestion[];
  }

  async saveAnswers(assessmentId: number, answers: { question_id: number; answer_value: string }[]): Promise<void> {
    for (const answer of answers) {
      // ON CONFLICT DO NOTHING — use upsert or executeRaw
      await prisma.$executeRaw`
        INSERT INTO assessment_answers (assessment_id, question_id, answer_value)
        VALUES (${assessmentId}, ${answer.question_id}, ${answer.answer_value})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  async getAnswersByAssessment(assessmentId: number): Promise<AssessmentAnswer[]> {
    const results = await prisma.assessment_answers.findMany({
      where: { assessment_id: assessmentId },
    });
    return results as unknown as AssessmentAnswer[];
  }

  async calculateScore(assessmentId: number): Promise<number> {
    // JOIN query — use $queryRaw
    const assessmentRows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT ta.*, tc.id as talent_category_id
      FROM talent_assessments ta
      JOIN talent_categories tc ON ta.talent_category_id = tc.id
      WHERE ta.id = ${assessmentId}
    `);

    if (assessmentRows.length === 0) {
      throw new Error('Assessment not found');
    }

    const assessment = assessmentRows[0];
    const answers = await this.getAnswersByAssessment(assessmentId);

    // Get questions with weights
    const questions = await prisma.assessment_questions.findMany({
      where: { talent_category_id: assessment.talent_category_id },
      select: { id: true, weight: true, question_type: true, options: true },
    });

    let totalScore = 0;
    let totalWeight = 0;

    for (const question of questions) {
      const answer = answers.find((a) => a.question_id === question.id);
      if (answer) {
        let questionScore = 0;

        // Calculate score based on question type
        if (question.question_type === 'scale') {
          // Scale 1-5 or 1-10
          questionScore = parseInt(answer.answer_value) || 0;
        } else if (question.question_type === 'yes_no') {
          questionScore = answer.answer_value === 'yes' ? 5 : 0;
        } else if (question.question_type === 'multiple_choice') {
          // Each option has a score value
          const options = (question.options as any) || {};
          questionScore = options[answer.answer_value]?.score || 0;
        }

        const weight = question.weight ?? 1;
        totalScore += questionScore * weight;
        totalWeight += weight;
      }
    }

    // Calculate final score (0-100)
    const finalScore = totalWeight > 0 ? Math.round((totalScore / (totalWeight * 5)) * 100) : 0;
    return Math.min(100, Math.max(0, finalScore));
  }
}
