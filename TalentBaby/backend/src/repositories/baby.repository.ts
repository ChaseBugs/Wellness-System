import { prisma } from '../config/prisma';

export interface Baby {
  id: number;
  user_id: number;
  name: string;
  birth_date: Date;
  gender?: string;
  birth_weight_kg?: number;
  birth_height_cm?: number;
  profile_picture_url?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class BabyRepository {
  async findByUserId(userId: number): Promise<Baby[]> {
    const babies = await prisma.babies.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return babies as unknown as Baby[];
  }

  async findAll(): Promise<Baby[]> {
    const babies = await prisma.babies.findMany({
      orderBy: { created_at: 'desc' },
    });
    return babies as unknown as Baby[];
  }

  async findById(id: number, userId?: number): Promise<Baby | null> {
    const baby = await prisma.babies.findFirst({
      where: {
        id,
        ...(userId ? { user_id: userId } : {}),
      },
    });
    return baby as unknown as Baby | null;
  }

  async create(babyData: {
    user_id: number;
    name: string;
    birth_date: Date;
    gender?: string;
    birth_weight_kg?: number;
    birth_height_cm?: number;
    profile_picture_url?: string;
    avatar_url?: string;
  }): Promise<Baby> {
    const baby = await prisma.babies.create({
      data: {
        user_id: babyData.user_id,
        name: babyData.name,
        birth_date: babyData.birth_date,
        gender: babyData.gender ?? null,
        birth_weight_kg: babyData.birth_weight_kg ?? null,
        birth_height_cm: babyData.birth_height_cm ?? null,
        profile_picture_url: babyData.profile_picture_url ?? null,
        avatar_url: babyData.avatar_url ?? null,
      },
    });
    return baby as unknown as Baby;
  }

  async update(id: number, userId: number, updates: Partial<Baby>): Promise<Baby> {
    const allowedFields = [
      'name',
      'birth_date',
      'gender',
      'birth_weight_kg',
      'birth_height_cm',
      'profile_picture_url',
      'avatar_url',
    ] as const;

    type AllowedField = typeof allowedFields[number];

    const filteredData: Partial<Pick<Baby, AllowedField>> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        (filteredData as any)[key] = updates[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      const baby = await this.findById(id, userId);
      if (!baby) throw new Error('Baby not found');
      return baby;
    }

    // Verify the baby exists and belongs to the user before updating
    const existing = await prisma.babies.findFirst({ where: { id, user_id: userId } });
    if (!existing) throw new Error('Baby not found');

    const baby = await prisma.babies.update({
      where: { id },
      data: { ...filteredData, updated_at: new Date() },
    });
    return baby as unknown as Baby;
  }

  async delete(id: number, userId: number): Promise<void> {
    const result = await prisma.babies.deleteMany({
      where: { id, user_id: userId },
    });

    if (result.count === 0) {
      throw new Error('Baby not found');
    }
  }
}
