import { UserActionLogRepository, UserActionLog } from '../repositories/userActionLog.repository';
import { logUserAction } from '../utils/logger';

export class UserActionLogService {
  private userActionLogRepository: UserActionLogRepository;

  constructor() {
    this.userActionLogRepository = new UserActionLogRepository();
  }

  async logAction(
    userId: number | null,
    actionType: string,
    details: {
      actionDescription?: string;
      resourceType?: string;
      resourceId?: number;
      ipAddress?: string;
      userAgent?: string;
      requestMethod?: string;
      requestPath?: string;
      statusCode?: number;
      errorMessage?: string;
      metadata?: any;
    }
  ): Promise<UserActionLog> {
    // Log to file (date-based files)
    logUserAction(
      userId,
      actionType,
      {
        ...details,
        ip: details.ipAddress,
      },
      details.ipAddress,
      details.userAgent
    );

    // Log to database (primary storage for user actions)
    try {
      const logEntry = await this.userActionLogRepository.create({
        user_id: userId || undefined,
        action_type: actionType,
        action_description: details.actionDescription,
        resource_type: details.resourceType,
        resource_id: details.resourceId,
        ip_address: details.ipAddress,
        user_agent: details.userAgent,
        request_method: details.requestMethod,
        request_path: details.requestPath,
        status_code: details.statusCode,
        error_message: details.errorMessage,
        metadata: details.metadata,
      });

      return logEntry;
    } catch (error) {
      // If database logging fails, still log to file
      console.error('Failed to log user action to database:', error);
      throw error;
    }
  }

  async getUserActionLogs(userId: number, limit: number = 100, offset: number = 0): Promise<UserActionLog[]> {
    return await this.userActionLogRepository.findByUserId(userId, limit, offset);
  }

  async getActionLogsByType(actionType: string, limit: number = 100, offset: number = 0): Promise<UserActionLog[]> {
    return await this.userActionLogRepository.findByActionType(actionType, limit, offset);
  }

  async getResourceLogs(resourceType: string, resourceId: number): Promise<UserActionLog[]> {
    return await this.userActionLogRepository.findByResource(resourceType, resourceId);
  }

  async getLogsByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<UserActionLog[]> {
    return await this.userActionLogRepository.findByDateRange(startDate, endDate, limit);
  }

  async getStatistics(userId?: number, startDate?: Date, endDate?: Date): Promise<any> {
    return await this.userActionLogRepository.getStatistics(userId, startDate, endDate);
  }

  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    return await this.userActionLogRepository.deleteOldLogs(daysToKeep);
  }
}
