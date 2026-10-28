import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  author?: string;
  image_url?: string;
  video_url?: string;
  reading_time_minutes?: number;
  is_featured: boolean;
  view_count: number;
  doctor_name?: string;
  doctor_credentials?: string;
  doctor_verified?: boolean;
  age_min_months?: number;
  age_max_months?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  category: string;
  author?: string;
  image_url?: string;
  reading_time_minutes?: number;
  is_featured?: boolean;
  doctor_name?: string;
  doctor_credentials?: string;
  doctor_verified?: boolean;
  age_min_months?: number;
  age_max_months?: number;
}

export class ArticleRepository {
  async findAll(category?: string, isFeatured?: boolean, limit?: number, offset?: number, lang?: string, month?: number): Promise<Article[]> {
    const where: Prisma.articlesWhereInput = {
      ...(lang ? { language: lang } : {}),
      ...(category ? { category } : {}),
      ...(isFeatured !== undefined ? { is_featured: isFeatured } : {}),
      ...(month !== undefined
        ? {
            AND: [
              { OR: [{ age_min_months: null }, { age_min_months: { lte: month } }] },
              { OR: [{ age_max_months: null }, { age_max_months: { gte: month } }] },
            ],
          }
        : {}),
    };

    const rows = await prisma.articles.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(limit ? { take: limit } : {}),
      ...(limit && offset ? { skip: offset } : {}),
    });

    return rows as unknown as Article[];
  }

  async findByAgeRange(ageMonths: number, category?: string, lang: string = 'en'): Promise<Article[]> {
    const rows = await prisma.articles.findMany({
      where: {
        language: lang,
        age_min_months: { lte: ageMonths },
        age_max_months: { gte: ageMonths },
        doctor_name: { not: null },
        ...(category ? { category } : {}),
      },
      orderBy: [{ is_featured: 'desc' }, { view_count: 'desc' }],
    });

    return rows as unknown as Article[];
  }

  async findById(id: number): Promise<Article | null> {
    const row = await prisma.articles.findUnique({ where: { id } });
    return row as unknown as Article | null;
  }

  async create(input: CreateArticleInput): Promise<Article> {
    const row = await prisma.articles.create({
      data: {
        title: input.title,
        content: input.content,
        category: input.category,
        author: input.author ?? 'BabyG Editorial Team',
        image_url: input.image_url ?? null,
        reading_time_minutes: input.reading_time_minutes ?? null,
        is_featured: input.is_featured ?? false,
        doctor_name: input.doctor_name ?? null,
        doctor_credentials: input.doctor_credentials ?? null,
        doctor_verified: input.doctor_verified ?? false,
        age_min_months: input.age_min_months ?? 0,
        age_max_months: input.age_max_months ?? 60,
        language: 'en',
      },
    });
    return row as unknown as Article;
  }

  async update(id: number, input: Partial<CreateArticleInput>): Promise<Article | null> {
    const allowed: (keyof CreateArticleInput)[] = [
      'title', 'content', 'category', 'author', 'image_url',
      'reading_time_minutes', 'is_featured', 'doctor_name',
      'doctor_credentials', 'doctor_verified', 'age_min_months', 'age_max_months',
    ];

    const data: Record<string, unknown> = { updated_at: new Date() };
    for (const key of allowed) {
      if (input[key] !== undefined) {
        data[key] = input[key];
      }
    }

    if (Object.keys(data).length === 1) return this.findById(id);

    const row = await prisma.articles.update({
      where: { id },
      data,
    });
    return row as unknown as Article;
  }

  async delete(id: number): Promise<boolean> {
    const result = await prisma.articles.deleteMany({ where: { id } });
    return result.count > 0;
  }

  async search(searchTerm: string, limit: number = 20): Promise<Article[]> {
    const rows = await prisma.articles.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
    return rows as unknown as Article[];
  }

  async incrementViewCount(id: number): Promise<void> {
    await prisma.articles.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    });
  }

  async bookmarkArticle(userId: number, articleId: number): Promise<void> {
    await prisma.$executeRaw`INSERT INTO article_bookmarks (user_id, article_id) VALUES (${userId}, ${articleId}) ON CONFLICT DO NOTHING`;
  }

  async unbookmarkArticle(userId: number, articleId: number): Promise<void> {
    await prisma.article_bookmarks.deleteMany({
      where: { user_id: userId, article_id: articleId },
    });
  }

  async getBookmarkedArticles(userId: number): Promise<Article[]> {
    const rows = await prisma.$queryRaw<Article[]>(
      Prisma.sql`SELECT a.* FROM articles a
                 JOIN article_bookmarks ab ON a.id = ab.article_id
                 WHERE ab.user_id = ${userId}
                 ORDER BY ab.created_at DESC`
    );
    return rows;
  }

  async recordReadingHistory(userId: number, articleId: number): Promise<void> {
    await prisma.article_reading_history.create({
      data: { user_id: userId, article_id: articleId },
    });
  }
}
