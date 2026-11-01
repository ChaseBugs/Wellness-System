import type { AppCode } from "../../../../config/app-catalog.js";

export interface KpiQuery {
  appCode: AppCode;
  from: string;
  to: string;
}

export interface RetentionCounts {
  cohortSize: number;
  d1: number;
  d7: number;
  d30: number;
}

export interface KpiSummaryResponse {
  appCode: AppCode;
  from: string;
  to: string;
  activeUsers: number;
  anonymousVisitors: number;
  topEvents: Array<{ name: string; count: number }>;
  /** Share of users first seen in [from, to] who returned exactly 1/7/30 days later. */
  retention: { cohortSize: number; d1: number; d7: number; d30: number };
}
