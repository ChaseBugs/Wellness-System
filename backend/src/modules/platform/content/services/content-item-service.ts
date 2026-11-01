import type { AppCode } from "../../../../config/app-catalog.js";
import { ConflictError, NotFoundError, ValidationError } from "../../../../utils/errors.js";
import logger, { EMOJIS } from "../../../../utils/logger.js";
import { toPage, type Page } from "../../../../utils/pagination.js";
import type { EntitlementChecker } from "../../subscription/domain/entitlement-checker.js";
import type { IContentItemRepository } from "../domain/IContentItemRepository.js";
import { normalizeIngredients, normalizeSteps } from "../recipe-format.js";
import type {
  ContentEditorResponse,
  ContentItem,
  ContentItemResponse,
  ContentQuery,
  ContentSummaryResponse,
  CreateContentItemInput,
  RecipeAttributes,
  ReviewDecisionInput,
  ReviewStatus,
  UpdateContentItemInput
} from "../models/content-item.js";

/**
 * Content Factory workflow: draft -> in_review -> approved (expert sign-off) -> published.
 * Editing anything that has left draft sends it back to review, so unreviewed health content
 * can never stay live.
 */
export class ContentItemService {
  constructor(
    private contentItemRepository: IContentItemRepository,
    private entitlementChecker: EntitlementChecker
  ) {}

  async listPublished(query: Omit<ContentQuery, "statuses">): Promise<Page<ContentSummaryResponse>> {
    const { items, total } = await this.contentItemRepository.list({ ...query, statuses: ["published"] });
    return toPage(items, total, query, (item) => this.toSummary(item));
  }

  async getPublished(id: string, userId?: string): Promise<ContentItemResponse> {
    const item = await this.contentItemRepository.findById(id);
    if (!item || item.reviewStatus !== "published") throw new NotFoundError("Content");
    return this.toDetail(item, await this.isLocked(item, userId));
  }

  /** Published entities for app modules that map them into their own DTOs (e.g. BabyGrow activities). */
  async listPublishedItems(query: Omit<ContentQuery, "statuses">): Promise<{ items: ContentItem[]; total: number }> {
    return this.contentItemRepository.list({ ...query, statuses: ["published"] });
  }

  async distinctAttributeValues(contentType: ContentItem["contentType"], appCode: string, key: string): Promise<string[]> {
    return this.contentItemRepository.distinctAttributeValues(contentType, appCode, key);
  }

  /** Published items by id for other modules (recipes in meal plans, recipe nutrition in Foodvisor). */
  async findPublishedByIds(ids: string[]): Promise<ContentItem[]> {
    const items = await this.contentItemRepository.findByIds(ids);
    return items.filter((item) => item.reviewStatus === "published");
  }

  async listForEditor(query: ContentQuery): Promise<Page<ContentEditorResponse>> {
    const { items, total } = await this.contentItemRepository.list(query);
    return toPage(items, total, query, (item) => this.toEditor(item));
  }

  async getForEditor(id: string): Promise<ContentEditorResponse> {
    return this.toEditor(await this.require(id));
  }

  async create(editorId: string, input: CreateContentItemInput): Promise<ContentEditorResponse> {
    const item = await this.contentItemRepository.create(input, editorId);
    logger.successWithEmoji(EMOJIS.CREATE, "Content draft created", "CONTENT", { contentId: item.id, type: item.contentType });
    return this.toEditor(item);
  }

  async update(id: string, input: UpdateContentItemInput): Promise<ContentEditorResponse> {
    const current = await this.require(id);
    if (current.reviewStatus === "archived") throw new ConflictError("Archived content cannot be edited", "CONTENT_ARCHIVED");

    const needsReReview = current.reviewStatus !== "draft";
    const updated = await this.contentItemRepository.update(
      id,
      input,
      needsReReview ? { reviewStatus: "in_review", expertReviewed: false, publishedAt: null } : null
    );
    if (!updated) throw new NotFoundError("Content");
    return this.toEditor(updated);
  }

