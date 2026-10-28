import { prisma } from '../config/prisma';

export interface KickSession {
  id: number;
  pregnancy_id: number;
  session_date: Date;
  start_time: Date;
  end_time?: Date;
  kick_count: number;
  duration_minutes?: number;
  notes?: string;
  created_at: Date;
}

export class KickSessionRepository {
  async findByPregnancyId(pregnancyId: number): Promise<KickSession[]> {
    const rows = await prisma.kick_sessions.findMany({
      where: { pregnancy_id: pregnancyId },
      orderBy: [{ session_date: 'desc' }, { start_time: 'desc' }],
    });
    return rows as unknown as KickSession[];
  }

  async findById(id: number): Promise<KickSession | null> {
    const row = await prisma.kick_sessions.findUnique({ where: { id } });
    return row as unknown as KickSession | null;
  }

  async create(sessionData: Partial<KickSession>): Promise<KickSession> {
    // Calculate duration if start and end times are provided
    let duration_minutes: number | null = null;
    if (sessionData.start_time && sessionData.end_time) {
      const start = new Date(sessionData.start_time);
      const end = new Date(sessionData.end_time);
      duration_minutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    }

    const row = await prisma.kick_sessions.create({
      data: {
        pregnancy_id: sessionData.pregnancy_id!,
        session_date: sessionData.session_date!,
        start_time: sessionData.start_time!,
        end_time: sessionData.end_time ?? null,
        kick_count: sessionData.kick_count ?? 0,
        duration_minutes: duration_minutes,
        notes: sessionData.notes ?? null,
      },
    });
    return row as unknown as KickSession;
  }

  async update(id: number, updates: Partial<KickSession>): Promise<KickSession> {
    const allowedFields = ['start_time', 'end_time', 'kick_count', 'duration_minutes', 'notes'];
    const data: Record<string, any> = {};

    for (const key of allowedFields) {
      if (key in updates) {
        data[key] = (updates as any)[key];
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
          data.duration_minutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        }
      }
    }

    if (Object.keys(data).length === 0) {
      const session = await this.findById(id);
      if (!session) throw new Error('Kick session not found');
      return session;
    }

    const result = await prisma.kick_sessions.updateMany({
      where: { id },
      data,
    });

    if (result.count === 0) throw new Error('Kick session not found');

    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    const result = await prisma.kick_sessions.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new Error('Kick session not found');
    }
  }
}
