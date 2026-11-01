export type ProfileGender = "male" | "female" | "non_binary";
export type ProfileActivityLevel = "sedentary" | "low_active" | "active" | "very_active";

export interface FoodvisorProfile {
  id: string;
  userId: string;
  goal: string | null;
  gender: ProfileGender | null;
  age: number | null;
  heightCm: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  activityLevel: ProfileActivityLevel | null;
  dietaryRestrictions: string[];
  medicalConditions: string[];
  programStage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertProfileInput {
  goal?: string | null;
  gender?: ProfileGender | null;
  age?: number | null;
  heightCm?: number | null;
  currentWeightKg?: number | null;
  targetWeightKg?: number | null;
  activityLevel?: ProfileActivityLevel | null;
  dietaryRestrictions?: string[];
  medicalConditions?: string[];
  programStage?: string;
}

export type ProfileResponse = Omit<FoodvisorProfile, "userId" | "createdAt">;
