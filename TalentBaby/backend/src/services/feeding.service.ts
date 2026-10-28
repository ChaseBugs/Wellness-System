import { FeedingRepository, Feeding } from '../repositories/feeding.repository';
import { AppError } from '../middleware/errorHandler';

export class FeedingService {
  private feedingRepository: FeedingRepository;

  constructor() {
    this.feedingRepository = new FeedingRepository();
  }

  async getFeedings(babyId: number, userId: number, startDate?: Date, endDate?: Date): Promise<Feeding[]> {
    const isOwner = await this.feedingRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.feedingRepository.findByBabyId(babyId, startDate, endDate);
  }

  async createFeeding(babyId: number, userId: number, feedingData: Partial<Feeding>): Promise<Feeding> {
    const isOwner = await this.feedingRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.feedingRepository.create({
      ...feedingData,
      baby_id: babyId,
    });
  }

  async updateFeeding(feedingId: number, userId: number, updates: Partial<Feeding>): Promise<Feeding> {
    const feeding = await this.feedingRepository.findById(feedingId);
    if (!feeding) {
      const error: AppError = new Error('Feeding record not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const isOwner = await this.feedingRepository.verifyBabyOwnership(feeding.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return await this.feedingRepository.update(feedingId, updates);
  }

  async deleteFeeding(feedingId: number, userId: number): Promise<void> {
    const feeding = await this.feedingRepository.findById(feedingId);
    if (!feeding) {
      const error: AppError = new Error('Feeding record not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const isOwner = await this.feedingRepository.verifyBabyOwnership(feeding.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    await this.feedingRepository.delete(feedingId);
  }

  async getStatistics(babyId: number, userId: number, startDate: Date, endDate: Date): Promise<any> {
    const isOwner = await this.feedingRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.feedingRepository.getStatistics(babyId, startDate, endDate);
  }

  async getFeedingPatterns(babyId: number, userId: number, days: number = 7): Promise<any> {
    const isOwner = await this.feedingRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const feedings = await this.feedingRepository.findByBabyId(babyId, startDate, endDate);

    // Analyze patterns
    const patterns = {
      averageFeedingInterval: this.calculateAverageInterval(feedings),
      mostCommonTime: this.findMostCommonTime(feedings),
      feedingFrequency: this.calculateFrequency(feedings, days),
      typeDistribution: this.calculateTypeDistribution(feedings),
    };

    return patterns;
  }

  async getFeedingRecommendations(babyId: number, userId: number): Promise<any> {
    const isOwner = await this.feedingRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Get recent feedings
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); // Last 24 hours

    const feedings = await this.feedingRepository.findByBabyId(babyId, startDate, endDate);
    const lastFeeding = feedings.length > 0 ? feedings[0] : null;

    const recommendations = [];

    if (!lastFeeding) {
      recommendations.push({
        type: 'info',
        message: 'Start tracking feedings to get personalized recommendations',
      });
    } else {
      const hoursSinceLastFeeding = (Date.now() - new Date(lastFeeding.feeding_date).getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastFeeding > 4) {
        recommendations.push({
          type: 'reminder',
          message: `It's been ${Math.round(hoursSinceLastFeeding)} hours since last feeding. Consider feeding soon.`,
        });
      }

      if (feedings.length < 6) {
        recommendations.push({
          type: 'suggestion',
          message: 'Your baby may need more frequent feedings. Aim for 6-8 feedings per day.',
        });
      }
    }

    return recommendations;
  }

  private calculateAverageInterval(feedings: any[]): number {
    if (feedings.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < feedings.length; i++) {
      const interval = new Date(feedings[i - 1].feeding_date).getTime() - new Date(feedings[i].feeding_date).getTime();
      intervals.push(interval / (1000 * 60 * 60)); // Convert to hours
    }

    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  private findMostCommonTime(feedings: any[]): string {
    if (feedings.length === 0) return 'N/A';

    const hourCounts: { [key: number]: number } = {};
    feedings.forEach((feeding) => {
      const hour = new Date(feeding.feeding_date).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostCommonHour = Object.keys(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
    );

    return `${mostCommonHour}:00`;
  }

  private calculateFrequency(feedings: any[], days: number): number {
    return feedings.length / days;
  }

  private calculateTypeDistribution(feedings: any[]): any {
    const distribution: any = {};
    feedings.forEach((feeding) => {
      distribution[feeding.feeding_type] = (distribution[feeding.feeding_type] || 0) + 1;
    });
    return distribution;
  }
}
