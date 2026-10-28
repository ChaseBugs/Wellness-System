import { GrowthRepository, GrowthRecord } from '../repositories/growth.repository';
import { AppError } from '../middleware/errorHandler';

// WHO Growth Standards Percentile Calculator (simplified version)
// In production, you'd use official WHO tables or a library
export class GrowthService {
  private growthRepository: GrowthRepository;

  constructor() {
    this.growthRepository = new GrowthRepository();
  }

  async getGrowthRecords(babyId: number, userId: number): Promise<GrowthRecord[]> {
    // Verify ownership
    const isOwner = await this.growthRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.growthRepository.findByBabyId(babyId);
  }

  async createGrowthRecord(
    babyId: number,
    userId: number,
    growthData: Partial<GrowthRecord>
  ): Promise<GrowthRecord> {
    // Verify ownership
    const isOwner = await this.growthRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Get baby's birth date to calculate age
    const { database } = await import('../config/database');
    const babyResult = await database.query('SELECT birth_date FROM babies WHERE id = $1', [babyId]);
    if (babyResult.rows.length === 0) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const birthDate = new Date(babyResult.rows[0].birth_date);
    const recordDate = new Date(growthData.record_date!);
    const ageInDays = Math.floor((recordDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate percentiles (simplified - in production use WHO tables)
    const percentiles = this.calculatePercentiles(
      ageInDays,
      growthData.weight_kg,
      growthData.height_cm,
      growthData.head_circumference_cm
    );

    return await this.growthRepository.create({
      baby_id: babyId,
      record_date: growthData.record_date!,
      age_in_days: ageInDays,
      weight_kg: growthData.weight_kg,
      height_cm: growthData.height_cm,
      head_circumference_cm: growthData.head_circumference_cm,
      percentile_weight: percentiles.weight,
      percentile_height: percentiles.height,
      percentile_head_circumference: percentiles.headCircumference,
      notes: growthData.notes,
    });
  }

  async updateGrowthRecord(
    recordId: number,
    userId: number,
    updates: Partial<GrowthRecord>
  ): Promise<GrowthRecord> {
    const record = await this.growthRepository.findById(recordId);
    if (!record) {
      const error: AppError = new Error('Growth record not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Verify ownership
    const isOwner = await this.growthRepository.verifyBabyOwnership(record.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return await this.growthRepository.update(recordId, updates);
  }

  async deleteGrowthRecord(recordId: number, userId: number): Promise<void> {
    const record = await this.growthRepository.findById(recordId);
    if (!record) {
      const error: AppError = new Error('Growth record not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Verify ownership
    const isOwner = await this.growthRepository.verifyBabyOwnership(record.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    await this.growthRepository.delete(recordId);
  }

  async getGrowthChart(babyId: number, userId: number) {
    // Verify ownership
    const isOwner = await this.growthRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const records = await this.growthRepository.findByBabyId(babyId);

    // Get baby info for gender-based charts
    const { database } = await import('../config/database');
    const babyResult = await database.query(
      'SELECT birth_date, gender FROM babies WHERE id = $1',
      [babyId]
    );
    const baby = babyResult.rows[0];

    return {
      records,
      baby: {
        birth_date: baby.birth_date,
        gender: baby.gender,
      },
      // In production, add WHO percentile reference data here
    };
  }

  async getEnhancedGrowthChart(babyId: number, userId: number, metric: string, startDate?: Date, endDate?: Date): Promise<any> {
    const isOwner = await this.growthRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Get growth records
    const records = await this.growthRepository.findByBabyId(babyId, startDate, endDate);

    // Calculate trends
    const trends = this.calculateTrends(records, metric);

    // Get WHO percentile data
    const percentileData = this.calculatePercentileData(records, metric);

    return {
      records,
      trends,
      percentileData,
      metric,
    };
  }

  private calculateTrends(records: any[], metric: string): any {
    if (records.length < 2) {
      return { direction: 'insufficient_data', rate: 0 };
    }

    const sorted = records.sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    let firstValue: number, lastValue: number;

    if (metric === 'weight') {
      firstValue = parseFloat(first.weight_kg);
      lastValue = parseFloat(last.weight_kg);
    } else if (metric === 'height') {
      firstValue = parseFloat(first.height_cm);
      lastValue = parseFloat(last.height_cm);
    } else {
      firstValue = parseFloat(first.head_circumference_cm);
      lastValue = parseFloat(last.head_circumference_cm);
    }

    const daysDiff = (new Date(last.record_date).getTime() - new Date(first.record_date).getTime()) / (1000 * 60 * 60 * 24);
    const rate = (lastValue - firstValue) / daysDiff;

    return {
      direction: rate > 0 ? 'increasing' : rate < 0 ? 'decreasing' : 'stable',
      rate: Math.abs(rate),
      change: lastValue - firstValue,
      period_days: daysDiff,
    };
  }

  private calculatePercentileData(records: any[], metric: string): any[] {
    return records.map((record) => {
      let value: number, percentile: number;

      if (metric === 'weight') {
        value = parseFloat(record.weight_kg);
        percentile = record.percentile_weight;
      } else if (metric === 'height') {
        value = parseFloat(record.height_cm);
        percentile = record.percentile_height;
      } else {
        value = parseFloat(record.head_circumference_cm);
        percentile = record.percentile_head_circumference;
      }

      return {
        date: record.record_date,
        value,
        percentile,
        age_in_days: record.age_in_days,
      };
    });
  }

  // Simplified percentile calculation - in production, use official WHO tables
  private calculatePercentiles(
    ageInDays: number,
    weight?: number,
    height?: number,
    headCircumference?: number
  ): {
    weight?: number;
    height?: number;
    headCircumference?: number;
  } {
    // This is a placeholder - implement actual WHO percentile calculations
    // You would typically use a library or lookup tables based on WHO standards
    return {
      weight: weight ? 50 : undefined, // Placeholder: 50th percentile
      height: height ? 50 : undefined,
      headCircumference: headCircumference ? 50 : undefined,
    };
  }
}
