import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { ContentItem } from "../../../platform/content/models/content-item.js";
import type { EntitlementChecker } from "../../../platform/subscription/domain/entitlement-checker.js";
import type { LibraryCatalog } from "../domain/babygrow-ports.js";
import type { IActivityRepository } from "../domain/IActivityRepository.js";
import {
  ACTIVITY_CATEGORIES,
  type ActivityHistoryResponse,
  type ActivityResponse,
  type CompleteActivityInput,
  type DailyActivityResponse,
  type DailyUpdateResponse,
  type DifficultyFeedback
} from "../models/library.js";
import { ageInMonths, type ChildService } from "./child-service.js";
import { toActivity, toDailyUpdate } from "./library-mappers.js";

const APP = "babygrow";
const LIST_LIMIT = 500;
const DAILY_UPDATE_TYPES = ["tip", "development", "activity", "safety"];

export interface ActivityFilters {
  month?: number;
  category?: string;
  subCategory?: string;
  search?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Day number used to rotate content deterministically (same picks all day, different tomorrow). */
const daySeed = (date: string) => Number.parseInt(date.replace(/-/g, ""), 10);

/**
 * Age-appropriate play activities, the four-slot daily plan and age-based daily updates
 * (logic moved from the legacy TalentBaby activity and daily-update controllers).
 */
export class ActivityLibraryService {
  constructor(
    private catalog: LibraryCatalog,
    private activityRepository: IActivityRepository,
    private childService: ChildService,
    private entitlements: EntitlementChecker
  ) {}

  async list(userId: string, filters: ActivityFilters): Promise<ActivityResponse[]> {
    const { items } = await this.catalog.listPublishedItems({
      appCode: APP,
      contentType: "activity",
      ageMonths: filters.month,
      category: filters.category && filters.category !== "all" ? filters.category : undefined,
      attributeEquals: filters.subCategory ? { subCategory: filters.subCategory } : undefined,
      q: filters.search,
      sort: "age",
      page: 1,
      limit: LIST_LIMIT,
      offset: 0
    });
    return this.toResponses(userId, items);
  }

  async get(userId: string, id: string): Promise<ActivityResponse> {
    const [response] = await this.toResponses(userId, [await this.requireActivity(id)]);
    return response;
  }

  async subCategories(): Promise<string[]> {
    return this.catalog.distinctAttributeValues("activity", APP, "subCategory");
  }

  async history(userId: string, childId: string): Promise<ActivityHistoryResponse[]> {
    await this.childService.requireAccess(userId, childId, "viewer");
    const logs = await this.activityRepository.listLogs(childId, 200);
    const items = await this.catalog.findPublishedByIds([...new Set(logs.map((log) => log.contentId))]);
    const activities = new Map((await this.toResponses(userId, items)).map((activity) => [activity.id, activity]));
    return logs
      .filter((log) => activities.has(log.contentId))
      .map((log) => ({
        logId: log.id,
        completedAt: log.completedAt,
        rating: log.rating,
        difficultyFeedback: log.difficultyFeedback,
        notes: log.notes,
        activity: activities.get(log.contentId) as ActivityResponse
      }));
  }

  async complete(userId: string, childId: string, activityId: string, input: CompleteActivityInput): Promise<ActivityHistoryResponse> {
    await this.childService.requireAccess(userId, childId, "editor");
    const item = await this.requireActivity(activityId);
    const log = await this.activityRepository.createLog(childId, item.id, userId, input);
    const [activity] = await this.toResponses(userId, [item]);
    return { logId: log.id, completedAt: log.completedAt, rating: log.rating, difficultyFeedback: log.difficultyFeedback, notes: log.notes, activity };
  }

  async setDifficulty(userId: string, childId: string, activityId: string, feedback: DifficultyFeedback): Promise<ActivityHistoryResponse> {
    await this.childService.requireAccess(userId, childId, "editor");
    const item = await this.requireActivity(activityId);
    const log = await this.activityRepository.setLatestDifficulty(childId, item.id, feedback);
    if (!log) throw new NotFoundError("Completed activity (complete it before rating its difficulty)");
    const [activity] = await this.toResponses(userId, [item]);
    return { logId: log.id, completedAt: log.completedAt, rating: log.rating, difficultyFeedback: log.difficultyFeedback, notes: log.notes, activity };
  }

