import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Symptom {
  id: number;
  pregnancy_id: number;
  symptom_date: Date;
  symptom_type: string; // 'nausea', 'fatigue', 'mood', 'pain', 'cravings', etc.
  severity: number; // 1-5
  notes?: string;
  created_at: Date;
}

export class SymptomRepository {
  async findByPregnancyId(pregnancyId: number, startDate?: Date, endDate?: Date): Promise<Symptom[]> {
    const where: Prisma.pregnancy_symptomsWhereInput = { pregnancy_id: pregnancyId };

    if (startDate || endDate) {
      where.symptom_date = {};
      if (startDate) (where.symptom_date as any).gte = startDate;
      if (endDate) (where.symptom_date as any).lte = endDate;
    }

    const rows = await prisma.pregnancy_symptoms.findMany({
      where,
      orderBy: { symptom_date: 'desc' },
    });
    return rows as unknown as Symptom[];
  }

  async create(symptomData: Partial<Symptom>): Promise<Symptom> {
    const row = await prisma.pregnancy_symptoms.create({
      data: {
        pregnancy_id: symptomData.pregnancy_id!,
        symptom_date: symptomData.symptom_date!,
        symptom_type: symptomData.symptom_type!,
        severity: symptomData.severity ?? 1,
        notes: symptomData.notes ?? null,
      },
    });
    return row as unknown as Symptom;
  }

  async getSymptomPatterns(pregnancyId: number): Promise<any> {
    // Uses GROUP BY aggregate — requires raw SQL
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        symptom_type,
        AVG(severity) as avg_severity,
        COUNT(*) as frequency
      FROM pregnancy_symptoms
      WHERE pregnancy_id = ${pregnancyId}
      GROUP BY symptom_type
      ORDER BY frequency DESC
    `);
    return rows;
  }
}
