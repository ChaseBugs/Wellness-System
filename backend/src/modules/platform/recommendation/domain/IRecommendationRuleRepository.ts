import type { AppCode } from "../../../../config/app-catalog.js";
import type {
  CreateRecommendationRuleInput,
  RecommendationRule,
  UpdateRecommendationRuleInput
} from "../models/recommendation-rule.js";

export interface IRecommendationRuleRepository {
  listActiveForSource(sourceApp: AppCode): Promise<RecommendationRule[]>;
  list(): Promise<RecommendationRule[]>;
  findById(id: string): Promise<RecommendationRule | null>;
  create(input: CreateRecommendationRuleInput): Promise<RecommendationRule>;
  update(id: string, input: UpdateRecommendationRuleInput): Promise<RecommendationRule | null>;
}