  /**
   * Four activities per day, one per development area, chosen from what fits the child's age on that
   * date. The pick rotates with the date and is stored, so the plan stays the same all day.
   */
  async dailyPlan(userId: string, childId: string, date = today()): Promise<DailyActivityResponse[]> {
    const child = await this.childService.requireAccess(userId, childId, "viewer");
    if (Number.isNaN(Date.parse(date))) throw new ValidationError("date must be YYYY-MM-DD");

    let slots = await this.activityRepository.findPlan(childId, date);
    if (slots.length < ACTIVITY_CATEGORIES.length) {
      const age = Math.min(36, Math.max(1, ageInMonths(child.birthDate, new Date(`${date}T12:00:00Z`))));
      const picks: Array<{ slot: number; contentId: string }> = [];
      for (const [index, category] of ACTIVITY_CATEGORIES.entries()) {
        const { items: pool } = await this.catalog.listPublishedItems({
          appCode: APP,
          contentType: "activity",
          ageMonths: age,
          category,
          sort: "age",
          page: 1,
          limit: LIST_LIMIT,
          offset: 0
        });
        if (pool.length > 0) picks.push({ slot: index + 1, contentId: pool[(daySeed(date) + index * 37) % pool.length].id });
      }
      slots = await this.activityRepository.savePlan(childId, date, picks);
    }

    const items = await this.catalog.findPublishedByIds(slots.map((slot) => slot.contentId));
    const activities = new Map((await this.toResponses(userId, items)).map((activity) => [activity.id, activity]));
    return slots
      .filter((slot) => activities.has(slot.contentId))
      .map((slot) => ({
        dailyId: slot.id,
        slot: slot.slot,
        planDate: slot.planDate,
        isCompleted: slot.completedAt !== null,
        completedAt: slot.completedAt,
        activity: activities.get(slot.contentId) as ActivityResponse
      }));
  }

  async completeDailySlot(userId: string, childId: string, slot: number, date = today()): Promise<DailyActivityResponse> {
    await this.childService.requireAccess(userId, childId, "editor");
    const updated = await this.activityRepository.completeSlot(childId, date, slot);
    if (!updated) throw new NotFoundError("Daily activity slot (load the daily plan first)");
    await this.activityRepository.createLog(childId, updated.contentId, userId, {});
    const plan = await this.dailyPlan(userId, childId, date);
    return plan.find((entry) => entry.slot === slot) as DailyActivityResponse;
  }

  /** Today's tip / development / activity / safety note for the child's age (rotates daily). */
  async todaysUpdates(userId: string, childId: string): Promise<DailyUpdateResponse[]> {
    const child = await this.childService.requireAccess(userId, childId, "viewer");
    const updates = await this.updatesForAge(ageInMonths(child.birthDate));
    const seed = daySeed(today());
    return DAILY_UPDATE_TYPES.flatMap((type) => {
      const pool = updates.filter((update) => update.contentType === type);
      return pool.length ? [pool[seed % pool.length]] : [];
    });
  }

  async updatesForAge(ageInMonthsValue: number): Promise<DailyUpdateResponse[]> {
    const { items } = await this.catalog.listPublishedItems({
      appCode: APP,
      contentType: "daily_update",
      ageMonths: ageInMonthsValue,
      sort: "age",
      page: 1,
      limit: LIST_LIMIT,
      offset: 0
    });
    return items.map(toDailyUpdate);
  }

  private async requireActivity(id: string): Promise<ContentItem> {
    const [item] = await this.catalog.findPublishedByIds([id]);
    if (!item || item.contentType !== "activity" || !item.appCodes.includes(APP)) throw new NotFoundError("Activity");
    return item;
  }

  private async toResponses(userId: string, items: ContentItem[]): Promise<ActivityResponse[]> {
    const counts = await this.activityRepository.completionCounts(items.map((item) => item.id));
    const premiumUnlocked = items.some((item) => item.isPremium) ? await this.entitlements.hasAccess(userId, APP) : true;
    return items.map((item) => toActivity(item, counts.get(item.id) ?? 0, item.isPremium && !premiumUnlocked));
  }
}
