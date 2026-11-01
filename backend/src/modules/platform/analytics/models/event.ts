import type { AppCode } from "../../../../config/app-catalog.js";

export type ClientPlatform = "ios" | "android" | "web";

export interface TrackEventInput {
  name: string;
  properties?: Record<string, unknown>;
  occurredAt?: string;
  sessionId?: string;
  anonymousId?: string;
  platform?: ClientPlatform;
  appVersion?: string;
}

export interface NewAnalyticsEvent {
  userId: string | null;
  anonymousId: string | null;
  appCode: AppCode;
  name: string;
  properties: Record<string, unknown>;
  sessionId: string | null;
  platform: ClientPlatform | null;
  appVersion: string | null;
  occurredAt: Date;
}

export interface RecentEventSignal {
  name: string;
  lastAt: Date;
}

export interface TrackEventsResponse {
  accepted: number;
}
