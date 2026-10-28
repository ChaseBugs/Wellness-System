import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class VideoService {
  async uploadVideo(babyId: number, userId: number, file: Express.Multer.File): Promise<any> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll store the file path
    const mediaUrl = `/uploads/${file.filename}`;
    const thumbnailUrl = null; // Generate thumbnail in production

    // Create memory record
    const result = await database.query(
      `INSERT INTO memories (baby_id, memory_type, media_url, thumbnail_url, memory_date, title)
       VALUES ($1, 'video', $2, $3, CURRENT_DATE, $4)
       RETURNING *`,
      [babyId, mediaUrl, thumbnailUrl, file.originalname]
    );

    logger.info('Video uploaded', { userId, babyId, memoryId: result.rows[0].id });

    return result.rows[0];
  }

  async linkVideoToMilestone(milestoneId: number, memoryId: number, userId: number): Promise<void> {
    // Verify milestone ownership
    const milestoneResult = await database.query(
      `SELECT b.user_id FROM milestones m
       JOIN babies b ON m.baby_id = b.id
       WHERE m.id = $1`,
      [milestoneId]
    );

    if (milestoneResult.rows.length === 0) {
      const error: AppError = new Error('Milestone not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (milestoneResult.rows[0].user_id !== userId) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // Link video to milestone
    await database.query(
      `INSERT INTO milestone_videos (milestone_id, memory_id)
       VALUES ($1, $2)
       ON CONFLICT (milestone_id, memory_id) DO NOTHING`,
      [milestoneId, memoryId]
    );

    logger.info('Video linked to milestone', { userId, milestoneId, memoryId });
  }

  async linkVideoToActivity(babyActivityId: number, memoryId: number, userId: number): Promise<void> {
    // Verify activity ownership
    const activityResult = await database.query(
      `SELECT b.user_id FROM baby_activities ba
       JOIN babies b ON ba.baby_id = b.id
       WHERE ba.id = $1`,
      [babyActivityId]
    );

    if (activityResult.rows.length === 0) {
      const error: AppError = new Error('Activity not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (activityResult.rows[0].user_id !== userId) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // Link video to activity
    await database.query(
      `INSERT INTO activity_videos (baby_activity_id, memory_id)
       VALUES ($1, $2)
       ON CONFLICT (baby_activity_id, memory_id) DO NOTHING`,
      [babyActivityId, memoryId]
    );

    logger.info('Video linked to activity', { userId, babyActivityId, memoryId });
  }

  async getMilestoneVideos(milestoneId: number, userId: number): Promise<any[]> {
    // Verify milestone ownership
    const milestoneResult = await database.query(
      `SELECT b.user_id FROM milestones m
       JOIN babies b ON m.baby_id = b.id
       WHERE m.id = $1`,
      [milestoneId]
    );

    if (milestoneResult.rows.length === 0) {
      const error: AppError = new Error('Milestone not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (milestoneResult.rows[0].user_id !== userId) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // Get videos linked to milestone
    const result = await database.query(
      `SELECT m.* FROM memories m
       JOIN milestone_videos mv ON m.id = mv.memory_id
       WHERE mv.milestone_id = $1 AND m.memory_type = 'video'
       ORDER BY m.created_at DESC`,
      [milestoneId]
    );

    return result.rows;
  }

  async getActivityVideos(babyActivityId: number, userId: number): Promise<any[]> {
    // Verify activity ownership
    const activityResult = await database.query(
      `SELECT b.user_id FROM baby_activities ba
       JOIN babies b ON ba.baby_id = b.id
       WHERE ba.id = $1`,
      [babyActivityId]
    );

    if (activityResult.rows.length === 0) {
      const error: AppError = new Error('Activity not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (activityResult.rows[0].user_id !== userId) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // Get videos linked to activity
    const result = await database.query(
      `SELECT m.* FROM memories m
       JOIN activity_videos av ON m.id = av.memory_id
       WHERE av.baby_activity_id = $1 AND m.memory_type = 'video'
       ORDER BY m.created_at DESC`,
      [babyActivityId]
    );

    return result.rows;
  }

  async getVideoTimeline(babyId: number, userId: number, startDate?: Date, endDate?: Date): Promise<any[]> {
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    let query = `
      SELECT * FROM memories 
      WHERE baby_id = $1 AND memory_type = 'video'
    `;
    const params: any[] = [babyId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND memory_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND memory_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ' ORDER BY memory_date DESC, created_at DESC';

    const result = await database.query(query, params);
    return result.rows;
  }

  async getVideoMetadata(memoryId: number, userId: number): Promise<any> {
    // Verify memory ownership
    const memoryResult = await database.query(
      `SELECT m.*, b.user_id FROM memories m
       JOIN babies b ON m.baby_id = b.id
       WHERE m.id = $1`,
      [memoryId]
    );

    if (memoryResult.rows.length === 0) {
      const error: AppError = new Error('Memory not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (memoryResult.rows[0].user_id !== userId) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return {
      id: memoryResult.rows[0].id,
      video_url: memoryResult.rows[0].media_url,
      thumbnail_url: memoryResult.rows[0].thumbnail_url,
      duration: memoryResult.rows[0].video_duration_seconds,
      file_size: memoryResult.rows[0].video_file_size_bytes,
      format: memoryResult.rows[0].video_format,
      resolution: memoryResult.rows[0].video_resolution,
      created_at: memoryResult.rows[0].created_at,
    };
  }

  async deleteVideo(memoryId: number, userId: number): Promise<void> {
    const memoryResult = await database.query(
      `SELECT m.id, b.user_id FROM memories m
       JOIN babies b ON m.baby_id = b.id
       WHERE m.id = $1 AND m.memory_type = 'video'`,
      [memoryId]
    );

    if (memoryResult.rows.length === 0) {
      const error: AppError = new Error('Video not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (memoryResult.rows[0].user_id !== userId) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    await database.query('DELETE FROM memories WHERE id = $1', [memoryId]);
    logger.info('Video deleted', { userId, memoryId });
  }

  private async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const result = await database.query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    return result.rows.length > 0;
  }
}
