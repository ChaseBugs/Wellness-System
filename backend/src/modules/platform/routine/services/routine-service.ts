import type { AppCode } from "../../../../config/app-catalog.js";
import { ConflictError, NotFoundError, ValidationError } from "../../../../utils/errors.js";
import { toPage, type Page } from "../../../../utils/pagination.js";
import type { EntitlementChecker } from "../../subscription/domain/entitlement-checker.js";
import type { IExerciseRepository } from "../domain/IExerciseRepository.js";
import type { IRoutineRepository } from "../domain/IRoutineRepository.js";
import type { ExpertReviewInput } from "../models/exercise.js";
import type {
  CreateRoutineInput,
  Routine,
  RoutineDetailResponse,
  RoutineEditorResponse,
  RoutineQuery,
  RoutineStepInput,
  RoutineSummaryResponse,
  RoutineWithSteps,
  UpdateRoutineInput
} from "../models/routine.js";

export class RoutineService {
  constructor(
    private routineRepository: IRoutineRepository,
    private exerciseRepository: IExerciseRepository,
    private entitlementChecker: EntitlementChecker
  ) {}

  /** App-facing list: only published routines that belong to the calling app. */
  async listPublished(appCode: AppCode, query: Omit<RoutineQuery, "appCode" | "status">): Promise<Page<RoutineSummaryResponse>> {
    const { items, total } = await this.routineRepository.list({ ...query, appCode, status: "published" });
    return toPage(items, total, query, (routine) => this.toSummary(routine));
  }

  async getPublished(appCode: AppCode, id: string, userId: string): Promise<RoutineDetailResponse> {
    const routine = await this.routineRepository.findById(id);
    if (!routine || routine.appCode !== appCode || routine.status !== "published") throw new NotFoundError("Routine");
    const locked = routine.isPremium && !(await this.entitlementChecker.hasAccess(userId, appCode));
    return this.toDetail(routine, locked);
  }

  /** Loads a published routine of this app for starting a session (the caller enforces premium access). */
  async requirePublished(appCode: AppCode, id: string): Promise<RoutineWithSteps> {
    const routine = await this.routineRepository.findById(id);
    if (!routine || routine.appCode !== appCode || routine.status !== "published") throw new NotFoundError("Routine");
    return routine;
  }

  async listForEditor(query: RoutineQuery): Promise<Page<RoutineEditorResponse>> {
    const { items, total } = await this.routineRepository.list(query);
    return toPage(items, total, query, (routine) => ({
      ...this.toSummary(routine),
      locked: false,
      steps: [],
      status: routine.status,
      expertReviewed: routine.expertReviewed,
      reviewNotes: routine.reviewNotes,
      updatedAt: routine.updatedAt
    }));
  }

  async getForEditor(id: string): Promise<RoutineEditorResponse> {
    return this.toEditor(await this.require(id));
  }

  async create(editorId: string, input: CreateRoutineInput): Promise<RoutineEditorResponse> {
    await this.assertExercisesUsable(input.appCode, input.steps);
    return this.toEditor(await this.routineRepository.create(input, editorId));
  }

  async update(id: string, input: UpdateRoutineInput): Promise<RoutineEditorResponse> {
    const current = await this.require(id);
    if (current.status === "archived") throw new ConflictError("Archived routines cannot be edited", "ROUTINE_ARCHIVED");
    if (input.steps) await this.assertExercisesUsable(current.appCode, input.steps);
    const updated = await this.routineRepository.update(id, input);
    if (!updated) throw new NotFoundError("Routine");
    return this.toEditor(updated);
  }

  async review(id: string, decision: ExpertReviewInput): Promise<RoutineEditorResponse> {
    await this.require(id);
    let updated = await this.routineRepository.setReview(id, decision.approve, decision.notes ?? null);
    if (updated && !decision.approve && updated.status === "published") {
      updated = await this.routineRepository.setStatus(id, "draft");
    }
    if (!updated) throw new NotFoundError("Routine");
    return this.toEditor(updated);
  }

  /** A routine goes live only when it and every exercise in it carry an expert sign-off. */
  async publish(id: string): Promise<RoutineEditorResponse> {
    const routine = await this.require(id);
    if (!routine.expertReviewed) throw new ConflictError("Routine needs expert review before publishing", "REVIEW_REQUIRED");
    if (routine.steps.length === 0) throw new ConflictError("Routine has no steps", "ROUTINE_EMPTY");
    const blocked = routine.steps.filter((step) => step.exerciseStatus !== "published" || !step.exerciseExpertReviewed);
    if (blocked.length > 0) {
      throw new ConflictError("Every exercise must be reviewed and published first", "EXERCISES_NOT_PUBLISHED", {
        exerciseIds: blocked.map((step) => step.exerciseId)
      });
    }
    return this.toEditor((await this.routineRepository.setStatus(id, "published")) as RoutineWithSteps);
  }

  async archive(id: string): Promise<RoutineEditorResponse> {
    await this.require(id);
    return this.toEditor((await this.routineRepository.setStatus(id, "archived")) as RoutineWithSteps);
  }

  private async require(id: string): Promise<RoutineWithSteps> {
    const routine = await this.routineRepository.findById(id);
    if (!routine) throw new NotFoundError("Routine");
    return routine;
  }

  private async assertExercisesUsable(appCode: AppCode, steps: RoutineStepInput[]): Promise<void> {
    const ids = [...new Set(steps.map((step) => step.exerciseId))];
    const exercises = await this.exerciseRepository.findByIds(ids);
    const found = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    const missing = ids.filter((id) => !found.has(id));
    if (missing.length > 0) throw new ValidationError("Unknown exercises", { exerciseIds: missing });
    const foreign = exercises.filter((exercise) => !exercise.appCodes.includes(appCode));
    if (foreign.length > 0) {
      throw new ValidationError(`Exercises are not enabled for ${appCode}`, { exerciseIds: foreign.map((exercise) => exercise.id) });
    }
  }

  private toSummary(routine: Routine): RoutineSummaryResponse {
    return {
      id: routine.id,
      appCode: routine.appCode,
      title: routine.title,
      description: routine.description,
      goal: routine.goal,
      level: routine.level,
      estimatedMinutes: routine.estimatedMinutes,
      tags: routine.tags,
      isPremium: routine.isPremium,
      stepCount: routine.stepCount
    };
  }

  private toDetail(routine: RoutineWithSteps, locked: boolean): RoutineDetailResponse {
    return {
      ...this.toSummary(routine),
      locked,
      steps: locked
        ? []
        : routine.steps.map((step) => ({
            position: step.position,
            exerciseId: step.exerciseId,
            name: step.exerciseName,
            sets: step.sets,
            reps: step.reps,
            durationSeconds: step.durationSeconds,
            restSeconds: step.restSeconds,
            notes: step.notes,
            safetyNotes: step.safetyNotes,
            media: step.media
          }))
    };
  }

  private toEditor(routine: RoutineWithSteps): RoutineEditorResponse {
    return {
      ...this.toDetail(routine, false),
      status: routine.status,
      expertReviewed: routine.expertReviewed,
      reviewNotes: routine.reviewNotes,
      updatedAt: routine.updatedAt
    };
  }
}
