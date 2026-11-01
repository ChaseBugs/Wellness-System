import type {
  ContentItem,
  ContentItemResponse,
  ContentQuery,
  ContentSummaryResponse
} from "../../../platform/content/models/content-item.js";
import type { Page } from "../../../../utils/pagination.js";

/** The Content Factory, which owns recipe content (implemented by ContentItemService). */
export interface RecipeCatalog {
  listPublished(query: Omit<ContentQuery, "statuses">): Promise<Page<ContentSummaryResponse>>;
  getPublished(id: string, userId?: string): Promise<ContentItemResponse>;
  findPublishedByIds(ids: string[]): Promise<ContentItem[]>;
}
