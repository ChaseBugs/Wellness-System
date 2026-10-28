import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ChecklistService } from '../services/checklist.service';
import { logger } from '../utils/logger';

export class ChecklistController {
  private checklistService: ChecklistService;

  constructor() {
    this.checklistService = new ChecklistService();
  }

  async getChecklists(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const checklistType = req.query.type as string | undefined;

      const checklists = await this.checklistService.getChecklists(userId, checklistType);

      res.status(200).json({
        message: 'Checklists retrieved successfully',
        data: checklists,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const checklistId = parseInt(req.params.id, 10);

      const checklist = await this.checklistService.getChecklist(checklistId, userId);
      const items = await this.checklistService.getChecklistItems(checklistId, userId);

      res.status(200).json({
        message: 'Checklist retrieved successfully',
        data: {
          ...checklist,
          items,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const checklist = await this.checklistService.createChecklist(userId, req.body);

      logger.info('Checklist created', { userId, checklistId: checklist.id });

      res.status(201).json({
        message: 'Checklist created successfully',
        data: checklist,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const checklistId = parseInt(req.params.id, 10);
      const checklist = await this.checklistService.updateChecklist(checklistId, userId, req.body);

      res.status(200).json({
        message: 'Checklist updated successfully',
        data: checklist,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const checklistId = parseInt(req.params.id, 10);
      await this.checklistService.deleteChecklist(checklistId, userId);

      res.status(200).json({
        message: 'Checklist deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getChecklistItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const checklistId = parseInt(req.params.checklistId, 10);
      const items = await this.checklistService.getChecklistItems(checklistId, userId);

      res.status(200).json({
        message: 'Checklist items retrieved successfully',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  async addChecklistItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const checklistId = parseInt(req.body.checklist_id, 10);
      const item = await this.checklistService.addChecklistItem(checklistId, userId, req.body);

      res.status(201).json({
        message: 'Checklist item added successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChecklistItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const itemId = parseInt(req.params.itemId, 10);
      const checklistId = parseInt(req.body.checklist_id, 10);
      const item = await this.checklistService.updateChecklistItem(itemId, checklistId, userId, req.body);

      res.status(200).json({
        message: 'Checklist item updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteChecklistItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const itemId = parseInt(req.params.itemId, 10);
      const checklistId = parseInt(req.params.checklistId, 10);
      await this.checklistService.deleteChecklistItem(itemId, checklistId, userId);

      res.status(200).json({
        message: 'Checklist item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
