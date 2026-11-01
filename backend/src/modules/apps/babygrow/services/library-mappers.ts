import type { ContentItem } from "../../../platform/content/models/content-item.js";
import type {
  ActivityResponse,
  ArticleResponse,
  BabyRecipeResponse,
  DailyUpdateResponse,
  RecipeIngredient,
  StoryResponse
} from "../models/library.js";

/** Pure mappers from Content Factory items to the flat shapes the TalentBaby app renders. */
const str = (value: unknown): string | null => (typeof value === "string" && value.length > 0 ? value : null);
const num = (value: unknown): number | null => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
};
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0) : [];

export function toActivity(item: ContentItem, liveCompletions: number, locked: boolean): ActivityResponse {
  const a = item.attributes;
  return {
    id: item.id,
    title: item.title,
    description: item.summary,
    category: item.category,
    subCategory: str(a.subCategory),
    monthMin: num(a.ageMonthsMin),
    monthMax: num(a.ageMonthsMax),
    durationMinutes: item.durationMinutes,
    difficultyLevel: str(a.difficultyLevel),
    imageUrl: str(item.media.imageUrl),
    videoUrl: locked ? null : str(item.media.videoUrl),
    materialsNeeded: strings(a.materialsNeeded),
    instructions: locked ? null : item.body,
    benefits: strings(a.benefits),
    frequency: str(a.frequency),
    doneCount: (num(a.doneCount) ?? 0) + liveCompletions,
    isPremium: item.isPremium,
    locked,
    expertReviewed: item.expertReviewed
  };
}

export function toDailyUpdate(item: ContentItem): DailyUpdateResponse {
  return {
    id: item.id,
    ageInMonths: num(item.attributes.ageMonthsMin),
    contentType: item.category,
    title: item.title,
    content: item.body,
    imageUrl: str(item.media.imageUrl),
    videoUrl: str(item.media.videoUrl),
    createdAt: item.createdAt
  };
}

export function toRecipe(item: ContentItem, locked: boolean, isFavorite: boolean): BabyRecipeResponse {
  const a = item.attributes;
  const nutritionInfo = a.nutritionInfo && typeof a.nutritionInfo === "object" ? (a.nutritionInfo as Record<string, unknown>) : {};
  const ingredients = Array.isArray(a.ingredients) ? (a.ingredients as Array<RecipeIngredient | string>) : [];
  return {
    id: item.id,
    title: item.title,
    description: item.summary,
    category: item.category,
    recipeType: str(a.recipeType) ?? item.category,
    mealSlot: str(a.mealSlot),
    target: str(a.target),
    ageGroup: str(a.ageGroup),
    prepTimeMinutes: num(a.prepTimeMinutes),
    cookingTimeMinutes: num(a.cookingTimeMinutes),
    servings: num(a.servings),
    calories: num(a.calories) ?? num(nutritionInfo.calories),
    ingredients: locked ? [] : ingredients,
    instructions: locked ? [] : item.steps.map((step) => (typeof step === "string" ? step : step.text)),
    nutritionInfo,
    imageUrl: str(item.media.imageUrl),
    isPremium: item.isPremium,
    locked,
    isFavorite,
    expertReviewed: item.expertReviewed
  };
}

export function toArticle(item: ContentItem, locked: boolean, isBookmarked: boolean): ArticleResponse {
  const a = item.attributes;
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    content: locked ? null : item.body,
    category: item.category,
    imageUrl: str(item.media.imageUrl),
    author: str(a.author),
    doctorName: str(a.doctorName),
    doctorCredentials: str(a.doctorCredentials),
    isPremium: item.isPremium,
    locked,
    isBookmarked,
    expertReviewed: item.expertReviewed,
    createdAt: item.publishedAt ?? item.createdAt
  };
}

export function toStory(item: ContentItem, locked: boolean, isBookmarked: boolean): StoryResponse {
  const a = item.attributes;
  const min = num(a.ageMonthsMin);
  const max = num(a.ageMonthsMax);
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    content: locked ? null : item.body,
    category: item.category,
    imageUrl: str(item.media.imageUrl),
    audioUrl: locked ? null : str(item.media.audioUrl),
    author: str(a.author),
    narrator: str(a.narrator),
    ageGroup: min !== null && max !== null ? `${min}-${max}` : null,
    durationMinutes: item.durationMinutes,
    isPremium: item.isPremium,
    locked,
    isBookmarked,
    expertReviewed: item.expertReviewed
  };
}
