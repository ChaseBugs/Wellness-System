import { PregnancyWeekRepository, PregnancyWeek } from '../repositories/pregnancyWeek.repository';
import { AppError } from '../middleware/errorHandler';

export class PregnancyWeekService {
  private pregnancyWeekRepository: PregnancyWeekRepository;

  constructor() {
    this.pregnancyWeekRepository = new PregnancyWeekRepository();
  }

  async getWeekContent(weekNumber: number): Promise<PregnancyWeek> {
    const week = await this.pregnancyWeekRepository.findByWeek(weekNumber);
    if (!week) {
      const error: AppError = new Error('Week content not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return week;
  }

  async getAllWeeks(): Promise<PregnancyWeek[]> {
    return await this.pregnancyWeekRepository.findAll();
  }

  async getWeekRange(startWeek: number, endWeek: number): Promise<PregnancyWeek[]> {
    return await this.pregnancyWeekRepository.findByWeekRange(startWeek, endWeek);
  }

  async createWeekContent(weekData: Partial<PregnancyWeek>): Promise<PregnancyWeek> {
    return await this.pregnancyWeekRepository.create(weekData);
  }
}
