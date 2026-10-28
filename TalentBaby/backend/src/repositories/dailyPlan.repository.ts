import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface DailyPlan {
  id: number;
  baby_id: number;
  plan_date: Date;
  activities: number[]; // Array of activity IDs
  status: string; // 'pending', 'in_progress', 'completed'
  created_at: Date;
  updated_at: Date;
}

export class DailyPlanRepository {
  async findByBabyIdAndDate(babyId: number, date: Date): Promise<DailyPlan | null> {
    const result = await prisma.daily_plans.findFirst({
      where: {
        baby_id: babyId,
        plan_date: date,
      },
    });
    return result as unknown as DailyPlan | null;
  }

  async findByBabyId(babyId: number, startDate?: Date, endDate?: Date): Promise<DailyPlan[]> {
    const where: Prisma.daily_plansWhereInput = { baby_id: babyId };

    if (startDate || endDate) {
      where.plan_date = {};
      if (startDate) (where.plan_date as Prisma.DateTimeFilter).gte = startDate;
      if (endDate) (where.plan_date as Prisma.DateTimeFilter).lte = endDate;
    }

    const results = await prisma.daily_plans.findMany({
      where,
      orderBy: { plan_date: 'desc' },
    });
    return results as unknown as DailyPlan[];
  }

  async create(planData: Partial<DailyPlan>): Promise<DailyPlan> {
    const result = await prisma.daily_plans.create({
      data: {
        baby_id: planData.baby_id!,
        plan_date: planData.plan_date!,
        activities: planData.activities || [],
        status: planData.status || 'pending',
      },
    });
    return result as unknown as DailyPlan;
  }

  async update(id: number, updates: Partial<DailyPlan>): Promise<DailyPlan> {
    const data: Prisma.daily_plansUpdateInput = { updated_at: new Date() };
    if (updates.activities !== undefined) data.activities = updates.activities;
    if (updates.status !== undefined) data.status = updates.status;

    if (Object.keys(data).length === 1) {
      // only updated_at — no real changes, just fetch
      const existing = await prisma.daily_plans.findUnique({ where: { id } });
      if (!existing) throw new Error('Daily plan not found');
      return existing as unknown as DailyPlan;
    }

    const result = await prisma.daily_plans.update({
      where: { id },
      data,
    });
    return result as unknown as DailyPlan;
  }

  async generateDailyPlan(babyId: number, date: Date, activityIds: number[]): Promise<DailyPlan> {
    // Check if plan already exists
    const existing = await this.findByBabyIdAndDate(babyId, date);
    if (existing) {
      // Update existing plan
      return await this.update(existing.id, { activities: activityIds });
    } else {
      // Create new plan
      return await this.create({
        baby_id: babyId,
        plan_date: date,
        activities: activityIds,
        status: 'pending',
      });
    }
  }
}
