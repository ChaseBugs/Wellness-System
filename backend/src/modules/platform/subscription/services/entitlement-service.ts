import type { AppCode } from "../../../../config/app-catalog.js";
import { NotFoundError } from "../../../../utils/errors.js";
import type { EntitlementChecker } from "../domain/entitlement-checker.js";
import type { IPlanRepository } from "../domain/IPlanRepository.js";
import type { IPurchaseRepository } from "../domain/IPurchaseRepository.js";
import type { EligibilityResponse, EntitlementGrant, EntitlementSummaryResponse } from "../models/entitlement.js";

export class EntitlementService implements EntitlementChecker {
  constructor(
    private purchaseRepository: IPurchaseRepository,
    private planRepository: IPlanRepository
  ) {}

  async hasAccess(userId: string, appCode: AppCode): Promise<boolean> {
    return this.purchaseRepository.hasActiveGrant(userId, appCode);
  }

  async summary(userId: string): Promise<EntitlementSummaryResponse> {
    const grants = await this.purchaseRepository.findActiveGrants(userId);

    // When several purchases cover one app, report Wellness Pass first, then the latest expiry.
    const best = new Map<AppCode, EntitlementGrant>();
    for (const grant of grants) {
      const current = best.get(grant.appCode);
      if (!current || this.outranks(grant, current)) best.set(grant.appCode, grant);
    }

    const apps = [...best.values()].map((grant) => ({
      appCode: grant.appCode,
      tier: grant.tier,
      planCode: grant.planCode,
      expiresAt: grant.expiresAt
    }));
    const tier = grants.some((grant) => grant.tier === "wellness_pass")
      ? "wellness_pass"
      : grants.length > 0
        ? "app_pro"
        : "free";
    return { tier, apps };
  }

  /** Pre-purchase check so clients never sell a plan the account already has (duplicate subscriptions). */
  async eligibility(userId: string, planCode: string): Promise<EligibilityResponse> {
    const plan = await this.planRepository.findByCode(planCode);
    if (!plan || !plan.isActive) throw new NotFoundError("Plan");

    const covered = new Set((await this.purchaseRepository.findActiveGrants(userId)).map((grant) => grant.appCode));
    const alreadyCoveredApps = plan.apps.filter((app) => covered.has(app));

    if (alreadyCoveredApps.length === plan.apps.length) {
      return { planCode, eligible: false, reason: "ALREADY_ENTITLED", alreadyCoveredApps };
    }
    return { planCode, eligible: true, reason: alreadyCoveredApps.length > 0 ? "UPGRADE" : "ELIGIBLE", alreadyCoveredApps };
  }

  private outranks(candidate: EntitlementGrant, current: EntitlementGrant): boolean {
    if (candidate.tier !== current.tier) return candidate.tier === "wellness_pass";
    const expiry = (grant: EntitlementGrant) => (grant.expiresAt ? new Date(grant.expiresAt).getTime() : Infinity);
    return expiry(candidate) > expiry(current);
  }
}
