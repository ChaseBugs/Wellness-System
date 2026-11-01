export type ChildSex = "female" | "male" | "unspecified";
export type CaregiverRole = "owner" | "editor" | "viewer";

export interface Child {
  id: string;
  createdBy: string;
  name: string;
  birthDate: string;
  sex: ChildSex;
  birthWeightKg: number | null;
  birthHeightCm: number | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildWithRole extends Child {
  role: CaregiverRole;
}

export interface CreateChildInput {
  name: string;
  birthDate: string;
  sex?: ChildSex;
  birthWeightKg?: number | null;
  birthHeightCm?: number | null;
  avatarUrl?: string | null;
}

export type UpdateChildInput = Partial<CreateChildInput>;

export interface ChildResponse {
  id: string;
  name: string;
  birthDate: string;
  sex: ChildSex;
  birthWeightKg: number | null;
  birthHeightCm: number | null;
  avatarUrl: string | null;
  ageMonths: number;
  myRole: CaregiverRole;
  isActive: boolean;
}

export interface Caregiver {
  childId: string;
  userId: string;
  role: CaregiverRole;
  email: string;
  displayName: string | null;
  createdAt: Date;
}

export interface AddCaregiverInput {
  email: string;
  role: Exclude<CaregiverRole, "owner">;
}

export interface CaregiverResponse {
  userId: string;
  email: string;
  displayName: string | null;
  role: CaregiverRole;
  addedAt: Date;
}
