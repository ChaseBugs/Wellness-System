export type ParentGender = "female" | "male" | "other" | "prefer_not_to_say";

export interface ParentProfile {
  userId: string;
  phoneNumber: string | null;
  gender: ParentGender | null;
  birthdate: string | null;
  avatarUrl: string | null;
  relationToBaby: string | null;
  activeChildId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Account fields (name, language) live in identity; the rest is BabyGrow-specific. */
export interface UpdateParentProfileInput {
  fullName?: string | null;
  languagePreference?: string;
  phoneNumber?: string | null;
  gender?: ParentGender | null;
  birthdate?: string | null;
  profilePictureUrl?: string | null;
  relationToBaby?: string | null;
}

export interface ParentProfileResponse {
  id: string;
  email: string;
  fullName: string | null;
  languagePreference: string;
  phoneNumber: string | null;
  gender: ParentGender | null;
  birthdate: string | null;
  profilePictureUrl: string | null;
  relationToBaby: string | null;
  activeChildId: string | null;
}
