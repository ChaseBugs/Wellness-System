import { DailyUpdateRepository, DailyUpdate } from '../repositories/dailyUpdate.repository';
import { database } from '../config/database';

export class DailyUpdateService {
  private dailyUpdateRepository: DailyUpdateRepository;

  constructor() {
    this.dailyUpdateRepository = new DailyUpdateRepository();
  }

  async getDailyUpdates(babyId: number): Promise<any> {
    // Get baby's age in months
    const babyResult = await database.query('SELECT birth_date FROM babies WHERE id = $1', [babyId]);
    if (babyResult.rows.length === 0) {
      throw new Error('Baby not found');
    }

    const birthDate = new Date(babyResult.rows[0].birth_date);
    const today = new Date();
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // Get updates for this age
    const tip = await this.dailyUpdateRepository.getRandomUpdate(ageInMonths, 'tip');
    const development = await this.dailyUpdateRepository.getRandomUpdate(ageInMonths, 'development');
    const activity = await this.dailyUpdateRepository.getRandomUpdate(ageInMonths, 'activity');
    const safety = await this.dailyUpdateRepository.getRandomUpdate(ageInMonths, 'safety');

    return {
      age_in_months: ageInMonths,
      updates: {
        tip,
        development,
        activity,
        safety,
      },
    };
  }

  async getAllUpdates(ageInMonths: number, contentType?: string): Promise<DailyUpdate[]> {
    return await this.dailyUpdateRepository.findByAge(ageInMonths, contentType);
  }
}
