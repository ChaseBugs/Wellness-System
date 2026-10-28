import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Checklist {
  id: number;
  user_id: number;
  checklist_type: string; // 'hospital_bag', 'birth_plan', 'custom'
  title: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  item_text: string;
  is_checked: boolean;
  item_order: number;
  created_at: Date;
  updated_at: Date;
}

export class ChecklistRepository {
  async findByUserId(userId: number, checklistType?: string): Promise<Checklist[]> {
    const where: Prisma.checklistsWhereInput = { user_id: userId };
    if (checklistType) where.checklist_type = checklistType;

    const results = await prisma.checklists.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return results as unknown as Checklist[];
  }

  async findById(id: number, userId: number): Promise<Checklist | null> {
    const result = await prisma.checklists.findFirst({
      where: { id, user_id: userId },
    });
    return result as unknown as Checklist | null;
  }

  async create(checklistData: Partial<Checklist>): Promise<Checklist> {
    const result = await prisma.checklists.create({
      data: {
        user_id: checklistData.user_id!,
        checklist_type: checklistData.checklist_type!,
        title: checklistData.title!,
        description: checklistData.description || null,
      },
    });
    return result as unknown as Checklist;
  }

  async update(id: number, userId: number, updates: Partial<Checklist>): Promise<Checklist> {
    const data: Prisma.checklistsUpdateInput = { updated_at: new Date() };
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;

    if (Object.keys(data).length === 1) {
      const checklist = await this.findById(id, userId);
      if (!checklist) throw new Error('Checklist not found');
      return checklist;
    }

    const result = await prisma.checklists.updateMany({
      where: { id, user_id: userId },
      data,
    });

    if (result.count === 0) throw new Error('Checklist not found');

    const updated = await this.findById(id, userId);
    return updated!;
  }

  async delete(id: number, userId: number): Promise<void> {
    const result = await prisma.checklists.deleteMany({
      where: { id, user_id: userId },
    });
    if (result.count === 0) {
      throw new Error('Checklist not found');
    }
  }

  // Checklist Items
  async getItemsByChecklist(checklistId: number): Promise<ChecklistItem[]> {
    const results = await prisma.checklist_items.findMany({
      where: { checklist_id: checklistId },
      orderBy: { item_order: 'asc' },
    });
    return results as unknown as ChecklistItem[];
  }

  async addItem(itemData: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const result = await prisma.checklist_items.create({
      data: {
        checklist_id: itemData.checklist_id!,
        item_text: itemData.item_text!,
        item_order: itemData.item_order || 0,
      },
    });
    return result as unknown as ChecklistItem;
  }

  async updateItem(itemId: number, updates: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const data: Prisma.checklist_itemsUpdateInput = { updated_at: new Date() };
    if (updates.item_text !== undefined) data.item_text = updates.item_text;
    if (updates.is_checked !== undefined) data.is_checked = updates.is_checked;
    if (updates.item_order !== undefined) data.item_order = updates.item_order;

    if (Object.keys(data).length === 1) {
      throw new Error('No valid fields to update');
    }

    const result = await prisma.checklist_items.update({
      where: { id: itemId },
      data,
    });
    return result as unknown as ChecklistItem;
  }

  async deleteItem(itemId: number): Promise<void> {
    const result = await prisma.checklist_items.deleteMany({
      where: { id: itemId },
    });
    if (result.count === 0) {
      throw new Error('Checklist item not found');
    }
  }
}
