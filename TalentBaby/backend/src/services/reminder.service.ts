import { ReminderRepository, Reminder } from '../repositories/reminder.repository';
import { AppError } from '../middleware/errorHandler';

export class ReminderService {
  private reminderRepository: ReminderRepository;

  constructor() {
    this.reminderRepository = new ReminderRepository();
  }

  async getReminders(userId: number, isActive?: boolean): Promise<Reminder[]> {
    return await this.reminderRepository.findByUserId(userId, isActive);
  }

  async getBabyReminders(babyId: number, userId: number): Promise<Reminder[]> {
    // Verify baby ownership
    const isOwner = await this.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.reminderRepository.findByBabyId(babyId);
  }

  async createReminder(userId: number, reminderData: Partial<Reminder>): Promise<Reminder> {
    return await this.reminderRepository.create({
      ...reminderData,
      user_id: userId,
    });
  }

  async updateReminder(reminderId: number, userId: number, updates: Partial<Reminder>): Promise<Reminder> {
    return await this.reminderRepository.update(reminderId, userId, updates);
  }

  async deleteReminder(reminderId: number, userId: number): Promise<void> {
    await this.reminderRepository.delete(reminderId, userId);
  }

  async getUpcomingReminders(userId: number, limit: number = 10): Promise<Reminder[]> {
    return await this.reminderRepository.getUpcomingReminders(userId, limit);
  }

  private async verifyBabyOwnership(babyId: number, userId: number): Promise<boolean> {
    const { database } = await import('../config/database');
    const result = await database.query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, userId]
    );
    return result.rows.length > 0;
  }
}
