import type {
  ContentItem,
  ContentQuery,
  CreateContentItemInput,
  ReviewStatus,
  UpdateContentItemInput
} from "../models/content-item.js";

export interface ContentReviewChange {
  reviewStatus: ReviewStatus;
  expertReviewed?: boolean;
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  publishedAt?: Date | null;
}

export interface IContentItemRepository {
  list(query: ContentQuery): Promise<{ items: ContentItem[]; total: number }>;
  findById(id: string): Promise<ContentItem | null>;
  findByIds(ids: string[]): Promise<ContentItem[]>;
  create(input: CreateContentItemInput, createdBy: string): Promise<ContentItem>;
  update(id: string, input: UpdateContentItemInput, reviewReset: ContentReviewChange | null): Promise<ContentItem | null>;
  applyReview(id: string, change: ContentReviewChange): Promise<ContentItem | null>;
  /** Distinct non-empty values of one attributes key across published items of a type and app. */
  distinctAttributeValues(contentType: string, appCode: string, key: string): Promise<string[]>;
}
