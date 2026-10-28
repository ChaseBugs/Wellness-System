import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface UserAction {
  id: number;
  user_id: number | null;
  action_type: string; // 'login', 'logout', 'create', 'update', 'delete', 'view', 'search', etc.
  action_name: string; // Descriptive name like 'Create Baby Profile', 'View Growth Chart'
  resource_type?: string; // 'baby', 'feeding', 'milestone', etc.
  resource_id?: number;
  details: any; // JSONB for additional details
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export class UserActionRepository {
  async create(actionData: Partial<UserAction>): Promise<UserAction> {
    const results = await prisma.$queryRaw<UserAction[]>(Prisma.sql`
      INSERT INTO user_actions
        (user_id, action_type, action_name, resource_type, resource_id, details, ip_address, user_agent)
      VALUES
        (${actionData.user_id || null},
         ${actionData.action_type},
         ${actionData.action_name},
         ${actionData.resource_type || null},
         ${actionData.resource_id || null},
         ${JSON.stringify(actionData.details || {})}::jsonb,
         ${actionData.ip_address || null},
         ${actionData.user_agent || null})
      RETURNING *
    `);
    return results[0];
  }

  async findByUserId(userId: number, limit: number = 100, offset: number = 0): Promise<UserAction[]> {
    const results = await prisma.$queryRaw<UserAction[]>(Prisma.sql`
      SELECT * FROM user_actions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return results;
  }

  async findByActionType(actionType: string, limit: number = 100): Promise<UserAction[]> {
    const results = await prisma.$queryRaw<UserAction[]>(Prisma.sql`
      SELECT * FROM user_actions
      WHERE action_type = ${actionType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
    return results;
  }

  async findByResource(resourceType: string, resourceId: number): Promise<UserAction[]> {
    const results = await prisma.$queryRaw<UserAction[]>(Prisma.sql`
      SELECT * FROM user_actions
      WHERE resource_type = ${resourceType} AND resource_id = ${resourceId}
      ORDER BY created_at DESC
    `);
    return results;
  }

  async getStatistics(userId?: number, startDate?: Date, endDate?: Date): Promise<any> {
    // Build dynamic conditions
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
      FROM user_actions
      WHERE ${whereClause}
      GROUP BY action_type
      ORDER BY count DESC
    `);
    return results;
  }

  async getRecentActions(limit: number = 50): Promise<UserAction[]> {
    const results = await prisma.$queryRaw<UserAction[]>(Prisma.sql`
      SELECT * FROM user_actions
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
    return results;
  }
}
