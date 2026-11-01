export const GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
export const UNITS = ["metric", "imperial"] as const;

/** HeightIncrease-only settings for an account (name and email stay in identity). */
export interface HeightProfile {
  id: string;
  userId: string;
  targetHeightCm: number | null;
  birthDate: string | null;
  gender: (typeof GENDERS)[number] | null;
  units: (typeof UNITS)[number];
  notificationsEnabled: boolean;
  status: "active" | "blocked";
  streakDays: number;
  points: number;
  avatarUrl: string | null;
}

export interface UpdateHeightProfileInput {
  name?: string;
  targetHeightCm?: number | null;
  birthDate?: string | null;
  gender?: HeightProfile["gender"];
  units?: HeightProfile["units"];
  notificationsEnabled?: boolean;
  avatarUrl?: string | null;
}

export interface HeightProfileResponse {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  streakDays: number;
  points: number;
  measurements: {
    /** Latest height.measurements row; the trend lives at GET /measurements. */
    currentHeightCm: number | null;
    weightKg: number | null;
    targetHeightCm: number | null;
    birthDate: string | null;
    gender: HeightProfile["gender"];
  };
  preferences: { units: HeightProfile["units"]; notificationsEnabled: boolean };
}
