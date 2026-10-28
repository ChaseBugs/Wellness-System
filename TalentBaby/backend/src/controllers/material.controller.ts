import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { database } from '../config/database';

export class MaterialController {
  async getMaterials(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, category, age_months } = req.query;
      let query = 'SELECT * FROM materials WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (type) {
        query += ` AND type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (age_months) {
        query += ` AND age_range_min_months <= $${paramIndex} AND age_range_max_months >= $${paramIndex}`;
        params.push(parseInt(age_months as string, 10));
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await database.query(query, params);
      res.status(200).json({ message: 'Materials retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const result = await database.query(
        `SELECT bmr.*, m.* FROM baby_material_recommendations bmr
         JOIN materials m ON bmr.material_id = m.id
         WHERE bmr.baby_id = $1 ORDER BY bmr.recommended_date DESC`,
        [babyId]
      );
      res.status(200).json({ message: 'Recommendations retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }
}
