import type { CreateGrowthRecordInput, GrowthRecord, UpdateGrowthRecordInput } from "../models/growth-record.js";

export interface IGrowthRecordRepository {
  listForChild(childId: string): Promise<GrowthRecord[]>;
  create(childId: string, recordedBy: string, input: CreateGrowthRecordInput): Promise<GrowthRecord>;
  update(id: string, childId: string, input: UpdateGrowthRecordInput): Promise<GrowthRecord | null>;
  delete(id: string, childId: string): Promise<boolean>;
}
