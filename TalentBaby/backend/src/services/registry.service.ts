import { RegistryRepository, Registry, RegistryItem } from '../repositories/registry.repository';
import { AppError } from '../middleware/errorHandler';

export class RegistryService {
  private registryRepository: RegistryRepository;

  constructor() {
    this.registryRepository = new RegistryRepository();
  }

  async getRegistries(userId: number): Promise<Registry[]> {
    return await this.registryRepository.findByUserId(userId);
  }

  async getRegistry(id: number, userId: number): Promise<Registry> {
    const registry = await this.registryRepository.findById(id, userId);
    if (!registry) {
      const error: AppError = new Error('Registry not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return registry;
  }

  async getRegistryByShareCode(shareCode: string): Promise<Registry> {
    const registry = await this.registryRepository.findByShareCode(shareCode);
    if (!registry) {
      const error: AppError = new Error('Registry not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return registry;
  }

  async createRegistry(userId: number, registryData: Partial<Registry>): Promise<Registry> {
    return await this.registryRepository.create({
      ...registryData,
      user_id: userId,
    });
  }

  async updateRegistry(registryId: number, userId: number, updates: Partial<Registry>): Promise<Registry> {
    return await this.registryRepository.update(registryId, userId, updates);
  }

  async deleteRegistry(registryId: number, userId: number): Promise<void> {
    await this.registryRepository.delete(registryId, userId);
  }

  async getRegistryItems(registryId: number, userId: number): Promise<RegistryItem[]> {
    // Verify registry ownership
    const registry = await this.registryRepository.findById(registryId, userId);
    if (!registry) {
      const error: AppError = new Error('Registry not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return await this.registryRepository.getRegistryItems(registryId);
  }

  async addRegistryItem(registryId: number, userId: number, itemData: Partial<RegistryItem>): Promise<RegistryItem> {
    // Verify registry ownership
    const registry = await this.registryRepository.findById(registryId, userId);
    if (!registry) {
      const error: AppError = new Error('Registry not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return await this.registryRepository.addRegistryItem({
      ...itemData,
      registry_id: registryId,
    });
  }

  async updateRegistryItem(itemId: number, userId: number, updates: Partial<RegistryItem>): Promise<RegistryItem> {
    // Get item to verify registry ownership
    const items = await this.registryRepository.getRegistryItems(updates.registry_id!);
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      const error: AppError = new Error('Registry item not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const registry = await this.registryRepository.findById(item.registry_id, userId);
    if (!registry) {
      const error: AppError = new Error('Unauthorized');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return await this.registryRepository.updateRegistryItem(itemId, updates);
  }

  async deleteRegistryItem(itemId: number, registryId: number, userId: number): Promise<void> {
    // Verify registry ownership
    const registry = await this.registryRepository.findById(registryId, userId);
    if (!registry) {
      const error: AppError = new Error('Registry not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    await this.registryRepository.deleteRegistryItem(itemId);
  }
}
