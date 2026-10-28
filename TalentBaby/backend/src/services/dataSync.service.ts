import { database } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class DataSyncService {
  async getSyncData(userId: number, lastSyncTime?: Date): Promise<any> {
    const syncData: any = {
      babies: [],
      feedings: [],
      sleep_sessions: [],
      diaper_changes: [],
      growth_records: [],
      milestones: [],
      activities: [],
      memories: [],
      sync_timestamp: new Date().toISOString(),
    };

    // Get babies
    const babiesResult = await database.query(
      'SELECT * FROM babies WHERE user_id = $1',
      [userId]
    );
    syncData.babies = babiesResult.rows;

    if (babiesResult.rows.length === 0) {
      return syncData;
    }

    const babyIds = babiesResult.rows.map((b: any) => b.id);

    // Get all data for user's babies
    if (lastSyncTime) {
      // Only get data updated since last sync
      syncData.feedings = await this.getUpdatedFeedings(babyIds, lastSyncTime);
      syncData.sleep_sessions = await this.getUpdatedSleepSessions(babyIds, lastSyncTime);
      syncData.diaper_changes = await this.getUpdatedDiaperChanges(babyIds, lastSyncTime);
      syncData.growth_records = await this.getUpdatedGrowthRecords(babyIds, lastSyncTime);
      syncData.milestones = await this.getUpdatedMilestones(babyIds, lastSyncTime);
      syncData.activities = await this.getUpdatedActivities(babyIds, lastSyncTime);
      syncData.memories = await this.getUpdatedMemories(babyIds, lastSyncTime);
    } else {
      // Get all data
      syncData.feedings = await this.getAllFeedings(babyIds);
      syncData.sleep_sessions = await this.getAllSleepSessions(babyIds);
      syncData.diaper_changes = await this.getAllDiaperChanges(babyIds);
      syncData.growth_records = await this.getAllGrowthRecords(babyIds);
      syncData.milestones = await this.getAllMilestones(babyIds);
      syncData.activities = await this.getAllActivities(babyIds);
      syncData.memories = await this.getAllMemories(babyIds);
    }

    return syncData;
  }

  private async getUpdatedFeedings(babyIds: number[], lastSyncTime: Date): Promise<any[]> {
    const result = await database.query(
      `SELECT * FROM feedings 
       WHERE baby_id = ANY($1::int[]) AND updated_at > $2 
       ORDER BY updated_at DESC`,
      [babyIds, lastSyncTime]
    );
    return result.rows;
  }

  private async getAllFeedings(babyIds: number[]): Promise<any[]> {
    const result = await database.query(
      'SELECT * FROM feedings WHERE baby_id = ANY($1::int[]) ORDER BY feeding_date DESC',
      [babyIds]
    );
    return result.rows;
  }

  private async getUpdatedSleepSessions(babyIds: number[], lastSyncTime: Date): Promise<any[]> {
    const result = await database.query(
      `SELECT * FROM sleep_sessions 
       WHERE baby_id = ANY($1::int[]) AND updated_at > $2 
       ORDER BY updated_at DESC`,
      [babyIds, lastSyncTime]
    );
    return result.rows;
  }

  private async getAllSleepSessions(babyIds: number[]): Promise<any[]> {
    const result = await database.query(
      'SELECT * FROM sleep_sessions WHERE baby_id = ANY($1::int[]) ORDER BY start_time DESC',
      [babyIds]
    );
    return result.rows;
  }

  private async getUpdatedDiaperChanges(babyIds: number[], lastSyncTime: Date): Promise<any[]> {
    const result = await database.query(
      `SELECT * FROM diaper_changes 
       WHERE baby_id = ANY($1::int[]) AND updated_at > $2 
       ORDER BY updated_at DESC`,
      [babyIds, lastSyncTime]
    );
    return result.rows;
  }

  private async getAllDiaperChanges(babyIds: number[]): Promise<any[]> {
    const result = await database.query(
      'SELECT * FROM diaper_changes WHERE baby_id = ANY($1::int[]) ORDER BY change_time DESC',
      [babyIds]
    );
    return result.rows;
  }

  private async getUpdatedGrowthRecords(babyIds: number[], lastSyncTime: Date): Promise<any[]> {
    const result = await database.query(
      `SELECT * FROM growth_records 
       WHERE baby_id = ANY($1::int[]) AND updated_at > $2 
       ORDER BY updated_at DESC`,
      [babyIds, lastSyncTime]
    );
    return result.rows;
  }

  private async getAllGrowthRecords(babyIds: number[]): Promise<any[]> {
    const result = await database.query(
      'SELECT * FROM growth_records WHERE baby_id = ANY($1::int[]) ORDER BY record_date DESC',
      [babyIds]
    );
    return result.rows;
  }

  private async getUpdatedMilestones(babyIds: number[], lastSyncTime: Date): Promise<any[]> {
    const result = await database.query(
      `SELECT * FROM milestones 
       WHERE baby_id = ANY($1::int[]) AND updated_at > $2 
       ORDER BY updated_at DESC`,
      [babyIds, lastSyncTime]
    );
    return result.rows;
  }

  private async getAllMilestones(babyIds: number[]): Promise<any[]> {
    const result = await database.query(
      'SELECT * FROM milestones WHERE baby_id = ANY($1::int[]) ORDER BY achieved_date DESC',
      [babyIds]
    );
    return result.rows;
  }

  private async getUpdatedActivities(babyIds: number[], lastSyncTime: Date): Promise<any[]> {
    const result = await database.query(
      `SELECT ba.* FROM baby_activities ba
       WHERE ba.baby_id = ANY($1::int[]) AND ba.updated_at > $2 
       ORDER BY ba.updated_at DESC`,
      [babyIds, lastSyncTime]
    );
    return result.rows;
  }

  private async getAllActivities(babyIds: number[]): Promise<any[]> {
    const result = await database.query(
      'SELECT * FROM baby_activities WHERE baby_id = ANY($1::int[]) ORDER BY assigned_date DESC',
      [babyIds]
    );
    return result.rows;
  }

  private async getUpdatedMemories(babyIds: number[], lastSyncTime: Date): Promise<any[]> {
    const result = await database.query(
      `SELECT * FROM memories 
       WHERE baby_id = ANY($1::int[]) AND updated_at > $2 
       ORDER BY updated_at DESC`,
      [babyIds, lastSyncTime]
    );
    return result.rows;
  }

  private async getAllMemories(babyIds: number[]): Promise<any[]> {
    const result = await database.query(
      'SELECT * FROM memories WHERE baby_id = ANY($1::int[]) ORDER BY memory_date DESC',
      [babyIds]
    );
    return result.rows;
  }
}
