import { DiaperRepository, DiaperChange } from '../repositories/diaper.repository';
import { AppError } from '../middleware/errorHandler';

export class DiaperService {
  private diaperRepository: DiaperRepository;

  constructor() {
    this.diaperRepository = new DiaperRepository();
  }

  async getDiaperChanges(babyId: number, userId: number, startDate?: Date, endDate?: Date): Promise<DiaperChange[]> {
    const isOwner = await this.diaperRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.diaperRepository.findByBabyId(babyId, startDate, endDate);
  }

  async createDiaperChange(babyId: number, userId: number, diaperData: Partial<DiaperChange>): Promise<DiaperChange> {
    const isOwner = await this.diaperRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.diaperRepository.create({
      ...diaperData,
      baby_id: babyId,
    });
  }

  async updateDiaperChange(changeId: number, userId: number, updates: Partial<DiaperChange>): Promise<DiaperChange> {
    const change = await this.diaperRepository.findById(changeId);
    if (!change) {
      const error: AppError = new Error('Diaper change not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const isOwner = await this.diaperRepository.verifyBabyOwnership(change.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return await this.diaperRepository.update(changeId, updates);
  }

  async deleteDiaperChange(changeId: number, userId: number): Promise<void> {
    const change = await this.diaperRepository.findById(changeId);
    if (!change) {
      const error: AppError = new Error('Diaper change not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const isOwner = await this.diaperRepository.verifyBabyOwnership(change.baby_id, userId);
    if (!isOwner) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    await this.diaperRepository.delete(changeId);
  }

  async getDailySummary(babyId: number, userId: number, date: Date): Promise<any> {
    const isOwner = await this.diaperRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.diaperRepository.getDailySummary(babyId, date);
  }

  async getStatistics(babyId: number, userId: number, startDate: Date, endDate: Date): Promise<any> {
    const isOwner = await this.diaperRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.diaperRepository.getStatistics(babyId, startDate, endDate);
  }

  async getDiaperPatterns(babyId: number, userId: number, days: number = 7): Promise<any> {
    const isOwner = await this.diaperRepository.verifyBabyOwnership(babyId, userId);
    if (!isOwner) {
      const error: AppError = new Error('Baby not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const changes = await this.diaperRepository.findByBabyId(babyId, startDate, endDate);

    const patterns = {
      averagePerDay: changes.length / days,
      typeDistribution: this.calculateTypeDistribution(changes),
      mostActiveTime: this.findMostActiveTime(changes),
      frequency: this.calculateFrequency(changes),
    };

    return patterns;
  }

  private calculateTypeDistribution(changes: any[]): any {
    const distribution: any = { wet: 0, dirty: 0, both: 0 };
    changes.forEach((change) => {
      if (change.diaper_type === 'wet') distribution.wet++;
      else if (change.diaper_type === 'dirty') distribution.dirty++;
      else if (change.diaper_type === 'both') distribution.both++;
    });
    return distribution;
  }

  private findMostActiveTime(changes: any[]): string {
    if (changes.length === 0) return 'N/A';

    const hourCounts: { [key: number]: number } = {};
    changes.forEach((change) => {
      const hour = new Date(change.change_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostActiveHour = Object.keys(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
    );

    return `${mostActiveHour}:00`;
  }

  private calculateFrequency(changes: any[]): any {
    if (changes.length === 0) return { averageInterval: 0, minInterval: 0, maxInterval: 0 };

    const intervals: number[] = [];
    for (let i = 1; i < changes.length; i++) {
      const interval =
        (new Date(changes[i - 1].change_time).getTime() - new Date(changes[i].change_time).getTime()) / (1000 * 60); // minutes
      intervals.push(Math.abs(interval));
    }

    return {
      averageInterval: intervals.reduce((a, b) => a + b, 0) / intervals.length,
      minInterval: Math.min(...intervals),
      maxInterval: Math.max(...intervals),
    };
  }
}
