import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface AdminMessage {
  id: number;
  title: string;
  body: string;
  type: 'announcement' | 'alert' | 'tip' | 'update';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_role: 'all' | 'user' | 'doctor' | 'agent';
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export class AdminMessageRepository {
  async findAll() {
    const rows = await prisma.admin_messages.findMany({
      orderBy: { created_at: 'desc' },
    });
    return rows as unknown as AdminMessage[];
  }

  async findPublished(role?: string) {
    const targetRole = role ?? 'user';
    const rows = await prisma.$queryRaw<AdminMessage[]>(Prisma.sql`
      SELECT * FROM admin_messages
      WHERE is_published = true
        AND (target_role = 'all' OR target_role = ${targetRole})
      ORDER BY published_at DESC
    `);
    return rows;
  }

  async findById(id: number) {
    const row = await prisma.admin_messages.findUnique({ where: { id } });
    return (row as unknown as AdminMessage) ?? undefined;
  }

  async create(data: Omit<AdminMessage, 'id' | 'created_at' | 'updated_at'>) {
    const publishedAt = data.is_published
      ? (data.published_at ? new Date(data.published_at) : new Date())
      : null;

    const row = await prisma.admin_messages.create({
      data: {
        title: data.title,
        body: data.body,
        type: data.type,
        priority: data.priority,
        target_role: data.target_role,
        is_published: data.is_published,
        published_at: publishedAt,
      },
    });
    return row as unknown as AdminMessage;
  }

  async update(id: number, data: Partial<Omit<AdminMessage, 'id' | 'created_at' | 'updated_at'>>) {
    const updateData: Prisma.admin_messagesUpdateInput = { updated_at: new Date() };

    if (data.title       !== undefined) updateData.title       = data.title;
    if (data.body        !== undefined) updateData.body        = data.body;
    if (data.type        !== undefined) updateData.type        = data.type;
    if (data.priority    !== undefined) updateData.priority    = data.priority;
    if (data.target_role !== undefined) updateData.target_role = data.target_role;

    if (data.is_published !== undefined) {
      updateData.is_published = data.is_published;
      if (data.is_published && !data.published_at) {
        updateData.published_at = new Date();
      } else if (!data.is_published) {
        updateData.published_at = null;
      }
    }
    if (data.published_at !== undefined) {
      updateData.published_at = data.published_at ? new Date(data.published_at) : null;
    }

    // Return null if nothing meaningful was requested
    const keys = Object.keys(updateData).filter(k => k !== 'updated_at');
    if (!keys.length) return null;

    const row = await prisma.admin_messages.update({
      where: { id },
      data: updateData,
    });
    return (row as unknown as AdminMessage) ?? undefined;
  }

  async delete(id: number) {
    const result = await prisma.admin_messages.deleteMany({ where: { id } });
    return result.count > 0;
  }
}
