import type {
  ChildMilestoneRow,
  DefinitionQuery,
  MilestoneDefinition,
  RecordMilestoneInput
} from "../models/milestone.js";

export interface IMilestoneRepository {
  /** Published definitions only (what families see). */
  listPublished(query: DefinitionQuery): Promise<MilestoneDefinition[]>;
  findDefinition(id: string): Promise<MilestoneDefinition | null>;
  /** Expert approval also publishes the definition. */
  setReviewed(id: string, approved: boolean): Promise<MilestoneDefinition | null>;
  /** With a month: every published definition of that month joined with the child's answer; without: answered ones only. */
  listForChild(childId: string, month?: number): Promise<ChildMilestoneRow[]>;
  upsertCheck(childId: string, milestoneId: string, recordedBy: string, input: RecordMilestoneInput): Promise<void>;
  deleteCheck(childId: string, milestoneId: string): Promise<boolean>;
}
