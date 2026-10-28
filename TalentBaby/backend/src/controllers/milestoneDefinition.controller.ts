import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { MilestoneDefinitionService } from '../services/milestoneDefinition.service';

const service = new MilestoneDefinitionService();

export class MilestoneDefinitionController {
  /** GET /milestone-definitions/month/:month — mobile: all definitions for a month grouped by type */
  async getByMonth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const month = parseInt(req.params.month, 10);
      const data  = await service.getByMonth(month);
      res.status(200).json({ message: 'Milestone definitions retrieved', data });
    } catch (error) {
      next(error);
    }
  }

  /** GET /milestone-definitions — admin list with optional ?month=&milestone_type= filters */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const month         = req.query.month         ? parseInt(req.query.month as string, 10) : undefined;
      const milestoneType = req.query.milestone_type ? (req.query.milestone_type as string)    : undefined;
      const data = await service.list(month, milestoneType);
      res.status(200).json({ message: 'Milestone definitions retrieved', data });
    } catch (error) {
      next(error);
    }
  }

  /** GET /milestone-definitions/:id */
  async getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id   = parseInt(req.params.id, 10);
      const data = await service.getOne(id);
      res.status(200).json({ message: 'Milestone definition retrieved', data });
    } catch (error) {
      if ((error as Error).message === 'Milestone definition not found') {
        res.status(404).json({ error: 'Milestone definition not found' });
        return;
      }
      next(error);
    }
  }

  /** POST /milestone-definitions */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { month, milestone_type, title, description, question, related_activity, display_order, doctor_verified } = req.body;
      const data = await service.create({ month, milestone_type, title, description, question, related_activity, display_order, doctor_verified });
      res.status(201).json({ message: 'Milestone definition created', data });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /milestone-definitions/:id */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { month, milestone_type, title, description, question, related_activity, display_order, doctor_verified } = req.body;
      const data = await service.update(id, { month, milestone_type, title, description, question, related_activity, display_order, doctor_verified });
      res.status(200).json({ message: 'Milestone definition updated', data });
    } catch (error) {
      if ((error as Error).message === 'Milestone definition not found') {
        res.status(404).json({ error: 'Milestone definition not found' });
        return;
      }
      next(error);
    }
  }

  /** DELETE /milestone-definitions/:id */
  async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await service.remove(id);
      res.status(200).json({ message: 'Milestone definition deleted' });
    } catch (error) {
      next(error);
    }
  }
}
