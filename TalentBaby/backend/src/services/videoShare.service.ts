import { VideoShareRepository, VideoShare } from '../repositories/videoShare.repository';
import { AppError } from '../middleware/errorHandler';
import { database } from '../config/database';

export class VideoShareService {
  private videoShareRepository: VideoShareRepository;

  constructor() {
    this.videoShareRepository = new VideoShareRepository();
  }

  async createShare(memoryId: number, userId: number, shareType: string = 'link', expiresInDays?: number): Promise<VideoShare> {
    // Verify memory ownership
    const memoryResult = await database.query(
      `SELECT b.user_id FROM memories m
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

    return await this.videoShareRepository.createShare(memoryId, userId, shareType, expiresInDays);
  }

  async getShareByToken(shareToken: string): Promise<VideoShare> {
    const share = await this.videoShareRepository.findByToken(shareToken);
    if (!share) {
      const error: AppError = new Error('Share link not found or expired');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Increment view count
    await this.videoShareRepository.incrementViewCount(share.id);

    return share;
  }

  async getSharesByMemory(memoryId: number, userId: number): Promise<VideoShare[]> {
    // Verify memory ownership
    const memoryResult = await database.query(
      `SELECT b.user_id FROM memories m
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

    return await this.videoShareRepository.getSharesByMemory(memoryId);
  }

  async deleteShare(shareId: number, userId: number): Promise<void> {
    await this.videoShareRepository.deleteShare(shareId, userId);
  }
}
