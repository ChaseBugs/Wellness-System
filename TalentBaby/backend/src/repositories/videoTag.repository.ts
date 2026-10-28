import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface VideoTag {
  id: number;
  memory_id: number;
  tag_name: string;
  created_at: Date;
}

export class VideoTagRepository {
  async addTag(memoryId: number, tagName: string): Promise<VideoTag> {
    const rows = await prisma.$queryRaw<VideoTag[]>(Prisma.sql`
      INSERT INTO video_tags (memory_id, tag_name)
      VALUES (${memoryId}, ${tagName})
      ON CONFLICT (memory_id, tag_name) DO NOTHING
      RETURNING *
    `);
    return rows[0];
  }

  async removeTag(memoryId: number, tagName: string): Promise<void> {
    await prisma.video_tags.deleteMany({
      where: { memory_id: memoryId, tag_name: tagName },
    });
  }

  async getTagsByMemory(memoryId: number): Promise<VideoTag[]> {
    const rows = await prisma.video_tags.findMany({
      where: { memory_id: memoryId },
      orderBy: { tag_name: 'asc' },
    });
    return rows as unknown as VideoTag[];
  }

  async getMemoriesByTag(tagName: string, babyId?: number): Promise<any[]> {
    if (babyId !== undefined) {
      return prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT m.* FROM memories m
        JOIN video_tags vt ON m.id = vt.memory_id
        WHERE vt.tag_name = ${tagName}
          AND m.memory_type = 'video'
          AND m.baby_id = ${babyId}
        ORDER BY m.memory_date DESC
      `);
    }
    return prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT m.* FROM memories m
      JOIN video_tags vt ON m.id = vt.memory_id
      WHERE vt.tag_name = ${tagName}
        AND m.memory_type = 'video'
      ORDER BY m.memory_date DESC
    `);
  }

  async getAllTags(babyId?: number): Promise<string[]> {
    let rows: { tag_name: string }[];
    if (babyId !== undefined) {
      rows = await prisma.$queryRaw<{ tag_name: string }[]>(Prisma.sql`
        SELECT DISTINCT vt.tag_name FROM video_tags vt
        JOIN memories m ON vt.memory_id = m.id
        WHERE m.memory_type = 'video'
          AND m.baby_id = ${babyId}
        ORDER BY vt.tag_name ASC
      `);
    } else {
      rows = await prisma.$queryRaw<{ tag_name: string }[]>(Prisma.sql`
        SELECT DISTINCT vt.tag_name FROM video_tags vt
        JOIN memories m ON vt.memory_id = m.id
        WHERE m.memory_type = 'video'
        ORDER BY vt.tag_name ASC
      `);
    }
    return rows.map(r => r.tag_name);
  }
}
