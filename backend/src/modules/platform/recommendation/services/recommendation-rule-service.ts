import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { IRecommendationRuleRepository } from "../domain/IRecommendationRuleRepository.js";
import type {
  CreateRecommendationRuleInput,
  RecommendationRule,
  RecommendationRuleResponse,
  UpdateRecommendationRuleInput
} from "../models/recommendation-rule.js";

export class RecommendationRuleService {
  constructor(private ruleRepository: IRecommendationRuleRepository) {}

  async list(): Promise<RecommendationRuleResponse[]> {
    return (await this.ruleRepository.list()).map((rule) => this.toResponse(rule));
  }

  async create(input: CreateRecommendationRuleInput): Promise<RecommendationRuleResponse> {
    if (input.sourceApp === input.targetApp) throw new ValidationError("sourceApp and targetApp must differ");
    return this.toResponse(await this.ruleRepository.create(input));
  }

  async update(id: string, input: UpdateRecommendationRuleInput): Promise<RecommendationRuleResponse> {
    const rule = await this.ruleRepository.update(id, input);
    if (!rule) throw new NotFoundError("Recommendation rule");
    return this.toResponse(rule);
  }

  private toResponse(rule: RecommendationRule): RecommendationRuleResponse {
    const { createdAt: _createdAt, ...rest } = rule;
    return rest;
  }
}
