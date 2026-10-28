import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';
import crypto from 'crypto';

export interface VideoShare {
  id: number;
  memory_id: number;
  shared_by_user_id: number;
  share_token: string;
  share_type: string; // 'link', 'family', 'public'
  expires_at?: Date;
  view_count: number;
  created_at: Date;
}

export class VideoShareRepository {
  async createShare(memoryId: number, userId: number, shareType: string = 'link', expiresInDays?: number): Promise<VideoShare> {
    const shareToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const row = await prisma.video_shares.create({
      data: {
        memory_id: memoryId,
        shared_by_user_id: userId,
        share_token: shareToken,
        share_type: shareType,
        expires_at: expiresAt,
      },
    });
    return row as unknown as VideoShare;
  }

  async findByToken(shareToken: string): Promise<VideoShare | null> {
    const rows = await prisma.$queryRaw<VideoShare[]>(Prisma.sql`
      SELECT * FROM video_shares
      WHERE share_token = ${shareToken}
        AND (expires_at IS NULL OR expires_at > NOW())
    `);
    return rows[0] ?? null;
  }

  async incrementViewCount(shareId: number): Promise<void> {
    await prisma.$executeRaw`
      UPDATE video_shares SET view_count = view_count + 1 WHERE id = ${shareId}
    `;
  }

  async getSharesByMemory(memoryId: number): Promise<VideoShare[]> {
    const rows = await prisma.video_shares.findMany({
      where: { memory_id: memoryId },
      orderBy: { created_at: 'desc' },
    });
    return rows as unknown as VideoShare[];
  }

  async deleteShare(shareId: number, userId: number): Promise<void> {
    const result = await prisma.video_shares.deleteMany({
      where: { id: shareId, shared_by_user_id: userId },
    });
    if (result.count === 0) {
      throw new Error('Share not found');
    }
  }
}
