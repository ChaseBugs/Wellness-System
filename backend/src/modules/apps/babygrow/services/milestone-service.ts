import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { IMilestoneRepository } from "../domain/IMilestoneRepository.js";
import {
  MILESTONE_DOMAINS,
  type ChildMilestoneResponse,
  type ChildMilestoneRow,
  type DefinitionQuery,
  type MilestoneDefinition,
  type MilestoneDefinitionResponse,
  type MilestoneReportResponse,
  type RecordMilestoneInput
} from "../models/milestone.js";
import type { ChildService } from "./child-service.js";

export function toDefinitionResponse(definition: MilestoneDefinition): MilestoneDefinitionResponse {
  return {
    id: definition.id,
    month: definition.month,
    milestoneType: definition.domain,
    title: definition.title,
    description: definition.description,
    question: definition.question,
    relatedActivity: definition.relatedActivity,
    displayOrder: definition.displayOrder,
    expertReviewed: definition.expertReviewed
  };
}

/**
 * Monthly development checklist. Parents answer each published milestone with yes / almost / no.
 * Definitions are managed in the admin (`/apps/babygrow/admin/milestone-definitions`).
 */
export class MilestoneService {
  constructor(
    private milestoneRepository: IMilestoneRepository,
    private childService: ChildService
  ) {}

  async listDefinitions(query: DefinitionQuery): Promise<MilestoneDefinitionResponse[]> {
    return (await this.milestoneRepository.listPublished(query)).map(toDefinitionResponse);
  }

  /** One month's definitions grouped by development area (every area key is always present). */
  async definitionsByMonth(month: number): Promise<Record<string, MilestoneDefinitionResponse[]>> {
    const grouped: Record<string, MilestoneDefinitionResponse[]> = Object.fromEntries(MILESTONE_DOMAINS.map((domain) => [domain, []]));
    for (const definition of await this.milestoneRepository.listPublished({ month })) {
      grouped[definition.domain].push(toDefinitionResponse(definition));
    }
    return grouped;
  }

  async reviewDefinition(id: string, approve: boolean): Promise<MilestoneDefinitionResponse> {
    const definition = await this.milestoneRepository.setReviewed(id, approve);
    if (!definition) throw new NotFoundError("Milestone definition");
    return toDefinitionResponse(definition);
  }

  async listForChild(userId: string, childId: string, month?: number): Promise<ChildMilestoneResponse[]> {
    await this.childService.requireAccess(userId, childId, "viewer");
    return (await this.milestoneRepository.listForChild(childId, month)).map((row) => this.toChildResponse(childId, row));
  }

  async report(userId: string, childId: string, month?: number): Promise<MilestoneReportResponse> {
    await this.childService.requireAccess(userId, childId, "viewer");
    const rows = await this.milestoneRepository.listForChild(childId, month);
    const report: MilestoneReportResponse = {
      childId,
      month: month ?? null,
      total: rows.length,
      yes: 0,
      almost: 0,
      no: 0,
      unanswered: 0,
      byType: Object.fromEntries(MILESTONE_DOMAINS.map((domain) => [domain, { total: 0, yes: 0, almost: 0, no: 0 }]))
    };
    for (const row of rows) {
      const bucket = report.byType[row.milestoneType];
      bucket.total++;
      if (row.status) {
        report[row.status]++;
        bucket[row.status]++;
      } else {
        report.unanswered++;
      }
    }
    return report;
  }

  async record(userId: string, childId: string, milestoneId: string, input: RecordMilestoneInput): Promise<ChildMilestoneResponse> {
    const child = await this.childService.requireAccess(userId, childId, "editor");
    const definition = await this.milestoneRepository.findDefinition(milestoneId);
    if (!definition || !definition.isPublished) throw new NotFoundError("Milestone");
    // A "yes" without a date is recorded as achieved today.
    const achievedOn = input.status === "yes" ? input.achievedOn ?? new Date().toISOString().slice(0, 10) : input.achievedOn ?? null;
    if (achievedOn && achievedOn < child.birthDate) throw new ValidationError("achievedOn cannot be before the birth date");
    await this.milestoneRepository.upsertCheck(childId, milestoneId, userId, { ...input, achievedOn });
    const [row] = (await this.milestoneRepository.listForChild(childId)).filter((entry) => entry.id === milestoneId);
    return this.toChildResponse(childId, row);
  }

  async unrecord(userId: string, childId: string, milestoneId: string): Promise<void> {
    await this.childService.requireAccess(userId, childId, "editor");
    if (!(await this.milestoneRepository.deleteCheck(childId, milestoneId))) throw new NotFoundError("Milestone record");
  }

  private toChildResponse(childId: string, row: ChildMilestoneRow): ChildMilestoneResponse {
    return {
      id: row.id,
      milestoneId: row.id,
      checkId: row.checkId,
      childId,
      month: row.month,
      milestoneType: row.milestoneType,
      title: row.title,
      description: row.description,
      question: row.question,
      relatedActivity: row.relatedActivity,
      displayOrder: row.displayOrder,
      expertReviewed: row.expertReviewed,
      status: row.status,
      achievedOn: row.achievedOn,
      notes: row.notes
    };
  }
}
