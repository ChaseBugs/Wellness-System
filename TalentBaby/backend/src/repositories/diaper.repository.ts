import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface DiaperChange {
  id: number;
  baby_id: number;
  change_time: Date;
  diaper_type: string; // 'wet', 'dirty', 'both'
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class DiaperRepository {
  async findByBabyId(babyId: number, startDate?: Date, endDate?: Date): Promise<DiaperChange[]> {
    const where: Prisma.diaper_changesWhereInput = { baby_id: babyId };

    if (startDate || endDate) {
      where.change_time = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const rows = await prisma.diaper_changes.findMany({
      where,
      orderBy: [{ change_time: 'desc' }],
    });

    return rows as unknown as DiaperChange[];
  }

  async findById(id: number): Promise<DiaperChange | null> {
    const row = await prisma.diaper_changes.findUnique({ where: { id } });
    return row as unknown as DiaperChange | null;
  }

  async create(diaperData: Partial<DiaperChange>): Promise<DiaperChange> {
    const row = await prisma.diaper_changes.create({
      data: {
        baby_id: diaperData.baby_id!,
        change_time: diaperData.change_time!,
        diaper_type: diaperData.diaper_type!,
        notes: diaperData.notes ?? null,
      },
    });

    return row as unknown as DiaperChange;
  }

  async update(id: number, updates: Partial<DiaperChange>): Promise<DiaperChange> {
    const allowedFields = ['change_time', 'diaper_type', 'notes'] as const;

    const data: Record<string, unknown> = { updated_at: new Date() };
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        data[key] = updates[key] ?? null;
      }
    }

    if (Object.keys(data).length === 1) {
      // only updated_at — no real update fields
      const diaper = await this.findById(id);
      if (!diaper) throw new Error('Diaper change not found');
      return diaper;
    }

    const row = await prisma.diaper_changes.update({
      where: { id },
      data,
    });

    return row as unknown as DiaperChange;
  }

  async delete(id: number): Promise<void> {
    const result = await prisma.diaper_changes.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new Error('Diaper change not found');
    }
  }

  async getDailySummary(babyId: number, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        COUNT(*) FILTER (WHERE diaper_type = 'wet') as wet_count,
        COUNT(*) FILTER (WHERE diaper_type = 'dirty') as dirty_count,
        COUNT(*) FILTER (WHERE diaper_type = 'both') as both_count,
        COUNT(*) as total_changes
      FROM diaper_changes
      WHERE baby_id = ${babyId} AND change_time >= ${startOfDay} AND change_time <= ${endOfDay}
    `);

    return rows[0] || { wet_count: 0, dirty_count: 0, both_count: 0, total_changes: 0 };
  }

  async getStatistics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        diaper_type,
        COUNT(*) as count
      FROM diaper_changes
      WHERE baby_id = ${babyId} AND change_time >= ${startDate} AND change_time <= ${endDate}
      GROUP BY diaper_type
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
