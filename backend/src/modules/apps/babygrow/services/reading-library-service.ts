import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { ContentItem, ContentType } from "../../../platform/content/models/content-item.js";
import type { EntitlementChecker } from "../../../platform/subscription/domain/entitlement-checker.js";
import type { LibraryCatalog } from "../domain/babygrow-ports.js";
import type { IBookmarkRepository } from "../domain/IBookmarkRepository.js";
import { BABY_AGE_GROUPS, type ArticleResponse, type BabyRecipeResponse, type StoryResponse } from "../models/library.js";
import { ageInMonths, type ChildService } from "./child-service.js";
import { toArticle, toRecipe, toStory } from "./library-mappers.js";

const APP = "babygrow";
const LIST_LIMIT = 300;

type ReadingType = Extract<ContentType, "recipe" | "article" | "story">;

export function ageGroupFor(months: number): string {
  return BABY_AGE_GROUPS.find((group) => months >= group.min && months <= group.max)?.group ?? BABY_AGE_GROUPS[BABY_AGE_GROUPS.length - 1].group;
}

/** Recipes, articles and bedtime stories for families, with favourites/bookmarks per caregiver. */
export class ReadingLibraryService {
  constructor(
    private catalog: LibraryCatalog,
    private bookmarks: IBookmarkRepository,
    private childService: ChildService,
    private entitlements: EntitlementChecker
  ) {}

  async recipes(userId: string, filters: { category?: string; target?: string }): Promise<BabyRecipeResponse[]> {
    const items = await this.listType("recipe", {
      category: filters.category,
      attributeEquals: filters.target ? { target: filters.target } : undefined
    });
    return this.mapRecipes(userId, items);
  }

  async recipesForChild(userId: string, childId: string): Promise<BabyRecipeResponse[]> {
    const child = await this.childService.requireAccess(userId, childId, "viewer");
    return this.recipesByAgeGroup(userId, ageGroupFor(ageInMonths(child.birthDate)));
  }

  async recipesByAgeGroup(userId: string, group: string, mealSlot?: string): Promise<BabyRecipeResponse[]> {
    if (!BABY_AGE_GROUPS.some((entry) => entry.group === group)) {
      throw new ValidationError(`Unknown age group; use one of ${BABY_AGE_GROUPS.map((entry) => entry.group).join(", ")}`);
    }
    const items = await this.listType("recipe", { attributeEquals: { ageGroup: group, ...(mealSlot ? { mealSlot } : {}) } });
    return this.mapRecipes(userId, items);
  }

  async recipe(userId: string, id: string): Promise<BabyRecipeResponse> {
    return (await this.mapRecipes(userId, [await this.require("recipe", id)]))[0];
  }

  async favoriteRecipes(userId: string): Promise<BabyRecipeResponse[]> {
    return this.mapRecipes(userId, await this.bookmarked(userId, "recipe"));
  }

  async articles(userId: string, filters: { category?: string; month?: number; q?: string }): Promise<ArticleResponse[]> {
    const items = await this.listType("article", { category: filters.category, ageMonths: filters.month, q: filters.q });
    return this.mapArticles(userId, items);
  }

  async article(userId: string, id: string): Promise<ArticleResponse> {
    return (await this.mapArticles(userId, [await this.require("article", id)]))[0];
  }

  async bookmarkedArticles(userId: string): Promise<ArticleResponse[]> {
    return this.mapArticles(userId, await this.bookmarked(userId, "article"));
  }

  async stories(userId: string, filters: { ageMonths?: number; search?: string }): Promise<StoryResponse[]> {
    const items = await this.listType("story", { ageMonths: filters.ageMonths, q: filters.search });
    return this.mapStories(userId, items);
  }

  async story(userId: string, id: string): Promise<StoryResponse> {
    return (await this.mapStories(userId, [await this.require("story", id)]))[0];
  }

  async bookmarkedStories(userId: string): Promise<StoryResponse[]> {
    return this.mapStories(userId, await this.bookmarked(userId, "story"));
  }

  /** Favourite a recipe or bookmark an article/story (idempotent). */
  async setBookmark(userId: string, type: ReadingType, id: string, saved: boolean): Promise<{ id: string; saved: boolean }> {
    if (saved) {
      await this.require(type, id);
      await this.bookmarks.add(userId, id);
    } else {
      await this.bookmarks.remove(userId, id);
    }
    return { id, saved };
  }

  private async listType(
    contentType: ReadingType,
    query: { category?: string; ageMonths?: number; q?: string; attributeEquals?: Record<string, string> }
  ): Promise<ContentItem[]> {
    const { items } = await this.catalog.listPublishedItems({
      appCode: APP,
      contentType,
      ...query,
      sort: contentType === "article" ? "recent" : "age",
      page: 1,
      limit: LIST_LIMIT,
      offset: 0
    });
    return items;
  }

  private async require(type: ReadingType, id: string): Promise<ContentItem> {
    const [item] = await this.catalog.findPublishedByIds([id]);
    if (!item || item.contentType !== type || !item.appCodes.includes(APP)) throw new NotFoundError(type[0].toUpperCase() + type.slice(1));
    return item;
  }

  private async bookmarked(userId: string, type: ReadingType): Promise<ContentItem[]> {
    const ids = await this.bookmarks.listIds(userId);
    const items = new Map((await this.catalog.findPublishedByIds(ids)).map((item) => [item.id, item]));
    return ids.map((id) => items.get(id)).filter((item): item is ContentItem => item !== undefined && item.contentType === type);
  }

  private async context(userId: string, items: ContentItem[]): Promise<{ unlocked: boolean; saved: Set<string> }> {
    const [unlocked, saved] = await Promise.all([
      items.some((item) => item.isPremium) ? this.entitlements.hasAccess(userId, APP) : Promise.resolve(true),
      this.bookmarks.listIds(userId)
    ]);
    return { unlocked, saved: new Set(saved) };
  }

  private async mapRecipes(userId: string, items: ContentItem[]): Promise<BabyRecipeResponse[]> {
    const { unlocked, saved } = await this.context(userId, items);
    return items.map((item) => toRecipe(item, item.isPremium && !unlocked, saved.has(item.id)));
  }

  private async mapArticles(userId: string, items: ContentItem[]): Promise<ArticleResponse[]> {
    const { unlocked, saved } = await this.context(userId, items);
    return items.map((item) => toArticle(item, item.isPremium && !unlocked, saved.has(item.id)));
  }

  private async mapStories(userId: string, items: ContentItem[]): Promise<StoryResponse[]> {
    const { unlocked, saved } = await this.context(userId, items);
    return items.map((item) => toStory(item, item.isPremium && !unlocked, saved.has(item.id)));
  }
}
