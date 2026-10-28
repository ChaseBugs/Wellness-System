import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserActionLogService } from '../services/userActionLog.service';

const userActionLogService = new UserActionLogService();

/**
 * Middleware to log user actions
 * Should be used after authentication middleware
 */
export const userActionLogger = (actionType: string, options?: {
  resourceType?: string;
  getResourceId?: (req: Request) => number | undefined;
  getMetadata?: (req: Request, res: Response) => any;
  skipOnSuccess?: boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();

    // Store original end function
    const originalEnd = res.end.bind(res);
    const originalJson = res.json.bind(res);

    // Override res.end to capture response
    res.end = function (chunk?: any, encoding?: any): Response {
      logAction();
      return originalEnd(chunk, encoding);
    };

    // Override res.json to capture JSON responses
    res.json = function (body: any): Response {
      logAction();
      return originalJson(body);
    };

    const logAction = async () => {
      try {
        const authReq = req as AuthRequest;
        const userId = authReq.userId || null;

        // Get resource ID if provided
        const resourceId = options?.getResourceId ? options.getResourceId(req) : undefined;

        // Skip logging successful actions if option is set
        if (options?.skipOnSuccess && res.statusCode < 400) {
          return;
        }

        // Get metadata if provided
        const metadata = options?.getMetadata ? options.getMetadata(req, res) : undefined;

        // Get IP address
        const ipAddress =
          (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
          (req.headers['x-real-ip'] as string) ||
          req.socket.remoteAddress ||
          'unknown';

        // Log the action
        await userActionLogService.logAction(userId, actionType, {
          actionDescription: `${req.method} ${req.path}`,
          resourceType: options?.resourceType,
          resourceId,
          ipAddress,
          userAgent: req.headers['user-agent'] || undefined,
          requestMethod: req.method,
          requestPath: req.path,
          statusCode: res.statusCode,
          errorMessage: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : undefined,
          metadata: {
            ...metadata,
            duration: Date.now() - startTime,
            query: req.query,
            body: sanitizeBody(req.body),
          },
        });
      } catch (error) {
        // Don't fail the request if logging fails
        console.error('Failed to log user action:', error);
      }
    };

    next();
  };
};

/**
 * Helper function to sanitize request body (remove sensitive data)
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'password_hash', 'token', 'secret', 'api_key', 'authorization'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Simple middleware to log all authenticated requests
 */
export const logAllUserActions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthRequest;
  
  // Only log authenticated requests
  if (!authReq.userId) {
    return next();
  }

  const actionType = `${req.method.toLowerCase()}_${req.path.replace(/\//g, '_').replace(/^_/, '')}`;
  
  userActionLogger(actionType)(req, res, next);
};
