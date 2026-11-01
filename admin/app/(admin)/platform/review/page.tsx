"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { platformFetch } from "@/lib/api";
import { isAdmin } from "@/lib/auth";

type Tab = "content" | "exercises" | "routines";
type Page<T> = { items: T[]; total: number };

type ContentItem = {
  id: string; title: string; contentType: string; appCodes: string[]; reviewStatus: string; expertReviewed: boolean; updatedAt: string;
};
type RoutineItem = {
  id: string; name?: string; title?: string; appCodes?: string[]; appCode?: string; status: string; expertReviewed: boolean; updatedAt: string;
};

const CONTENT_STATUSES = ["in_review", "approved", "draft", "published"] as const;

/**
 * Expert review across every app. Content Factory: draft → submit → in_review → approve (admin) →
 * approved → publish. Routine Engine: draft → approve review (admin) → publish.
 */
function ReviewQueue() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "content");
  const [status, setStatus] = useState<string>("in_review");
  const [content, setContent] = useState<Page<ContentItem>>({ items: [], total: 0 });
  const [routine, setRoutine] = useState<Page<RoutineItem>>({ items: [], total: 0 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Bumped after an action to reload; `loadedKey` tells which request the table shows.
  const [version, setVersion] = useState(0);
  const [loadedKey, setLoadedKey] = useState("");
  const admin = isAdmin();
  const requestKey = `${tab}:${status}:${version}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    const done = () => { if (!cancelled) setLoadedKey(requestKey); };
    const request = tab === "content"
      ? platformFetch<Page<ContentItem>>(`/content/manage/items?status=${status}&limit=100`).then((page) => { if (!cancelled) setContent(page); })
      : platformFetch<Page<RoutineItem>>(`/routine/${tab}?status=draft&limit=100`).then((page) => { if (!cancelled) setRoutine(page); });
    request
      .then(() => { if (!cancelled) setError(""); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load"); })
      .finally(done);
    return () => { cancelled = true; };
  }, [tab, status, requestKey]);

  const load = useCallback(() => setVersion((value) => value + 1), []);

  async function act(path: string, body: unknown, message: string) {
    setError("");
    setNotice("");
    try {
      await platformFetch(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
      setNotice(message);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <section className="page">
      <PageHeader
        title="Review queue"
        subtitle="Expert sign-off before anything reaches users. Approving needs an admin; submitting and publishing need an editor."
      />
      <div className="tab-row">
        {(["content", "exercises", "routines"] as const).map((key) => (
          <button className={`filter-chip ${tab === key ? "active" : ""}`} key={key} onClick={() => setTab(key)} type="button">
            {key === "content" ? "Content Factory" : key === "exercises" ? "Exercises" : "Routines"}
          </button>
        ))}
      </div>

      <section className="panel">
        <div className="toolbar">
          {tab === "content" ? (
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {CONTENT_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          ) : (
            <span>Drafts (unpublished)</span>
          )}
          <span>{loading ? "Loading..." : `${tab === "content" ? content.total : routine.total} items`}</span>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {notice ? <p className="muted">{notice}</p> : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>{tab === "content" ? "Type" : "Kind"}</th>
                <th>Apps</th>
                <th>Status</th>
                <th>Expert reviewed</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tab === "content"
                ? content.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.contentType}</td>
                      <td>{item.appCodes.join(", ")}</td>
                      <td>{item.reviewStatus}</td>
                      <td>{item.expertReviewed ? "yes" : "no"}</td>
                      <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                      <td className="row-actions">
                        {item.reviewStatus === "draft" ? (
                          <button onClick={() => act(`/content/manage/items/${item.id}/submit`, undefined, "Submitted for review.")} type="button">Submit</button>
                        ) : null}
                        {item.reviewStatus === "in_review" && admin ? (
                          <>
                            <button className="primary" onClick={() => act(`/content/manage/items/${item.id}/review`, { approve: true }, "Approved.")} type="button">Approve</button>
                            <button className="danger" onClick={() => act(`/content/manage/items/${item.id}/review`, { approve: false }, "Sent back to draft.")} type="button">Reject</button>
                          </>
                        ) : null}
                        {item.reviewStatus === "approved" ? (
                          <button className="primary" onClick={() => act(`/content/manage/items/${item.id}/publish`, undefined, "Published.")} type="button">Publish</button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                : routine.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name ?? item.title}</td>
                      <td>{tab === "exercises" ? "exercise" : "routine"}</td>
                      <td>{item.appCodes ? item.appCodes.join(", ") : item.appCode}</td>
                      <td>{item.status}</td>
                      <td>{item.expertReviewed ? "yes" : "no"}</td>
                      <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                      <td className="row-actions">
                        {!item.expertReviewed && admin ? (
                          <button className="primary" onClick={() => act(`/routine/${tab}/${item.id}/review`, { approve: true }, "Review approved.")} type="button">Approve review</button>
                        ) : null}
                        {item.expertReviewed ? (
                          <button className="primary" onClick={() => act(`/routine/${tab}/${item.id}/publish`, undefined, "Published.")} type="button">Publish</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
              {!loading && (tab === "content" ? content.items : routine.items).length === 0 ? (
                <tr><td className="empty-row" colSpan={7}>Nothing waiting here.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <ReviewQueue />
    </Suspense>
  );
}