  async submit(id: string): Promise<ContentEditorResponse> {
    const item = await this.require(id);
    this.assertTransition(item.reviewStatus, ["draft"], "submit");
    this.assertReviewable(item);
    return this.toEditor(await this.applyReview(id, { reviewStatus: "in_review" }));
  }

  async review(id: string, reviewerId: string, decision: ReviewDecisionInput): Promise<ContentEditorResponse> {
    const item = await this.require(id);
    this.assertTransition(item.reviewStatus, ["in_review"], "review");
    const updated = await this.applyReview(id, {
      reviewStatus: decision.approve ? "approved" : "draft",
      expertReviewed: decision.approve,
      reviewNotes: decision.notes ?? null,
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    });
    logger.infoWithEmoji(EMOJIS.UPDATE, `Content ${decision.approve ? "approved" : "returned to draft"}`, "CONTENT", {
      contentId: id,
      reviewerId
    });
    return this.toEditor(updated);
  }

  async publish(id: string): Promise<ContentEditorResponse> {
    const item = await this.require(id);
    this.assertTransition(item.reviewStatus, ["approved"], "publish");
    return this.toEditor(await this.applyReview(id, { reviewStatus: "published", publishedAt: new Date() }));
  }

  async archive(id: string): Promise<ContentEditorResponse> {
    await this.require(id);
    return this.toEditor(await this.applyReview(id, { reviewStatus: "archived", publishedAt: null }));
  }

  private async require(id: string): Promise<ContentItem> {
    const item = await this.contentItemRepository.findById(id);
    if (!item) throw new NotFoundError("Content");
    return item;
  }

  private async applyReview(id: string, change: Parameters<IContentItemRepository["applyReview"]>[1]): Promise<ContentItem> {
    const updated = await this.contentItemRepository.applyReview(id, change);
    if (!updated) throw new NotFoundError("Content");
    return updated;
  }

  private assertTransition(current: ReviewStatus, allowed: ReviewStatus[], action: string): void {
    if (!allowed.includes(current)) {
      throw new ConflictError(`Cannot ${action} content in status "${current}"`, "INVALID_REVIEW_TRANSITION", {
        current,
        allowed
      });
    }
  }

  /** Category-specific completeness checks run before an expert sees the item. */
  private assertReviewable(item: ContentItem): void {
    if (item.contentType !== "recipe") return;
    const attributes = item.attributes as Partial<RecipeAttributes>;
    const ingredientsValid = normalizeIngredients(attributes.ingredients).length > 0;
    if (typeof attributes.servings !== "number" || attributes.servings <= 0 || !ingredientsValid) {
      throw new ValidationError("Recipes need attributes.servings (> 0) and attributes.ingredients[{ name }] before review");
    }
  }

  private async isLocked(item: ContentItem, userId?: string): Promise<boolean> {
    if (!item.isPremium) return false;
    if (!userId) return true;
    for (const appCode of item.appCodes as AppCode[]) {
      if (await this.entitlementChecker.hasAccess(userId, appCode)) return false;
    }
    return true;
  }

  private toSummary(item: ContentItem): ContentSummaryResponse {
    return {
      id: item.id,
      contentType: item.contentType,
      title: item.title,
      summary: item.summary,
      appCodes: item.appCodes,
      category: item.category,
      tags: item.tags,
      durationMinutes: item.durationMinutes,
      difficulty: item.difficulty,
      media: item.media,
      locale: item.locale,
      isPremium: item.isPremium,
      publishedAt: item.publishedAt
    };
  }

  private toDetail(item: ContentItem, locked: boolean): ContentItemResponse {
    return {
      ...this.toSummary(item),
      body: locked ? null : item.body,
      steps: locked ? [] : normalizeSteps(item.steps),
      attributes: locked ? {} : item.attributes,
      locked
    };
  }

  private toEditor(item: ContentItem): ContentEditorResponse {
    return {
      ...this.toDetail(item, false),
      reviewStatus: item.reviewStatus,
      expertReviewed: item.expertReviewed,
      reviewNotes: item.reviewNotes,
      reviewedAt: item.reviewedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}
