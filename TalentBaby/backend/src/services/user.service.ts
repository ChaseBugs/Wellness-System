import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { BabyRepository } from '../repositories/baby.repository';
import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  private userRepository: UserRepository;
  private babyRepository: BabyRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.babyRepository = new BabyRepository();
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: number, updates: any) {
    const allowedFields = [
      'full_name',
      'phone_number',
      'gender',
      'birthdate',
      'profile_picture_url',
      'language_preference',
      'relation_to_baby',
    ];

    const filteredUpdates: any = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return await this.getProfile(userId);
    }

    const updated = await this.userRepository.update(userId, filteredUpdates);
    const { password_hash, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async createUserAdmin(data: {
    email: string;
    password: string;
    full_name?: string;
    role: string;
    is_premium?: boolean;
    relation_to_baby?: string;
    baby_id?: number;
  }) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      const err: AppError = new Error('A user with this email already exists');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.createAdmin({
      email: data.email,
      password_hash,
      full_name: data.full_name,
      role: data.role,
      is_premium: data.is_premium,
      relation_to_baby: data.relation_to_baby,
    });

    await this.userRepository.createNotificationPreferences(user.id);

    // If a baby_id is provided, assign it and set as active
    if (data.baby_id) {
      await database.query(
        'UPDATE babies SET user_id = $1 WHERE id = $2',
        [user.id, data.baby_id]
      );
      await this.userRepository.setActiveBaby(user.id, data.baby_id);
    }

    const { password_hash: _, ...safe } = user;
    return safe;
  }

  async setActiveBaby(userId: number, babyId: number | null) {
    if (babyId !== null) {
      const baby = await this.babyRepository.findById(babyId, userId);
      if (!baby) {
        const err: AppError = new Error('Baby not found or does not belong to this user.');
        err.statusCode = 404;
        err.isOperational = true;
        throw err;
      }
    }
    await this.userRepository.setActiveBaby(userId, babyId);
    return this.getProfile(userId);
  }

  async setActiveBabyAdmin(targetUserId: number, babyId: number | null) {
    if (babyId !== null) {
      const baby = await this.babyRepository.findById(babyId, targetUserId);
      if (!baby) {
        const err: AppError = new Error('Baby not found or does not belong to this user.');
        err.statusCode = 404;
        err.isOperational = true;
        throw err;
      }
    }
    await this.userRepository.setActiveBaby(targetUserId, babyId);
  }

  async getNotificationPreferences(userId: number) {
    const result = await database.query(
      'SELECT * FROM user_notification_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default preferences if they don't exist
      await database.query(
        'INSERT INTO user_notification_preferences (user_id) VALUES ($1)',
        [userId]
      );
      const newResult = await database.query(
        'SELECT * FROM user_notification_preferences WHERE user_id = $1',
        [userId]
      );
      return newResult.rows[0];
    }

    return result.rows[0];
  }

  async updateNotificationPreferences(userId: number, preferences: any) {
    const allowedFields = [
      'growth_milestone_alerts',
      'vaccination_reminders',
      'development_milestone_alerts',
      'health_check_reminders',
      'photo_memories',
      'app_updates',
    ];

    const filteredUpdates: any = {};
    Object.keys(preferences).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = preferences[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return await this.getNotificationPreferences(userId);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.keys(filteredUpdates).forEach((key) => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(filteredUpdates[key]);
      paramIndex++;
    });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const result = await database.query(
      `UPDATE user_notification_preferences 
       SET ${fields.join(', ')} 
       WHERE user_id = $${paramIndex} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      // Create if doesn't exist
      await database.query(
        `INSERT INTO user_notification_preferences (user_id, ${Object.keys(filteredUpdates).join(', ')})
         VALUES ($1, ${Object.keys(filteredUpdates).map((_, i) => `$${i + 2}`).join(', ')})
         RETURNING *`,
        [userId, ...Object.values(filteredUpdates)]
      );
      return await this.getNotificationPreferences(userId);
    }

    return result.rows[0];
  }
}
