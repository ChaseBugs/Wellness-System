import { getAppDefinition, type AppCode } from "../../../../config/app-catalog.js";
import { NotFoundError } from "../../../../utils/errors.js";
import type { IInteractionRepository } from "../domain/IInteractionRepository.js";
import type { IRecommendationRuleRepository } from "../domain/IRecommendationRuleRepository.js";
import type {
  InstalledAppsReader,
  IntentSignalReader,
  RecommendationPreferenceReader
} from "../domain/recommendation-ports.js";
import type { InteractionAction, RecommendationResponse, RuleStatsResponse } from "../models/recommendation.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function ratio(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 1000;
}

/**
 * Recommends the next app based on what the user is trying to do, not as an ad:
 * a rule fires only after its trigger event happened recently in the source app, never for apps
 * the user already has, never after an opt-out, and with per-rule weekly frequency caps.
 */
export class RecommendationService {
  constructor(
    private ruleRepository: IRecommendationRuleRepository,
    private interactionRepository: IInteractionRepository,
    private signals: IntentSignalReader,
    private installedApps: InstalledAppsReader,
    private preferences: RecommendationPreferenceReader
  ) {}

  async feed(userId: string, sourceApp: AppCode, limit: number): Promise<RecommendationResponse[]> {
    const user = await this.preferences.findById(userId);
    if (!user || !user.crossAppRecommendations) return [];

    const rules = await this.ruleRepository.listActiveForSource(sourceApp);
    if (rules.length === 0) return [];

    const maxLookback = Math.max(...rules.map((rule) => rule.lookbackDays));
    const [installed, signals, states] = await Promise.all([
      this.installedApps.listCodes(userId),
      this.signals.recentSignals(userId, sourceApp, maxLookback),
      this.interactionRepository.userState(userId, rules.map((rule) => rule.id))
    ]);
    const installedSet = new Set(installed);
    const lastSeen = new Map(signals.map((signal) => [signal.name, new Date(signal.lastAt).getTime()]));
    const stateByRule = new Map(states.map((state) => [state.ruleId, state]));

    const now = Date.now();
    return rules
      .filter((rule) => {
        if (installedSet.has(rule.targetApp)) return false;
        const triggeredAt = lastSeen.get(rule.triggerEvent);
        if (triggeredAt === undefined || triggeredAt < now - rule.lookbackDays * DAY_MS) return false;
        const state = stateByRule.get(rule.id);
        if (state?.dismissedLast30Days) return false;
        return (state?.impressionsLast7Days ?? 0) < rule.maxImpressionsPerWeek;
      })
      .slice(0, limit)
      .map((rule) => ({
        ruleId: rule.id,
        targetApp: { code: rule.targetApp, name: getAppDefinition(rule.targetApp).name },
        headline: rule.headline,
        body: rule.body,
        deepLink: rule.deepLink
      }));
  }

  /** Clients report what the user saw and did; impressions drive the frequency cap. */
  async track(userId: string, ruleId: string, action: InteractionAction): Promise<{ recorded: boolean }> {
    const rule = await this.ruleRepository.findById(ruleId);
    if (!rule) throw new NotFoundError("Recommendation rule");
    const recorded = await this.interactionRepository.record(userId, rule.id, rule.sourceApp, rule.targetApp, action);
    return { recorded };
  }

  async stats(from: string, to: string): Promise<RuleStatsResponse[]> {
    const rows = await this.interactionRepository.stats(from, to);
    return rows.map((row) => ({
      ...row,
      clickThroughRate: ratio(row.clicks, row.impressions),
      installRate: ratio(row.installs, row.clicks)
    }));
  }
}
