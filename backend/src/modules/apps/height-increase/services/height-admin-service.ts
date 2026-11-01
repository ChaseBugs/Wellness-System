import type { ResourceDefinition, ResourceRecord } from "../../../../shared/resource-kit/resource-definition.js";
import type { ResourceActor, ResourceService } from "../../../../shared/resource-kit/resource-service.js";
import { ValidationError } from "../../../../utils/errors.js";
import type { UpdateRoutineInput } from "../../../platform/routine/models/routine.js";
import type { IHeightAdminStatsRepository } from "../domain/IHeightAdminStatsRepository.js";
import type { HeightAdminStats, LegacyPlanExercise } from "../models/height-admin.js";

const TREND_DAYS = 14;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Replaces a routine's steps through the Routine Engine (implemented by RoutineService). */
export interface RoutineStepWriter {
  update(id: string, input: UpdateRoutineInput): Promise<unknown>;
}

const positive = (value: unknown) => (typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined);

/** Dashboard stats and training-plan saves for the HeightIncrease admin. */
export class HeightAdminService {
  constructor(
    private statsRepository: IHeightAdminStatsRepository,
    private resourceService: ResourceService,
    private plans: ResourceDefinition,
    private routines: RoutineStepWriter
  ) {}

  async stats(): Promise<HeightAdminStats> {
    const [totals, latestLogs, perDay] = await Promise.all([
      this.statsRepository.totals(),
      this.statsRepository.latestLogs(6),
      this.statsRepository.logsPerDay(TREND_DAYS)
    ]);
    return {
      totals,
      latestLogs,
      charts: {
        workoutByDay: perDay.map((row) => ({
          label: `${Number(row.day.slice(5, 7))}/${Number(row.day.slice(8, 10))}`,
          entries: row.entries,
          workoutMinutes: row.workoutMinutes,
          averageSleepHours: Number((row.averageSleepHours ?? 0).toFixed(1))
        })),
        contentMix: [
          { label: "Exercises", value: totals.exercises },
          { label: "Plans", value: totals.plans },
          { label: "Articles", value: totals.articles },
          { label: "Push", value: totals.notifications }
        ],
        users: [
          { label: "Active", value: totals.activeUsers },
          { label: "Inactive", value: Math.max(totals.users - totals.activeUsers, 0) }
        ]
      }
    };
  }

  /**
   * Training plans are Resource-kit records plus an ordered exercise list. The legacy admin sends both in
   * one body (`exercises: [{ exercise, order, durationSeconds, sets, reps, restSeconds }]`); the list is
   * written as Routine Engine steps, which also checks every exercise belongs to HeightIncrease.
   */
  async savePlan(id: string | undefined, body: unknown, actor: ResourceActor): Promise<ResourceRecord> {
    const { exercises, ...fields } = (body && typeof body === "object" && !Array.isArray(body) ? body : {}) as Record<string, unknown>;
    const steps = exercises === undefined ? undefined : this.toSteps(exercises);
    const record = id
      ? await this.resourceService.update(this.plans, id, fields, actor)
      : await this.resourceService.create(this.plans, fields, actor);
    if (steps) {
      await this.routines.update(record.id, { steps });
      await this.resourceService.recordCustomAction(this.plans, [record.id], actor, { action: "replace-exercises", count: steps.length });
      return this.resourceService.get(this.plans, record.id);
    }
    return record;
  }

  private toSteps(raw: unknown): NonNullable<UpdateRoutineInput["steps"]> {
    if (!Array.isArray(raw)) throw new ValidationError("exercises must be an array");
    const entries = raw as LegacyPlanExercise[];
    const invalid = entries.findIndex((entry) => !entry || typeof entry.exercise !== "string" || !UUID.test(entry.exercise));
    if (invalid >= 0) throw new ValidationError(`exercises[${invalid}].exercise must be an exercise id`);
    return [...entries]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((entry) => ({
        exerciseId: entry.exercise,
        sets: positive(entry.sets),
        reps: positive(entry.reps),
        durationSeconds: positive(entry.durationSeconds),
        restSeconds: typeof entry.restSeconds === "number" && entry.restSeconds >= 0 ? Math.round(entry.restSeconds) : undefined
      }));
  }
}
