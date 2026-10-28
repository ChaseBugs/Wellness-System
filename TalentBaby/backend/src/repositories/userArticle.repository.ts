import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface UserArticle {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  keywords: string[];
  thumbnail_url?: string;
  status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  // joined
  author_name?: string;
  author_role?: string;
  doctor_grade?: string;
  doctor_specialty?: string;
  is_liked?: boolean;
}

export interface UserArticleComment {
  id: number;
  article_id: number;
  user_id: number;
  parent_id?: number;
  content: string;
  like_count: number;
  is_doctor_comment: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  doctor_grade?: string;
  doctor_specialty?: string;
  is_liked?: boolean;
  replies?: UserArticleComment[];
}

const POINT_RULES = {
  article_submit: 10,
  article_liked: 2,
  comment_submit: 3,
  comment_liked: 1,
} as const;

export class UserArticleRepository {
  // ─── Articles ────────────────────────────────────────────────────────────

  async findAll(filters: { category?: string; userId?: number; search?: string; doctor_only?: boolean; limit?: number; offset?: number } = {}) {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    // Build dynamic conditions
    const conditions: Prisma.Sql[] = [Prisma.sql`a.status = 'published'`];

    if (filters.category) conditions.push(Prisma.sql`a.category = ${filters.category}`);
    if (filters.doctor_only) conditions.push(Prisma.sql`u.role = 'doctor'`);
    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(Prisma.sql`(a.title ILIKE ${term} OR a.content ILIKE ${term} OR EXISTS (SELECT 1 FROM unnest(a.keywords) k WHERE k ILIKE ${term}))`);
    }

    const where = Prisma.join(conditions, ' AND ');

    const likedSub = filters.userId
      ? Prisma.sql`(SELECT 1 FROM user_article_likes l WHERE l.article_id = a.id AND l.user_id = ${Number(filters.userId)}) IS NOT NULL`
      : Prisma.sql`false`;

