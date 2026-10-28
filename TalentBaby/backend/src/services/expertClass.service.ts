import { ExpertClassRepository, ExpertClass } from '../repositories/expertClass.repository';

export class ExpertClassService {
  private classRepository: ExpertClassRepository;

  constructor() {
    this.classRepository = new ExpertClassRepository();
  }

  async getClasses(classType?: string, category?: string, isPremium?: boolean): Promise<ExpertClass[]> {
    return await this.classRepository.findAll(classType, category, isPremium);
  }

  async getClass(id: number): Promise<ExpertClass> {
    const classData = await this.classRepository.findById(id);
    if (!classData) {
      throw new Error('Class not found');
    }
    return classData;
  }

  async enrollUser(userId: number, classId: number): Promise<void> {
    await this.classRepository.enrollUser(userId, classId);
  }

  async getEnrolledClasses(userId: number): Promise<ExpertClass[]> {
    return await this.classRepository.getEnrolledClasses(userId);
  }

  async markCompleted(userId: number, classId: number): Promise<void> {
    await this.classRepository.markCompleted(userId, classId);
  }
}
