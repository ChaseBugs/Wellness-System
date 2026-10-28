import { AdminMessageRepository, AdminMessage } from '../repositories/adminMessage.repository';

export class AdminMessageService {
  private repo: AdminMessageRepository;

  constructor() {
    this.repo = new AdminMessageRepository();
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getPublished(role?: string) {
    return this.repo.findPublished(role);
  }

  async getById(id: number) {
    const msg = await this.repo.findById(id);
    if (!msg) throw new Error('Message not found');
    return msg;
  }

  async create(data: Omit<AdminMessage, 'id' | 'created_at' | 'updated_at'>) {
    return this.repo.create(data);
  }

  async update(id: number, data: Partial<Omit<AdminMessage, 'id' | 'created_at' | 'updated_at'>>) {
    const updated = await this.repo.update(id, data);
    if (!updated) throw new Error('Message not found');
    return updated;
  }

  async delete(id: number) {
    const ok = await this.repo.delete(id);
    if (!ok) throw new Error('Message not found');
  }
}
