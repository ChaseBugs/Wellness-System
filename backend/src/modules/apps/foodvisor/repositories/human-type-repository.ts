import type pg from "pg";
import { camelizeRow, camelizeRows } from "../../../../utils/sql.js";
import type { Classification } from "../calculators/human-type-classifier.js";
import type { IHumanTypeRepository } from "../domain/IHumanTypeRepository.js";
import type { HumanTypeQuestion, HumanTypeSurvey } from "../models/human-type.js";

const QUESTION_COLUMNS = `id, question_id, sort_order AS "order", category_key, category_name_ko, category_name_en, prompt_ko,
  input_type, scale_min, scale_max, scale_min_label_ko, scale_max_label_ko, options, answers, weight, is_core,
  use_for_classification, use_for_recommendation`;

export class HumanTypeRepository implements IHumanTypeRepository {
  constructor(private pool: pg.Pool) {}

  async listQuestions(): Promise<HumanTypeQuestion[]> {
    const result = await this.pool.query(`SELECT ${QUESTION_COLUMNS} FROM foodvisor.human_type_questions ORDER BY sort_order`);
    return camelizeRows<HumanTypeQuestion>(result.rows);
  }

  async findQuestions(questionIds: string[]): Promise<HumanTypeQuestion[]> {
    const result = await this.pool.query(
      `SELECT ${QUESTION_COLUMNS} FROM foodvisor.human_type_questions WHERE question_id = ANY($1::text[])`,
      [questionIds]
    );
    return camelizeRows<HumanTypeQuestion>(result.rows);
  }

  async createSurvey(userId: string, result: Classification, notes: string | null): Promise<HumanTypeSurvey> {
    const inserted = await this.pool.query(
      `INSERT INTO foodvisor.human_type_surveys
         (user_id, status, classifier_version, answers, scores, result_type, result_label_ko, second_type, confidence,
          total_possible, recommendation_tags, caution_tags, summary_ko, notes)
       VALUES ($1, 'completed', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [userId, ...this.resultValues(result), notes]
    );
    return camelizeRow<HumanTypeSurvey>(inserted.rows[0]);
  }

  async listSurveysForUser(userId: string): Promise<HumanTypeSurvey[]> {
    const result = await this.pool.query(
      "SELECT * FROM foodvisor.human_type_surveys WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    return camelizeRows<HumanTypeSurvey>(result.rows);
  }

  async findSurvey(id: string): Promise<HumanTypeSurvey | null> {
    const result = await this.pool.query("SELECT * FROM foodvisor.human_type_surveys WHERE id = $1", [id]);
    return result.rows[0] ? camelizeRow<HumanTypeSurvey>(result.rows[0]) : null;
  }

  async applyClassification(id: string, result: Classification, status: HumanTypeSurvey["status"]): Promise<HumanTypeSurvey> {
    const updated = await this.pool.query(
      `UPDATE foodvisor.human_type_surveys SET
         classifier_version = $2, answers = $3, scores = $4, result_type = $5, result_label_ko = $6, second_type = $7,
         confidence = $8, total_possible = $9, recommendation_tags = $10, caution_tags = $11, summary_ko = $12,
         status = $13, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, ...this.resultValues(result), status]
    );
    return camelizeRow<HumanTypeSurvey>(updated.rows[0]);
  }

  private resultValues(result: Classification): unknown[] {
    return [
      result.classifierVersion,
      JSON.stringify(result.answers),
      JSON.stringify(result.scores),
      result.resultType,
      result.resultLabelKo,
      result.secondType,
      result.confidence,
      result.totalPossible,
      result.recommendationTags,
      result.cautionTags,
      result.summaryKo
    ];
  }
}
