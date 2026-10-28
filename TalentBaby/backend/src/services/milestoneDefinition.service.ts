import {
  MilestoneDefinitionRepository,
  MilestoneDefinition,
  CreateMilestoneDefinitionInput,
} from '../repositories/milestoneDefinition.repository';

export class MilestoneDefinitionService {
  private repo = new MilestoneDefinitionRepository();

  /** Returns definitions grouped by milestone_type — used by mobile. */
  async getByMonth(month: number): Promise<Record<string, MilestoneDefinition[]>> {
    const rows = await this.repo.findByMonth(month);
    const grouped: Record<string, MilestoneDefinition[]> = {};
    for (const row of rows) {
      if (!grouped[row.milestone_type]) grouped[row.milestone_type] = [];
      grouped[row.milestone_type].push(row);
    }
    return grouped;
  }

  /** Flat list with optional filters — used by admin. */
  async list(month?: number, milestoneType?: string): Promise<MilestoneDefinition[]> {
    return this.repo.findAll(month, milestoneType);
  }

  async getOne(id: number): Promise<MilestoneDefinition> {
    const def = await this.repo.findById(id);
    if (!def) throw new Error('Milestone definition not found');
    return def;
  }

  async create(input: CreateMilestoneDefinitionInput): Promise<MilestoneDefinition> {
    return this.repo.create(input);
  }

  async update(id: number, input: Partial<CreateMilestoneDefinitionInput>): Promise<MilestoneDefinition> {
    const def = await this.repo.update(id, input);
    if (!def) throw new Error('Milestone definition not found');
    return def;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
