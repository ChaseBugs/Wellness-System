import { prisma } from '../config/prisma';

export interface PregnancyWeek {
  id: number;
  week_number: number;
  title: string;
  fetal_development: string;
  baby_size: string;
  baby_weight: string;
  body_changes: string;
  symptoms: string[];
  tips: string[];
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class PregnancyWeekRepository {
  async findByWeek(weekNumber: number): Promise<PregnancyWeek | null> {
    const row = await prisma.pregnancy_weeks.findUnique({
      where: { week_number: weekNumber },
    });
    return row as unknown as PregnancyWeek | null;
  }

  async findAll(): Promise<PregnancyWeek[]> {
    const rows = await prisma.pregnancy_weeks.findMany({
      orderBy: { week_number: 'asc' },
    });
    return rows as unknown as PregnancyWeek[];
  }

  async findByWeekRange(startWeek: number, endWeek: number): Promise<PregnancyWeek[]> {
    const rows = await prisma.pregnancy_weeks.findMany({
      where: {
        week_number: { gte: startWeek, lte: endWeek },
      },
      orderBy: { week_number: 'asc' },
    });
    return rows as unknown as PregnancyWeek[];
  }

  async create(weekData: Partial<PregnancyWeek>): Promise<PregnancyWeek> {
    const row = await prisma.pregnancy_weeks.create({
      data: {
        week_number: weekData.week_number!,
        title: weekData.title!,
        fetal_development: weekData.fetal_development ?? null,
        baby_size: weekData.baby_size ?? null,
        baby_weight: weekData.baby_weight ?? null,
        body_changes: weekData.body_changes ?? null,
        symptoms: weekData.symptoms ?? [],
        tips: weekData.tips ?? [],
        image_url: weekData.image_url ?? null,
      },
    });
    return row as unknown as PregnancyWeek;
  }
}
