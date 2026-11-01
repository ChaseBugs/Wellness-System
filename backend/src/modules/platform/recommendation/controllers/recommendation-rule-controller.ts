import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { CreateRecommendationRuleInput, UpdateRecommendationRuleInput } from "../models/recommendation-rule.js";
import type { RecommendationRuleService } from "../services/recommendation-rule-service.js";

const UPDATABLE = ["triggerEvent", "lookbackDays", "headline", "body", "deepLink", "priority", "maxImpressionsPerWeek", "isActive"] as const;

function pick(body: Record<string, unknown>): UpdateRecommendationRuleInput {
  const picked: Record<string, unknown> = {};
  for (const field of UPDATABLE) if (body[field] !== undefined) picked[field] = body[field];
  return picked as UpdateRecommendationRuleInput;
}

export class RecommendationRuleController extends BaseController {
  constructor(private ruleService: RecommendationRuleService) {
    super();
  }

  list = this.handle(async (_req, res) => {
    sendSuccess(res, await this.ruleService.list());
  });

  create = this.handle(async (req, res) => {
    const input = {
      ...pick(req.body),
      code: req.body.code,
      sourceApp: req.body.sourceApp,
      targetApp: req.body.targetApp
    } as CreateRecommendationRuleInput;
    sendSuccess(res, await this.ruleService.create(input), 201);
  });

  update = this.handle(async (req, res) => {
    sendSuccess(res, await this.ruleService.update(this.param(req, "id"), pick(req.body)));
  });
}
