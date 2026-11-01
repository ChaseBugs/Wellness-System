import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { IProfileRepository } from "../domain/IProfileRepository.js";
import type { IWeightEntryRepository } from "../domain/IWeightEntryRepository.js";
import type { UpsertWeightEntryInput, WeightEntry, WeightEntryResponse, WeightHistoryResponse } from "../models/weight-entry.js";

const HISTORY_LIMIT = 365;

export class WeightEntryService {
  constructor(
    private weightEntryRepository: IWeightEntryRepository,
    private profileRepository: IProfileRepository
  ) {}

  async history(userId: string): Promise<WeightHistoryResponse> {
    const [entries, profile] = await Promise.all([
      this.weightEntryRepository.listForUser(userId, HISTORY_LIMIT),
      this.profileRepository.findByUser(userId)
    ]);
    const latest = entries[0];
    const oldest = entries[entries.length - 1];
    return {
      entries: entries.map((entry) => this.toResponse(entry)),
      latestKg: latest ? Number(latest.weightKg) : null,
      changeKg: latest && oldest ? Math.round((Number(latest.weightKg) - Number(oldest.weightKg)) * 100) / 100 : null,
      targetWeightKg: profile?.targetWeightKg ?? null
    };
  }

  async record(userId: string, input: UpsertWeightEntryInput): Promise<WeightEntryResponse> {
    if (Date.parse(input.measuredOn) > Date.now()) throw new ValidationError("measuredOn cannot be in the future");
    const entry = await this.weightEntryRepository.upsert(userId, input);
    // Keep the profile's current weight in sync when this is the newest reading.
    const [newest] = await this.weightEntryRepository.listForUser(userId, 1);
    if (newest?.id === entry.id) await this.profileRepository.upsert(userId, { currentWeightKg: Number(entry.weightKg) });
    return this.toResponse(entry);
  }

  async delete(userId: string, id: string): Promise<void> {
    if (!(await this.weightEntryRepository.delete(id, userId))) throw new NotFoundError("Weight entry");
  }

  private toResponse(entry: WeightEntry): WeightEntryResponse {
    return { id: entry.id, measuredOn: entry.measuredOn, weightKg: Number(entry.weightKg), note: entry.note };
  }
}
