import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SubscriptionService } from '../services/subscription.service';
import { logger } from '../utils/logger';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  async getSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const subscription = await this.subscriptionService.getSubscription(userId);

      res.status(200).json({
        message: 'Subscription retrieved successfully',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const subscription = await this.subscriptionService.createSubscription(userId, req.body);

      logger.info('Subscription created', { userId, subscriptionId: subscription.id });

      res.status(201).json({
        message: 'Subscription created successfully',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const subscriptionId = parseInt(req.params.id, 10);
      const subscription = await this.subscriptionService.updateSubscription(subscriptionId, userId, req.body);

      res.status(200).json({
        message: 'Subscription updated successfully',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const subscriptionId = parseInt(req.params.id, 10);
      const subscription = await this.subscriptionService.cancelSubscription(subscriptionId, userId);

      res.status(200).json({
        message: 'Subscription cancelled successfully',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkPremiumStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const isPremium = await this.subscriptionService.isPremiumUser(userId);

      res.status(200).json({
        message: 'Premium status retrieved successfully',
        data: { isPremium },
      });
    } catch (error) {
      next(error);
    }
  }
}
