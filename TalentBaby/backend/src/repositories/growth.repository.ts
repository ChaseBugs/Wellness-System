import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface GrowthRecord {
  id: number;
  baby_id: number;
  record_date: Date;
  age_in_days: number;
  weight_kg?: number;
  height_cm?: number;
  head_circumference_cm?: number;
  bmi?: number;
  percentile_weight?: number;
  percentile_height?: number;
  percentile_head_circumference?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class GrowthRepository {
  async findByBabyId(babyId: number, startDate?: Date, endDate?: Date): Promise<GrowthRecord[]> {
    const where: Prisma.growth_recordsWhereInput = { baby_id: babyId };

    if (startDate || endDate) {
      where.record_date = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const rows = await prisma.growth_records.findMany({
      where,
      orderBy: [{ record_date: 'asc' }],
    });

    return rows as unknown as GrowthRecord[];
  }

  async findById(id: number): Promise<GrowthRecord | null> {
    const row = await prisma.growth_records.findUnique({ where: { id } });
    return row as unknown as GrowthRecord | null;
  }

  async create(growthData: {
    baby_id: number;
    record_date: Date;
    age_in_days: number;
    weight_kg?: number;
    height_cm?: number;
    head_circumference_cm?: number;
    percentile_weight?: number;
    percentile_height?: number;
    percentile_head_circumference?: number;
    notes?: string;
  }): Promise<GrowthRecord> {
    // Calculate BMI if weight and height are provided
    let bmi: number | null = null;
    if (growthData.weight_kg && growthData.height_cm) {
      const heightInMeters = growthData.height_cm / 100;
      bmi = growthData.weight_kg / (heightInMeters * heightInMeters);
    }

    const row = await prisma.growth_records.create({
      data: {
        baby_id: growthData.baby_id,
        record_date: growthData.record_date,
        age_in_days: growthData.age_in_days,
        weight_kg: growthData.weight_kg ?? null,
        height_cm: growthData.height_cm ?? null,
        head_circumference_cm: growthData.head_circumference_cm ?? null,
        bmi: bmi,
        percentile_weight: growthData.percentile_weight ?? null,
        percentile_height: growthData.percentile_height ?? null,
        percentile_head_circumference: growthData.percentile_head_circumference ?? null,
        notes: growthData.notes ?? null,
      },
    });

    return row as unknown as GrowthRecord;
  }

  async update(id: number, updates: Partial<GrowthRecord>): Promise<GrowthRecord> {
    const data: Record<string, unknown> = { updated_at: new Date() };

    // Copy all allowed fields (everything except id, created_at, baby_id)
    for (const key of Object.keys(updates) as Array<keyof GrowthRecord>) {
      if (key !== 'id' && key !== 'created_at' && key !== 'baby_id') {
        data[key] = updates[key] ?? null;
      }
    }

    // Recalculate BMI if weight or height changed
    if (updates.weight_kg !== undefined || updates.height_cm !== undefined) {
      const existing = await this.findById(id);
      if (existing) {
        const weight = updates.weight_kg ?? existing.weight_kg;
        const height = updates.height_cm ?? existing.height_cm;
        if (weight && height) {
          const heightInMeters = height / 100;
          const bmi = weight / (heightInMeters * heightInMeters);
          data['bmi'] = bmi;
        }
      }
    }

    if (Object.keys(data).length === 1) {
      // only updated_at — no real update fields
      const record = await this.findById(id);
      if (!record) throw new Error('Growth record not found');
      return record;
    }

    const row = await prisma.growth_records.update({
      where: { id },
      data,
    });

    return row as unknown as GrowthRecord;
  }

  async delete(id: number): Promise<void> {
    const result = await prisma.growth_records.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new Error('Growth record not found');
    }
  }

  async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const row = await prisma.babies.findFirst({
      where: { id: babyId, user_id: userId },
      select: { id: true },
    });
    return row !== null;
  }
}
