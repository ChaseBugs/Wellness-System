import { prisma } from '../config/prisma';

export interface Pregnancy {
  id: number;
  user_id: number;
  due_date: Date;
  lmp_date?: Date;
  conception_date?: Date;
  ultrasound_date?: Date;
  current_week?: number;
  current_day?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class PregnancyRepository {
  async findByUserId(userId: number): Promise<Pregnancy | null> {
    const row = await prisma.pregnancies.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return row as unknown as Pregnancy | null;
  }

  async findById(id: number, userId: number): Promise<Pregnancy | null> {
    const row = await prisma.pregnancies.findFirst({
      where: { id, user_id: userId },
    });
    return row as unknown as Pregnancy | null;
  }

  async create(pregnancyData: Partial<Pregnancy>): Promise<Pregnancy> {
    // Calculate current week and day
    const dueDate = new Date(pregnancyData.due_date!);
    const today = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksPregnant = 40 - Math.ceil(daysUntilDue / 7);
    const daysPregnant = daysUntilDue % 7;

    const row = await prisma.pregnancies.create({
      data: {
        user_id: pregnancyData.user_id!,
        due_date: pregnancyData.due_date!,
        lmp_date: pregnancyData.lmp_date ?? null,
        conception_date: pregnancyData.conception_date ?? null,
        ultrasound_date: pregnancyData.ultrasound_date ?? null,
        current_week: weeksPregnant,
        current_day: daysPregnant,
        notes: pregnancyData.notes ?? null,
      },
    });
    return row as unknown as Pregnancy;
  }

  async update(id: number, userId: number, updates: Partial<Pregnancy>): Promise<Pregnancy> {
    const allowedFields = ['due_date', 'lmp_date', 'conception_date', 'ultrasound_date', 'notes'];
    const data: Record<string, any> = { updated_at: new Date() };

    for (const key of allowedFields) {
      if (key in updates) {
        data[key] = (updates as any)[key];
      }
    }

    // Recalculate week and day if due_date changed
    if (updates.due_date) {
      const dueDate = new Date(updates.due_date);
      const today = new Date();
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      data.current_week = 40 - Math.ceil(daysUntilDue / 7);
      data.current_day = daysUntilDue % 7;
    }

    if (Object.keys(data).length === 1) {
      // Only updated_at — no real changes
      const pregnancy = await this.findById(id, userId);
      if (!pregnancy) throw new Error('Pregnancy not found');
      return pregnancy;
    }

    const row = await prisma.pregnancies.updateMany({
      where: { id, user_id: userId },
      data,
    });

    if (row.count === 0) throw new Error('Pregnancy not found');

    const updated = await this.findById(id, userId);
    return updated!;
  }

  async delete(id: number, userId: number): Promise<void> {
    const result = await prisma.pregnancies.deleteMany({
      where: { id, user_id: userId },
    });
    if (result.count === 0) {
      throw new Error('Pregnancy not found');
    }
  }
}
