import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Subscription {
  id: number;
  user_id: number;
  plan_type: string; // 'free', 'premium', 'family'
  status: string; // 'active', 'cancelled', 'expired'
  start_date: Date;
  end_date?: Date;
  payment_provider?: string;
  payment_id?: string;
  created_at: Date;
  updated_at: Date;
}

export class SubscriptionRepository {
  async findByUserId(userId: number): Promise<Subscription | null> {
    const result = await prisma.subscriptions.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return result as unknown as Subscription | null;
  }

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const result = await prisma.subscriptions.create({
      data: {
        user_id: subscriptionData.user_id!,
        plan_type: subscriptionData.plan_type!,
        status: subscriptionData.status || 'active',
        start_date: subscriptionData.start_date!,
        end_date: subscriptionData.end_date || null,
        payment_provider: subscriptionData.payment_provider || null,
        payment_id: subscriptionData.payment_id || null,
      },
    });
    return result as unknown as Subscription;
  }

  async update(id: number, userId: number, updates: Partial<Subscription>): Promise<Subscription> {
    const data: Prisma.subscriptionsUpdateInput = { updated_at: new Date() };
    if (updates.plan_type !== undefined) data.plan_type = updates.plan_type;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.end_date !== undefined) data.end_date = updates.end_date;
    if (updates.payment_provider !== undefined) data.payment_provider = updates.payment_provider;
    if (updates.payment_id !== undefined) data.payment_id = updates.payment_id;

    if (Object.keys(data).length === 1) {
      const existing = await prisma.subscriptions.findFirst({
        where: { id, user_id: userId },
      });
      if (!existing) throw new Error('Subscription not found');
      return existing as unknown as Subscription;
    }

    const result = await prisma.subscriptions.updateMany({
      where: { id, user_id: userId },
      data,
    });

    if (result.count === 0) throw new Error('Subscription not found');

    const updated = await prisma.subscriptions.findFirst({ where: { id, user_id: userId } });
    return updated as unknown as Subscription;
  }

  async cancel(id: number, userId: number): Promise<Subscription> {
    const result = await prisma.subscriptions.updateMany({
      where: { id, user_id: userId },
      data: {
        status: 'cancelled',
        updated_at: new Date(),
      },
    });

    if (result.count === 0) {
      throw new Error('Subscription not found');
    }

    const updated = await prisma.subscriptions.findFirst({ where: { id, user_id: userId } });
    return updated as unknown as Subscription;
  }
}
