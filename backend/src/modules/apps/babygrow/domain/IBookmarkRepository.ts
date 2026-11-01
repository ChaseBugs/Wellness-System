export interface IBookmarkRepository {
  add(userId: string, contentId: string): Promise<void>;
  remove(userId: string, contentId: string): Promise<boolean>;
  /** Bookmarked content ids, newest first. */
  listIds(userId: string): Promise<string[]>;
}
