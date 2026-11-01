"use client";

import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import BulkActionBar from "@/components/BulkActionBar";
import FilterBar, { type FilterValues } from "@/components/filters/FilterBar";
import { ADMIN_BASES, ApiError, assetUrl, bulkDelete, bulkVerify, platformFetch, ResourceColumn, ResourceField } from "@/lib/api";
import type { BulkAction, FilterDef } from "@/lib/foodvisor/resourceConfigs";

/** "Invalid fields: startsAt must be an ISO date, …" from the platform's validation details. */
function describeError(err: unknown, fallback: string) {
  if (!(err instanceof Error)) return fallback;
  const details = err instanceof ApiError && Array.isArray(err.details) ? (err.details as Array<{ message?: string; msg?: string; path?: string }>) : [];
  const messages = details.map((d) => d.message ?? (d.path ? `${d.path}: ${d.msg}` : d.msg)).filter(Boolean);
  return messages.length ? `${err.message}: ${messages.join(", ")}` : err.message;
}

/** An extra per-row button, e.g. "Publish" for Routine Engine content. Resolving reloads the list. */
export type RowAction = {
  label: string;
  show?: (item: Record<string, unknown>) => boolean;
  run: (item: Record<string, unknown>) => Promise<unknown>;
  tone?: "primary" | "danger";
};

type Props = {
  title: string;
  description: string;
  endpoint: string;
  columns: ResourceColumn[];
  fields: ResourceField[];
  searchPlaceholder: string;
  filters?: FilterDef[];
  bulkActions?: BulkAction[];
  sortable?: { value: string; label: string }[];
  /** Resource-kit root the endpoint is relative to (default: the Foodvisor admin). */
  apiBase?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  rowActions?: RowAction[];
};

type ApiList = {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
};

function getValue(item: Record<string, unknown>, key: string) {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) return (value as Record<string, unknown>)[part];
    return "";
  }, item);
}

function setNested(target: Record<string, unknown>, key: string, value: unknown) {
  const parts = key.split(".");
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  });
  cursor[parts[parts.length - 1]] = value;
}

function formatValue(value: unknown, column: ResourceColumn, onImageClick?: (src: string) => void) {
  if (column.kind === "boolean") {
    return value ? <span className="badge ok"><Check size={14} /> true</span> : <span className="badge"><X size={14} /> false</span>;
  }
  if (column.kind === "date" && value) return new Date(String(value)).toLocaleDateString();
  if (column.kind === "image") {
    if (!value) return <span className="no-image">No image</span>;
    const src = String(value);
    const resolvedSrc = assetUrl(src);
    return <button className="image-button" onClick={() => onImageClick?.(resolvedSrc)} type="button" aria-label="Open image preview"><img className="table-image" src={resolvedSrc} alt="" /></button>;
  }
  if (Array.isArray(value)) {
    const text = value.join(", "); return text.length > 48 ? `${text.slice(0, 48)}...` : text;
  }
  if (typeof value === "object" && value !== null) {
    const text = JSON.stringify(value); return text.length > 48 ? `${text.slice(0, 48)}...` : text;
  }
  const text = String(value ?? ""); return text.length > 64 ? `${text.slice(0, 64)}...` : text;
}

