import { NutritionRepository, NutritionGuide } from '../repositories/nutrition.repository';

export class NutritionService {
  private nutritionRepository: NutritionRepository;

  constructor() {
    this.nutritionRepository = new NutritionRepository();
  }

  async getNutritionByTrimester(trimester: number): Promise<NutritionGuide[]> {
    return await this.nutritionRepository.findByTrimester(trimester);
  }

  async getAllNutrition(): Promise<NutritionGuide[]> {
    return await this.nutritionRepository.findAll();
  }

  async getNutrition(id: number): Promise<NutritionGuide> {
    const guide = await this.nutritionRepository.findById(id);
    if (!guide) {
      throw new Error('Nutrition guide not found');
    }
    return guide;
  }
}
