import { ForbiddenError, NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type {
  AccountStore,
  IDailyLogRepository,
  IGoalRepository,
  IHeightProfileRepository,
  MeasurementStore
} from "../domain/height-ports.js";
import type {
  CreateGoalInput,
  DailyLog,
  DailyLogResponse,
  Goal,
  GoalResponse,
  ReportResponse,
  UpdateGoalInput,
  UpsertDailyLogInput
} from "../models/daily-log.js";
import type { HeightProfile, HeightProfileResponse, UpdateHeightProfileInput } from "../models/height-profile.js";

const DEFAULT_REPORT_DAYS = 30;
/** Logs read to count the workout streak (a longer streak shows as this many days). */
const STREAK_WINDOW_DAYS = 366;

/**
 * Consecutive days with a logged workout, ending today or yesterday (`today` is the client's local
 * date, so a streak isn't broken by the server's timezone).
 */
export function workoutStreak(logs: Array<{ logDate: string; workoutMinutes: number }>, today: string): number {
  const days = new Set(logs.filter((log) => log.workoutMinutes > 0).map((log) => log.logDate));
  const shift = (date: string, offset: number) => new Date(Date.parse(`${date}T00:00:00Z`) + offset * 86_400_000).toISOString().slice(0, 10);
  let cursor = days.has(today) ? today : shift(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = shift(cursor, -1);
  }
  return streak;
}

/**
 * The HeightIncrease user's own data: profile, daily logs, goals and reports. Height readings logged
 * here also land in height.measurements so the observed trend has one source.
 */
export class HeightProfileService {
  constructor(
    private profiles: IHeightProfileRepository,
    private logs: IDailyLogRepository,
    private goals: IGoalRepository,
    private measurements: MeasurementStore,
    private accounts: AccountStore
  ) {}

  /** Blocked users keep their Wellness account but cannot use HeightIncrease. */
  async requireActive(userId: string): Promise<HeightProfile> {
    const profile = await this.profiles.ensure(userId);
    if (profile.status === "blocked") throw new ForbiddenError("Your HeightIncrease access is blocked");
    return profile;
  }

  async get(userId: string): Promise<HeightProfileResponse & { activeGoals: GoalResponse[]; latestLogs: DailyLogResponse[] }> {
    const profile = await this.requireActive(userId);
    const [response, goals, logs] = await Promise.all([
      this.toResponse(userId, profile),
      this.goals.list(userId, "active"),
      this.logs.listRecent(userId, 7)
    ]);
    return { ...response, activeGoals: goals.map(toGoalResponse), latestLogs: logs.map(toLogResponse) };
  }

  async update(userId: string, input: UpdateHeightProfileInput): Promise<HeightProfileResponse> {
    await this.requireActive(userId);
    const { name, ...fields } = input;
    if (name !== undefined) await this.accounts.update(userId, { displayName: name });
    return this.toResponse(userId, await this.profiles.update(userId, fields));
  }

  async report(userId: string, limit = DEFAULT_REPORT_DAYS, today = new Date().toISOString().slice(0, 10)): Promise<ReportResponse> {
    const profile = await this.requireActive(userId);
    const [history, latest] = await Promise.all([this.logs.listRecent(userId, Math.max(limit, STREAK_WINDOW_DAYS)), this.latestMeasurement(userId)]);
    const logs = history.slice(0, limit);
    const sleep = logs.filter((log) => log.sleepHours !== null);
    return {
      summary: {
        workoutMinutes: logs.reduce((total, log) => total + log.workoutMinutes, 0),
        averageSleepHours: sleep.length
          ? Math.round((sleep.reduce((total, log) => total + (log.sleepHours ?? 0), 0) / sleep.length) * 10) / 10
          : 0,
        streakDays: workoutStreak(history, today),
        currentHeightCm: latest?.heightCm ?? null,
        targetHeightCm: profile.targetHeightCm
      },
      logs: logs.map(toLogResponse)
    };
  }

  async recordLog(userId: string, input: UpsertDailyLogInput): Promise<DailyLogResponse> {
    await this.requireActive(userId);
    if (Date.parse(input.date) > Date.now()) throw new ValidationError("date cannot be in the future");
    const log = await this.logs.upsert(userId, input);
    if (typeof input.heightCm === "number") {
      await this.measurements.upsert(userId, { measuredOn: log.logDate, heightCm: input.heightCm, weightKg: input.weightKg ?? log.weightKg });
    }
    return toLogResponse(log);
  }

  async listGoals(userId: string, status?: Goal["status"]): Promise<GoalResponse[]> {
    await this.requireActive(userId);
    return (await this.goals.list(userId, status)).map(toGoalResponse);
  }

  async createGoal(userId: string, input: CreateGoalInput): Promise<GoalResponse> {
    await this.requireActive(userId);
    return toGoalResponse(await this.goals.create(userId, input));
  }

  async updateGoal(userId: string, id: string, input: UpdateGoalInput): Promise<GoalResponse> {
    await this.requireActive(userId);
    const goal = await this.goals.update(id, userId, input);
    if (!goal) throw new NotFoundError("Goal");
    return toGoalResponse(goal);
  }

  private async latestMeasurement(userId: string) {
    const measurements = await this.measurements.listForUser(userId);
    return measurements[measurements.length - 1];
  }

  private async toResponse(userId: string, profile: HeightProfile): Promise<HeightProfileResponse> {
    const [account, latest] = await Promise.all([this.accounts.findById(userId), this.latestMeasurement(userId)]);
    if (!account) throw new NotFoundError("Account");
    return {
      id: userId,
      email: account.email,
      name: account.displayName,
      avatarUrl: profile.avatarUrl,
      streakDays: profile.streakDays,
      points: profile.points,
      measurements: {
        currentHeightCm: latest?.heightCm ?? null,
        weightKg: latest?.weightKg ?? null,
        targetHeightCm: profile.targetHeightCm,
        birthDate: profile.birthDate,
        gender: profile.gender
      },
      preferences: { units: profile.units, notificationsEnabled: profile.notificationsEnabled }
    };
  }
}

function toLogResponse(log: DailyLog): DailyLogResponse {
  return {
    id: log.id,
    date: log.logDate,
    heightCm: log.heightCm,
    weightKg: log.weightKg,
    sleepHours: log.sleepHours,
    waterGlasses: log.waterGlasses,
    mood: log.mood,
    workoutMinutes: log.workoutMinutes,
    completedExercises: log.completedExercises,
    notes: log.notes
  };
}

function toGoalResponse(goal: Goal): GoalResponse {
  return {
    id: goal.id,
    title: goal.title,
    type: goal.goalType,
    targetValue: goal.targetValue,
    currentValue: goal.currentValue,
    unit: goal.unit,
    startsAt: goal.startsAt,
    dueAt: goal.dueAt,
    status: goal.status
  };
}
