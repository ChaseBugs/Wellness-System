import type { AppCode } from "../../../../config/app-catalog.js";
import type { PageQuery } from "../../../../utils/pagination.js";
import type { CompleteSessionInput, DayActivity, Session } from "../models/session.js";

export interface ISessionRepository {
  create(userId: string, appCode: AppCode, routineId: string, totalSteps: number): Promise<Session>;
  findById(id: string, userId: string, appCode: AppCode): Promise<Session | null>;
  complete(id: string, input: CompleteSessionInput): Promise<Session>;
  abandon(id: string): Promise<Session>;
  list(userId: string, appCode: AppCode, page: PageQuery): Promise<{ items: Session[]; total: number }>;
  /** Completed-session totals per UTC day for the last `days` days (days without activity omitted). */
  dailyActivity(userId: string, appCodes: AppCode[], days: number): Promise<DayActivity[]>;
  /** Distinct UTC dates with a completed session, newest first. */
  completedDates(userId: string, appCode: AppCode, limit: number): Promise<string[]>;
  countCompleted(userId: string, appCode: AppCode): Promise<number>;
  /** Totals for one UTC date across the given apps (used for consented cross-app summaries). */
  summarizeDay(userId: string, appCodes: AppCode[], date: string): Promise<DayActivity>;
}
