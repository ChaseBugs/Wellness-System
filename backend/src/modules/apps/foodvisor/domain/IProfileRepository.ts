import type { FoodvisorProfile, UpsertProfileInput } from "../models/profile.js";

export interface IProfileRepository {
  findByUser(userId: string): Promise<FoodvisorProfile | null>;
  upsert(userId: string, input: UpsertProfileInput): Promise<FoodvisorProfile>;
}
