// TalentBaby's development areas (the app is the only consumer of these definitions).
export const MILESTONE_DOMAINS = ["physical", "cognitive", "communication", "social_emotional"] as const;
export type MilestoneDomain = (typeof MILESTONE_DOMAINS)[number];

export const MILESTONE_STATUSES = ["yes", "almost", "no"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export interface MilestoneDefinition {
  id: string;
  key: string;
  domain: MilestoneDomain;
  title: string;
  description: string | null;
  question: string | null;
  relatedActivity: string | null;
  month: number | null;
  displayOrder: number;
  ageMonthsMin: number;
  ageMonthsMax: number;
  source: string;
  expertReviewed: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MilestoneDefinitionResponse {
  id: string;
  month: number | null;
  milestoneType: MilestoneDomain;
  title: string;
  description: string | null;
  question: string | null;
  relatedActivity: string | null;
  displayOrder: number;
  expertReviewed: boolean;
}

export interface DefinitionQuery {
  month?: number;
  domain?: MilestoneDomain;
}

export interface RecordMilestoneInput {
  status: MilestoneStatus;
  achievedOn?: string | null;
  notes?: string | null;
}

/** A definition joined with this child's answer (status null = not answered yet). */
export interface ChildMilestoneRow extends MilestoneDefinitionResponse {
  checkId: string | null;
  status: MilestoneStatus | null;
  achievedOn: string | null;
  notes: string | null;
}

export interface ChildMilestoneResponse extends MilestoneDefinitionResponse {
  milestoneId: string;
  checkId: string | null;
  childId: string;
  status: MilestoneStatus | null;
  achievedOn: string | null;
  notes: string | null;
}

export interface MilestoneReportResponse {
  childId: string;
  month: number | null;
  total: number;
  yes: number;
  almost: number;
  no: number;
  unanswered: number;
  byType: Record<string, { total: number; yes: number; almost: number; no: number }>;
}
