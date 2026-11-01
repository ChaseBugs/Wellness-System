import type { UserRole } from "../../types/express.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../utils/errors.js";
import type { IAuditLogRepository } from "./audit-log-repository.js";
import {
  JsonPatch,
  operationsOf,
  type FieldSpec,
  type ResourceDefinition,
  type ResourceListQuery,
  type ResourceRecord
} from "./resource-definition.js";
import type { ResourceRepository, ResourceStats } from "./resource-repository.js";

export interface ResourceActor {
  id: string;
  role: UserRole;
  requestId: string;
}

export interface ResourcePage {
  items: ResourceRecord[];
  total: number;
  page: number;
  limit: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IMPLICIT_FIELDS = new Set(["id", "_id", "createdAt", "updatedAt", "__v"]);
const MAX_BULK = 500;

type FieldError = { field: string; message: string };

/** Converts one incoming value to the column type; returns an error message instead of throwing. */
function coerce(spec: FieldSpec, raw: unknown): { value?: unknown; error?: string } {
  if (raw === null) return spec.required ? { error: "is required" } : { value: null };
  switch (spec.type) {
    case "text": {
      if (typeof raw !== "string" && typeof raw !== "number") return { error: "must be a string" };
      const value = String(raw);
      if (spec.enum && !spec.enum.includes(value)) return { error: `must be one of: ${spec.enum.join(", ")}` };
      return { value };
    }
    case "number":
    case "integer": {
      const value = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
      if (typeof value !== "number" || !Number.isFinite(value)) return { error: "must be a number" };
      if (spec.type === "integer" && !Number.isInteger(value)) return { error: "must be an integer" };
      return { value };
    }
    case "boolean":
      if (typeof raw === "boolean") return { value: raw };
      if (raw === "true" || raw === "false") return { value: raw === "true" };
      return { error: "must be a boolean" };
    case "date":
    case "timestamp": {
      if (typeof raw !== "string" || Number.isNaN(Date.parse(raw))) return { error: "must be an ISO date" };
      return { value: raw };
    }
    case "uuid":
      return typeof raw === "string" && UUID.test(raw) ? { value: raw } : { error: "must be a UUID" };
    case "textArray": {
      // Admin forms send tag inputs either as arrays or as comma-separated text.
      const list = typeof raw === "string" ? raw.split(",") : raw;
      if (!Array.isArray(list) || list.some((item) => typeof item !== "string" && typeof item !== "number")) {
        return { error: "must be an array of strings" };
      }
      return { value: list.map((item) => String(item).trim()).filter(Boolean) };
    }
    case "json":
      if (typeof raw !== "object") return { error: "must be an object or array" };
      return { value: JSON.stringify(raw) };
  }
}

function coerceFilterValue(spec: FieldSpec | undefined, raw: string): unknown {
  if (!spec) return raw;
  if (spec.type === "number" || spec.type === "integer") {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new ValidationError(`Filter value "${raw}" is not a number`);
    return value;
  }
  if (spec.type === "boolean") return raw === "true";
  return raw;
}

/**
 * CRUD rules shared by every kit resource: whitelist-only writes, typed coercion, required fields on
 * create, review flag forced false on create and changeable only by admins, audit trail on writes.
 */
export class ResourceService {
  constructor(
    private repository: ResourceRepository,
    private auditLog: IAuditLogRepository
  ) {}

  parseListQuery(definition: ResourceDefinition, query: Record<string, unknown>): ResourceListQuery {
    const maxLimit = definition.maxLimit ?? 500;
    const page = Math.max(1, Number.parseInt(String(query.page ?? 1), 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(String(query.limit ?? 20), 10) || 20));
    const q = typeof query.q === "string" ? query.q.trim() : "";

    const sortRaw = typeof query.sort === "string" && query.sort.trim() ? query.sort.trim() : definition.defaultSort;
    const descending = sortRaw.startsWith("-");
    const sortField = descending ? sortRaw.slice(1) : sortRaw;
    const sortable = new Set([...definition.sortFields, "createdAt", "updatedAt"]);
    const sort = sortable.has(sortField)
      ? { field: sortField, direction: descending ? ("DESC" as const) : ("ASC" as const) }
      : { field: "createdAt", direction: "DESC" as const };

    const allowed = new Set(definition.filterFields);
    const filters: ResourceListQuery["filters"] = [];
    for (const [key, rawValue] of Object.entries(query)) {
      if (rawValue === undefined || rawValue === "" || ["q", "page", "limit", "sort"].includes(key)) continue;
      const raw = String(rawValue);
      const range = key.endsWith("_gte") ? "gte" : key.endsWith("_lte") ? "lte" : null;
      const field = range ? key.slice(0, -4) : key;
      if (!allowed.has(field)) continue;
      const spec = definition.fields[field];
      if (range) filters.push({ field, op: range, value: coerceFilterValue(spec, raw) });
      else if (raw.includes(",")) {
        filters.push({ field, op: "in", value: raw.split(",").map((value) => coerceFilterValue(spec, value.trim())).filter((value) => value !== "") });
      } else filters.push({ field, op: "eq", value: coerceFilterValue(spec, raw) });
    }

    return { q: q || undefined, page, limit, offset: (page - 1) * limit, sort, filters };
  }

  async list(definition: ResourceDefinition, query: ResourceListQuery): Promise<ResourcePage> {
    const { items, total } = await this.repository.list(definition, query);
    return { items, total, page: query.page, limit: query.limit };
  }

  async get(definition: ResourceDefinition, id: string): Promise<ResourceRecord> {
    this.assertUuid(id);
    const record = await this.repository.findById(definition, id);
    if (!record) throw new NotFoundError(definition.name);
    return record;
  }

