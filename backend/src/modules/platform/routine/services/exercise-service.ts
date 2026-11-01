import { ConflictError, NotFoundError } from "../../../../utils/errors.js";
import { toPage, type Page } from "../../../../utils/pagination.js";
import type { IExerciseRepository } from "../domain/IExerciseRepository.js";
import type {
  CreateExerciseInput,
  Exercise,
  ExerciseQuery,
  ExerciseResponse,
  ExpertReviewInput,
  UpdateExerciseInput
} from "../models/exercise.js";

/** Exercises carry movement-safety guidance, so publishing requires an expert sign-off. */
export class ExerciseService {
  constructor(private exerciseRepository: IExerciseRepository) {}

  async list(query: ExerciseQuery): Promise<Page<ExerciseResponse>> {
    const { items, total } = await this.exerciseRepository.list(query);
    return toPage(items, total, query, (exercise) => this.toResponse(exercise));
  }

  async get(id: string): Promise<ExerciseResponse> {
    return this.toResponse(await this.require(id));
  }

  async create(editorId: string, input: CreateExerciseInput): Promise<ExerciseResponse> {
    return this.toResponse(await this.exerciseRepository.create(input, editorId));
  }

  async update(id: string, input: UpdateExerciseInput): Promise<ExerciseResponse> {
    const current = await this.require(id);
    if (current.status === "archived") throw new ConflictError("Archived exercises cannot be edited", "EXERCISE_ARCHIVED");
    const updated = await this.exerciseRepository.update(id, input);
    if (!updated) throw new NotFoundError("Exercise");
    return this.toResponse(updated);
  }

  async review(id: string, decision: ExpertReviewInput): Promise<ExerciseResponse> {
    await this.require(id);
    const updated = await this.exerciseRepository.setReview(id, decision.approve, decision.notes ?? null);
    if (!updated) throw new NotFoundError("Exercise");
    // Withdrawing approval also takes the exercise out of circulation.
    if (!decision.approve && updated.status === "published") {
      return this.toResponse((await this.exerciseRepository.setStatus(id, "draft")) as Exercise);
    }
    return this.toResponse(updated);
  }

  async publish(id: string): Promise<ExerciseResponse> {
    const exercise = await this.require(id);
    if (!exercise.expertReviewed) throw new ConflictError("Exercise needs expert review before publishing", "REVIEW_REQUIRED");
    return this.toResponse((await this.exerciseRepository.setStatus(id, "published")) as Exercise);
  }

  async archive(id: string): Promise<ExerciseResponse> {
    await this.require(id);
    return this.toResponse((await this.exerciseRepository.setStatus(id, "archived")) as Exercise);
  }

  private async require(id: string): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findById(id);
    if (!exercise) throw new NotFoundError("Exercise");
    return exercise;
  }

  private toResponse(exercise: Exercise): ExerciseResponse {
    return {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      appCodes: exercise.appCodes,
      bodyAreas: exercise.bodyAreas,
      difficulty: exercise.difficulty,
      defaultDurationSeconds: exercise.defaultDurationSeconds,
      defaultReps: exercise.defaultReps,
      media: exercise.media,
      safetyNotes: exercise.safetyNotes,
      contraindications: exercise.contraindications,
      status: exercise.status,
      expertReviewed: exercise.expertReviewed,
      reviewNotes: exercise.reviewNotes,
      updatedAt: exercise.updatedAt
    };
  }
}