    const rows = await prisma.$queryRaw<UserArticle[]>(Prisma.sql`
      SELECT a.*, u.full_name AS author_name, u.role AS author_role,
             dp.grade AS doctor_grade, dp.specialty AS doctor_specialty,
             ${likedSub} AS is_liked
      FROM user_articles a
      JOIN users u ON u.id = a.user_id
      LEFT JOIN doctor_profiles dp ON dp.user_id = a.user_id
      WHERE ${where}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return rows;
  }

  async findById(id: number, requestingUserId?: number) {
    const likedSub = requestingUserId
      ? Prisma.sql`(SELECT 1 FROM user_article_likes l WHERE l.article_id = a.id AND l.user_id = ${Number(requestingUserId)}) IS NOT NULL`
      : Prisma.sql`false`;

    const rows = await prisma.$queryRaw<UserArticle[]>(Prisma.sql`
      SELECT a.*, u.full_name AS author_name, u.role AS author_role,
             dp.grade AS doctor_grade, dp.specialty AS doctor_specialty,
             ${likedSub} AS is_liked
      FROM user_articles a
      JOIN users u ON u.id = a.user_id
      LEFT JOIN doctor_profiles dp ON dp.user_id = a.user_id
      WHERE a.id = ${id}
    `);
    return rows[0] as UserArticle | undefined;
  }

  async create(data: { user_id: number; title: string; content: string; category?: string; tags?: string[]; keywords?: string[]; thumbnail_url?: string; status?: string }) {
    const row = await prisma.user_articles.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        content: data.content,
        category: data.category ?? 'general',
        tags: data.tags ?? [],
        keywords: data.keywords ?? [],
        thumbnail_url: data.thumbnail_url ?? null,
        status: data.status ?? 'published',
      },
    });
    return row as unknown as UserArticle;
  }

  async update(id: number, userId: number, data: Partial<Pick<UserArticle, 'title' | 'content' | 'category' | 'tags' | 'thumbnail_url' | 'status'>>) {
    const updateData: Prisma.user_articlesUpdateInput = { updated_at: new Date() };

    if (data.title         !== undefined) updateData.title         = data.title;
    if (data.content       !== undefined) updateData.content       = data.content;
    if (data.category      !== undefined) updateData.category      = data.category;
    if (data.tags          !== undefined) updateData.tags          = data.tags;
    if (data.thumbnail_url !== undefined) updateData.thumbnail_url = data.thumbnail_url;
    if (data.status        !== undefined) updateData.status        = data.status;

    const fieldsChanged = Object.keys(updateData).filter(k => k !== 'updated_at');
    if (!fieldsChanged.length) return null;

    // Use raw to support compound WHERE (id AND user_id)
    const rows = await prisma.$queryRaw<UserArticle[]>(Prisma.sql`
      UPDATE user_articles
      SET ${Prisma.join(
        [
          ...(data.title         !== undefined ? [Prisma.sql`title = ${data.title}`]                 : []),
          ...(data.content       !== undefined ? [Prisma.sql`content = ${data.content}`]             : []),
          ...(data.category      !== undefined ? [Prisma.sql`category = ${data.category}`]           : []),
          ...(data.tags          !== undefined ? [Prisma.sql`tags = ${data.tags}::text[]`]           : []),
          ...(data.thumbnail_url !== undefined ? [Prisma.sql`thumbnail_url = ${data.thumbnail_url}`] : []),
          ...(data.status        !== undefined ? [Prisma.sql`status = ${data.status}`]               : []),
          Prisma.sql`updated_at = CURRENT_TIMESTAMP`,
        ],
        ', '
      )}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `);
    return rows[0] as UserArticle | undefined;
  }

  async delete(id: number, userId: number) {
    const result = await prisma.user_articles.deleteMany({
      where: { id, user_id: userId },
    });
    return result.count > 0;
  }

  async incrementView(id: number) {
    await prisma.$executeRaw`
      UPDATE user_articles SET view_count = view_count + 1 WHERE id = ${id}
    `;
  }

  // ─── Likes ───────────────────────────────────────────────────────────────

  async toggleLike(articleId: number, userId: number): Promise<'liked' | 'unliked'> {
    const existing = await prisma.user_article_likes.findFirst({
      where: { article_id: articleId, user_id: userId },
    });

    if (existing) {
      await prisma.user_article_likes.deleteMany({
        where: { article_id: articleId, user_id: userId },
      });
      await prisma.$executeRaw`
        UPDATE user_articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = ${articleId}
      `;
      return 'unliked';
    } else {
      await prisma.user_article_likes.create({
        data: { article_id: articleId, user_id: userId },
      });
      await prisma.$executeRaw`
        UPDATE user_articles SET like_count = like_count + 1 WHERE id = ${articleId}
      `;

      // Award points to article author
      const article = await prisma.user_articles.findUnique({
        where: { id: articleId },
        select: { user_id: true },
      });
      if (article && article.user_id !== userId) {
        await this.awardPoints(article.user_id, POINT_RULES.article_liked, 'article_liked', articleId, 'article', 'Article liked');
      }
      return 'liked';
    }
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  async getComments(articleId: number, requestingUserId?: number) {
    const likedSub = requestingUserId
      ? Prisma.sql`(SELECT 1 FROM user_article_comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ${Number(requestingUserId)}) IS NOT NULL`
      : Prisma.sql`false`;

    const rows = await prisma.$queryRaw<UserArticleComment[]>(Prisma.sql`
      SELECT c.*, u.full_name AS author_name, u.role AS author_role,
             dp.grade AS doctor_grade, dp.specialty AS doctor_specialty,
             ${likedSub} AS is_liked
      FROM user_article_comments c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN doctor_profiles dp ON dp.user_id = c.user_id
      WHERE c.article_id = ${articleId}
      ORDER BY c.parent_id NULLS FIRST, c.created_at ASC
    `);

    // Nest replies under parent comments
    const comments = rows as UserArticleComment[];
    const map = new Map<number, UserArticleComment>();
    const roots: UserArticleComment[] = [];

    comments.forEach(c => { c.replies = []; map.set(c.id, c); });
    comments.forEach(c => {
      if (c.parent_id) {
        const parent = map.get(c.parent_id);
        if (parent) parent.replies!.push(c);
      } else {
        roots.push(c);
      }
    });
    return roots;
  }

  async createComment(data: { article_id: number; user_id: number; parent_id?: number; content: string; is_doctor_comment?: boolean }) {
    const row = await prisma.user_article_comments.create({
      data: {
        article_id: data.article_id,
        user_id: data.user_id,
        parent_id: data.parent_id ?? null,
        content: data.content,
        is_doctor_comment: data.is_doctor_comment ?? false,
      },
    });
    await prisma.$executeRaw`
      UPDATE user_articles SET comment_count = comment_count + 1 WHERE id = ${data.article_id}
    `;
    return row as unknown as UserArticleComment;
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await prisma.user_article_comments.findFirst({
      where: { id: commentId, user_id: userId },
      select: { article_id: true },
    });

    if (!comment) return false;

    const result = await prisma.user_article_comments.deleteMany({
      where: { id: commentId, user_id: userId },
    });

    if (result.count > 0) {
      await prisma.$executeRaw`
        UPDATE user_articles SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ${comment.article_id}
      `;
    }
    return result.count > 0;
  }

  async toggleCommentLike(commentId: number, userId: number): Promise<'liked' | 'unliked'> {
    const existing = await prisma.user_article_comment_likes.findFirst({
      where: { comment_id: commentId, user_id: userId },
    });

    if (existing) {
      await prisma.user_article_comment_likes.deleteMany({
        where: { comment_id: commentId, user_id: userId },
      });
      await prisma.$executeRaw`
        UPDATE user_article_comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = ${commentId}
      `;
      return 'unliked';
    } else {
      await prisma.user_article_comment_likes.create({
        data: { comment_id: commentId, user_id: userId },
      });
      await prisma.$executeRaw`
        UPDATE user_article_comments SET like_count = like_count + 1 WHERE id = ${commentId}
      `;

      const comment = await prisma.user_article_comments.findUnique({
        where: { id: commentId },
        select: { user_id: true },
      });
      if (comment && comment.user_id !== userId) {
        await this.awardPoints(comment.user_id, POINT_RULES.comment_liked, 'comment_liked', commentId, 'comment', 'Comment liked');
      }
      return 'liked';
    }
  }

  // ─── Points ──────────────────────────────────────────────────────────────

  async awardPoints(userId: number, points: number, reason: string, referenceId?: number, referenceType?: string, description?: string) {
    await prisma.$executeRaw`
      INSERT INTO user_points (user_id, total_points) VALUES (${userId}, ${points})
      ON CONFLICT (user_id) DO UPDATE
        SET total_points = user_points.total_points + ${points},
            updated_at = CURRENT_TIMESTAMP
    `;
    await prisma.user_point_history.create({
      data: {
        user_id: userId,
        points,
        reason,
        reference_id: referenceId ?? null,
        reference_type: referenceType ?? null,
        description: description ?? null,
      },
    });
  }

  async getPoints(userId: number) {
    const row = await prisma.user_points.findUnique({
      where: { user_id: userId },
      select: { total_points: true },
    });
    return (row?.total_points ?? 0) as number;
  }

  async getPointHistory(userId: number) {
    const rows = await prisma.user_point_history.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    return rows;
  }

  async getLeaderboard(limit = 20) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT u.id, u.full_name, u.profile_picture_url, u.role,
             COALESCE(p.total_points, 0) AS total_points,
             dp.grade AS doctor_grade, dp.specialty AS doctor_specialty
      FROM users u
      LEFT JOIN user_points p ON p.user_id = u.id
      LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
      ORDER BY total_points DESC
      LIMIT ${limit}
    `);
    return rows;
  }

  // ─── Doctor Profiles ─────────────────────────────────────────────────────

  async findDoctorProfile(userId: number) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT dp.*, u.full_name, u.email, u.profile_picture_url
      FROM doctor_profiles dp
      JOIN users u ON u.id = dp.user_id
      WHERE dp.user_id = ${userId}
    `);
    return rows[0];
  }

  async findAllDoctors(filters: { specialty?: string; grade_level?: number; verified?: boolean } = {}) {
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];
    if (filters.specialty   !== undefined) conditions.push(Prisma.sql`dp.specialty = ${filters.specialty}`);
    if (filters.grade_level !== undefined) conditions.push(Prisma.sql`dp.grade_level = ${filters.grade_level}`);
    if (filters.verified    !== undefined) conditions.push(Prisma.sql`dp.verified = ${filters.verified}`);

    const where = Prisma.join(conditions, ' AND ');

    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT dp.*, u.full_name, u.email, u.profile_picture_url,
             COALESCE(pt.total_points, 0) AS total_points
      FROM doctor_profiles dp
      JOIN users u ON u.id = dp.user_id
      LEFT JOIN user_points pt ON pt.user_id = dp.user_id
      WHERE ${where}
      ORDER BY dp.grade_level DESC, dp.verified DESC
    `);
    return rows;
  }

  async upsertDoctorProfile(userId: number, data: {
    specialty: string;
    grade: string;
    grade_level: number;
    license_number?: string;
    hospital?: string;
    bio?: string;
  }) {
    const gradeMap: Record<string, number> = { 'intern': 1, 'resident': 2, 'specialist': 3, 'professor': 4, 'honorary': 5 };
    const gradeLevel = gradeMap[data.grade] ?? data.grade_level ?? 1;

    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      INSERT INTO doctor_profiles (user_id, specialty, grade, grade_level, license_number, hospital, bio)
      VALUES (${userId}, ${data.specialty}, ${data.grade}, ${gradeLevel}, ${data.license_number ?? null}, ${data.hospital ?? null}, ${data.bio ?? null})
      ON CONFLICT (user_id) DO UPDATE SET
        specialty = EXCLUDED.specialty,
        grade = EXCLUDED.grade,
        grade_level = EXCLUDED.grade_level,
        license_number = COALESCE(EXCLUDED.license_number, doctor_profiles.license_number),
        hospital = COALESCE(EXCLUDED.hospital, doctor_profiles.hospital),
        bio = COALESCE(EXCLUDED.bio, doctor_profiles.bio),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `);

    // Set user role to 'doctor'
    await prisma.users.update({
      where: { id: userId },
      data: { role: 'doctor', updated_at: new Date() },
    });

    return rows[0];
  }

  async verifyDoctor(userId: number) {
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      UPDATE doctor_profiles SET verified = true, verified_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING *
    `);
    return rows[0];
  }
}
