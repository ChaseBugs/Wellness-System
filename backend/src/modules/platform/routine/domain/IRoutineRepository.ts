import type { PublishStatus } from "../models/exercise.js";
import type { CreateRoutineInput, Routine, RoutineQuery, RoutineWithSteps, UpdateRoutineInput } from "../models/routine.js";

export interface IRoutineRepository {
  list(query: RoutineQuery): Promise<{ items: Routine[]; total: number }>;
  findById(id: string): Promise<RoutineWithSteps | null>;
  create(input: CreateRoutineInput, createdBy: string): Promise<RoutineWithSteps>;
  /** Content edits always clear expert sign-off and unpublish, so changed routines are re-reviewed. */
  update(id: string, input: UpdateRoutineInput): Promise<RoutineWithSteps | null>;
  setReview(id: string, approved: boolean, notes: string | null): Promise<RoutineWithSteps | null>;
  setStatus(id: string, status: PublishStatus): Promise<RoutineWithSteps | null>;
}
