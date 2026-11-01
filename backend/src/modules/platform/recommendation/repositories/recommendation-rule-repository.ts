import type pg from "pg";
import type { AppCode } from "../../../../config/app-catalog.js";
import { buildInsert, buildUpdate, camelizeRow, camelizeRows, type ColumnMap } from "../../../../utils/sql.js";
import type { IRecommendationRuleRepository } from "../domain/IRecommendationRuleRepository.js";
import type {
  CreateRecommendationRuleInput,
  RecommendationRule,
  UpdateRecommendationRuleInput
} from "../models/recommendation-rule.js";

const RULE_COLUMNS: ColumnMap<CreateRecommendationRuleInput> = {
  code: "code",
  sourceApp: "source_app",
  targetApp: "target_app",
  triggerEvent: "trigger_event",
  lookbackDays: "lookback_days",
  headline: "headline",
  body: "body",
  deepLink: "deep_link",
  priority: "priority",
  maxImpressionsPerWeek: "max_impressions_per_week",
  isActive: "is_active"
};

export class RecommendationRuleRepository implements IRecommendationRuleRepository {
  constructor(private pool: pg.Pool) {}

  async listActiveForSource(sourceApp: AppCode): Promise<RecommendationRule[]> {
    const result = await this.pool.query(
      "SELECT * FROM reco.rules WHERE source_app = $1 AND is_active ORDER BY priority, code",
      [sourceApp]
    );
    return camelizeRows<RecommendationRule>(result.rows);
  }

  async list(): Promise<RecommendationRule[]> {
    const result = await this.pool.query("SELECT * FROM reco.rules ORDER BY source_app, priority, code");
    return camelizeRows<RecommendationRule>(result.rows);
  }

  async findById(id: string): Promise<RecommendationRule | null> {
    const result = await this.pool.query("SELECT * FROM reco.rules WHERE id = $1", [id]);
    return result.rows[0] ? camelizeRow<RecommendationRule>(result.rows[0]) : null;
  }

  async create(input: CreateRecommendationRuleInput): Promise<RecommendationRule> {
    const { text, values } = buildInsert("reco.rules", input, RULE_COLUMNS);
    const result = await this.pool.query(text, values);
    return camelizeRow<RecommendationRule>(result.rows[0]);
  }

  async update(id: string, input: UpdateRecommendationRuleInput): Promise<RecommendationRule | null> {
    const query = buildUpdate("reco.rules", input, RULE_COLUMNS, { id });
    if (!query) return this.findById(id);
    const result = await this.pool.query(query.text, query.values);
    return result.rows[0] ? camelizeRow<RecommendationRule>(result.rows[0]) : null;
  }
}
