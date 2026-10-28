import { UserArticleRepository } from '../repositories/userArticle.repository';
import { database } from '../config/database';

const repo = new UserArticleRepository();

// Point constants
const POINTS = {
  article_submit:  10,  // article submission
  article_liked:    2,  // article received a like
  comment_submit:   3,  // comment posted
  comment_liked:    1,  // comment received a like
  doctor_comment:   5,  // doctor posted a comment (doctor reward)
} as const;

export class UserArticleService {
  // ─── Articles ─────────────────────────────────────────────────────────────

  async getArticles(filters: { category?: string; userId?: number; search?: string; doctor_only?: boolean; limit?: number; offset?: number }) {
    return repo.findAll(filters);
  }

  async getArticle(id: number, requestingUserId?: number) {
    const article = await repo.findById(id, requestingUserId);
    if (!article) throw { status: 404, message: 'Article not found.' };
    await repo.incrementView(id);
    return article;
  }

  async submitArticle(userId: number, data: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    thumbnail_url?: string;
    status?: string;
  }) {
    const article = await repo.create({ user_id: userId, ...data });

    // Award points for submission
    if (article.status === 'published') {
      await repo.awardPoints(userId, POINTS.article_submit, 'article_submit', article.id, 'article', 'Article submission points');
    }

    return article;
  }

  async updateArticle(id: number, userId: number, data: Parameters<UserArticleRepository['update']>[2]) {
    const article = await repo.update(id, userId, data);
    if (!article) throw { status: 404, message: 'Article not found or access denied.' };
    return article;
  }

  async deleteArticle(id: number, userId: number) {
    const deleted = await repo.delete(id, userId);
    if (!deleted) throw { status: 404, message: 'Article not found or access denied.' };
  }

  async toggleLike(articleId: number, userId: number) {
    const result = await repo.toggleLike(articleId, userId);
    return result;
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async getComments(articleId: number, requestingUserId?: number) {
    // Verify article exists
    const article = await repo.findById(articleId);
    if (!article) throw { status: 404, message: 'Article not found.' };
    return repo.getComments(articleId, requestingUserId);
  }

  async postComment(userId: number, articleId: number, data: { content: string; parent_id?: number }) {
    // Check if user is a doctor
    const userRow = await database.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    const isDoctor = userRow.rows[0]?.role === 'doctor';

    const comment = await repo.createComment({
      article_id: articleId,
      user_id: userId,
      parent_id: data.parent_id,
      content: data.content,
      is_doctor_comment: isDoctor,
    });

    // Award points
    if (isDoctor) {
      // Doctors earn bonus points for commenting (encourage doctor participation)
      await repo.awardPoints(userId, POINTS.doctor_comment, 'doctor_comment', comment.id, 'comment', 'Doctor comment points');
    } else {
      await repo.awardPoints(userId, POINTS.comment_submit, 'comment_submit', comment.id, 'comment', 'Comment submission points');
    }

    return comment;
  }

  async deleteComment(commentId: number, userId: number) {
    const deleted = await repo.deleteComment(commentId, userId);
    if (!deleted) throw { status: 404, message: 'Comment not found or access denied.' };
  }

  async toggleCommentLike(commentId: number, userId: number) {
    return repo.toggleCommentLike(commentId, userId);
  }

  // ─── Points ───────────────────────────────────────────────────────────────

  async getMyPoints(userId: number) {
    const total = await repo.getPoints(userId);
    const history = await repo.getPointHistory(userId);
    return { total_points: total, history };
  }

  async getLeaderboard() {
    return repo.getLeaderboard(20);
  }

  // ─── Doctor Profiles ──────────────────────────────────────────────────────

  async getDoctorProfile(userId: number) {
    const profile = await repo.findDoctorProfile(userId);
    if (!profile) throw { status: 404, message: 'Doctor profile not found.' };
    return profile;
  }

  async getAllDoctors(filters: { specialty?: string; grade_level?: number }) {
    return repo.findAllDoctors({ ...filters, verified: undefined });
  }

  async registerOrUpdateDoctorProfile(userId: number, data: {
    specialty: string;
    grade: string;
    grade_level?: number;
    license_number?: string;
    hospital?: string;
    bio?: string;
  }) {
    const gradeMap: Record<string, number> = { 'intern': 1, 'resident': 2, 'specialist': 3, 'professor': 4, 'honorary': 5 };
    const grade_level = gradeMap[data.grade] ?? data.grade_level ?? 1;
    return repo.upsertDoctorProfile(userId, { ...data, grade_level });
  }

  async verifyDoctor(userId: number) {
    const profile = await repo.verifyDoctor(userId);
    if (!profile) throw { status: 404, message: 'Doctor profile not found.' };
    return profile;
  }
}
