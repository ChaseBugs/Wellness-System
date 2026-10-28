import { prisma } from '../config/prisma';

export interface NutritionGuide {
  id: number;
  title: string;
  description: string;
  trimester: number; // 1, 2, or 3
  content: string;
  meal_suggestions: string[];
  recipes: string[];
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class NutritionRepository {
  async findByTrimester(trimester: number): Promise<NutritionGuide[]> {
    const rows = await prisma.nutrition_guides.findMany({
      where: { trimester },
      orderBy: { title: 'asc' },
    });
    return rows as unknown as NutritionGuide[];
  }

  async findAll(): Promise<NutritionGuide[]> {
    const rows = await prisma.nutrition_guides.findMany({
      orderBy: [{ trimester: 'asc' }, { title: 'asc' }],
    });
    return rows as unknown as NutritionGuide[];
  }

  async findById(id: number): Promise<NutritionGuide | null> {
    const row = await prisma.nutrition_guides.findUnique({ where: { id } });
    return (row as unknown as NutritionGuide) ?? null;
  }
}
