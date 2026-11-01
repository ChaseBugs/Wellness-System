import { BaseController } from "../../../../utils/base-controller.js";
import { sendSuccess } from "../../../../utils/response.js";
import type { InteractionAction } from "../models/recommendation.js";
import type { RecommendationService } from "../services/recommendation-service.js";

export class RecommendationController extends BaseController {
  constructor(private recommendationService: RecommendationService) {
    super();
  }

  feed = this.handle(async (req, res) => {
    const limit = Number(this.query(req, "limit") ?? 1);
    sendSuccess(res, await this.recommendationService.feed(this.userId(req), this.appCode(req), limit));
  });

  track = this.handle(async (req, res) => {
    const result = await this.recommendationService.track(
      this.userId(req),
      this.param(req, "ruleId"),
      req.body.action as InteractionAction
    );
    sendSuccess(res, result, 201);
  });

  stats = this.handle(async (req, res) => {
    sendSuccess(res, await this.recommendationService.stats(String(req.query.from), String(req.query.to)));
  });
}
