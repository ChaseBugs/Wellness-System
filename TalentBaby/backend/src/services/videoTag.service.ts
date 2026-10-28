import { VideoTagRepository } from '../repositories/videoTag.repository';
import { AppError } from '../middleware/errorHandler';
import { database } from '../config/database';

export class VideoTagService {
  private videoTagRepository: VideoTagRepository;

  constructor() {
    this.videoTagRepository = new VideoTagRepository();
  }

  async addTag(memoryId: number, userId: number, tagName: string): Promise<void> {
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

    await this.videoTagRepository.addTag(memoryId, tagName);
  }

  async removeTag(memoryId: number, userId: number, tagName: string): Promise<void> {
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

    await this.videoTagRepository.removeTag(memoryId, tagName);
  }

  async getTagsByMemory(memoryId: number): Promise<string[]> {
    const tags = await this.videoTagRepository.getTagsByMemory(memoryId);
    return tags.map((tag) => tag.tag_name);
  }

  async getMemoriesByTag(tagName: string, babyId?: number, userId?: number): Promise<any[]> {
    // If babyId provided, verify ownership
    if (babyId && userId) {
      const isOwner = await this.verifyBabyOwnership(babyId, userId);
      if (!isOwner) {
        const error: AppError = new Error('Baby not found');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }
    }

    return await this.videoTagRepository.getMemoriesByTag(tagName, babyId);
  }

  async getAllTags(babyId?: number, userId?: number): Promise<string[]> {
    if (babyId && userId) {
      const isOwner = await this.verifyBabyOwnership(babyId, userId);
      if (!isOwner) {
        const error: AppError = new Error('Baby not found');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }
    }

    return await this.videoTagRepository.getAllTags(babyId);
  }

  private async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const result = await database.query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    return result.rows.length > 0;
  }
}
