import {
  BabyMilestoneRepository,
  BabyMilestone,
  BabyMilestoneWithDefinition,
  MilestoneStatus,
} from '../repositories/babyMilestone.repository';
import { MilestoneDefinitionRepository } from '../repositories/milestoneDefinition.repository';

type MilestoneTypeKey = 'physical' | 'cognitive' | 'communication' | 'social_emotional';

interface TypeSummary {
  total: number;
  yes: number;
  almost: number;
  no: number;
  unanswered: number;
  milestones: unknown[];
}

export interface MilestoneReport {
  baby_id: number;
  month: number;
  overall: {
    total: number;
    yes: number;
    almost: number;
    completion_rate: number;
  };
  by_type: Record<MilestoneTypeKey, TypeSummary>;
}

export class BabyMilestoneService {
  private repo     = new BabyMilestoneRepository();
  private defsRepo = new MilestoneDefinitionRepository();

  async getForBaby(babyId: number, month?: number): Promise<BabyMilestoneWithDefinition[]> {
    return this.repo.findByBabyId(babyId, month);
  }

  async getReport(babyId: number, month?: number): Promise<MilestoneReport> {
    // Resolve month: param → baby's current age → default 2
    let reportMonth: number;
    if (month !== undefined) {
      reportMonth = month;
    } else {
      const birthDate = await this.repo.findBabyBirthDate(babyId);
      if (birthDate) {
        const birth = new Date(birthDate);
        const now   = new Date();
        reportMonth = Math.max(1,
          (now.getFullYear() - birth.getFullYear()) * 12 +
          (now.getMonth() - birth.getMonth())
        );
      } else {
        reportMonth = 2;
      }
    }

    const [defs, statuses] = await Promise.all([
      this.defsRepo.findByMonth(reportMonth),
      this.repo.findStatusesByBabyAndMonth(babyId, reportMonth),
    ]);

    const statusMap: Record<number, { status: string; achieved_date: string | null; notes: string | null }> = {};
    for (const s of statuses) {
      statusMap[s.milestone_definition_id] = {
        status: s.status,
        achieved_date: s.achieved_date,
        notes: s.notes,
      };
    }

    const summary: Record<MilestoneTypeKey, TypeSummary> = {
      physical:         { total: 0, yes: 0, almost: 0, no: 0, unanswered: 0, milestones: [] },
      cognitive:        { total: 0, yes: 0, almost: 0, no: 0, unanswered: 0, milestones: [] },
      communication:    { total: 0, yes: 0, almost: 0, no: 0, unanswered: 0, milestones: [] },
      social_emotional: { total: 0, yes: 0, almost: 0, no: 0, unanswered: 0, milestones: [] },
    };

    for (const def of defs) {
      const typeKey = def.milestone_type as MilestoneTypeKey;
      const record  = statusMap[def.id];
      const status  = record?.status ?? 'unanswered';

      summary[typeKey].total++;
      if (status === 'yes')         summary[typeKey].yes++;
      else if (status === 'almost') summary[typeKey].almost++;
      else if (status === 'no')     summary[typeKey].no++;
      else                          summary[typeKey].unanswered++;

      summary[typeKey].milestones.push({
        ...def,
        status,
        achieved_date: record?.achieved_date ?? null,
        notes:         record?.notes ?? null,
      });
    }

    const totalYes    = statuses.filter(s => s.status === 'yes').length;
    const totalAlmost = statuses.filter(s => s.status === 'almost').length;
    const totalDefs   = defs.length;

    return {
      baby_id: babyId,
      month: reportMonth,
      overall: {
        total: totalDefs,
        yes: totalYes,
        almost: totalAlmost,
        completion_rate: totalDefs > 0 ? Math.round((totalYes / totalDefs) * 100) : 0,
      },
      by_type: summary,
    };
  }

  async upsert(
    babyId: number,
    milestoneDefinitionId: number,
    status: MilestoneStatus,
    achievedDate?: string | null,
    notes?: string | null
  ): Promise<BabyMilestone> {
    return this.repo.upsert(babyId, milestoneDefinitionId, status, achievedDate, notes);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
