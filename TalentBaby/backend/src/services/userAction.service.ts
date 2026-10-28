import { UserActionRepository, UserAction } from '../repositories/userAction.repository';
import { logUserAction } from '../utils/logger';

export class UserActionService {
  private userActionRepository: UserActionRepository;

  constructor() {
    this.userActionRepository = new UserActionRepository();
  }

  async logAction(
    userId: number | null,
    actionType: string,
    actionName: string,
    details: any = {},
    ipAddress?: string,
    userAgent?: string,
    resourceType?: string,
    resourceId?: number
  ): Promise<UserAction> {
    // Log to file
    logUserAction(userId, actionName, details, ipAddress, userAgent);

    // Save to database
    return await this.userActionRepository.create({
      user_id: userId,
      action_type: actionType,
      action_name: actionName,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async getUserActions(userId: number, limit: number = 100, offset: number = 0): Promise<UserAction[]> {
    return await this.userActionRepository.findByUserId(userId, limit, offset);
  }

  async getActionStatistics(userId?: number, startDate?: Date, endDate?: Date): Promise<any> {
    return await this.userActionRepository.getStatistics(userId, startDate, endDate);
  }

  async getRecentActions(limit: number = 50): Promise<UserAction[]> {
    return await this.userActionRepository.getRecentActions(limit);
  }
}
