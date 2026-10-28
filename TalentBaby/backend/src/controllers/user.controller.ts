import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const profile = await this.userService.getProfile(userId);

      res.status(200).json({
        message: 'Profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const updates = req.body;

      const updatedProfile = await this.userService.updateProfile(userId, updates);

      logger.info('User profile updated', { userId });

      res.status(200).json({
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({ message: 'Users retrieved successfully', data: users });
    } catch (error) {
      next(error);
    }
  }

  async createUserAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, full_name, role, is_premium, relation_to_baby, baby_id } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
      }
      const validRoles = ['user', 'agent', 'doctor'];
      if (role && !validRoles.includes(role)) {
        res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
        return;
      }
      const user = await this.userService.createUserAdmin({
        email, password, full_name, role: role || 'user',
        is_premium, relation_to_baby, baby_id,
      });
      logger.info('Admin created user', { createdBy: req.userId, newUser: user.id, role: user.role });
      res.status(201).json({ message: 'User created successfully', data: user });
    } catch (error) {
      next(error);
    }
  }

  async setActiveBaby(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { baby_id } = req.body;
      const profile = await this.userService.setActiveBaby(userId, baby_id ?? null);
      res.status(200).json({ message: 'Active baby updated.', data: profile });
    } catch (error) {
      next(error);
    }
  }

  async setActiveBabyAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = parseInt(req.params.id, 10);
      const { baby_id } = req.body;
      await this.userService.setActiveBabyAdmin(targetUserId, baby_id ?? null);
      res.status(200).json({ message: 'Active baby updated.' });
    } catch (error) {
      next(error);
    }
  }

  async getNotificationPreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const preferences = await this.userService.getNotificationPreferences(userId);

      res.status(200).json({
        message: 'Notification preferences retrieved',
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNotificationPreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const preferences = req.body;

      const updated = await this.userService.updateNotificationPreferences(userId, preferences);

      logger.info('Notification preferences updated', { userId });

      res.status(200).json({
        message: 'Notification preferences updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
