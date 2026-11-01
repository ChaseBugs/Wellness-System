/**
 * Resource kit: declarative CRUD for admin-managed tables (reference data, catalogs, content lists).
 * It reproduces the contract of Foodvisor's generic `createCrudRouter` on PostgreSQL so the existing
 * admin panels keep working: `?q=&page=&limit=&sort=-field`, `field=value`, `field=a,b`,
 * `field_gte=`/`field_lte=`, `PATCH /bulk-verify`, `DELETE /bulk`.
 *
 * User-facing features do NOT use the kit; they keep the layered route/controller/service/repository
 * files. The kit is for tables whose admin behaviour is plain CRUD plus a doctor-review flag.
 */
export type FieldType =
  | "text"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "timestamp"
  | "uuid"
  | "textArray"
  | "json";

export interface FieldSpec {
  /** Column in the table (and in `view`, when one is used for reads). Never derived from input. */
  column: string;
  type: FieldType;
  required?: boolean;
  enum?: readonly string[];
  /** Returned by reads but never written (computed or joined columns). */
  readOnly?: boolean;
  /**
   * The value is one key of the jsonb `column` (e.g. `imageUrl` inside `media`). Writes merge only the
   * keys sent, so other keys survive. Don't also expose `column` itself as a field of the same resource.
   */
  jsonKey?: string;
}

/** Keys to merge into a jsonb column (built by the service from `jsonKey` fields). */
export class JsonPatch {
  constructor(public readonly values: Record<string, unknown>) {}
}

export interface ResourceOperations {
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface ResourceDefinition {
  /** URL segment and audit-log resource name, e.g. "foods". */
  name: string;
  /** Table that receives writes, e.g. "foodvisor.foods". */
  table: string;
  /** Optional view used for reads (joins such as the owning account's email). */
  view?: string;
  /** API field name -> column spec. `id`, `createdAt` and `updatedAt` are implicit. */
  fields: Record<string, FieldSpec>;
  searchFields: string[];
  filterFields: string[];
  sortFields: string[];
  /** e.g. "-createdAt" or "sortOrder". */
  defaultSort: string;
  /** Field holding the doctor/expert review flag; forced false on create, only admins may change it. */
  reviewField?: string;
  /** Field shown in dashboards ("recent additions"). */
  labelField: string;
  operations?: Partial<ResourceOperations>;
  /** Hard cap for `limit` (Foodvisor's admin allows large exports). */
  maxLimit?: number;
  /** Restricts every read and write to a slice of a shared table (e.g. recipes inside content.items). */
  scope?: Array<{ column: string; equals?: string; contains?: string }>;
  /** Server-controlled column values added on create (column -> value). */
  createDefaults?: Record<string, unknown>;
  /** Code-defined SQL SET fragments applied with every update (e.g. sending content back to review). */
  updateSideEffects?: string[];
}

export interface ResourceListQuery {
  q?: string;
  page: number;
  limit: number;
  offset: number;
  sort: { field: string; direction: "ASC" | "DESC" };
  /** Parsed `field`, `field_gte`, `field_lte` filters keyed by API field. */
  filters: Array<{ field: string; op: "eq" | "in" | "gte" | "lte"; value: unknown }>;
}

export type ResourceRecord = Record<string, unknown> & { id: string };

export function defineResource(definition: ResourceDefinition): ResourceDefinition {
  for (const field of [...definition.searchFields, ...definition.filterFields, ...definition.sortFields, definition.labelField]) {
    if (field !== "createdAt" && field !== "updatedAt" && !definition.fields[field]) {
      throw new Error(`Resource ${definition.name}: unknown field "${field}" in search/filter/sort/label lists`);
    }
  }
  if (definition.reviewField && definition.fields[definition.reviewField]?.type !== "boolean") {
    throw new Error(`Resource ${definition.name}: reviewField must be a boolean field`);
  }
  return definition;
}

export function operationsOf(definition: ResourceDefinition): ResourceOperations {
  return { create: true, update: true, delete: true, ...definition.operations };
}

/** Shared column specs for the source-tracing + review pattern used by every Foodvisor reference table. */
export const sourceTraceFields: Record<string, FieldSpec> = {
  dataSource: { column: "data_source", type: "text" },
  sourceNote: { column: "source_note", type: "text" },
  sourceRefs: { column: "source_refs", type: "textArray" }
};

export const doctorVerifiedField: Record<string, FieldSpec> = {
  doctorVerified: { column: "doctor_verified", type: "boolean" }
};
