import type { ContentItem, ContentQuery } from "../../../platform/content/models/content-item.js";

/** Resolves a caregiver invite by email; implemented by the identity module's UserRepository. */
export interface UserLookup {
  findByEmail(email: string): Promise<{ id: string; email: string } | null>;
}

/** The signed-in account's identity fields (implemented by the identity module's UserRepository). */
export interface AccountStore {
  findById(id: string): Promise<{ id: string; email: string; displayName: string | null; locale: string } | null>;
  update(id: string, input: { displayName?: string | null; locale?: string }): Promise<unknown>;
}

/** Published Content Factory items (implemented by ContentItemService). */
export interface LibraryCatalog {
  listPublishedItems(query: Omit<ContentQuery, "statuses">): Promise<{ items: ContentItem[]; total: number }>;
  findPublishedByIds(ids: string[]): Promise<ContentItem[]>;
  distinctAttributeValues(contentType: ContentItem["contentType"], appCode: string, key: string): Promise<string[]>;
}
