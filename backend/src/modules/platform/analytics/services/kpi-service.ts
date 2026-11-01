import { ValidationError } from "../../../../utils/errors.js";
import type { IEventRepository } from "../domain/IEventRepository.js";
import type { KpiQuery, KpiSummaryResponse } from "../models/kpi.js";

const MAX_RANGE_DAYS = 366;

function rate(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 1000;
}

/** Launch-decision KPIs from the strategy (active users, D1/D7/D30 retention, core-event volume). */
export class KpiService {
  constructor(private eventRepository: IEventRepository) {}

  async summary(query: KpiQuery): Promise<KpiSummaryResponse> {
    const days = (Date.parse(query.to) - Date.parse(query.from)) / (24 * 60 * 60 * 1000);
    if (!(days >= 0)) throw new ValidationError("`from` must be on or before `to`");
    if (days > MAX_RANGE_DAYS) throw new ValidationError(`Range is limited to ${MAX_RANGE_DAYS} days`);

    const [active, topEvents, retention] = await Promise.all([
      this.eventRepository.countActive(query.appCode, query.from, query.to),
      this.eventRepository.topEvents(query.appCode, query.from, query.to, 25),
      this.eventRepository.retention(query.appCode, query.from, query.to)
    ]);

    return {
      appCode: query.appCode,
      from: query.from,
      to: query.to,
      activeUsers: active.users,
      anonymousVisitors: active.anonymous,
      topEvents,
      retention: {
        cohortSize: retention.cohortSize,
        d1: rate(retention.d1, retention.cohortSize),
        d7: rate(retention.d7, retention.cohortSize),
        d30: rate(retention.d30, retention.cohortSize)
      }
    };
  }
}
