import type pg from "pg";
import { JsonPatch, type FieldSpec, type ResourceDefinition, type ResourceListQuery, type ResourceRecord } from "./resource-definition.js";

export interface ResourceStats {
  total: number;
  unverified: number;
  recent: Array<{ id: string; label: string; createdAt: Date }>;
  createdPerDay: Array<{ date: string; count: number }>;
}

/** Literal for code-defined constants only (scope values from definitions, never request input). */
const literal = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** SQL that reads a field for filtering, sorting and search (jsonKey fields are cast to their type). */
function expressionOf(spec: FieldSpec): string {
  if (!spec.jsonKey) return spec.column;
  const text = `(${spec.column}->>${literal(spec.jsonKey)})`;
  if (spec.type === "number" || spec.type === "integer") return `${text}::numeric`;
  if (spec.type === "boolean") return `${text}::boolean`;
  if (spec.type === "timestamp" || spec.type === "date") return `${text}::timestamptz`;
  if (spec.type === "textArray" || spec.type === "json") return `(${spec.column}->${literal(spec.jsonKey)})`;
  return text;
}

/** Bind placeholder for a column value; JsonPatch values travel as one jsonb parameter. */
const placeholderFor = (value: unknown, index: number) => (value instanceof JsonPatch ? `$${index}::jsonb` : `$${index}`);
const paramFor = (value: unknown) => (value instanceof JsonPatch ? JSON.stringify(value.values) : value);

/**
 * Generic parameterized SQL for a ResourceDefinition. Identifiers (table, view, columns) and scope
 * constants come only from the code-defined definition; every request value travels as a bind parameter.
 */
export class ResourceRepository {
  constructor(private pool: pg.Pool) {}

