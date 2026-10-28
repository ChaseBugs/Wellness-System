import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class BirthPlanService {
  async getBirthPlan(userId: number, pregnancyId?: number): Promise<any> {
    let query = 'SELECT * FROM birth_plans WHERE user_id = $1';
    const params: any[] = [userId];

    if (pregnancyId) {
      query += ' AND pregnancy_id = $2';
      params.push(pregnancyId);
    }

    query += ' ORDER BY created_at DESC LIMIT 1';

    const result = await database.query(query, params);
    return result.rows[0] || null;
  }

  async createBirthPlan(userId: number, birthPlanData: { pregnancy_id?: number; plan_content: string }): Promise<any> {
    const result = await database.query(
      `INSERT INTO birth_plans (user_id, pregnancy_id, plan_content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, birthPlanData.pregnancy_id || null, birthPlanData.plan_content]
    );
    return result.rows[0];
  }

  async updateBirthPlan(birthPlanId: number, userId: number, planContent: string): Promise<any> {
    const result = await database.query(
      `UPDATE birth_plans 
       SET plan_content = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
      [planContent, birthPlanId, userId]
    );

    if (result.rows.length === 0) {
      const error: AppError = new Error('Birth plan not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return result.rows[0];
  }

  async deleteBirthPlan(birthPlanId: number, userId: number): Promise<void> {
    const result = await database.query(
      'DELETE FROM birth_plans WHERE id = $1 AND user_id = $2',
      [birthPlanId, userId]
    );

    if (result.rowCount === 0) {
      const error: AppError = new Error('Birth plan not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
  }
}
