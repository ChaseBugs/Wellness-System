import { prisma } from '../config/prisma';

export interface BumpPhoto {
  id: number;
  pregnancy_id: number;
  photo_url: string;
  thumbnail_url?: string;
  week_number: number;
  photo_date: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class BumpPhotoRepository {
  async findByPregnancyId(pregnancyId: number): Promise<BumpPhoto[]> {
    const rows = await prisma.bump_photos.findMany({
      where: { pregnancy_id: pregnancyId },
      orderBy: [{ week_number: 'asc' }, { photo_date: 'asc' }],
    });
    return rows as unknown as BumpPhoto[];
  }

  async findById(id: number): Promise<BumpPhoto | null> {
    const row = await prisma.bump_photos.findUnique({ where: { id } });
    return row as unknown as BumpPhoto | null;
  }

  async create(photoData: Partial<BumpPhoto>): Promise<BumpPhoto> {
    const row = await prisma.bump_photos.create({
      data: {
        pregnancy_id: photoData.pregnancy_id!,
        photo_url: photoData.photo_url!,
        thumbnail_url: photoData.thumbnail_url ?? null,
        week_number: photoData.week_number!,
        photo_date: photoData.photo_date!,
        notes: photoData.notes ?? null,
      },
    });
    return row as unknown as BumpPhoto;
  }

  async delete(id: number): Promise<void> {
    const result = await prisma.bump_photos.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new Error('Bump photo not found');
    }
  }
}
