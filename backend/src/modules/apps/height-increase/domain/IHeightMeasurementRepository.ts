import type { HeightMeasurement, UpsertHeightMeasurementInput } from "../models/height-measurement.js";

export interface IHeightMeasurementRepository {
  listForUser(userId: string): Promise<HeightMeasurement[]>;
  /** One measurement per day: re-measuring on the same date replaces the earlier value. */
  upsert(userId: string, input: UpsertHeightMeasurementInput): Promise<HeightMeasurement>;
  delete(id: string, userId: string): Promise<boolean>;
}
