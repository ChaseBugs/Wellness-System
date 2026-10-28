import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserActionLogService } from '../services/userActionLog.service';
import { logger } from '../utils/logger';

export class AuthController {
  private authService: AuthService;
  private userActionLogService: UserActionLogService;

  constructor() {
    this.authService = new AuthService();
    this.userActionLogService = new UserActionLogService();
  }

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName } = req.body;

      const result = await this.authService.signup(email, password, fullName);

      logger.info('User signed up', { email, userId: result.user.id });

      // Log user action
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                       (req.headers['x-real-ip'] as string) || 
                       req.socket.remoteAddress || 'unknown';

      await this.userActionLogService.logAction(result.user.id, 'user_signup', {
        actionDescription: 'User registered',
        ipAddress,
        userAgent: req.headers['user-agent'] || undefined,
        requestMethod: req.method,
        requestPath: req.path,
        statusCode: 201,
        metadata: { email },
      });

      res.status(201).json({
        message: 'User created successfully',
        data: result,
      });
    } catch (error) {
      // Log failed signup attempt
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                       (req.headers['x-real-ip'] as string) || 
                       req.socket.remoteAddress || 'unknown';

      await this.userActionLogService.logAction(null, 'user_signup_failed', {
        actionDescription: 'Failed user registration',
        ipAddress,
        userAgent: req.headers['user-agent'] || undefined,
        requestMethod: req.method,
        requestPath: req.path,
        statusCode: (error as any)?.statusCode || 500,
        errorMessage: (error as Error)?.message,
        metadata: { email: req.body.email },
      }).catch(() => {}); // Don't fail if logging fails

      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      logger.info('User logged in', { email, userId: result.user.id });

      // Log user action
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                       (req.headers['x-real-ip'] as string) || 
                       req.socket.remoteAddress || 'unknown';

      await this.userActionLogService.logAction(result.user.id, 'user_login', {
        actionDescription: 'User logged in',
        ipAddress,
        userAgent: req.headers['user-agent'] || undefined,
        requestMethod: req.method,
        requestPath: req.path,
        statusCode: 200,
        metadata: { email },
      });

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      // Log failed login attempt
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                       (req.headers['x-real-ip'] as string) || 
                       req.socket.remoteAddress || 'unknown';

      await this.userActionLogService.logAction(null, 'user_login_failed', {
        actionDescription: 'Failed login attempt',
        ipAddress,
        userAgent: req.headers['user-agent'] || undefined,
        requestMethod: req.method,
        requestPath: req.path,
        statusCode: (error as any)?.statusCode || 401,
        errorMessage: (error as Error)?.message,
        metadata: { email: req.body.email },
      }).catch(() => {}); // Don't fail if logging fails

      next(error);
    }
  }
}