  async create(definition: ResourceDefinition, body: unknown, actor: ResourceActor): Promise<ResourceRecord> {
    if (!operationsOf(definition).create) throw new ForbiddenError(`${definition.name} cannot be created from the admin`);
    const columns = this.toColumns(definition, body, "create", actor);
    if (definition.reviewField) {
      const reviewColumn = definition.fields[definition.reviewField].column;
      // Same rule as Foodvisor: anything created from the admin starts unverified.
      const index = columns.findIndex(([column]) => column === reviewColumn);
      if (index >= 0) columns.splice(index, 1);
      columns.push([reviewColumn, false]);
    }
    const id = await this.repository.insert(definition, columns);
    await this.audit(definition, "create", [id], actor);
    return this.get(definition, id);
  }

  async update(definition: ResourceDefinition, id: string, body: unknown, actor: ResourceActor): Promise<ResourceRecord> {
    if (!operationsOf(definition).update) throw new ForbiddenError(`${definition.name} cannot be edited from the admin`);
    this.assertUuid(id);
    const columns = this.toColumns(definition, body, "update", actor);
    if (!(await this.repository.update(definition, id, columns))) throw new NotFoundError(definition.name);
    await this.audit(definition, "update", [id], actor, { fields: columns.map(([column]) => column) });
    return this.get(definition, id);
  }

  async delete(definition: ResourceDefinition, id: string, actor: ResourceActor): Promise<void> {
    if (!operationsOf(definition).delete) throw new ForbiddenError(`${definition.name} cannot be deleted from the admin`);
    this.assertUuid(id);
    if (!(await this.repository.delete(definition, id))) throw new NotFoundError(definition.name);
    await this.audit(definition, "delete", [id], actor);
  }

  async bulkVerify(definition: ResourceDefinition, ids: unknown, value: unknown, actor: ResourceActor): Promise<{ matched: number; modified: number }> {
    if (!definition.reviewField) throw new NotFoundError(`${definition.name} bulk verification`);
    if (actor.role !== "admin") throw new ForbiddenError("Only admins can change review status");
    const list = this.assertIds(ids);
    if (typeof value !== "boolean") throw new ValidationError("doctorVerified must be a boolean");
    if (list.length === 0) return { matched: 0, modified: 0 };
    const result = await this.repository.bulkSetReview(definition, list, value);
    await this.audit(definition, "bulk-verify", list, actor, { value });
    return result;
  }

  async bulkDelete(definition: ResourceDefinition, ids: unknown, actor: ResourceActor): Promise<{ deleted: number }> {
    if (!operationsOf(definition).delete) throw new ForbiddenError(`${definition.name} cannot be deleted from the admin`);
    const list = this.assertIds(ids);
    if (list.length === 0) return { deleted: 0 };
    const deleted = await this.repository.bulkDelete(definition, list);
    await this.audit(definition, "bulk-delete", list, actor);
    return { deleted };
  }

  async stats(definition: ResourceDefinition, recentLimit = 2, days = 30): Promise<ResourceStats> {
    return this.repository.stats(definition, recentLimit, days);
  }

  async recordCustomAction(definition: ResourceDefinition, ids: string[], actor: ResourceActor, details: Record<string, unknown>): Promise<void> {
    await this.audit(definition, "custom", ids, actor, details);
  }

  private toColumns(definition: ResourceDefinition, body: unknown, mode: "create" | "update", actor: ResourceActor): Array<[string, unknown]> {
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ValidationError("Request body must be an object");
    const input = body as Record<string, unknown>;
    const errors: FieldError[] = [];
    const columns: Array<[string, unknown]> = [];
    const jsonPatches = new Map<string, Record<string, unknown>>();

    for (const [field, raw] of Object.entries(input)) {
      if (IMPLICIT_FIELDS.has(field) || raw === undefined) continue;
      const spec = definition.fields[field];
      // Unknown and read-only fields are ignored, like Mongoose strict mode in the legacy admin.
      if (!spec || spec.readOnly) continue;
      if (field === definition.reviewField && mode === "update" && actor.role !== "admin") {
        throw new ForbiddenError("Only admins can change review status");
      }
      const result = coerce(spec, raw);
      if (result.error) errors.push({ field, message: `${field} ${result.error}` });
      else if (spec.jsonKey) {
        // The patch is serialized as a whole, so json values go in as objects, not pre-encoded strings.
        const value = spec.type === "json" && raw !== null ? raw : result.value;
        jsonPatches.set(spec.column, { ...jsonPatches.get(spec.column), [spec.jsonKey]: value });
      }
      else columns.push([spec.column, result.value]);
    }
    for (const [column, values] of jsonPatches) columns.push([column, new JsonPatch(values)]);

    if (mode === "create") {
      for (const [field, spec] of Object.entries(definition.fields)) {
        if (spec.required && !spec.readOnly && (input[field] === undefined || input[field] === null || input[field] === "")) {
          errors.push({ field, message: `${field} is required` });
        }
      }
    }
    if (errors.length > 0) throw new ValidationError("Invalid fields", errors);
    return columns;
  }

  private assertUuid(id: string): void {
    if (!UUID.test(id)) throw new ValidationError("Invalid id");
  }

  private assertIds(ids: unknown): string[] {
    if (!Array.isArray(ids) || ids.length > MAX_BULK || ids.some((id) => typeof id !== "string" || !UUID.test(id))) {
      throw new ValidationError(`ids must be an array of at most ${MAX_BULK} UUIDs`);
    }
    return ids as string[];
  }

  private async audit(
    definition: ResourceDefinition,
    action: Parameters<IAuditLogRepository["record"]>[0]["action"],
    ids: string[],
    actor: ResourceActor,
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.auditLog.record({ resource: definition.name, action, recordIds: ids, actorId: actor.id, requestId: actor.requestId, details });
  }
}
