import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { IGrowthRecordRepository } from "../domain/IGrowthRecordRepository.js";
import type {
  CreateGrowthRecordInput,
  GrowthRecord,
  GrowthRecordResponse,
  GrowthReportResponse,
  UpdateGrowthRecordInput
} from "../models/growth-record.js";
import type { ChildService } from "./child-service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function per30Days(from: number | null, to: number | null, days: number): number | null {
  if (from === null || to === null || days <= 0) return null;
  return Math.round(((to - from) / days) * 30 * 100) / 100;
}

export class GrowthRecordService {
  constructor(
    private growthRecordRepository: IGrowthRecordRepository,
    private childService: ChildService
  ) {}

  async list(userId: string, childId: string): Promise<GrowthRecordResponse[]> {
    await this.childService.requireAccess(userId, childId, "viewer");
    return (await this.growthRecordRepository.listForChild(childId)).map((record) => this.toResponse(record));
  }

  async create(userId: string, childId: string, input: CreateGrowthRecordInput): Promise<GrowthRecordResponse> {
    const child = await this.childService.requireAccess(userId, childId, "editor");
    if (input.measuredOn < child.birthDate) throw new ValidationError("measuredOn cannot be before the birth date");
    return this.toResponse(await this.growthRecordRepository.create(childId, userId, input));
  }

  async update(userId: string, childId: string, id: string, input: UpdateGrowthRecordInput): Promise<GrowthRecordResponse> {
    await this.childService.requireAccess(userId, childId, "editor");
    const record = await this.growthRecordRepository.update(id, childId, input);
    if (!record) throw new NotFoundError("Growth record");
    return this.toResponse(record);
  }

  async delete(userId: string, childId: string, id: string): Promise<void> {
    await this.childService.requireAccess(userId, childId, "editor");
    if (!(await this.growthRecordRepository.delete(id, childId))) throw new NotFoundError("Growth record");
  }

  /** Premium report (route is guarded by the BabyGrow entitlement). */
  async report(userId: string, childId: string): Promise<GrowthReportResponse> {
    await this.childService.requireAccess(userId, childId, "viewer");
    const records = await this.growthRecordRepository.listForChild(childId);
    const changes: GrowthReportResponse["changes"] = [];
    for (let index = 1; index < records.length; index++) {
      const previous = records[index - 1];
      const current = records[index];
      const days = Math.round((Date.parse(current.measuredOn) - Date.parse(previous.measuredOn)) / DAY_MS);
      if (days <= 0) continue;
      changes.push({
        from: previous.measuredOn,
        to: current.measuredOn,
        days,
        heightCmPer30Days: per30Days(previous.heightCm, current.heightCm, days),
        weightKgPer30Days: per30Days(previous.weightKg, current.weightKg, days)
      });
    }
    return { childId, records: records.map((record) => this.toResponse(record)), changes };
  }

  private toResponse(record: GrowthRecord): GrowthRecordResponse {
    const heightCm = record.heightCm === null ? null : Number(record.heightCm);
    const weightKg = record.weightKg === null ? null : Number(record.weightKg);
    return {
      id: record.id,
      measuredOn: record.measuredOn,
      heightCm,
      weightKg,
      headCircumferenceCm: record.headCircumferenceCm === null ? null : Number(record.headCircumferenceCm),
      bmi: heightCm && weightKg ? Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10 : null,
      notes: record.notes,
      createdAt: record.createdAt
    };
  }
}
