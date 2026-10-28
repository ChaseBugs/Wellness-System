import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface ExpertClass {
  id: number;
  title: string;
  description?: string;
  instructor_name?: string;
  class_type: string; // 'live', 'on_demand'
  scheduled_time?: Date;
  video_url?: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  category: string;
  is_premium: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ExpertClassRepository {
  async findAll(classType?: string, category?: string, isPremium?: boolean): Promise<ExpertClass[]> {
    const where: Prisma.expert_classesWhereInput = {};
    if (classType) where.class_type = classType;
    if (category) where.category = category;
    if (isPremium !== undefined) where.is_premium = isPremium;

    const results = await prisma.expert_classes.findMany({
      where,
      orderBy: [
        { scheduled_time: 'desc' },
        { created_at: 'desc' },
      ],
    });
    return results as unknown as ExpertClass[];
  }

  async findById(id: number): Promise<ExpertClass | null> {
    const result = await prisma.expert_classes.findUnique({
      where: { id },
    });
    return result as unknown as ExpertClass | null;
  }

  async enrollUser(userId: number, classId: number): Promise<void> {
    // ON CONFLICT (user_id, class_id) DO NOTHING — use executeRaw
    await prisma.$executeRaw`
      INSERT INTO class_enrollments (user_id, class_id)
      VALUES (${userId}, ${classId})
      ON CONFLICT (user_id, class_id) DO NOTHING
    `;
  }

  async getEnrolledClasses(userId: number): Promise<ExpertClass[]> {
    // JOIN query — use $queryRaw
    const results = await prisma.$queryRaw<ExpertClass[]>(Prisma.sql`
      SELECT ec.* FROM expert_classes ec
      JOIN class_enrollments ce ON ec.id = ce.class_id
      WHERE ce.user_id = ${userId}
      ORDER BY ce.enrolled_at DESC
    `);
    return results;
  }

  async markCompleted(userId: number, classId: number): Promise<void> {
    await prisma.class_enrollments.updateMany({
      where: {
        user_id: userId,
        class_id: classId,
      },
      data: {
        completed_at: new Date(),
      },
    });
  }
}
