import { PregnancyRepository, Pregnancy } from '../repositories/pregnancy.repository';
import { AppError } from '../middleware/errorHandler';

export class PregnancyService {
  private pregnancyRepository: PregnancyRepository;

  constructor() {
    this.pregnancyRepository = new PregnancyRepository();
  }

  async getPregnancy(userId: number): Promise<Pregnancy | null> {
    return await this.pregnancyRepository.findByUserId(userId);
  }

  async createPregnancy(userId: number, pregnancyData: Partial<Pregnancy>): Promise<Pregnancy> {
    return await this.pregnancyRepository.create({
      ...pregnancyData,
      user_id: userId,
    });
  }

  async updatePregnancy(pregnancyId: number, userId: number, updates: Partial<Pregnancy>): Promise<Pregnancy> {
    return await this.pregnancyRepository.update(pregnancyId, userId, updates);
  }

  async deletePregnancy(pregnancyId: number, userId: number): Promise<void> {
    await this.pregnancyRepository.delete(pregnancyId, userId);
  }

  async calculateDueDate(lmpDate: Date): Promise<Date> {
    // Due date is typically 280 days (40 weeks) from LMP
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);
    return dueDate;
  }

  async calculateFromConception(conceptionDate: Date): Promise<Date> {
    // Due date is typically 266 days (38 weeks) from conception
    const dueDate = new Date(conceptionDate);
    dueDate.setDate(dueDate.getDate() + 266);
    return dueDate;
  }
}
