import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BabyMilestoneService } from '../services/babyMilestone.service';
import { MilestoneStatus } from '../repositories/babyMilestone.repository';

const service = new BabyMilestoneService();

export class BabyMilestoneController {
  /** GET /baby-milestones/:babyId — all records for a baby, optionally filtered by ?month= */
  async getForBaby(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const month  = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const data   = await service.getForBaby(babyId, month);
      res.status(200).json({ message: 'Baby milestones retrieved', data });
    } catch (error) {
      next(error);
    }
  }

  /** GET /baby-milestones/:babyId/report */
  async getReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const babyId = parseInt(req.params.babyId, 10);
      const month  = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const data   = await service.getReport(babyId, month);
      res.status(200).json({ message: 'Milestone report generated', data });
    } catch (error) {
      next(error);
    }
  }

  /** POST /baby-milestones — upsert (insert or update on conflict) */
  async upsert(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { baby_id, milestone_definition_id, status, achieved_date, notes } = req.body;
      const data = await service.upsert(
        baby_id,
        milestone_definition_id,
        status as MilestoneStatus,
        achieved_date,
        notes
      );
      res.status(200).json({ message: 'Baby milestone saved', data });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /baby-milestones/:id */
  async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await service.remove(id);
      res.status(200).json({ message: 'Baby milestone record deleted' });
    } catch (error) {
      next(error);
    }
  }
}