export function ResourceManager({
  title, description, endpoint, columns, fields, searchPlaceholder, filters = [], bulkActions = [], sortable = [],
  apiBase = ADMIN_BASES.foodvisor, canCreate = true, canEdit = true, canDelete = true, rowActions = []
}: Props) {
  const apiFetch = <T,>(path: string, init?: RequestInit) => platformFetch<T>(`${apiBase}${path}`, init);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sort, setSort] = useState("");
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ action: BulkAction } | null>(null);

  const blankForm = useMemo(() => fields.reduce<Record<string, unknown>>((acc, field) => {
    setNested(acc, field.name, field.type === "boolean" ? false : "");
    return acc;
  }, {}), [fields]);

  async function load(nextPage = page) {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: String(limit) });
      if (query) params.set("q", query);
      if (sort) params.set("sort", sort);
      Object.entries(filterValues).forEach(([k, v]) => { if (v) params.set(k, v); });
      const data = await apiFetch<ApiList>(`${endpoint}?${params.toString()}`);
      setItems(data.items); setTotal(data.total); setPage(data.page || nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(1); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [endpoint, limit, sort, JSON.stringify(filterValues)]);

  function toggleId(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }
  function toggleAllOnPage() {
    const pageIds = items.map((i) => String(i.id));
    const next = new Set(selected);
    const allSelected = pageIds.every((id) => next.has(id));
    if (allSelected) pageIds.forEach((id) => next.delete(id));
    else pageIds.forEach((id) => next.add(id));
    setSelected(next);
  }

  async function runBulk(action: BulkAction) {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    try {
      if (action === "delete") await bulkDelete(endpoint, ids, apiBase);
      else await bulkVerify(endpoint, ids, action === "verify", apiBase);
      setSelected(new Set()); setConfirmAction(null); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk action failed");
    }
  }

  /** On create, empty optional fields are left out so the database defaults apply; on edit they clear the value. */
  function normalizePayload(formData: FormData, creating: boolean) {
    const payload: Record<string, unknown> = {};
    fields.forEach((field) => {
      if (creating && !field.required && field.type !== "boolean" && !String(formData.get(field.name) ?? "").trim()) return;
      const raw = formData.get(field.name);
      let value: unknown = raw;
      // Empty optional numbers and selects mean "no value", not 0 or "".
      if (field.type === "number") value = raw === "" || raw === null ? null : Number(raw);
      if (field.type === "select" && raw === "") value = null;
      if (field.type === "boolean") value = raw === "true";
      if (field.type === "tags") value = String(raw ?? "").split(",").map((t) => t.trim()).filter(Boolean);
      if (field.type === "textarea") {
        const text = String(raw ?? "").trim();
        if (text.startsWith("[") || text.startsWith("{")) { try { value = JSON.parse(text); } catch { value = text; } }
      }
      if (field.type === "date") value = raw ? new Date(String(raw)).toISOString() : null;
      setNested(payload, field.name, value);
    });
    return payload;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = editing?.id;
    const payload = normalizePayload(new FormData(event.currentTarget), !id);
    try {
      await apiFetch(id ? `${endpoint}/${id}` : endpoint, { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    } catch (err) {
      setError(describeError(err, "Save failed"));
      setEditing(null);
      return;
    }
    setEditing(null); await load();
  }

  async function remove(id: unknown) {
    if (!window.confirm("Delete this record?")) return;
    try { await apiFetch(`${endpoint}/${id}`, { method: "DELETE" }); } catch (err) { setError(describeError(err, "Delete failed")); }
    await load();
  }

  async function runRowAction(action: RowAction, item: Record<string, unknown>) {
    setError("");
    try { await action.run(item); } catch (err) { setError(describeError(err, `${action.label} failed`)); }
    await load();
  }

  const formSource = editing ?? blankForm;
  const pages = Math.max(Math.ceil(total / limit), 1);
  const start = total ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);
  const pageIds = items.map((i) => String(i.id));
  const pageAllSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  return (
    <section className="page">
      <PageHeader
        title={title} subtitle={description}
        action={canCreate ? <button className="primary" onClick={() => setEditing(blankForm)} type="button"><Plus size={16} /> Add</button> : undefined}
      />

      <section className="panel">
        <div className="toolbar">
          <label className="search-field">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(1)} placeholder={searchPlaceholder} />
          </label>
          <button onClick={() => load(1)} type="button">Search</button>
          {sortable.length ? (
            <select className="sort-select" value={sort} onChange={(e) => { setPage(1); setSort(e.target.value); }}>
              <option value="">Default order</option>
              {sortable.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          ) : null}
          <select className="limit-select" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
            <option value={25}>25</option><option value={50}>50</option><option value={100}>100</option><option value={250}>250</option><option value={500}>500</option>
          </select>
          <span>{loading ? "Loading..." : `${start}-${end} of ${total}`}</span>
        </div>

        <FilterBar filters={filters} values={filterValues} onChange={(v) => { setPage(1); setFilterValues(v); }} />

        {error && <p className="error">{error}</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {bulkActions.length ? (
                  <th className="select-col"><input type="checkbox" checked={pageAllSelected} onChange={toggleAllOnPage} aria-label="Select all on this page" /></th>
                ) : null}
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th className={rowActions.length ? "actions-wide" : undefined}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const id = String(item.id);
                return (
                  <tr key={id} className={selected.has(id) ? "row-selected" : ""}>
                    {bulkActions.length ? (
                      <td className="select-col"><input type="checkbox" checked={selected.has(id)} onChange={() => toggleId(id)} aria-label="Select row" /></td>
                    ) : null}
                    {columns.map((c) => <td key={c.key}>{formatValue(getValue(item, c.key), c, setPreviewImage)}</td>)}
                    <td className="row-actions">
                      {rowActions.filter((action) => !action.show || action.show(item)).map((action) => (
                        <button key={action.label} className={action.tone ?? ""} onClick={() => runRowAction(action, item)} type="button">{action.label}</button>
                      ))}
                      {canEdit ? <button onClick={() => setEditing(item)} type="button" aria-label="Edit record"><Pencil size={15} /> Edit</button> : null}
                      {canDelete ? <button onClick={() => remove(item.id)} type="button" aria-label="Delete"><Trash2 size={15} /></button> : null}
                    </td>
                  </tr>
                );
              })}
              {!loading && items.length === 0 ? (
                <tr><td className="empty-row" colSpan={(bulkActions.length ? 1 : 0) + columns.length + 1}>No records match the current filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button disabled={page <= 1 || loading} onClick={() => load(1)} type="button">First</button>
          <button disabled={page <= 1 || loading} onClick={() => load(page - 1)} type="button">Previous</button>
          <span>Page {page} / {pages}</span>
          <button disabled={page >= pages || loading} onClick={() => load(page + 1)} type="button">Next</button>
          <button disabled={page >= pages || loading} onClick={() => load(pages)} type="button">Last</button>
        </div>
      </section>

      <BulkActionBar
        selectedCount={selected.size} actions={bulkActions}
        onAction={(a) => { if (a === "delete" || a === "unverify") setConfirmAction({ action: a }); else runBulk(a); }}
        onClear={() => setSelected(new Set())}
      />

      {previewImage && (
        <button className="image-preview-backdrop" onClick={() => setPreviewImage("")} type="button" aria-label="Close image preview">
          <img className="image-preview" src={previewImage} alt="" />
        </button>
      )}

      {confirmAction && (
        <Modal onClose={() => setConfirmAction(null)}>
          <div className="confirm">
            <h2>Confirm {confirmAction.action}</h2>
            <p>{confirmAction.action === "delete"
              ? `Delete ${selected.size} record${selected.size === 1 ? "" : "s"}? This cannot be undone.`
              : `Mark ${selected.size} record${selected.size === 1 ? "" : "s"} as unverified?`}</p>
            <div className="editor-actions">
              <button type="button" onClick={() => setConfirmAction(null)}><X size={16} /> Cancel</button>
              <button className={confirmAction.action === "delete" ? "danger" : "primary"} type="button" onClick={() => runBulk(confirmAction.action)}>
                <Check size={16} /> Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <form className="editor" onSubmit={submit}>
            <div className="modal-head">
              <h2>{editing.id ? `Edit ${title}` : `Add ${title}`}</h2>
              <button type="button" onClick={() => setEditing(null)}><X size={16} /> Close</button>
            </div>
            <div className="editor-grid">
              {fields.map((field) => {
                const value = getValue(formSource, field.name);
                const isSourceField = field.name === "chineseName" || field.name === "cautions" || field.name === "sourceNote";
                const isLongField = field.type === "textarea" || field.name === "benefits" || field.name === "dietUseNote";
                return (
                  <label key={field.name} className={`${isSourceField ? "source-field" : ""} ${isLongField ? "wide-field" : ""}`.trim()}>
                    <span>{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea name={field.name} defaultValue={typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value ?? "")} required={field.required} />
                    ) : field.type === "select" ? (
                      <select name={field.name} defaultValue={String(value ?? "")} required={field.required}>
                        <option value="">Select</option>
                        {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === "boolean" ? (
                      <select name={field.name} defaultValue={String(Boolean(value))}>
                        <option value="false">false</option><option value="true">true</option>
                      </select>
                    ) : (
                      <input name={field.name} type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} step={field.type === "number" ? "any" : undefined}
                             defaultValue={Array.isArray(value) ? value.join(", ") : String(value ?? "")} required={field.required} />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="editor-actions">
              <button type="button" onClick={() => setEditing(null)}><X size={16} /> Cancel</button>
              <button className="primary" type="submit"><Check size={16} /> Save</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
