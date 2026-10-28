import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface SleepSession {
  id: number;
  baby_id: number;
  sleep_type: string; // 'nap', 'night', 'bedtime'
  start_time: Date;
  end_time?: Date;
  duration_minutes?: number;
  quality_rating?: number; // 1-5
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class SleepRepository {
  async findByBabyId(babyId: number, startDate?: Date, endDate?: Date): Promise<SleepSession[]> {
    const where: Prisma.sleep_sessionsWhereInput = { baby_id: babyId };

    if (startDate || endDate) {
      where.start_time = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const rows = await prisma.sleep_sessions.findMany({
      where,
      orderBy: [{ start_time: 'desc' }],
    });

    return rows as unknown as SleepSession[];
  }

  async findById(id: number): Promise<SleepSession | null> {
    const row = await prisma.sleep_sessions.findUnique({ where: { id } });
    return row as unknown as SleepSession | null;
  }

  async create(sleepData: Partial<SleepSession>): Promise<SleepSession> {
    // Calculate duration if start and end times are provided
    let duration_minutes: number | null = null;
    if (sleepData.start_time && sleepData.end_time) {
      const start = new Date(sleepData.start_time);
      const end = new Date(sleepData.end_time);
      duration_minutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    }

    const row = await prisma.sleep_sessions.create({
      data: {
        baby_id: sleepData.baby_id!,
        sleep_type: sleepData.sleep_type!,
        start_time: sleepData.start_time!,
        end_time: sleepData.end_time ?? null,
        duration_minutes: duration_minutes ?? sleepData.duration_minutes ?? null,
        quality_rating: sleepData.quality_rating ?? null,
        notes: sleepData.notes ?? null,
      },
    });

    return row as unknown as SleepSession;
  }

  async update(id: number, updates: Partial<SleepSession>): Promise<SleepSession> {
    const allowedFields = [
      'sleep_type',
      'start_time',
      'end_time',
      'duration_minutes',
      'quality_rating',
      'notes',
    ] as const;

    const data: Record<string, unknown> = { updated_at: new Date() };
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        data[key] = updates[key] ?? null;
      }
    }

    // Recalculate duration if start_time or end_time changed
    if (updates.start_time || updates.end_time) {
      const existing = await this.findById(id);
      if (existing) {
        const start = updates.start_time ? new Date(updates.start_time) : new Date(existing.start_time);
        const end = updates.end_time
          ? new Date(updates.end_time)
          : existing.end_time
          ? new Date(existing.end_time)
          : null;
        if (end) {
          const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
          data['duration_minutes'] = duration;
        }
      }
    }

    if (Object.keys(data).length === 1) {
      // only updated_at — no real update fields
      const sleep = await this.findById(id);
      if (!sleep) throw new Error('Sleep session not found');
      return sleep;
    }

    const row = await prisma.sleep_sessions.update({
      where: { id },
      data,
    });

    return row as unknown as SleepSession;
  }

  async delete(id: number): Promise<void> {
    const result = await prisma.sleep_sessions.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new Error('Sleep session not found');
    }
  }

  async getStatistics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        sleep_type,
        COUNT(*) as total_sessions,
        AVG(duration_minutes) as avg_duration,
        SUM(duration_minutes) as total_duration,
        AVG(quality_rating) as avg_quality
      FROM sleep_sessions
      WHERE baby_id = ${babyId} AND start_time >= ${startDate} AND start_time <= ${endDate}
      GROUP BY sleep_type
    `);
    return rows;
  }

  async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const row = await prisma.babies.findFirst({
      where: { id: babyId, user_id: userId },
      select: { id: true },
    });
    return row !== null;
  }
}
