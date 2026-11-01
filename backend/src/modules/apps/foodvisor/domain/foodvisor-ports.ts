import type { AppCode } from "../../../../config/app-catalog.js";
import type { ContentItem } from "../../../platform/content/models/content-item.js";
import type { ConsentScope } from "../../../platform/identity/models/consent.js";

/** Published recipes from the Content Factory (implemented by ContentItemService). */
export interface RecipeReader {
  findPublishedByIds(ids: string[]): Promise<ContentItem[]>;
}

/** Implemented by the identity module's ConsentService. */
export interface ConsentChecker {
  hasConsent(userId: string, sourceApp: AppCode, targetApp: AppCode, scope: ConsentScope): Promise<boolean>;
}

/** Implemented by the Routine Engine's SessionService. */
export interface ActivitySummaryReader {
  summarizeDay(userId: string, appCodes: AppCode[], date: string): Promise<{ sessions: number; minutes: number }>;
}
