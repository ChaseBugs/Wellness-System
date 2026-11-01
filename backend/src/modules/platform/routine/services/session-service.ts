import type { AppCode } from "../../../../config/app-catalog.js";
import { ConflictError, EntitlementRequiredError, NotFoundError } from "../../../../utils/errors.js";
import { toPage, type Page, type PageQuery } from "../../../../utils/pagination.js";
import type { EntitlementChecker } from "../../subscription/domain/entitlement-checker.js";
import type { ISessionRepository } from "../domain/ISessionRepository.js";
import type { CompleteSessionInput, DayActivity, ProgressResponse, Session, SessionResponse } from "../models/session.js";
import type { RoutineService } from "./routine-service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDate(offsetDays = 0): string {
  return new Date(Date.now() - offsetDays * DAY_MS).toISOString().slice(0, 10);
}

export class SessionService {
  constructor(
    private sessionRepository: ISessionRepository,
    private routineService: RoutineService,
    private entitlementChecker: EntitlementChecker
  ) {}

  async start(userId: string, appCode: AppCode, routineId: string): Promise<SessionResponse> {
    const routine = await this.routineService.requirePublished(appCode, routineId);
    if (routine.isPremium && !(await this.entitlementChecker.hasAccess(userId, appCode))) {
      throw new EntitlementRequiredError(appCode);
    }
    return this.toResponse(await this.sessionRepository.create(userId, appCode, routine.id, routine.steps.length));
  }

  async complete(userId: string, appCode: AppCode, sessionId: string, input: CompleteSessionInput): Promise<SessionResponse> {
    await this.requireInProgress(userId, appCode, sessionId);
    return this.toResponse(await this.sessionRepository.complete(sessionId, input));
  }

  async abandon(userId: string, appCode: AppCode, sessionId: string): Promise<SessionResponse> {
    await this.requireInProgress(userId, appCode, sessionId);
    return this.toResponse(await this.sessionRepository.abandon(sessionId));
  }

  async list(userId: string, appCode: AppCode, page: PageQuery): Promise<Page<SessionResponse>> {
    const { items, total } = await this.sessionRepository.list(userId, appCode, page);
    return toPage(items, total, page, (session) => this.toResponse(session));
  }

  /** Streak and weekly totals per app. Days are UTC calendar days. */
  async progress(userId: string, appCode: AppCode): Promise<ProgressResponse> {
    const [dates, totalCompletedSessions, recent] = await Promise.all([
      this.sessionRepository.completedDates(userId, appCode, 400),
      this.sessionRepository.countCompleted(userId, appCode),
      this.sessionRepository.dailyActivity(userId, [appCode], 7)
    ]);

    const byDate = new Map(recent.map((day) => [day.date, day]));
    const last7Days: DayActivity[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const date = utcDate(offset);
      last7Days.push(byDate.get(date) ?? { date, sessions: 0, minutes: 0 });
    }

    return {
      appCode,
      currentStreakDays: this.currentStreak(dates),
      totalCompletedSessions,
      thisWeek: {
        sessions: last7Days.reduce((sum, day) => sum + day.sessions, 0),
        minutes: last7Days.reduce((sum, day) => sum + day.minutes, 0)
      },
      last7Days
    };
  }

  /** Activity summary for other apps; callers must have checked consent first. */
  async summarizeDay(userId: string, appCodes: AppCode[], date: string): Promise<DayActivity> {
    return this.sessionRepository.summarizeDay(userId, appCodes, date);
  }

  /** Consecutive days ending today, or yesterday when today has no session yet (the streak is still alive). */
  private currentStreak(datesDesc: string[]): number {
    const completed = new Set(datesDesc);
    let offset = completed.has(utcDate(0)) ? 0 : 1;
    let streak = 0;
    while (completed.has(utcDate(offset))) {
      streak++;
      offset++;
    }
    return streak;
  }

  private async requireInProgress(userId: string, appCode: AppCode, sessionId: string): Promise<Session> {
    const session = await this.sessionRepository.findById(sessionId, userId, appCode);
    if (!session) throw new NotFoundError("Session");
    if (session.status !== "in_progress") {
      throw new ConflictError(`Session is already ${session.status}`, "SESSION_CLOSED");
    }
    return session;
  }

  private toResponse(session: Session): SessionResponse {
    return {
      id: session.id,
      appCode: session.appCode,
      routineId: session.routineId,
      status: session.status,
      totalSteps: session.totalSteps,
      completedSteps: session.completedSteps,
      durationSeconds: session.durationSeconds,
      perceivedEffort: session.perceivedEffort,
      notes: session.notes,
      startedAt: session.startedAt,
      completedAt: session.completedAt
    };
  }
}
