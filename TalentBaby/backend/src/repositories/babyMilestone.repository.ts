import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';

export type MilestoneStatus = 'yes' | 'no' | 'almost';

export interface BabyMilestone {
  id: number;
  baby_id: number;
  milestone_definition_id: number;
  status: MilestoneStatus;
  achieved_date: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BabyMilestoneWithDefinition extends BabyMilestone {
  month: number;
  milestone_type: string;
  title: string;
  description: string;
  question: string | null;
  related_activity: string | null;
  display_order: number;
}

export interface BabyMilestoneStatusRow {
  milestone_definition_id: number;
  status: MilestoneStatus;
  achieved_date: string | null;
  notes: string | null;
}

export class BabyMilestoneRepository {
  async findByBabyId(babyId: number, month?: number): Promise<BabyMilestoneWithDefinition[]> {
    return prisma.$queryRaw<BabyMilestoneWithDefinition[]>(Prisma.sql`
      SELECT bm.*, md.month, md.milestone_type, md.title, md.description,
             md.question, md.related_activity, md.display_order
      FROM baby_milestones bm
      JOIN milestone_definitions md ON md.id = bm.milestone_definition_id
      WHERE bm.baby_id = ${babyId}
      ${month !== undefined ? Prisma.sql`AND md.month = ${month}` : Prisma.empty}
      ORDER BY md.month, md.milestone_type, md.display_order
    `);
  }

  async findStatusesByBabyAndMonth(babyId: number, month: number): Promise<BabyMilestoneStatusRow[]> {
    return prisma.$queryRaw<BabyMilestoneStatusRow[]>(Prisma.sql`
      SELECT bm.milestone_definition_id, bm.status, bm.achieved_date, bm.notes
      FROM baby_milestones bm
      JOIN milestone_definitions md ON md.id = bm.milestone_definition_id
      WHERE bm.baby_id = ${babyId} AND md.month = ${month}
    `);
  }

  async findBabyBirthDate(babyId: number): Promise<string | null> {
    const baby = await prisma.babies.findUnique({
      where: { id: babyId },
      select: { birth_date: true },
    });
    return baby ? String(baby.birth_date) : null;
  }

  async upsert(
    babyId: number,
    milestoneDefinitionId: number,
    status: MilestoneStatus,
    achievedDate?: string | null,
    notes?: string | null
  ): Promise<BabyMilestone> {
    const rows = await prisma.$queryRaw<BabyMilestone[]>(Prisma.sql`
      INSERT INTO baby_milestones (baby_id, milestone_definition_id, status, achieved_date, notes)
      VALUES (${babyId}, ${milestoneDefinitionId}, ${status}, ${achievedDate ?? null}, ${notes ?? null})
      ON CONFLICT (baby_id, milestone_definition_id)
      DO UPDATE SET
        status        = EXCLUDED.status,
        achieved_date = EXCLUDED.achieved_date,
        notes         = EXCLUDED.notes,
        updated_at    = CURRENT_TIMESTAMP
      RETURNING *
    `);
    return rows[0];
  }

  async delete(id: number): Promise<void> {
    await prisma.baby_milestones.delete({ where: { id } });
  }
}
