import type { AppCode } from "../../../../config/app-catalog.js";
import type { PageQuery } from "../../../../utils/pagination.js";
import type { Difficulty } from "../../content/models/content-item.js";
import type { PublishStatus } from "./exercise.js";

export interface RoutineStep {
  id: string;
  position: number;
  exerciseId: string;
  exerciseName: string;
  exerciseStatus: PublishStatus;
  exerciseExpertReviewed: boolean;
  safetyNotes: string[];
  media: Record<string, unknown>;
  sets: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number;
  notes: string | null;
}

export interface Routine {
  id: string;
  appCode: AppCode;
  title: string;
  description: string | null;
  goal: string | null;
  level: Difficulty;
  estimatedMinutes: number | null;
  tags: string[];
  isPremium: boolean;
  status: PublishStatus;
  expertReviewed: boolean;
  reviewNotes: string | null;
  stepCount: number;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineWithSteps extends Routine {
  steps: RoutineStep[];
}

export interface RoutineStepInput {
  exerciseId: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  notes?: string;
}

export interface CreateRoutineInput {
  appCode: AppCode;
  title: string;
  description?: string;
  goal?: string;
  level?: Difficulty;
  estimatedMinutes?: number;
  tags?: string[];
  isPremium?: boolean;
  steps: RoutineStepInput[];
}

/** `steps`, when present, replaces the whole ordered step list. */
export type UpdateRoutineInput = Partial<Omit<CreateRoutineInput, "appCode">>;

export interface RoutineQuery extends PageQuery {
  appCode?: AppCode;
  status?: PublishStatus;
  level?: Difficulty;
  tag?: string;
  goal?: string;
}

export interface RoutineSummaryResponse {
  id: string;
  appCode: AppCode;
  title: string;
  description: string | null;
  goal: string | null;
  level: Difficulty;
  estimatedMinutes: number | null;
  tags: string[];
  isPremium: boolean;
  stepCount: number;
}

export interface RoutineDetailResponse extends RoutineSummaryResponse {
  locked: boolean;
  steps: Array<{
    position: number;
    exerciseId: string;
    name: string;
    sets: number | null;
    reps: number | null;
    durationSeconds: number | null;
    restSeconds: number;
    notes: string | null;
    safetyNotes: string[];
    media: Record<string, unknown>;
  }>;
}

export interface RoutineEditorResponse extends RoutineDetailResponse {
  status: PublishStatus;
  expertReviewed: boolean;
  reviewNotes: string | null;
  updatedAt: Date;
}
