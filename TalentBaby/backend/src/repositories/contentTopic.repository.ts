import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export class ContentTopicRepository {
  async getAllTopics() {
    const results = await prisma.content_topics.findMany({
      orderBy: { name: 'asc' },
    });
    return results;
  }

  async getTopicById(id: number) {
    const result = await prisma.content_topics.findUnique({
      where: { id },
    });
    return result || null;
  }

  async getContentByTopic(topicId: number, contentType?: string) {
    const where: Prisma.content_topic_associationsWhereInput = { topic_id: topicId };
    if (contentType) where.content_type = contentType;

    const results = await prisma.content_topic_associations.findMany({
      where,
      select: {
        content_type: true,
        content_id: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return results;
  }

  async searchContent(searchTerm: string, contentType?: string) {
    const searchPattern = `%${searchTerm}%`;

    // Search across articles, stories, activities, recipes — UNION ALL requires $queryRaw
    const contentTypes = contentType ? [contentType] : ['article', 'story', 'activity', 'recipe'];

    const queries: Prisma.Sql[] = [];

    if (contentTypes.includes('article')) {
      queries.push(Prisma.sql`
        SELECT 'article' as content_type, id as content_id, title, description
        FROM articles
        WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern} OR content ILIKE ${searchPattern}
      `);
    }

    if (contentTypes.includes('story')) {
      queries.push(Prisma.sql`
        SELECT 'story' as content_type, id as content_id, title, description
        FROM bedtime_stories
        WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern} OR content ILIKE ${searchPattern}
      `);
    }

    if (contentTypes.includes('activity')) {
      queries.push(Prisma.sql`
        SELECT 'activity' as content_type, id as content_id, title, description
        FROM activities
        WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
      `);
    }

    if (contentTypes.includes('recipe')) {
      queries.push(Prisma.sql`
        SELECT 'recipe' as content_type, id as content_id, title, description
        FROM recipes
        WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
      `);
    }

    if (queries.length === 0) return [];

    // Build UNION ALL query
    let unionSql = queries[0];
    for (let i = 1; i < queries.length; i++) {
      unionSql = Prisma.sql`${unionSql} UNION ALL ${queries[i]}`;
    }
    unionSql = Prisma.sql`${unionSql} ORDER BY content_type, content_id`;

    const results = await prisma.$queryRaw<any[]>(unionSql);
    return results;
  }
}
