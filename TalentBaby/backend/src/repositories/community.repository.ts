import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface BirthClub {
  id: number;
  birth_month: number;
  birth_year: number;
  club_name?: string;
  member_count: number;
  created_at: Date;
}

export interface CommunityPost {
  id: number;
  user_id: number;
  birth_club_id?: number;
  post_type: string; // 'discussion', 'question', 'experience', 'advice'
  title: string;
  content: string;
  image_url?: string;
  like_count: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  like_count: number;
  created_at: Date;
  updated_at: Date;
}

export class CommunityRepository {
  // Birth Clubs
  async findOrCreateBirthClub(birthMonth: number, birthYear: number): Promise<BirthClub> {
    let club = await prisma.birth_clubs.findFirst({
      where: { birth_month: birthMonth, birth_year: birthYear },
    });

    if (!club) {
      club = await prisma.birth_clubs.create({
        data: {
          birth_month: birthMonth,
          birth_year: birthYear,
          club_name: `Birth Club ${birthMonth}/${birthYear}`,
          member_count: 0,
        },
      });
    }

    return club as unknown as BirthClub;
  }

  async joinBirthClub(userId: number, birthClubId: number): Promise<void> {
    // Upsert membership — ON CONFLICT DO NOTHING equivalent
    await prisma.$executeRaw`
      INSERT INTO birth_club_memberships (user_id, birth_club_id)
      VALUES (${userId}, ${birthClubId})
      ON CONFLICT (user_id, birth_club_id) DO NOTHING
    `;

    // Update member count
    const memberCount = await prisma.birth_club_memberships.count({
      where: { birth_club_id: birthClubId },
    });

    await prisma.birth_clubs.update({
      where: { id: birthClubId },
      data: { member_count: memberCount },
    });
  }

  async getUserBirthClubs(userId: number): Promise<BirthClub[]> {
    const rows = await prisma.$queryRaw<BirthClub[]>(Prisma.sql`
      SELECT bc.*
      FROM birth_clubs bc
      JOIN birth_club_memberships bcm ON bc.id = bcm.birth_club_id
      WHERE bcm.user_id = ${userId}
    `);
    return rows;
  }

  // Community Posts
  async createPost(postData: Partial<CommunityPost>): Promise<CommunityPost> {
    const post = await prisma.community_posts.create({
      data: {
        user_id: postData.user_id!,
        birth_club_id: postData.birth_club_id ?? null,
        post_type: postData.post_type ?? 'discussion',
        title: postData.title!,
        content: postData.content!,
        image_url: postData.image_url ?? null,
      },
    });
    return post as unknown as CommunityPost;
  }

  async getPosts(birthClubId?: number, postType?: string, limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {
    const where: Prisma.community_postsWhereInput = {};
    if (birthClubId) where.birth_club_id = birthClubId;
    if (postType) where.post_type = postType;

    const posts = await prisma.community_posts.findMany({
      where,
      orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
      take: limit,
      skip: offset,
    });
    return posts as unknown as CommunityPost[];
  }

  async getPostById(id: number): Promise<CommunityPost | null> {
    const post = await prisma.community_posts.findUnique({ where: { id } });
    return (post as unknown as CommunityPost) ?? null;
  }

  async likePost(userId: number, postId: number): Promise<void> {
    // ON CONFLICT DO NOTHING equivalent
    await prisma.$executeRaw`
      INSERT INTO post_likes (post_id, user_id)
      VALUES (${postId}, ${userId})
      ON CONFLICT (post_id, user_id) DO NOTHING
    `;

    const likeCount = await prisma.post_likes.count({ where: { post_id: postId } });
    await prisma.community_posts.update({
      where: { id: postId },
      data: { like_count: likeCount, updated_at: new Date() },
    });
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    await prisma.post_likes.deleteMany({
      where: { post_id: postId, user_id: userId },
    });

    const likeCount = await prisma.post_likes.count({ where: { post_id: postId } });
    await prisma.community_posts.update({
      where: { id: postId },
      data: { like_count: likeCount, updated_at: new Date() },
    });
  }

  // Comments
  async createComment(commentData: Partial<PostComment>): Promise<PostComment> {
    const comment = await prisma.post_comments.create({
      data: {
        post_id: commentData.post_id!,
        user_id: commentData.user_id!,
        content: commentData.content!,
      },
    });

    const commentCount = await prisma.post_comments.count({
      where: { post_id: commentData.post_id },
    });
    await prisma.community_posts.update({
      where: { id: commentData.post_id },
      data: { comment_count: commentCount, updated_at: new Date() },
    });

    return comment as unknown as PostComment;
  }

  async getComments(postId: number): Promise<PostComment[]> {
    const comments = await prisma.post_comments.findMany({
      where: { post_id: postId },
      orderBy: { created_at: 'asc' },
    });
    return comments as unknown as PostComment[];
  }
}
