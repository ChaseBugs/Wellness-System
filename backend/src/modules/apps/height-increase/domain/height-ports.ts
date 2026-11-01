import type { ContentItem, ContentQuery } from "../../../platform/content/models/content-item.js";
import type { CreateGoalInput, DailyLog, Goal, UpdateGoalInput, UpsertDailyLogInput } from "../models/daily-log.js";
import type { Banner, CatalogExercise, CatalogPlan } from "../models/height-catalog.js";
import type { HeightProfile, UpdateHeightProfileInput } from "../models/height-profile.js";

export interface IHeightProfileRepository {
  /** Returns the profile, creating an empty one on first use. */
  ensure(userId: string): Promise<HeightProfile>;
  update(userId: string, input: Omit<UpdateHeightProfileInput, "name">): Promise<HeightProfile>;
}

export interface IDailyLogRepository {
  upsert(userId: string, input: UpsertDailyLogInput): Promise<DailyLog>;
  listRecent(userId: string, limit: number): Promise<DailyLog[]>;
}

export interface IGoalRepository {
  list(userId: string, status?: Goal["status"]): Promise<Goal[]>;
  create(userId: string, input: CreateGoalInput): Promise<Goal>;
  update(id: string, userId: string, input: UpdateGoalInput): Promise<Goal | null>;
}

export interface IHeightCatalogRepository {
  activeBanners(placement?: string): Promise<Banner[]>;
  publishedExercises(filters: { category?: string; level?: string }): Promise<CatalogExercise[]>;
  publishedPlans(filters: { type?: string; level?: string; limit: number }): Promise<CatalogPlan[]>;
}

/** The signed-in account's identity fields (implemented by the identity module's UserRepository). */
export interface AccountStore {
  findById(id: string): Promise<{ id: string; email: string; displayName: string | null } | null>;
  update(id: string, input: { displayName?: string | null }): Promise<unknown>;
}

/** Latest height reading (implemented by HeightMeasurementRepository). */
export interface MeasurementStore {
  listForUser(userId: string): Promise<Array<{ measuredOn: string; heightCm: number; weightKg: number | null }>>;
  upsert(userId: string, input: { measuredOn: string; heightCm: number; weightKg?: number | null }): Promise<unknown>;
}

/** Published Content Factory items (implemented by ContentItemService). */
export interface ArticleCatalog {
  listPublishedItems(query: Omit<ContentQuery, "statuses">): Promise<{ items: ContentItem[]; total: number }>;
}
