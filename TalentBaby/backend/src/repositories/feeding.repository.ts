import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Feeding {
  id: number;
  baby_id: number;
  feeding_type: string; // 'breastfeeding', 'formula', 'solid', 'mixed'
  feeding_date: Date;
  start_time?: Date;
  end_time?: Date;
  duration_minutes?: number;
  amount_ml?: number;
  amount_oz?: number;
  side?: string; // 'left', 'right', 'both'
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class FeedingRepository {
  async findByBabyId(babyId: number, startDate?: Date, endDate?: Date): Promise<Feeding[]> {
    const where: Prisma.feedingsWhereInput = { baby_id: babyId };

    if (startDate || endDate) {
      where.feeding_date = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const rows = await prisma.feedings.findMany({
      where,
      orderBy: [{ feeding_date: 'desc' }, { start_time: 'desc' }],
    });

    return rows as unknown as Feeding[];
  }

  async findById(id: number): Promise<Feeding | null> {
    const row = await prisma.feedings.findUnique({ where: { id } });
    return row as unknown as Feeding | null;
  }

  async create(feedingData: Partial<Feeding>): Promise<Feeding> {
    const row = await prisma.feedings.create({
      data: {
        baby_id: feedingData.baby_id!,
        feeding_type: feedingData.feeding_type!,
        feeding_date: feedingData.feeding_date!,
        start_time: feedingData.start_time ?? null,
        end_time: feedingData.end_time ?? null,
        duration_minutes: feedingData.duration_minutes ?? null,
        amount_ml: feedingData.amount_ml ?? null,
        amount_oz: feedingData.amount_oz ?? null,
        side: feedingData.side ?? null,
        notes: feedingData.notes ?? null,
      },
    });

    return row as unknown as Feeding;
  }

  async update(id: number, updates: Partial<Feeding>): Promise<Feeding> {
    const allowedFields = [
      'feeding_type',
      'feeding_date',
      'start_time',
      'end_time',
      'duration_minutes',
      'amount_ml',
      'amount_oz',
      'side',
      'notes',
    ] as const;

    const data: Record<string, unknown> = { updated_at: new Date() };
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        data[key] = updates[key] ?? null;
      }
    }

    if (Object.keys(data).length === 1) {
      // only updated_at was going to be set — no real update fields
      const feeding = await this.findById(id);
      if (!feeding) throw new Error('Feeding record not found');
      return feeding;
    }

    const row = await prisma.feedings.update({
      where: { id },
      data,
    });

    return row as unknown as Feeding;
  }

  async delete(id: number): Promise<void> {
    const result = await prisma.feedings.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new Error('Feeding record not found');
    }
  }

  async getStatistics(babyId: number, startDate: Date, endDate: Date): Promise<any> {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        feeding_type,
        COUNT(*) as total_feedings,
        AVG(duration_minutes) as avg_duration,
        SUM(amount_ml) as total_amount_ml,
        SUM(amount_oz) as total_amount_oz
      FROM feedings
      WHERE baby_id = ${babyId} AND feeding_date >= ${startDate} AND feeding_date <= ${endDate}
      GROUP BY feeding_type
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
