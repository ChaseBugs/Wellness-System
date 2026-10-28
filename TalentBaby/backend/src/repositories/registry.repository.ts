import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export interface Registry {
  id: number;
  user_id: number;
  baby_id?: number;
  registry_name: string;
  is_public: boolean;
  share_code?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RegistryItem {
  id: number;
  registry_id: number;
  material_id?: number;
  custom_item_name?: string;
  custom_item_description?: string;
  quantity: number;
  purchased: boolean;
  purchased_by?: string;
  created_at: Date;
  updated_at: Date;
}

export class RegistryRepository {
  async findByUserId(userId: number): Promise<Registry[]> {
    const results = await prisma.registries.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return results as unknown as Registry[];
  }

  async findById(id: number, userId: number): Promise<Registry | null> {
    const result = await prisma.registries.findFirst({
      where: { id, user_id: userId },
    });
    return result as unknown as Registry | null;
  }

  async findByShareCode(shareCode: string): Promise<Registry | null> {
    const result = await prisma.registries.findFirst({
      where: { share_code: shareCode, is_public: true },
    });
    return result as unknown as Registry | null;
  }

  async create(registryData: Partial<Registry>): Promise<Registry> {
    const shareCode = this.generateShareCode();

    const result = await prisma.registries.create({
      data: {
        user_id: registryData.user_id!,
        baby_id: registryData.baby_id || null,
        registry_name: registryData.registry_name!,
        is_public: registryData.is_public || false,
        share_code: shareCode,
      },
    });
    return result as unknown as Registry;
  }

  async update(id: number, userId: number, updates: Partial<Registry>): Promise<Registry> {
    const data: Prisma.registriesUpdateInput = { updated_at: new Date() };
    if (updates.registry_name !== undefined) data.registry_name = updates.registry_name;
    if (updates.is_public !== undefined) data.is_public = updates.is_public;

    if (Object.keys(data).length === 1) {
      const registry = await this.findById(id, userId);
      if (!registry) throw new Error('Registry not found');
      return registry;
    }

    const result = await prisma.registries.updateMany({
      where: { id, user_id: userId },
      data,
    });

    if (result.count === 0) throw new Error('Registry not found');

    const updated = await this.findById(id, userId);
    return updated!;
  }

  async delete(id: number, userId: number): Promise<void> {
    const result = await prisma.registries.deleteMany({
      where: { id, user_id: userId },
    });
    if (result.count === 0) {
      throw new Error('Registry not found');
    }
  }

  // Registry Items
  async getRegistryItems(registryId: number): Promise<RegistryItem[]> {
    const results = await prisma.registry_items.findMany({
      where: { registry_id: registryId },
      orderBy: { created_at: 'desc' },
    });
    return results as unknown as RegistryItem[];
  }

  async addRegistryItem(itemData: Partial<RegistryItem>): Promise<RegistryItem> {
    const result = await prisma.registry_items.create({
      data: {
        registry_id: itemData.registry_id!,
        material_id: itemData.material_id || null,
        custom_item_name: itemData.custom_item_name || null,
        custom_item_description: itemData.custom_item_description || null,
        quantity: itemData.quantity || 1,
      },
    });
    return result as unknown as RegistryItem;
  }

  async updateRegistryItem(itemId: number, updates: Partial<RegistryItem>): Promise<RegistryItem> {
    const data: Prisma.registry_itemsUpdateInput = { updated_at: new Date() };
    if (updates.quantity !== undefined) data.quantity = updates.quantity;
    if (updates.purchased !== undefined) data.purchased = updates.purchased;
    if (updates.purchased_by !== undefined) data.purchased_by = updates.purchased_by;

    if (Object.keys(data).length === 1) {
      throw new Error('No valid fields to update');
    }

    const result = await prisma.registry_items.update({
      where: { id: itemId },
      data,
    });
    return result as unknown as RegistryItem;
  }

  async deleteRegistryItem(itemId: number): Promise<void> {
    const result = await prisma.registry_items.deleteMany({
      where: { id: itemId },
    });
    if (result.count === 0) {
      throw new Error('Registry item not found');
    }
  }

  private generateShareCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
