import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { IHeightMeasurementRepository } from "../domain/IHeightMeasurementRepository.js";
import type {
  HeightMeasurement,
  HeightMeasurementResponse,
  HeightTrendResponse,
  UpsertHeightMeasurementInput
} from "../models/height-measurement.js";

const DAYS_PER_MONTH = 30.44;

export class HeightMeasurementService {
  constructor(private heightMeasurementRepository: IHeightMeasurementRepository) {}

  async record(userId: string, input: UpsertHeightMeasurementInput): Promise<HeightMeasurementResponse> {
    if (Date.parse(input.measuredOn) > Date.now()) throw new ValidationError("measuredOn cannot be in the future");
    return this.toResponse(await this.heightMeasurementRepository.upsert(userId, input));
  }

  async delete(userId: string, id: string): Promise<void> {
    if (!(await this.heightMeasurementRepository.delete(id, userId))) throw new NotFoundError("Measurement");
  }

  async trend(userId: string): Promise<HeightTrendResponse> {
    const measurements = await this.heightMeasurementRepository.listForUser(userId);
    const first = measurements[0];
    const latest = measurements[measurements.length - 1];
    const days = first && latest ? (Date.parse(latest.measuredOn) - Date.parse(first.measuredOn)) / 86_400_000 : 0;
    const totalChangeCm = first && latest ? Math.round((latest.heightCm - first.heightCm) * 10) / 10 : null;

    return {
      measurements: measurements.map((measurement) => this.toResponse(measurement)),
      firstMeasuredOn: first?.measuredOn ?? null,
      latestMeasuredOn: latest?.measuredOn ?? null,
      totalChangeCm,
      // A single day of data says nothing about a rate; require at least a week between readings.
      averageCmPerMonth:
        totalChangeCm !== null && days >= 7 ? Math.round((totalChangeCm / days) * DAYS_PER_MONTH * 100) / 100 : null
    };
  }

  private toResponse(measurement: HeightMeasurement): HeightMeasurementResponse {
    return {
      id: measurement.id,
      measuredOn: measurement.measuredOn,
      heightCm: measurement.heightCm,
      weightKg: measurement.weightKg,
      notes: measurement.notes
    };
  }
}
