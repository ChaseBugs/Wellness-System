import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ReminderService } from '../services/reminder.service';
import { logger } from '../utils/logger';

export class ReminderController {
  private reminderService: ReminderService;

  constructor() {
    this.reminderService = new ReminderService();
  }

  async getReminders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

      const reminders = await this.reminderService.getReminders(userId, isActive);

      res.status(200).json({
        message: 'Reminders retrieved successfully',
        data: reminders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBabyReminders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const babyId = parseInt(req.params.babyId, 10);

      const reminders = await this.reminderService.getBabyReminders(babyId, userId);

      res.status(200).json({
        message: 'Baby reminders retrieved successfully',
        data: reminders,
      });
    } catch (error) {
      next(error);
    }
  }

  async createReminder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const reminderData = req.body;

      const reminder = await this.reminderService.createReminder(userId, reminderData);

      logger.info('Reminder created', { userId, reminderId: reminder.id });

      res.status(201).json({
        message: 'Reminder created successfully',
        data: reminder,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReminder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const reminderId = parseInt(req.params.id, 10);
      const updates = req.body;

      const reminder = await this.reminderService.updateReminder(reminderId, userId, updates);

      logger.info('Reminder updated', { userId, reminderId });

      res.status(200).json({
        message: 'Reminder updated successfully',
        data: reminder,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReminder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const reminderId = parseInt(req.params.id, 10);

      await this.reminderService.deleteReminder(reminderId, userId);

      logger.info('Reminder deleted', { userId, reminderId });

      res.status(200).json({
        message: 'Reminder deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingReminders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const reminders = await this.reminderService.getUpcomingReminders(userId, limit);

      res.status(200).json({
        message: 'Upcoming reminders retrieved successfully',
        data: reminders,
      });
    } catch (error) {
      next(error);
    }
  }
}
