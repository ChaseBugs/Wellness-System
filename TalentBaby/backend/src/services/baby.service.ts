import { BabyRepository, Baby } from '../repositories/baby.repository';
import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class BabyService {
  private babyRepository: BabyRepository;

  constructor() {
    this.babyRepository = new BabyRepository();
  }

  async getBabies(userId: number): Promise<Baby[]> {
    return await this.babyRepository.findByUserId(userId);
  }

  async getAllBabies(): Promise<Baby[]> {
    return await this.babyRepository.findAll();
  }

  async getActiveBaby(userId: number): Promise<Baby | null> {
    const result = await database.query(
      `SELECT b.* FROM babies b
       JOIN users u ON u.active_baby_id = b.id
       WHERE u.id = $1`,
      [userId]
    );
    if (result.rows[0]) return result.rows[0];
    // Fall back to most recently created baby
    const babies = await this.babyRepository.findByUserId(userId);
    return babies[0] ?? null;
  }

  async getBabyById(babyId: number, userId: number): Promise<Baby> {
    const baby = await this.babyRepository.findById(babyId, userId);
    if (!baby) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return baby;
  }

  async createBaby(userId: number, babyData: Partial<Baby>): Promise<Baby> {
    const baby = await this.babyRepository.create({
      user_id: userId,
      name: babyData.name!,
      birth_date: babyData.birth_date!,
      gender: babyData.gender,
      birth_weight_kg: babyData.birth_weight_kg,
      birth_height_cm: babyData.birth_height_cm,
      profile_picture_url: babyData.profile_picture_url,
      avatar_url: babyData.avatar_url,
    });

    // Always set the new baby as the active baby for the user
    await database.query(
      'UPDATE users SET active_baby_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [baby.id, userId]
    );

    return baby;
  }

  async updateBaby(babyId: number, userId: number, updates: Partial<Baby>): Promise<Baby> {
    return await this.babyRepository.update(babyId, userId, updates);
  }

  async deleteBaby(babyId: number, userId: number): Promise<void> {
    await this.babyRepository.delete(babyId, userId);
  }
}
