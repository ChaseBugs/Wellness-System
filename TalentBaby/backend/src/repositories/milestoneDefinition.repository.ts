import { prisma } from '../config/prisma';

export type MilestoneTypeValue = 'physical' | 'cognitive' | 'communication' | 'social_emotional';

export interface MilestoneDefinition {
  id: number;
  month: number;
  milestone_type: MilestoneTypeValue;
  title: string;
  description: string;
  question: string | null;
  related_activity: string | null;
  display_order: number;
  doctor_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMilestoneDefinitionInput {
  month: number;
  milestone_type: string;
  title: string;
  description: string;
  question?: string | null;
  related_activity?: string | null;
  display_order?: number;
  doctor_verified?: boolean;
}

export class MilestoneDefinitionRepository {
  async findByMonth(month: number): Promise<MilestoneDefinition[]> {
    return prisma.milestone_definitions.findMany({
      where: { month },
      orderBy: [{ milestone_type: 'asc' }, { display_order: 'asc' }],
    }) as unknown as MilestoneDefinition[];
  }

  async findAll(month?: number, milestoneType?: string): Promise<MilestoneDefinition[]> {
    return prisma.milestone_definitions.findMany({
      where: {
        ...(month !== undefined ? { month } : {}),
        ...(milestoneType ? { milestone_type: milestoneType } : {}),
      },
      orderBy: [{ month: 'asc' }, { milestone_type: 'asc' }, { display_order: 'asc' }],
    }) as unknown as MilestoneDefinition[];
  }

  async findById(id: number): Promise<MilestoneDefinition | null> {
    return prisma.milestone_definitions.findUnique({
      where: { id },
    }) as unknown as MilestoneDefinition | null;
  }

  async create(input: CreateMilestoneDefinitionInput): Promise<MilestoneDefinition> {
    return prisma.milestone_definitions.create({
      data: {
        month: input.month,
        milestone_type: input.milestone_type,
        title: input.title,
        description: input.description,
        question: input.question ?? null,
        related_activity: input.related_activity ?? null,
        display_order: input.display_order ?? 0,
        doctor_verified: input.doctor_verified ?? false,
      },
    }) as unknown as MilestoneDefinition;
  }

  async update(id: number, input: Partial<CreateMilestoneDefinitionInput>): Promise<MilestoneDefinition | null> {
    return prisma.milestone_definitions.update({
      where: { id },
      data: {
        ...(input.month !== undefined ? { month: input.month } : {}),
        ...(input.milestone_type !== undefined ? { milestone_type: input.milestone_type } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.question !== undefined ? { question: input.question } : {}),
        ...(input.related_activity !== undefined ? { related_activity: input.related_activity } : {}),
        ...(input.display_order !== undefined ? { display_order: input.display_order } : {}),
        ...(input.doctor_verified !== undefined ? { doctor_verified: input.doctor_verified } : {}),
        updated_at: new Date(),
      },
    }) as unknown as MilestoneDefinition;
  }

  async delete(id: number): Promise<void> {
    await prisma.milestone_definitions.delete({ where: { id } });
  }
}
