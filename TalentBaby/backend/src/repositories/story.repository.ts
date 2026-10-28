import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export class StoryRepository {
  async getStories(filters?: { category?: string; ageMonths?: number; search?: string }) {
    const where: Prisma.bedtime_storiesWhereInput = {
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.ageMonths !== undefined
        ? {
            AND: [
              { OR: [{ age_min_months: null }, { age_min_months: { lte: filters.ageMonths } }] },
              { OR: [{ age_max_months: null }, { age_max_months: { gte: filters.ageMonths } }] },
            ],
          }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
              { content: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.bedtime_stories.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async getStoryById(id: number): Promise<any | null> {
    const row = await prisma.bedtime_stories.findUnique({ where: { id } });
    return row || null;
  }

  async getStoryCategories() {
    return prisma.story_categories.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async addStoryToFavorites(userId: number, storyId: number) {
    try {
      const row = await prisma.story_favorites.create({
        data: { user_id: userId, story_id: storyId },
      });
      return row;
    } catch {
      // ON CONFLICT DO NOTHING — unique constraint violation means already favorited
      return null;
    }
  }

  async removeStoryFromFavorites(userId: number, storyId: number) {
    await prisma.story_favorites.deleteMany({
      where: { user_id: userId, story_id: storyId },
    });
  }

  async getFavoriteStories(userId: number) {
    return prisma.$queryRaw(
      Prisma.sql`SELECT s.* FROM bedtime_stories s
                 INNER JOIN story_favorites sf ON s.id = sf.story_id
                 WHERE sf.user_id = ${userId}
                 ORDER BY sf.created_at DESC`
    );
  }

  async isStoryFavorite(userId: number, storyId: number): Promise<boolean> {
    const row = await prisma.story_favorites.findUnique({
      where: { user_id_story_id: { user_id: userId, story_id: storyId } },
    });
    return row !== null;
  }
}
