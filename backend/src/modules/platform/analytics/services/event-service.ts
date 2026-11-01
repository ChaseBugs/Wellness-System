import type { AppCode } from "../../../../config/app-catalog.js";
import { ValidationError } from "../../../../utils/errors.js";
import type { IEventRepository } from "../domain/IEventRepository.js";
import type { NewAnalyticsEvent, RecentEventSignal, TrackEventInput, TrackEventsResponse } from "../models/event.js";

// Accept a little clock skew from devices, but reject timestamps that would corrupt cohorts.
const MAX_FUTURE_MS = 5 * 60 * 1000;
const MAX_PAST_MS = 30 * 24 * 60 * 60 * 1000;

export class EventService {
  constructor(private eventRepository: IEventRepository) {}

  async track(appCode: AppCode, userId: string | undefined, events: TrackEventInput[]): Promise<TrackEventsResponse> {
    const now = Date.now();
    const rows: NewAnalyticsEvent[] = events.map((event, index) => {
      const occurredAt = event.occurredAt ? new Date(event.occurredAt) : new Date(now);
      if (occurredAt.getTime() > now + MAX_FUTURE_MS || occurredAt.getTime() < now - MAX_PAST_MS) {
        throw new ValidationError(`events[${index}].occurredAt is outside the accepted window`);
      }
      if (!userId && !event.anonymousId) {
        throw new ValidationError(`events[${index}] needs an anonymousId when not signed in`);
      }
      return {
        userId: userId ?? null,
        anonymousId: event.anonymousId ?? null,
        appCode,
        name: event.name,
        properties: event.properties ?? {},
        sessionId: event.sessionId ?? null,
        platform: event.platform ?? null,
        appVersion: event.appVersion ?? null,
        occurredAt
      };
    });
    return { accepted: await this.eventRepository.insertMany(rows) };
  }

  /** Used by the recommendation engine to read the user's recent intent signals in one app. */
  async recentSignals(userId: string, appCode: AppCode, sinceDays: number): Promise<RecentEventSignal[]> {
    return this.eventRepository.recentSignals(userId, appCode, sinceDays);
  }
}
