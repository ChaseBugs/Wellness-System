import type {
  CreateExerciseInput,
  Exercise,
  ExerciseQuery,
  PublishStatus,
  UpdateExerciseInput
} from "../models/exercise.js";

export interface IExerciseRepository {
  list(query: ExerciseQuery): Promise<{ items: Exercise[]; total: number }>;
  findById(id: string): Promise<Exercise | null>;
  findByIds(ids: string[]): Promise<Exercise[]>;
  create(input: CreateExerciseInput, createdBy: string): Promise<Exercise>;
  /** Content edits always clear expert sign-off and unpublish, so changed guidance is re-reviewed. */
  update(id: string, input: UpdateExerciseInput): Promise<Exercise | null>;
  setReview(id: string, approved: boolean, notes: string | null): Promise<Exercise | null>;
  setStatus(id: string, status: PublishStatus): Promise<Exercise | null>;
}
