export interface GrowthRecord {
  id: string;
  childId: string;
  measuredOn: string;
  heightCm: number | null;
  weightKg: number | null;
  headCircumferenceCm: number | null;
  notes: string | null;
  recordedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGrowthRecordInput {
  measuredOn: string;
  heightCm?: number;
  weightKg?: number;
  headCircumferenceCm?: number;
  notes?: string;
}

export type UpdateGrowthRecordInput = Partial<CreateGrowthRecordInput>;

export interface GrowthRecordResponse {
  id: string;
  measuredOn: string;
  heightCm: number | null;
  weightKg: number | null;
  headCircumferenceCm: number | null;
  /** weight / height² when both were measured (no percentile without a validated reference). */
  bmi: number | null;
  notes: string | null;
  createdAt: Date;
}

/**
 * Premium report: the child's own measurements and change rates only. Percentiles need a
 * validated standard (e.g. WHO growth tables) and are intentionally not computed here.
 */
export interface GrowthReportResponse {
  childId: string;
  records: GrowthRecordResponse[];
  changes: Array<{
    from: string;
    to: string;
    days: number;
    heightCmPer30Days: number | null;
    weightKgPer30Days: number | null;
  }>;
}
