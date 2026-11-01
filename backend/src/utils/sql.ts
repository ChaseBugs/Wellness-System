import type pg from "pg";

export type Row = Record<string, unknown>;
export type Queryable = Pick<pg.Pool, "query"> | pg.PoolClient;

/**
 * Whitelist that maps camelCase input fields to SQL columns. Column names only ever come
 * from these maps (never from request input), which keeps the dynamic SQL below injection-safe.
 * Use `{ column, json: true }` for jsonb columns: node-postgres would otherwise send JS arrays
 * as Postgres arrays instead of JSON.
 */
export type ColumnMap<T> = Partial<Record<Extract<keyof T, string>, string | { column: string; json: true }>>;

function toCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_match, char: string) => char.toUpperCase());
}

export function camelizeRow<T>(row: Row): T {
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) out[toCamel(key)] = value;
  return out as T;
}

export function camelizeRows<T>(rows: Row[]): T[] {
  return rows.map((row) => camelizeRow<T>(row));
}

function collect<T extends object>(input: T, columns: ColumnMap<T>): Array<[string, unknown]> {
  const pairs: Array<[string, unknown]> = [];
  for (const [field, spec] of Object.entries(columns) as Array<[string, string | { column: string; json: true }]>) {
    const value = (input as Row)[field];
    if (value === undefined) continue;
    if (typeof spec === "string") pairs.push([spec, value]);
    else pairs.push([spec.column, value === null ? null : JSON.stringify(value)]);
  }
  return pairs;
}

/** `fixed` holds server-controlled snake_case columns (owner ids, statuses) that are not user input. */
export function buildInsert<T extends object>(
  table: string,
  input: T,
  columns: ColumnMap<T>,
  fixed: Row = {},
  returning = "*"
): { text: string; values: unknown[] } {
  const pairs = [...collect(input, columns), ...Object.entries(fixed)];
  const names = pairs.map(([column]) => column).join(", ");
  const placeholders = pairs.map((_pair, index) => `$${index + 1}`).join(", ");
  return {
    text: `INSERT INTO ${table} (${names}) VALUES (${placeholders}) RETURNING ${returning}`,
    values: pairs.map(([, value]) => value)
  };
}

/** Returns null when the input has no updatable fields so callers can short-circuit to a read. */
export function buildUpdate<T extends object>(
  table: string,
  input: T,
  columns: ColumnMap<T>,
  where: Row,
  fixed: Row = {},
  returning = "*"
): { text: string; values: unknown[] } | null {
  const pairs = [...collect(input, columns), ...Object.entries(fixed)];
  if (pairs.length === 0) return null;
  const set = pairs.map(([column], index) => `${column} = $${index + 1}`);
  const whereEntries = Object.entries(where);
  const conditions = whereEntries.map(([column], index) => `${column} = $${pairs.length + index + 1}`);
  return {
    text: `UPDATE ${table} SET ${set.join(", ")}, updated_at = now() WHERE ${conditions.join(" AND ")} RETURNING ${returning}`,
    values: [...pairs.map(([, value]) => value), ...whereEntries.map(([, value]) => value)]
  };
}

export async function withTransaction<T>(pool: pg.Pool, work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** Strips the `total_count` window column that list queries add with `COUNT(*) OVER()`. */
export function splitTotal<T>(rows: Row[]): { items: T[]; total: number } {
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const items = rows.map(({ total_count: _total, ...rest }) => camelizeRow<T>(rest));
  return { items, total };
}
