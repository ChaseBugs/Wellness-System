import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { database } from '../config/database';

export class TalentController {
  async getCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await database.query('SELECT * FROM talent_categories ORDER BY id');
      res.status(200).json({ message: 'Categories retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async getAssessments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const result = await database.query(
        'SELECT * FROM talent_assessments WHERE baby_id = $1 ORDER BY assessment_date DESC',
        [babyId]
      );
      res.status(200).json({ message: 'Assessments retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async createAssessment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { baby_id, talent_category_id, assessment_date, age_in_months, score, observations } = req.body;
      const result = await database.query(
        `INSERT INTO talent_assessments (baby_id, talent_category_id, assessment_date, age_in_months, score, observations)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [baby_id, talent_category_id, assessment_date, age_in_months, score, observations]
      );
      res.status(201).json({ message: 'Assessment created', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async getProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const result = await database.query(
        'SELECT * FROM talent_progress WHERE baby_id = $1',
        [babyId]
      );
      res.status(200).json({ message: 'Progress retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async getMissions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const result = await database.query(
        'SELECT * FROM talent_missions WHERE baby_id = $1 ORDER BY start_date DESC',
        [babyId]
      );
      res.status(200).json({ message: 'Missions retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async createMission(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { baby_id, talent_category_id, mission_title, mission_description, start_date } = req.body;
      const result = await database.query(
        `INSERT INTO talent_missions (baby_id, talent_category_id, mission_title, mission_description, start_date)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [baby_id, talent_category_id, mission_title, mission_description, start_date]
      );
      res.status(201).json({ message: 'Mission created', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
}
