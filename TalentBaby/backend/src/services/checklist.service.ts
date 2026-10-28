import { ChecklistRepository, Checklist, ChecklistItem } from '../repositories/checklist.repository';
import { AppError } from '../middleware/errorHandler';

export class ChecklistService {
  private checklistRepository: ChecklistRepository;

  constructor() {
    this.checklistRepository = new ChecklistRepository();
  }

  async getChecklists(userId: number, checklistType?: string): Promise<Checklist[]> {
    return await this.checklistRepository.findByUserId(userId, checklistType);
  }

  async getChecklist(id: number, userId: number): Promise<Checklist> {
    const checklist = await this.checklistRepository.findById(id, userId);
    if (!checklist) {
      const error: AppError = new Error('Checklist not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return checklist;
  }

  async createChecklist(userId: number, checklistData: Partial<Checklist>): Promise<Checklist> {
    return await this.checklistRepository.create({
      ...checklistData,
      user_id: userId,
    });
  }

  async updateChecklist(checklistId: number, userId: number, updates: Partial<Checklist>): Promise<Checklist> {
    return await this.checklistRepository.update(checklistId, userId, updates);
  }

  async deleteChecklist(checklistId: number, userId: number): Promise<void> {
    await this.checklistRepository.delete(checklistId, userId);
  }

  async getChecklistItems(checklistId: number, userId: number): Promise<ChecklistItem[]> {
    // Verify checklist ownership
    const checklist = await this.checklistRepository.findById(checklistId, userId);
    if (!checklist) {
      const error: AppError = new Error('Checklist not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.checklistRepository.getItemsByChecklist(checklistId);
  }

  async addChecklistItem(checklistId: number, userId: number, itemData: Partial<ChecklistItem>): Promise<ChecklistItem> {
    // Verify checklist ownership
    const checklist = await this.checklistRepository.findById(checklistId, userId);
    if (!checklist) {
      const error: AppError = new Error('Checklist not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.checklistRepository.addItem({
      ...itemData,
      checklist_id: checklistId,
    });
  }

  async updateChecklistItem(itemId: number, checklistId: number, userId: number, updates: Partial<ChecklistItem>): Promise<ChecklistItem> {
    // Verify checklist ownership
    const checklist = await this.checklistRepository.findById(checklistId, userId);
    if (!checklist) {
      const error: AppError = new Error('Checklist not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return await this.checklistRepository.updateItem(itemId, updates);
  }

  async deleteChecklistItem(itemId: number, checklistId: number, userId: number): Promise<void> {
    // Verify checklist ownership
    const checklist = await this.checklistRepository.findById(checklistId, userId);
    if (!checklist) {
      const error: AppError = new Error('Checklist not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    await this.checklistRepository.deleteItem(itemId);
  }
}
