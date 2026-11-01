import type pg from "pg";
import { buildInsert, buildUpdate, camelizeRow, camelizeRows, splitTotal, type ColumnMap } from "../../../../utils/sql.js";
import type { ContentReviewChange, IContentItemRepository } from "../domain/IContentItemRepository.js";
import type { ContentItem, ContentQuery, CreateContentItemInput, UpdateContentItemInput } from "../models/content-item.js";

const CONTENT_COLUMNS: ColumnMap<CreateContentItemInput> = {
  contentType: "content_type",
  title: "title",
  summary: "summary",
  body: "body",
  appCodes: "app_codes",
  category: "category",
  tags: "tags",
  durationMinutes: "duration_minutes",
  difficulty: "difficulty",
  steps: { column: "steps", json: true },
  media: { column: "media", json: true },
  attributes: { column: "attributes", json: true },
  locale: "locale",
  isPremium: "is_premium"
};

const REVIEW_COLUMNS: ColumnMap<ContentReviewChange> = {
  reviewStatus: "review_status",
  expertReviewed: "expert_reviewed",
  reviewNotes: "review_notes",
  reviewedBy: "reviewed_by",
  reviewedAt: "reviewed_at",
  publishedAt: "published_at"
};

// `search` is a generated tsvector used only for filtering; never returned to callers.
const SELECT_COLUMNS = `id, content_type, title, summary, body, app_codes, category, tags, duration_minutes, difficulty,
  steps, media, attributes, locale, is_premium, review_status, expert_reviewed, review_notes, reviewed_by,
  reviewed_at, published_at, created_by, created_at, updated_at`;

const ORDER_BY: Record<NonNullable<ContentQuery["sort"]>, string> = {
  recent: "coalesce(published_at, updated_at) DESC, id",
  age: "coalesce((attributes->>'ageMonthsMin')::numeric, 0), category, coalesce((attributes->>'doneCount')::numeric, 0) DESC, title, id",
  title: "title, id"
};

export class ContentItemRepository implements IContentItemRepository {
  constructor(private pool: pg.Pool) {}

  async list(query: ContentQuery): Promise<{ items: ContentItem[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    const add = (sql: (placeholder: string) => string, value: unknown) => {
      values.push(value);
      conditions.push(sql(`$${values.length}`));
    };

    if (query.statuses?.length) add((p) => `review_status = ANY(${p}::text[])`, query.statuses);
    if (query.appCode) add((p) => `${p} = ANY(app_codes)`, query.appCode);
    if (query.contentType) add((p) => `content_type = ${p}`, query.contentType);
    if (query.category) add((p) => `category = ${p}`, query.category);
    if (query.tag) add((p) => `${p} = ANY(tags)`, query.tag);
    if (query.difficulty) add((p) => `difficulty = ${p}`, query.difficulty);
    if (query.maxMinutes !== undefined) add((p) => `duration_minutes <= ${p}`, query.maxMinutes);
    if (query.q) add((p) => `search @@ plainto_tsquery('simple', ${p})`, query.q);
    if (query.ageMonths !== undefined) {
      add((p) => `coalesce((attributes->>'ageMonthsMin')::numeric, 0) <= ${p}`, query.ageMonths);
      add((p) => `coalesce((attributes->>'ageMonthsMax')::numeric, 1000) >= ${p}`, query.ageMonths);
    }
    for (const [key, value] of Object.entries(query.attributeEquals ?? {})) {
      values.push(key);
      const keyParam = `$${values.length}`;
      add((p) => `attributes->>${keyParam}::text = ${p}::text`, value);
    }
    if (query.ids?.length) add((p) => `id = ANY(${p}::uuid[])`, query.ids);
    if (query.excludeAllergens?.length) {
      add((p) => `NOT (coalesce(attributes->'allergens', '[]'::jsonb) ?| ${p}::text[])`, query.excludeAllergens);
    }

    values.push(query.limit, query.offset);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.pool.query(
      `SELECT ${SELECT_COLUMNS}, COUNT(*) OVER() AS total_count FROM content.items ${where}
       ORDER BY ${ORDER_BY[query.sort ?? "recent"]}
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return splitTotal<ContentItem>(result.rows);
  }

  async findById(id: string): Promise<ContentItem | null> {
    const result = await this.pool.query(`SELECT ${SELECT_COLUMNS} FROM content.items WHERE id = $1`, [id]);
    return result.rows[0] ? camelizeRow<ContentItem>(result.rows[0]) : null;
  }

  async findByIds(ids: string[]): Promise<ContentItem[]> {
    if (ids.length === 0) return [];
    const result = await this.pool.query(`SELECT ${SELECT_COLUMNS} FROM content.items WHERE id = ANY($1::uuid[])`, [ids]);
    return camelizeRows<ContentItem>(result.rows);
  }

  async create(input: CreateContentItemInput, createdBy: string): Promise<ContentItem> {
    // Review state is forced server-side: new content is always an unreviewed draft.
    const { text, values } = buildInsert("content.items", input, CONTENT_COLUMNS, {
      created_by: createdBy,
      review_status: "draft",
      expert_reviewed: false
    }, SELECT_COLUMNS);
    const result = await this.pool.query(text, values);
    return camelizeRow<ContentItem>(result.rows[0]);
  }

  async update(id: string, input: UpdateContentItemInput, reviewReset: ContentReviewChange | null): Promise<ContentItem | null> {
    const fixed: Record<string, unknown> = {};
    if (reviewReset) {
      for (const [field, column] of Object.entries(REVIEW_COLUMNS) as Array<[keyof ContentReviewChange, string]>) {
        if (reviewReset[field] !== undefined) fixed[column] = reviewReset[field];
      }
    }
    const query = buildUpdate("content.items", input, CONTENT_COLUMNS, { id }, fixed, SELECT_COLUMNS);
    if (!query) return this.findById(id);
    const result = await this.pool.query(query.text, query.values);
    return result.rows[0] ? camelizeRow<ContentItem>(result.rows[0]) : null;
  }

  async distinctAttributeValues(contentType: string, appCode: string, key: string): Promise<string[]> {
    const result = await this.pool.query<{ value: string }>(
      `SELECT DISTINCT attributes->>$3 AS value FROM content.items
       WHERE content_type = $1 AND $2 = ANY(app_codes) AND review_status = 'published'
         AND coalesce(attributes->>$3, '') <> ''
       ORDER BY 1`,
      [contentType, appCode, key]
    );
    return result.rows.map((row) => row.value);
  }

  async applyReview(id: string, change: ContentReviewChange): Promise<ContentItem | null> {
    const query = buildUpdate("content.items", change, REVIEW_COLUMNS, { id }, {}, SELECT_COLUMNS);
    if (!query) return this.findById(id);
    const result = await this.pool.query(query.text, query.values);
    return result.rows[0] ? camelizeRow<ContentItem>(result.rows[0]) : null;
  }
}
