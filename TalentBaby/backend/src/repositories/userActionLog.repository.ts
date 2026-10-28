import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface UserActionLog {
  id: number;
  user_id?: number;
  action_type: string;
  action_description?: string;
  resource_type?: string;
  resource_id?: number;
  ip_address?: string;
  user_agent?: string;
  request_method?: string;
  request_path?: string;
  status_code?: number;
  error_message?: string;
  metadata?: any;
  created_at: Date;
}

export class UserActionLogRepository {
  async create(logData: Partial<UserActionLog>): Promise<UserActionLog> {
    const result = await prisma.user_action_logs.create({
      data: {
        user_id: logData.user_id || null,
        action_type: logData.action_type!,
        action_description: logData.action_description || null,
        resource_type: logData.resource_type || null,
        resource_id: logData.resource_id || null,
        ip_address: logData.ip_address || null,
        user_agent: logData.user_agent || null,
        request_method: logData.request_method || null,
        request_path: logData.request_path || null,
        status_code: logData.status_code || null,
        error_message: logData.error_message || null,
        metadata: logData.metadata ? logData.metadata : null,
      },
    });
    return result as unknown as UserActionLog;
  }

  async findByUserId(userId: number, limit: number = 100, offset: number = 0): Promise<UserActionLog[]> {
    const results = await prisma.user_action_logs.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });
    return results as unknown as UserActionLog[];
  }

  async findByActionType(actionType: string, limit: number = 100, offset: number = 0): Promise<UserActionLog[]> {
    const results = await prisma.user_action_logs.findMany({
      where: { action_type: actionType },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });
    return results as unknown as UserActionLog[];
  }

  async findByResource(resourceType: string, resourceId: number): Promise<UserActionLog[]> {
    const results = await prisma.user_action_logs.findMany({
      where: {
        resource_type: resourceType,
        resource_id: resourceId,
      },
      orderBy: { created_at: 'desc' },
    });
    return results as unknown as UserActionLog[];
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<UserActionLog[]> {
    const results = await prisma.user_action_logs.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
    return results as unknown as UserActionLog[];
  }

  async getStatistics(userId?: number, startDate?: Date, endDate?: Date): Promise<any> {
    // Aggregate query with dynamic conditions — use $queryRaw
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];
    if (userId) conditions.push(Prisma.sql`user_id = ${userId}`);
    if (startDate) conditions.push(Prisma.sql`created_at >= ${startDate}`);
    if (endDate) conditions.push(Prisma.sql`created_at <= ${endDate}`);

    const whereClause = Prisma.join(conditions, ' AND ');

    const results = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        action_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_action_logs
      WHERE ${whereClause}
      GROUP BY action_type
      ORDER BY count DESC
    `);
    return results;
  }

  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const result = await prisma.$executeRaw`
      DELETE FROM user_action_logs
      WHERE created_at < NOW() - (${daysToKeep} || ' days')::INTERVAL
    `;
    return result;
  }
}
