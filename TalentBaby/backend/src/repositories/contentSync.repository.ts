import { database } from '../config/database';

export interface SyncTableConfig {
  name: string;
  publicName?: string;
}

export interface SyncTableStatus {
  name: string;
  version: string | null;
  rowCount: number;
}

export interface SyncUpsertRow {
  id: number;
  updatedAt: string;
  payload: Record<string, unknown>;
}

export interface SyncDeleteRow {
  id: number;
  deletedAt: string;
  payload?: Record<string, unknown>;
}

export interface SyncTableDelta {
  name: string;
  upserts: SyncUpsertRow[];
  deletes: SyncDeleteRow[];
}

interface TableColumns {
  hasUpdatedAt: boolean;
  hasCreatedAt: boolean;
}

const CONTENT_TABLES: SyncTableConfig[] = [
  { name: 'activities' },
  { name: 'articles' },
  { name: 'bedtime_stories', publicName: 'stories' },
  { name: 'daily_updates_content', publicName: 'daily_updates' },
  { name: 'milestone_definitions' },
  { name: 'nutrition_categories' },
  { name: 'nutrition_foods' },
  { name: 'recipes' },
  { name: 'talent_categories' },
];

export class ContentSyncRepository {
  async getConfiguredTables(): Promise<SyncTableConfig[]> {
    const existing: SyncTableConfig[] = [];
    for (const table of CONTENT_TABLES) {
      if (await this.tableExists(table.name)) {
        existing.push(table);
      }
    }
    return existing;
  }

  async getTableStatuses(): Promise<SyncTableStatus[]> {
    const tables = await this.getConfiguredTables();
    const statuses: SyncTableStatus[] = [];

    for (const table of tables) {
      const columns = await this.getColumns(table.name);
      const versionExpression = this.versionExpression(columns);
      const result = await database.query(
        `SELECT COUNT(*)::int AS row_count, MAX(${versionExpression}) AS version FROM ${this.ident(table.name)}`
      );
      const row = result.rows[0] as { row_count: number; version: Date | string | null };
      statuses.push({
        name: table.publicName ?? table.name,
        version: this.toIso(row.version),
        rowCount: row.row_count,
      });
    }

    return statuses;
  }

  async getTableDeltas(since: Date | null, requestedNames?: string[]): Promise<SyncTableDelta[]> {
    const tables = await this.getConfiguredTables();
    const requested = new Set((requestedNames ?? []).map((name) => name.trim()).filter(Boolean));
    const filtered = requested.size === 0
      ? tables
      : tables.filter((table) => requested.has(table.name) || requested.has(table.publicName ?? table.name));

    const deltas: SyncTableDelta[] = [];
    for (const table of filtered) {
      const columns = await this.getColumns(table.name);
      const versionExpression = this.versionExpression(columns);
      const params: unknown[] = [];
      let where = '';

      if (since) {
        params.push(since);
        where = `WHERE ${versionExpression} > $1`;
      }

      const upsertsResult = await database.query(
        `SELECT id, ${versionExpression} AS updated_at, to_jsonb(t) AS payload
         FROM ${this.ident(table.name)} t
         ${where}
         ORDER BY ${versionExpression} ASC, id ASC`,
        params
      );

      const deletesResult = since
        ? await database.query(
            `SELECT row_id, deleted_at, payload
             FROM content_delete_log
             WHERE table_name = $1 AND deleted_at > $2
             ORDER BY deleted_at ASC, row_id ASC`,
            [table.name, since]
          ).catch(() => ({ rows: [] }))
        : { rows: [] };

      deltas.push({
        name: table.publicName ?? table.name,
        upserts: upsertsResult.rows.map((row: any) => ({
          id: Number(row.id),
          updatedAt: this.toIso(row.updated_at) ?? new Date(0).toISOString(),
          payload: row.payload,
        })),
        deletes: deletesResult.rows.map((row: any) => ({
          id: Number(row.row_id),
          deletedAt: this.toIso(row.deleted_at) ?? new Date(0).toISOString(),
          payload: row.payload,
        })),
      });
    }

    return deltas;
  }

  private async tableExists(tableName: string): Promise<boolean> {
    const result = await database.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = $1
       ) AS exists`,
      [tableName]
    );
    return Boolean(result.rows[0]?.exists);
  }

  private async getColumns(tableName: string): Promise<TableColumns> {
    const result = await database.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      [tableName]
    );
    const columns = new Set(result.rows.map((row: { column_name: string }) => row.column_name));
    return {
      hasUpdatedAt: columns.has('updated_at'),
      hasCreatedAt: columns.has('created_at'),
    };
  }

  private versionExpression(columns: TableColumns): string {
    if (columns.hasUpdatedAt && columns.hasCreatedAt) {
      return 'COALESCE(updated_at, created_at)';
    }
    if (columns.hasUpdatedAt) {
      return 'updated_at';
    }
    if (columns.hasCreatedAt) {
      return 'created_at';
    }
    return `TIMESTAMP '1970-01-01 00:00:00'`;
  }

  private ident(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private toIso(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
