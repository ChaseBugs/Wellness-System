import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { SubscriptionService } from '../services/subscription.service';
import { AppError } from './errorHandler';

const subscriptionService = new SubscriptionService();

/**
 * Middleware to check if user has premium subscription
 */
export const requirePremium = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      const error: AppError = new Error('Authentication required');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const isPremium = await subscriptionService.isPremiumUser(userId);

    if (!isPremium) {
      const error: AppError = new Error('Premium subscription required');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
};
