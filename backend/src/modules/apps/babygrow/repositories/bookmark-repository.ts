import type pg from "pg";
import type { IBookmarkRepository } from "../domain/IBookmarkRepository.js";

export class BookmarkRepository implements IBookmarkRepository {
  constructor(private pool: pg.Pool) {}

  async add(userId: string, contentId: string): Promise<void> {
    await this.pool.query(
      "INSERT INTO babygrow.bookmarks (user_id, content_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, contentId]
    );
  }

  async remove(userId: string, contentId: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM babygrow.bookmarks WHERE user_id = $1 AND content_id = $2", [userId, contentId]);
    return (result.rowCount ?? 0) > 0;
  }

  async listIds(userId: string): Promise<string[]> {
    const result = await this.pool.query<{ content_id: string }>(
      "SELECT content_id FROM babygrow.bookmarks WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return result.rows.map((row) => row.content_id);
  }
}
