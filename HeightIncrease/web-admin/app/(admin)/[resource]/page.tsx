"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ResourceForm from "@/components/ResourceForm";
import { apiFetch, ApiList } from "@/lib/api";
import { formatValue } from "@/lib/format";
import { resources } from "@/lib/resources";

export default function ResourcePage() {
  const params = useParams<{ resource: string }>();
  const resourceKey = params.resource;
  const config = resources[resourceKey];
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const title = useMemo(() => config?.title || "Not Found", [config]);

  async function load(q = query) {
    if (!config) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<ApiList>(`/admin/${config.endpoint}?limit=50${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey]);

  async function save(payload: Record<string, unknown>) {
    const id = editing?._id;
    await apiFetch(`/admin/${config.endpoint}${id ? `/${id}` : ""}`, {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    });
    setEditing(undefined);
    await load();
  }

  async function remove(id: unknown) {
    if (!window.confirm("Delete this record?")) return;
    await apiFetch(`/admin/${config.endpoint}/${id}`, { method: "DELETE" });
    await load();
  }

  if (!config) {
    return (
        <div className="error">Unknown admin resource.</div>
    );
  }

  return (
      <section className="page">
        <PageHeader
          title={title}
          subtitle="Search, inspect details, create records, and update existing app data."
          action={
            <button className="btn primary" onClick={() => setEditing(null)} type="button">
              Add
            </button>
          }
        />

        {error ? <div className="error">{error}</div> : null}

        <section className="panel">
          <div className="toolbar">
            <input
              className="search"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") load(query);
              }}
              placeholder={`Search ${title.toLowerCase()}`}
              value={query}
            />
            <button className="btn" onClick={() => load(query)} type="button">
              Search
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={config.columns.length + 1}>Loading...</td>
                  </tr>
                ) : null}
                {!loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={config.columns.length + 1}>No records found.</td>
                  </tr>
                ) : null}
                {items.map((item) => (
                  <tr key={String(item._id)}>
                    {config.columns.map((column) => (
                      <td key={column}>
                        {typeof item[column] === "boolean" ? (
                          <span className={`badge ${item[column] ? "" : "off"}`}>{formatValue(item[column])}</span>
                        ) : (
                          formatValue(item[column])
                        )}
                      </td>
                    ))}
                    <td className="actions">
                      <Link className="btn small" href={`/${resourceKey}/${item._id}`}>
                        Detail
                      </Link>
                      <button className="btn small" onClick={() => setEditing(item)} type="button">
                        Edit
                      </button>
                      <button className="btn small danger" onClick={() => remove(item._id)} type="button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {editing !== undefined ? (
          <ResourceForm config={config} item={editing} onCancel={() => setEditing(undefined)} onSubmit={save} />
        ) : null}
      </section>
  );
}
