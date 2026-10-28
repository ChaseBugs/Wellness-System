"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ResourceForm from "@/components/ResourceForm";
import { apiFetch } from "@/lib/api";
import { formatValue, labelize } from "@/lib/format";
import { resources } from "@/lib/resources";

type DetailResponse = {
  item: Record<string, unknown>;
};

export default function ResourceDetailPage() {
  const params = useParams<{ resource: string; id: string }>();
  const config = resources[params.resource];
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!config) return;
    try {
      const data = await apiFetch<DetailResponse>(`/admin/${config.endpoint}/${params.id}`);
      setItem(data.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load detail");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.resource, params.id]);

  async function save(payload: Record<string, unknown>) {
    await apiFetch(`/admin/${config.endpoint}/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    setEditing(false);
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
          title={`${config.title} Detail`}
          subtitle={params.id}
          action={
            <>
            <Link className="btn" href={`/${params.resource}`}>
              Back
            </Link>
            <button className="btn primary" disabled={!item} onClick={() => setEditing(true)} type="button">
              Edit
            </button>
            </>
          }
        />

        {error ? <div className="error">{error}</div> : null}
        {!item && !error ? <div className="muted">Loading detail...</div> : null}

        {item ? (
          <section className="panel">
            <div className="panel-head">
              <h2>{formatValue(item.title || item.name || item.email || item.key || item._id)}</h2>
            </div>
            <div className="detail-grid">
              {Object.entries(item).map(([key, value]) => (
                <Fragment key={key}>
                  <div className="detail-key">
                    {labelize(key)}
                  </div>
                  <div className="detail-value">
                    {value && typeof value === "object" ? (
                      <pre>{JSON.stringify(value, null, 2)}</pre>
                    ) : typeof value === "boolean" ? (
                      <span className={`badge ${value ? "" : "off"}`}>{formatValue(value)}</span>
                    ) : (
                      formatValue(value)
                    )}
                  </div>
                </Fragment>
              ))}
            </div>
          </section>
        ) : null}

        {editing && item ? <ResourceForm config={config} item={item} onCancel={() => setEditing(false)} onSubmit={save} /> : null}
      </section>
  );
}
