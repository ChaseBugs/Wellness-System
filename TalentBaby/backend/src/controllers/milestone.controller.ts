import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { database } from '../config/database';

export class MilestoneController {
  async getMilestones(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const result = await database.query(
        'SELECT * FROM milestones WHERE baby_id = $1 ORDER BY created_at DESC',
        [babyId]
      );
      res.status(200).json({ message: 'Milestones retrieved', data: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async createMilestone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { baby_id, milestone_type, title, description, achieved_date } = req.body;
      const result = await database.query(
        `INSERT INTO milestones (baby_id, milestone_type, title, description, achieved_date)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [baby_id, milestone_type, title, description, achieved_date]
      );
      res.status(201).json({ message: 'Milestone created', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async updateMilestone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const updates = req.body;
      const result = await database.query(
        `UPDATE milestones SET title = $1, description = $2, achieved_date = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [updates.title, updates.description, updates.achieved_date, id]
      );
      res.status(200).json({ message: 'Milestone updated', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async deleteMilestone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await database.query('DELETE FROM milestones WHERE id = $1', [id]);
      res.status(200).json({ message: 'Milestone deleted' });
    } catch (error) {
      next(error);
    }
  }
}
