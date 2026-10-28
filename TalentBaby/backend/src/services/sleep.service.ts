import { SleepRepository, SleepSession } from '../repositories/sleep.repository';
import { AppError } from '../middleware/errorHandler';

export class SleepService {
  private sleepRepository: SleepRepository;

  constructor() {
    this.sleepRepository = new SleepRepository();
  }

  async getSleepSessions(babyId: number, userId: number, startDate?: Date, endDate?: Date): Promise<SleepSession[]> {
    const isOwner = await this.sleepRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.sleepRepository.findByBabyId(babyId, startDate, endDate);
  }

  async createSleepSession(babyId: number, userId: number, sleepData: Partial<SleepSession>): Promise<SleepSession> {
    const isOwner = await this.sleepRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.sleepRepository.create({
      ...sleepData,
      baby_id: babyId,
    });
  }

  async updateSleepSession(sessionId: number, userId: number, updates: Partial<SleepSession>): Promise<SleepSession> {
    const session = await this.sleepRepository.findById(sessionId);
    if (!session) {
      const error: AppError = new Error('Sleep session not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const isOwner = await this.sleepRepository.verifyBabyOwnership(session.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return await this.sleepRepository.update(sessionId, updates);
  }

  async deleteSleepSession(sessionId: number, userId: number): Promise<void> {
    const session = await this.sleepRepository.findById(sessionId);
    if (!session) {
      const error: AppError = new Error('Sleep session not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const isOwner = await this.sleepRepository.verifyBabyOwnership(session.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    await this.sleepRepository.delete(sessionId);
  }

  async getStatistics(babyId: number, userId: number, startDate: Date, endDate: Date): Promise<any> {
    const isOwner = await this.sleepRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.sleepRepository.getStatistics(babyId, startDate, endDate);
  }

  async getSleepPatterns(babyId: number, userId: number, days: number = 7): Promise<any> {
    const isOwner = await this.sleepRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await this.sleepRepository.findByBabyId(babyId, startDate, endDate);

    const patterns = {
      averageSleepDuration: this.calculateAverageDuration(sessions),
      totalSleepPerDay: this.calculateTotalSleepPerDay(sessions, days),
      napCount: this.countNaps(sessions),
      bedtimePattern: this.analyzeBedtimePattern(sessions),
      sleepQuality: this.calculateAverageQuality(sessions),
    };

    return patterns;
  }

  async getSleepRecommendations(babyId: number, userId: number): Promise<any> {
    const isOwner = await this.sleepRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const sessions = await this.sleepRepository.findByBabyId(babyId, startDate, endDate);
    const patterns = await this.getSleepPatterns(babyId, userId, 7);

    const recommendations = [];

    // Age-based recommendations (simplified)
    const { database } = await import('../config/database');
    const babyResult = await database.query('SELECT birth_date FROM babies WHERE id = $1', [babyId]);
    if (babyResult.rows.length > 0) {
      const birthDate = new Date(babyResult.rows[0].birth_date);
      const ageInMonths = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

      let recommendedSleep = 0;
      if (ageInMonths < 3) recommendedSleep = 14;
      else if (ageInMonths < 6) recommendedSleep = 13;
      else if (ageInMonths < 12) recommendedSleep = 12;
      else recommendedSleep = 11;

      if (patterns.totalSleepPerDay < recommendedSleep) {
        recommendations.push({
          type: 'suggestion',
          message: `Your baby is getting ${patterns.totalSleepPerDay.toFixed(1)} hours of sleep. Recommended: ${recommendedSleep} hours for ${ageInMonths} month old.`,
        });
      }

      if (patterns.napCount < 2 && ageInMonths < 12) {
        recommendations.push({
          type: 'suggestion',
          message: 'Consider establishing a consistent nap schedule. Most babies need 2-3 naps per day.',
        });
      }
    }

    return recommendations;
  }

  private calculateAverageDuration(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    return total / sessions.length;
  }

  private calculateTotalSleepPerDay(sessions: any[], days: number): number {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    return total / days / 60; // Convert to hours
  }

  private countNaps(sessions: any[]): number {
    return sessions.filter((s) => s.sleep_type === 'nap').length;
  }

  private analyzeBedtimePattern(sessions: any[]): any {
    const bedtimes = sessions
      .filter((s) => s.sleep_type === 'night' || s.sleep_type === 'bedtime')
      .map((s) => new Date(s.start_time).getHours());

    if (bedtimes.length === 0) return { average: 'N/A', consistency: 'N/A' };

    const average = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    const variance = bedtimes.reduce((sum, h) => sum + Math.pow(h - average, 2), 0) / bedtimes.length;
    const consistency = variance < 1 ? 'Very Consistent' : variance < 2 ? 'Consistent' : 'Variable';

    return {
      average: `${Math.round(average)}:00`,
      consistency,
    };
  }

  private calculateAverageQuality(sessions: any[]): number {
    const withQuality = sessions.filter((s) => s.quality_rating);
    if (withQuality.length === 0) return 0;
    const total = withQuality.reduce((sum, s) => sum + s.quality_rating, 0);
    return total / withQuality.length;
  }
}
