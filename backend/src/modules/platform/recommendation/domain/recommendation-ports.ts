import type { AppCode } from "../../../../config/app-catalog.js";

/**
 * Narrow read ports onto other platform modules. Recommendations only use behavioural signals
 * (events, installs, preferences), never health or child records from app schemas.
 */
export interface IntentSignalReader {
  recentSignals(userId: string, appCode: AppCode, sinceDays: number): Promise<Array<{ name: string; lastAt: Date }>>;
}

export interface InstalledAppsReader {
  listCodes(userId: string): Promise<AppCode[]>;
}

export interface RecommendationPreferenceReader {
  findById(userId: string): Promise<{ crossAppRecommendations: boolean } | null>;
}
