import { SubscriptionRepository, Subscription } from '../repositories/subscription.repository';
import { AppError } from '../middleware/errorHandler';

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async getSubscription(userId: number): Promise<Subscription | null> {
    return await this.subscriptionRepository.findByUserId(userId);
  }

  async createSubscription(userId: number, subscriptionData: Partial<Subscription>): Promise<Subscription> {
    // Check if user already has an active subscription
    const existing = await this.subscriptionRepository.findByUserId(userId);
    if (existing && existing.status === 'active') {
      const error: AppError = new Error('User already has an active subscription');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    return await this.subscriptionRepository.create({
      ...subscriptionData,
      user_id: userId,
    });
  }

  async updateSubscription(subscriptionId: number, userId: number, updates: Partial<Subscription>): Promise<Subscription> {
    return await this.subscriptionRepository.update(subscriptionId, userId, updates);
  }

  async cancelSubscription(subscriptionId: number, userId: number): Promise<Subscription> {
    return await this.subscriptionRepository.cancel(subscriptionId, userId);
  }

  async isPremiumUser(userId: number): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    return subscription !== null && subscription.status === 'active' && subscription.plan_type !== 'free';
  }
}
