import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ActivityMilestoneService } from '../services/activityMilestone.service';
import { logger } from '../utils/logger';

export class ActivityMilestoneController {
  private activityMilestoneService: ActivityMilestoneService;

  constructor() {
    this.activityMilestoneService = new ActivityMilestoneService();
  }

  async trackMilestone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.body.baby_id, 10);
      const activityId = parseInt(req.body.activity_id, 10);
      const milestoneType = req.body.milestone_type;
      const description = req.body.description;

      const milestone = await this.activityMilestoneService.trackActivityMilestone(
        babyId,
        userId,
        activityId,
        milestoneType,
        description
      );

      logger.info('Activity milestone tracked', { userId, babyId, activityId, milestoneId: milestone.id });

      res.status(201).json({
        message: 'Activity milestone tracked successfully',
        data: milestone,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMilestones(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);
      const activityId = req.query.activityId ? parseInt(req.query.activityId as string, 10) : undefined;

      const milestones = await this.activityMilestoneService.getActivityMilestones(babyId, userId, activityId);

      res.status(200).json({
        message: 'Activity milestones retrieved successfully',
        data: milestones,
      });
    } catch (error) {
      next(error);
    }
  }
}
