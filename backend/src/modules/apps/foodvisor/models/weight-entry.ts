export interface WeightEntry {
  id: string;
  userId: string;
  measuredOn: string;
  weightKg: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertWeightEntryInput {
  measuredOn: string;
  weightKg: number;
  note?: string | null;
}

export interface WeightEntryResponse {
  id: string;
  measuredOn: string;
  weightKg: number;
  note: string | null;
}

export interface WeightHistoryResponse {
  entries: WeightEntryResponse[];
  latestKg: number | null;
  changeKg: number | null;
  targetWeightKg: number | null;
}
