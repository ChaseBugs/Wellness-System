import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface DailyUpdate {
  id: number;
  age_in_months: number;
  content_type: string; // 'tip', 'development', 'activity', 'safety'
  title?: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class DailyUpdateRepository {
  async findByAge(ageInMonths: number, contentType?: string): Promise<DailyUpdate[]> {
    const where: Prisma.daily_updates_contentWhereInput = { age_in_months: ageInMonths };
    if (contentType) where.content_type = contentType;

    const results = await prisma.daily_updates_content.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return results as unknown as DailyUpdate[];
  }

  async findById(id: number): Promise<DailyUpdate | null> {
    const result = await prisma.daily_updates_content.findUnique({
      where: { id },
    });
    return result as unknown as DailyUpdate | null;
  }

  async create(updateData: Partial<DailyUpdate>): Promise<DailyUpdate> {
    const result = await prisma.daily_updates_content.create({
      data: {
        age_in_months: updateData.age_in_months!,
        content_type: updateData.content_type!,
        title: updateData.title || null,
        content: updateData.content!,
        image_url: updateData.image_url || null,
        video_url: updateData.video_url || null,
      },
    });
    return result as unknown as DailyUpdate;
  }

  async getRandomUpdate(ageInMonths: number, contentType?: string): Promise<DailyUpdate | null> {
    const where: Prisma.daily_updates_contentWhereInput = { age_in_months: ageInMonths };
    if (contentType) where.content_type = contentType;

    // Use $queryRaw for RANDOM() ordering
    const params: any[] = [ageInMonths];
    let sql = Prisma.sql`SELECT * FROM daily_updates_content WHERE age_in_months = ${ageInMonths}`;

    if (contentType) {
      const results = await prisma.$queryRaw<DailyUpdate[]>(
        Prisma.sql`SELECT * FROM daily_updates_content WHERE age_in_months = ${ageInMonths} AND content_type = ${contentType} ORDER BY RANDOM() LIMIT 1`
      );
      return results[0] || null;
    }

    const results = await prisma.$queryRaw<DailyUpdate[]>(
      Prisma.sql`SELECT * FROM daily_updates_content WHERE age_in_months = ${ageInMonths} ORDER BY RANDOM() LIMIT 1`
    );
    return results[0] || null;
  }
}
