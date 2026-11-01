import type { AppCode } from "../../../../config/app-catalog.js";
import type { PageQuery } from "../../../../utils/pagination.js";
import type { Difficulty } from "../../content/models/content-item.js";

export type PublishStatus = "draft" | "published" | "archived";

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  appCodes: AppCode[];
  bodyAreas: string[];
  difficulty: Difficulty;
  defaultDurationSeconds: number | null;
  defaultReps: number | null;
  media: Record<string, unknown>;
  safetyNotes: string[];
  contraindications: string[];
  status: PublishStatus;
  expertReviewed: boolean;
  reviewNotes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExerciseInput {
  name: string;
  description?: string;
  appCodes: AppCode[];
  bodyAreas?: string[];
  difficulty?: Difficulty;
  defaultDurationSeconds?: number;
  defaultReps?: number;
  media?: Record<string, unknown>;
  safetyNotes?: string[];
  contraindications?: string[];
}

export type UpdateExerciseInput = Partial<CreateExerciseInput>;

export interface ExerciseQuery extends PageQuery {
  appCode?: AppCode;
  status?: PublishStatus;
  q?: string;
}

export interface ExerciseResponse {
  id: string;
  name: string;
  description: string | null;
  appCodes: AppCode[];
  bodyAreas: string[];
  difficulty: Difficulty;
  defaultDurationSeconds: number | null;
  defaultReps: number | null;
  media: Record<string, unknown>;
  safetyNotes: string[];
  contraindications: string[];
  status: PublishStatus;
  expertReviewed: boolean;
  reviewNotes: string | null;
  updatedAt: Date;
}

export interface ExpertReviewInput {
  approve: boolean;
  notes?: string;
}