  async list(definition: ResourceDefinition, query: ResourceListQuery): Promise<{ items: ResourceRecord[]; total: number }> {
    const values: unknown[] = [];
    const conditions: string[] = this.scopeConditions(definition);
    const bind = (value: unknown) => {
      values.push(value);
      return `$${values.length}`;
    };

    if (query.q) {
      const pattern = bind(`%${query.q}%`);
      const clauses = definition.searchFields.map((field) => {
        const spec = definition.fields[field];
        return spec.type === "textArray" && !spec.jsonKey
          ? `array_to_string(${spec.column}, ' ') ILIKE ${pattern}`
          : `${expressionOf(spec)}::text ILIKE ${pattern}`;
      });
      if (clauses.length > 0) conditions.push(`(${clauses.join(" OR ")})`);
    }

    for (const filter of query.filters) {
      const column = this.columnOf(definition, filter.field);
      const spec = definition.fields[filter.field];
      if (spec?.type === "textArray" && !spec.jsonKey) {
        conditions.push(filter.op === "in" ? `${column} && ${bind(filter.value)}::text[]` : `${bind(filter.value)} = ANY(${column})`);
      } else if (filter.op === "in") {
        conditions.push(`${column} = ANY(${bind(filter.value)})`);
      } else if (filter.op === "gte") {
        conditions.push(`${column} >= ${bind(filter.value)}`);
      } else if (filter.op === "lte") {
        conditions.push(`${column} <= ${bind(filter.value)}`);
      } else {
        conditions.push(`${column} = ${bind(filter.value)}`);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderColumn = this.columnOf(definition, query.sort.field);
    const limit = bind(query.limit);
    const offset = bind(query.offset);
    const result = await this.pool.query(
      `SELECT ${this.selectList(definition)}, COUNT(*) OVER() AS "__total"
       FROM ${this.readSource(definition)} ${where}
       ORDER BY ${orderColumn} ${query.sort.direction} NULLS LAST, id
       LIMIT ${limit} OFFSET ${offset}`,
      values
    );
    const total = result.rows.length > 0 ? Number(result.rows[0].__total) : 0;
    return { items: result.rows.map(({ __total: _total, ...row }) => row as ResourceRecord), total };
  }

  async findById(definition: ResourceDefinition, id: string): Promise<ResourceRecord | null> {
    const result = await this.pool.query(
      `SELECT ${this.selectList(definition)} FROM ${this.readSource(definition)} WHERE id = $1${this.andScope(definition)}`,
      [id]
    );
    return (result.rows[0] as ResourceRecord | undefined) ?? null;
  }

  /** `columns` are already-validated column -> value pairs produced by the service from the definition. */
  async insert(definition: ResourceDefinition, columns: Array<[string, unknown]>): Promise<string> {
    const all = [...columns, ...Object.entries(definition.createDefaults ?? {})];
    const names = all.map(([column]) => column).join(", ");
    const placeholders = all.map(([, value], index) => placeholderFor(value, index + 1)).join(", ");
    const result = await this.pool.query<{ id: string }>(
      all.length > 0
        ? `INSERT INTO ${definition.table} (${names}) VALUES (${placeholders}) RETURNING id`
        : `INSERT INTO ${definition.table} DEFAULT VALUES RETURNING id`,
      all.map(([, value]) => paramFor(value))
    );
    return result.rows[0].id;
  }

  async update(definition: ResourceDefinition, id: string, columns: Array<[string, unknown]>): Promise<boolean> {
    if (columns.length === 0) {
      const exists = await this.pool.query(`SELECT 1 FROM ${definition.table} WHERE id = $1${this.andScope(definition)}`, [id]);
      return (exists.rowCount ?? 0) > 0;
    }
    const set = [
      // JsonPatch merges into the existing object, keeping keys the request did not send.
      ...columns.map(([column, value], index) =>
        value instanceof JsonPatch ? `${column} = coalesce(${column}, '{}'::jsonb) || $${index + 1}::jsonb` : `${column} = $${index + 1}`
      ),
      ...(definition.updateSideEffects ?? []),
      "updated_at = now()"
    ].join(", ");
    const result = await this.pool.query(
      `UPDATE ${definition.table} SET ${set} WHERE id = $${columns.length + 1}${this.andScope(definition)}`,
      [...columns.map(([, value]) => paramFor(value)), id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async delete(definition: ResourceDefinition, id: string): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM ${definition.table} WHERE id = $1${this.andScope(definition)}`, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async bulkSetReview(definition: ResourceDefinition, ids: string[], value: boolean): Promise<{ matched: number; modified: number }> {
    const column = definition.fields[definition.reviewField as string].column;
    const matched = await this.pool.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM ${definition.table} WHERE id = ANY($1::uuid[])${this.andScope(definition)}`,
      [ids]
    );
    const result = await this.pool.query(
      `UPDATE ${definition.table} SET ${column} = $2, updated_at = now()
       WHERE id = ANY($1::uuid[]) AND ${column} IS DISTINCT FROM $2${this.andScope(definition)}`,
      [ids, value]
    );
    return { matched: matched.rows[0].count, modified: result.rowCount ?? 0 };
  }

  async bulkDelete(definition: ResourceDefinition, ids: string[]): Promise<number> {
    const result = await this.pool.query(`DELETE FROM ${definition.table} WHERE id = ANY($1::uuid[])${this.andScope(definition)}`, [ids]);
    return result.rowCount ?? 0;
  }

  async stats(definition: ResourceDefinition, recentLimit: number, days: number): Promise<ResourceStats> {
    const source = this.readSource(definition);
    const scope = this.scopeConditions(definition);
    const where = (extra?: string) => {
      const all = extra ? [...scope, extra] : scope;
      return all.length ? `WHERE ${all.join(" AND ")}` : "";
    };
    const reviewColumn = definition.reviewField ? definition.fields[definition.reviewField].column : null;
    const labelColumn = this.columnOf(definition, definition.labelField);
    const [counts, recent, perDay] = await Promise.all([
      this.pool.query<{ total: number; unverified: number }>(
        `SELECT count(*)::int AS total, ${reviewColumn ? `count(*) FILTER (WHERE NOT ${reviewColumn})::int` : "0"} AS unverified
         FROM ${source} ${where()}`
      ),
      this.pool.query<{ id: string; label: string | null; created_at: Date }>(
        `SELECT id, ${labelColumn}::text AS label, created_at FROM ${source} ${where()} ORDER BY created_at DESC LIMIT $1`,
        [recentLimit]
      ),
      this.pool.query<{ date: string; count: number }>(
        `SELECT to_char(created_at::date, 'YYYY-MM-DD') AS date, count(*)::int AS count FROM ${source}
         ${where("created_at >= current_date - make_interval(days => $1 - 1)")} GROUP BY 1`,
        [days]
      )
    ]);
    return {
      total: counts.rows[0].total,
      unverified: counts.rows[0].unverified,
      recent: recent.rows.map((row) => ({ id: row.id, label: row.label ?? "(no label)", createdAt: row.created_at })),
      createdPerDay: perDay.rows
    };
  }

  private readSource(definition: ResourceDefinition): string {
    return definition.view ?? definition.table;
  }

  private scopeConditions(definition: ResourceDefinition): string[] {
    return (definition.scope ?? []).map((rule) =>
      rule.contains !== undefined ? `${literal(rule.contains)} = ANY(${rule.column})` : `${rule.column} = ${literal(rule.equals ?? "")}`
    );
  }

  private andScope(definition: ResourceDefinition): string {
    const conditions = this.scopeConditions(definition);
    return conditions.length ? ` AND ${conditions.join(" AND ")}` : "";
  }

  private columnOf(definition: ResourceDefinition, field: string): string {
    if (field === "createdAt") return "created_at";
    if (field === "updatedAt") return "updated_at";
    return expressionOf(definition.fields[field]);
  }

  /** Aliases every column to its exact API name, so responses need no further mapping. */
  private selectList(definition: ResourceDefinition): string {
    const fields = Object.entries(definition.fields).map(([field, spec]) =>
      spec.jsonKey ? `${spec.column}->${literal(spec.jsonKey)} AS "${field}"` : `${spec.column} AS "${field}"`
    );
    return ["id", ...fields, `created_at AS "createdAt"`, `updated_at AS "updatedAt"`].join(", ");
  }
}
