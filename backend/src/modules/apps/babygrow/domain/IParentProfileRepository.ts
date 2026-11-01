import type { ParentProfile, UpdateParentProfileInput } from "../models/parent-profile.js";

export type ParentProfileFields = Omit<UpdateParentProfileInput, "fullName" | "languagePreference">;

export interface IParentProfileRepository {
  findByUser(userId: string): Promise<ParentProfile | null>;
  /** Partial upsert: only the provided fields change. */
  upsert(userId: string, input: ParentProfileFields): Promise<ParentProfile>;
  setActiveChild(userId: string, childId: string | null): Promise<void>;
}
