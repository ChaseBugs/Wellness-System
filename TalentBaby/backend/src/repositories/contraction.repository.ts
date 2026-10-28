import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Contraction {
  id: number;
  pregnancy_id: number;
  contraction_time: Date;
  duration_seconds: number;
  intensity: number; // 1-10
  notes?: string;
  created_at: Date;
}

export class ContractionRepository {
  async findByPregnancyId(pregnancyId: number): Promise<Contraction[]> {
    const rows = await prisma.contractions.findMany({
      where: { pregnancy_id: pregnancyId },
      orderBy: { contraction_time: 'desc' },
    });
    return rows as unknown as Contraction[];
  }

  async create(contractionData: Partial<Contraction>): Promise<Contraction> {
    const row = await prisma.contractions.create({
      data: {
        pregnancy_id: contractionData.pregnancy_id!,
        contraction_time: contractionData.contraction_time!,
        duration_seconds: contractionData.duration_seconds ?? null,
        intensity: contractionData.intensity ?? 1,
        notes: contractionData.notes ?? null,
      },
    });
    return row as unknown as Contraction;
  }

  async getContractionPatterns(pregnancyId: number): Promise<any> {
    // Uses LAG window function — requires raw SQL
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        contraction_time,
        duration_seconds,
        intensity,
        LAG(contraction_time) OVER (ORDER BY contraction_time) as previous_contraction_time
      FROM contractions
      WHERE pregnancy_id = ${pregnancyId}
      ORDER BY contraction_time DESC
      LIMIT 10
    `);

    // Calculate time between contractions
    const contractions = rows.map((row: any) => {
      let timeBetween = null;
      if (row.previous_contraction_time) {
        const current = new Date(row.contraction_time);
        const previous = new Date(row.previous_contraction_time);
        timeBetween = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60)); // minutes
      }
      return {
        ...row,
        time_between_minutes: timeBetween,
      };
    });

    return contractions;
  }

  async delete(id: number): Promise<void> {
    const result = await prisma.contractions.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new Error('Contraction not found');
    }
  }
}
