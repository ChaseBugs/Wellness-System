import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Reminder {
  id: number;
  user_id: number;
  baby_id?: number;
  reminder_type: string; // 'feeding', 'sleep', 'diaper', 'appointment', 'vaccination', 'activity', 'custom'
  title: string;
  description?: string;
  reminder_time: Date;
  reminder_date?: Date;
  is_recurring: boolean;
  recurrence_pattern?: string; // 'daily', 'weekly', 'custom'
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ReminderRepository {
  async findByUserId(userId: number, isActive?: boolean): Promise<Reminder[]> {
    const where: Prisma.remindersWhereInput = { user_id: userId };
    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const rows = await prisma.reminders.findMany({
      where,
      orderBy: { reminder_time: 'asc' },
    });
    return rows as unknown as Reminder[];
  }

  async findByBabyId(babyId: number): Promise<Reminder[]> {
    const rows = await prisma.reminders.findMany({
      where: { baby_id: babyId, is_active: true },
      orderBy: { reminder_time: 'asc' },
    });
    return rows as unknown as Reminder[];
  }

  async findById(id: number, userId: number): Promise<Reminder | null> {
    const row = await prisma.reminders.findFirst({
      where: { id, user_id: userId },
    });
    return row as unknown as Reminder | null;
  }

  async create(reminderData: Partial<Reminder>): Promise<Reminder> {
    const row = await prisma.reminders.create({
      data: {
        user_id: reminderData.user_id!,
        baby_id: reminderData.baby_id ?? null,
        reminder_type: reminderData.reminder_type!,
        title: reminderData.title!,
        description: reminderData.description ?? null,
        reminder_time: reminderData.reminder_time!,
        reminder_date: reminderData.reminder_date ?? null,
        is_recurring: reminderData.is_recurring ?? false,
        recurrence_pattern: reminderData.recurrence_pattern ?? null,
        is_active: reminderData.is_active !== undefined ? reminderData.is_active : true,
      },
    });
    return row as unknown as Reminder;
  }

  async update(id: number, userId: number, updates: Partial<Reminder>): Promise<Reminder> {
    const allowedFields = [
      'reminder_type',
      'title',
      'description',
      'reminder_time',
      'reminder_date',
      'is_recurring',
      'recurrence_pattern',
      'is_active',
    ];
    const data: Record<string, any> = { updated_at: new Date() };

    for (const key of allowedFields) {
      if (key in updates) {
        data[key] = (updates as any)[key];
      }
    }

    if (Object.keys(data).length === 1) {
      // Only updated_at — no real changes
      const reminder = await this.findById(id, userId);
      if (!reminder) throw new Error('Reminder not found');
      return reminder;
    }

    const result = await prisma.reminders.updateMany({
      where: { id, user_id: userId },
      data,
    });

    if (result.count === 0) throw new Error('Reminder not found');

    const updated = await this.findById(id, userId);
    return updated!;
  }

  async delete(id: number, userId: number): Promise<void> {
    const result = await prisma.reminders.deleteMany({
      where: { id, user_id: userId },
    });
    if (result.count === 0) {
      throw new Error('Reminder not found');
    }
  }

  async getUpcomingReminders(userId: number, limit: number = 10): Promise<Reminder[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const rows = await prisma.reminders.findMany({
      where: {
        user_id: userId,
        is_active: true,
        OR: [{ reminder_date: null }, { reminder_date: { lte: today } }],
        reminder_time: { gte: now },
      },
      orderBy: { reminder_time: 'asc' },
      take: limit,
    });
    return rows as unknown as Reminder[];
  }
}
