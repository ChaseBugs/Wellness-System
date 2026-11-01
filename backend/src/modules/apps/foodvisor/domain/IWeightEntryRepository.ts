import type { UpsertWeightEntryInput, WeightEntry } from "../models/weight-entry.js";

export interface IWeightEntryRepository {
  listForUser(userId: string, limit: number): Promise<WeightEntry[]>;
  /** One entry per day: re-weighing on the same date replaces the earlier value. */
  upsert(userId: string, input: UpsertWeightEntryInput): Promise<WeightEntry>;
  delete(id: string, userId: string): Promise<boolean>;
}
