import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { camelizeRows } from "../../../../utils/sql.js";
import type { IInteractionRepository } from "../domain/IInteractionRepository.js";
import type { InteractionAction, RuleStatsResponse, RuleUserState } from "../models/recommendation.js";

export class InteractionRepository implements IInteractionRepository {
  constructor(private pool: pg.Pool) {}

  async record(
    userId: string,
    ruleId: string,
    sourceApp: AppCode,
    targetApp: AppCode,
    action: InteractionAction
  ): Promise<boolean> {
    const result = await this.pool.query(
      `INSERT INTO reco.interactions (user_id, rule_id, source_app, target_app, action)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
      [userId, ruleId, sourceApp, targetApp, action]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async userState(userId: string, ruleIds: string[]): Promise<RuleUserState[]> {
    if (ruleIds.length === 0) return [];
    const result = await this.pool.query(
      `SELECT rule_id,
         count(*) FILTER (WHERE action = 'impression' AND created_at >= now() - interval '7 days')::int AS impressions_last7_days,
         bool_or(action = 'dismiss' AND created_at >= now() - interval '30 days') AS dismissed_last30_days
       FROM reco.interactions
       WHERE user_id = $1 AND rule_id = ANY($2::uuid[])
       GROUP BY rule_id`,
      [userId, ruleIds]
    );
    return camelizeRows<RuleUserState>(result.rows);
  }

  async stats(from: string, to: string): Promise<Array<Omit<RuleStatsResponse, "clickThroughRate" | "installRate">>> {
    const result = await this.pool.query(
      `SELECT r.id AS rule_id, r.code, r.source_app, r.target_app,
         count(i.id) FILTER (WHERE i.action = 'impression')::int AS impressions,
         count(i.id) FILTER (WHERE i.action = 'click')::int AS clicks,
         count(i.id) FILTER (WHERE i.action = 'dismiss')::int AS dismissals,
         count(i.id) FILTER (WHERE i.action = 'install')::int AS installs
       FROM reco.rules r
       LEFT JOIN reco.interactions i
         ON i.rule_id = r.id AND i.created_at >= $1::date AND i.created_at < $2::date + 1
       GROUP BY r.id ORDER BY r.source_app, r.priority, r.code`,
      [from, to]
    );
    return camelizeRows(result.rows);
  }
}
