import type { AppCode } from "../../../../config/app-catalog.js";
import type { InteractionAction, RuleStatsResponse, RuleUserState } from "../models/recommendation.js";

export interface IInteractionRepository {
  /** Returns false when the interaction was deduplicated (an install is counted once per user and rule). */
  record(userId: string, ruleId: string, sourceApp: AppCode, targetApp: AppCode, action: InteractionAction): Promise<boolean>;
  userState(userId: string, ruleIds: string[]): Promise<RuleUserState[]>;
  stats(from: string, to: string): Promise<Array<Omit<RuleStatsResponse, "clickThroughRate" | "installRate">>>;
}
