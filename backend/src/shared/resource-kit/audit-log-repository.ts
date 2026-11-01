import type pg from "pg";

export type AuditAction = "create" | "update" | "delete" | "bulk-verify" | "bulk-delete" | "custom";

export interface AuditEntry {
  resource: string;
  action: AuditAction;
  recordIds: string[];
  actorId: string | null;
  requestId: string | null;
  details?: Record<string, unknown>;
}

export interface IAuditLogRepository {
  record(entry: AuditEntry): Promise<void>;
}

export class AuditLogRepository implements IAuditLogRepository {
  constructor(private pool: pg.Pool) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.pool.query(
      `INSERT INTO admin.audit_logs (resource, action, record_ids, actor_id, request_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [entry.resource, entry.action, entry.recordIds.slice(0, 500), entry.actorId, entry.requestId, JSON.stringify(entry.details ?? {})]
    );
  }
}
