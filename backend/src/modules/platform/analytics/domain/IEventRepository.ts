import type { AppCode } from "../../../../config/app-catalog.js";
import type { NewAnalyticsEvent, RecentEventSignal } from "../models/event.js";
import type { RetentionCounts } from "../models/kpi.js";

export interface IEventRepository {
  insertMany(events: NewAnalyticsEvent[]): Promise<number>;
  /** Latest occurrence of each event name for a user in one app within the window. */
  recentSignals(userId: string, appCode: AppCode, sinceDays: number): Promise<RecentEventSignal[]>;
  countActive(appCode: AppCode, from: string, to: string): Promise<{ users: number; anonymous: number }>;
  topEvents(appCode: AppCode, from: string, to: string, limit: number): Promise<Array<{ name: string; count: number }>>;
  retention(appCode: AppCode, from: string, to: string): Promise<RetentionCounts>;
}
