import type { AppCode } from "../../../../config/app-catalog.js";
import type { PageQuery } from "../../../../utils/pagination.js";

export const CONTENT_TYPES = [
  "recipe",
  "exercise_guide",
  "yoga_pose",
  "article",
  "tutorial",
  "meditation_audio",
  "milestone_guide",
  "activity",
  "daily_update",
  "story",
  "guide"
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const REVIEW_STATUSES = ["draft", "in_review", "approved", "published", "archived"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface ContentStep {
  title?: string;
  text: string;
  durationSeconds?: number;
  mediaUrl?: string;
}

/** Category-specific shape stored in `attributes` for recipes; validated before review. */
export interface RecipeAttributes {
  servings: number;
  ingredients: Array<{ name: string; quantity?: number; unit?: string }>;
  nutritionPerServing?: { calories: number; proteinG?: number; carbsG?: number; fatG?: number };
  allergens?: string[];
}

export interface ContentItem {
  id: string;
  contentType: ContentType;
  title: string;
  summary: string | null;
  body: string | null;
  appCodes: AppCode[];
  category: string | null;
  tags: string[];
  durationMinutes: number | null;
  difficulty: Difficulty | null;
  steps: ContentStep[];
  media: Record<string, unknown>;
  attributes: Record<string, unknown>;
  locale: string;
  isPremium: boolean;
  reviewStatus: ReviewStatus;
  expertReviewed: boolean;
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  publishedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentItemInput {
  contentType: ContentType;
  title: string;
  summary?: string;
  body?: string;
  appCodes: AppCode[];
  category?: string;
  tags?: string[];
  durationMinutes?: number;
  difficulty?: Difficulty;
  steps?: ContentStep[];
  media?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  locale?: string;
  isPremium?: boolean;
}

export type UpdateContentItemInput = Partial<Omit<CreateContentItemInput, "contentType">>;

export interface ReviewDecisionInput {
  approve: boolean;
  notes?: string;
}

export interface ContentQuery extends PageQuery {
  appCode?: AppCode;
  contentType?: ContentType;
  category?: string;
  tag?: string;
  q?: string;
  difficulty?: Difficulty;
  maxMinutes?: number;
  excludeAllergens?: string[];
  statuses?: ReviewStatus[];
  /** Items whose attributes.ageMonthsMin..ageMonthsMax range contains this age (missing bounds are open). */
  ageMonths?: number;
  /** Exact matches on attributes keys (keys are chosen by code, values come from the request). */
  attributeEquals?: Record<string, string>;
  ids?: string[];
  sort?: "recent" | "age" | "title";
}

/** List/summary shape: body and steps are only returned by the detail endpoint. */
export interface ContentSummaryResponse {
  id: string;
  contentType: ContentType;
  title: string;
  summary: string | null;
  appCodes: AppCode[];
  category: string | null;
  tags: string[];
  durationMinutes: number | null;
  difficulty: Difficulty | null;
  media: Record<string, unknown>;
  locale: string;
  isPremium: boolean;
  publishedAt: Date | null;
}

export interface ContentItemResponse extends ContentSummaryResponse {
  body: string | null;
  steps: ContentStep[];
  attributes: Record<string, unknown>;
  /** True when the item is premium and the caller has no entitlement for any of its apps. */
  locked: boolean;
}

export interface ContentEditorResponse extends ContentItemResponse {
  reviewStatus: ReviewStatus;
  expertReviewed: boolean;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
