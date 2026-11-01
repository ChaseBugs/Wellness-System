import type { AppCode } from "../../../../config/app-catalog.js";
import type { IPlanRepository } from "../domain/IPlanRepository.js";
import type { Plan, PlanResponse } from "../models/plan.js";

export class PlanService {
  constructor(private planRepository: IPlanRepository) {}

  async list(appCode?: AppCode): Promise<PlanResponse[]> {
    const plans = await this.planRepository.listActive(appCode);
    return plans.map((plan) => this.toResponse(plan));
  }

  private toResponse(plan: Plan): PlanResponse {
    return {
      code: plan.code,
      name: plan.name,
      tier: plan.tier,
      appCode: plan.appCode,
      billingPeriod: plan.billingPeriod,
      priceUsd: plan.priceUsd,
      unlocksApps: plan.apps,
      products: plan.products
    };
  }
}
