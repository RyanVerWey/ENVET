"use client";

import { useCallback, useEffect, useState } from "react";

type Content = {
  slug: string;
  name?: string;
  title?: string;
  summary: string;
  details: string;
  state: "draft" | "published" | "archived";
  version: number;
  updated_at: string;
};
type Inquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service_interest: string;
  note: string;
  status: "new" | "contacted" | "booked" | "closed";
  created_at: string;
};
type StaffComment = {
  id: string;
  article_slug: string;
  author_label: string;
  body: string;
  state: "published" | "hidden";
  created_at: string;
};
type Dashboard = {
  page: number;
  more_inquiries: boolean;
  more_comments: boolean;
  more_reports: boolean;
  inquiries: Inquiry[];
  pages: { day: string; path: string; views: number }[];
  comments: StaffComment[];
  reports: {
    comment_id: string;
    reason: string;
    created_at: string;
    article_slug: string;
    body: string;
    state: "published" | "hidden";
  }[];
};
type Workspace = {
  horses: Content[];
  services: Content[];
  dashboard: Dashboard;
  moreHorses: boolean;
  moreServices: boolean;
};
type Draft = {
  kind: "horse" | "service";
  slug: string;
  title: string;
  summary: string;
  details: string;
  state: "draft" | "published" | "archived";
  expectedVersion: number | null;
};
const emptyDraft: Draft = {
  kind: "horse",
  slug: "",
  title: "",
  summary: "",
  details: "",
  state: "draft",
  expectedVersion: null,
};

export function TeamWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [page, setPage] = useState(0);

  const reload = useCallback(async () => {
    setWorkspace(null);
    setLoading(true);
    setMessage("");
    let status: number | null = null;
    try {
      const response = await fetch(`/api/team?page=${page}`, {
        cache: "no-store",
      });
      status = response.status;
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "The workspace could not load.");
      setWorkspace(result);
      return { ok: true as const };
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The workspace could not load.",
      );
      return { ok: false as const, status };
    } finally {
      setLoading(false);
    }
  }, [page]);
  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  async function change(url: string, method: string, payload: unknown) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "The change did not save.");
        return false;
      }
      const refresh = await reload();
      if (refresh.ok) setMessage("Saved.");
      else if (refresh.status === 403)
        setMessage(
          "Change confirmed, but team access is now denied. Current records are hidden. Ask an operator to verify access, then retry refresh. Do not repeat the change.",
        );
      else
        setMessage(
          "Change confirmed, but the latest records could not load. Current records are hidden. Retry refresh; do not repeat the change.",
        );
      return true;
    } catch {
      setWorkspace(null);
      setLoading(false);
      setMessage(
        "Could not confirm whether the change saved. Current records are hidden. Retry refresh before making another change.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  function edit(kind: "horse" | "service", item: Content) {
    setDraft({
      kind,
      slug: item.slug,
      title: item.name ?? item.title ?? "",
      summary: item.summary,
      details: item.details,
      state: item.state,
      expectedVersion: item.version,
    });
    document
      .getElementById("team-content-form")
      ?.scrollIntoView({ block: "start" });
    document.getElementById("content-title")?.focus();
  }

  return (
    <div className="wrap team-workspace">
      <nav className="team-nav" aria-label="Workspace sections">
        <a href="#team-inquiries">Inquiries</a>
        <a href="#team-content">Horses & services</a>
        <a href="#team-comments">Comments</a>
        <a href="#team-analytics">Page counts</a>
      </nav>
      {loading && <p role="status">Loading workspace…</p>}
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      {!loading && !workspace && (
        <button
          type="button"
          className="quiet-button"
          onClick={() => void reload()}
        >
          Retry refresh
        </button>
      )}
      {workspace && (
        <>
          <section id="team-inquiries" className="team-section">
            <div className="team-section-heading">
              <div>
                <p className="eyebrow">FOLLOW UP</p>
                <h2>Inquiries</h2>
              </div>
              <p>
                Follow up personally. Records remain until manually deleted.
              </p>
            </div>
            {workspace.dashboard.inquiries.length === 0 ? (
              <p>No inquiries yet. New submissions will appear here.</p>
            ) : (
              <div className="team-record-list">
                {workspace.dashboard.inquiries.map((item) => (
                  <article className="team-record" key={item.id}>
                    <div className="team-record-head">
                      <h3>{item.name}</h3>
                      <time dateTime={item.created_at}>
                        {new Date(item.created_at).toLocaleDateString("en-US")}
                      </time>
                    </div>
                    <p>
                      <strong>Interest:</strong> {item.service_interest}
                    </p>
                    <p>
                      <strong>Contact:</strong>{" "}
                      {item.email && (
                        <a href={`mailto:${item.email}`}>{item.email}</a>
                      )}
                      {item.email && item.phone && " · "}
                      {item.phone && (
                        <a href={`tel:${item.phone.replace(/[^+0-9]/g, "")}`}>
                          {item.phone}
                        </a>
                      )}
                    </p>
                    {item.note && <p className="team-note">{item.note}</p>}
                    <div className="team-record-actions">
                      <label>
                        Status{" "}
                        <select
                          aria-label={`Status for ${item.name}`}
                          value={item.status}
                          disabled={busy}
                          onChange={(event) =>
                            void change("/api/team/inquiry", "PATCH", {
                              id: item.id,
                              status: event.target.value,
                            })
                          }
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="booked">Booked</option>
                          <option value="closed">Closed</option>
                        </select>
                      </label>
                      <button
                        type="button"
                        className="quiet-button"
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Permanently delete ${item.name}'s inquiry from the active database?`,
                            )
                          )
                            void change("/api/team/inquiry", "DELETE", {
                              id: item.id,
                            });
                        }}
                      >
                        Delete inquiry
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          <section id="team-content" className="team-section">
            <div className="team-section-heading">
              <div>
                <p className="eyebrow">PUBLIC INFORMATION</p>
                <h2>Horses & services</h2>
              </div>
              <p>
                Only published entries appear on the visit page. Keep details
                factual and owner approved.
              </p>
            </div>
            <div className="team-content-layout">
              <div className="team-content-list">
                {(["horse", "service"] as const).map((kind) => {
                  const items =
                    kind === "horse" ? workspace.horses : workspace.services;
                  return (
                    <div key={kind}>
                      <h3>{kind === "horse" ? "Horses" : "Services"}</h3>
                      {items.length === 0 ? (
                        <p className="small">
                          No {kind === "horse" ? "horses" : "services"} entered
                          yet.
                        </p>
                      ) : (
                        <ul>
                          {items.map((item) => (
                            <li key={item.slug}>
                              <span>
                                <strong>{item.name ?? item.title}</strong>
                                <small>{item.state}</small>
                              </span>
                              <button
                                type="button"
                                className="quiet-button"
                                onClick={() => edit(kind, item)}
                              >
                                Edit
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
              <form
                id="team-content-form"
                className="team-content-form"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (await change("/api/team/content", "POST", draft))
                    setDraft(emptyDraft);
                }}
              >
                <h3>
                  {draft.expectedVersion === null
                    ? "Add an entry"
                    : "Edit entry"}
                </h3>
                <label>
                  Type{" "}
                  <select
                    value={draft.kind}
                    disabled={draft.expectedVersion !== null}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        kind: event.target.value as Draft["kind"],
                      })
                    }
                  >
                    <option value="horse">Horse</option>
                    <option value="service">Service</option>
                  </select>
                </label>
                <label>
                  Slug{" "}
                  <input
                    value={draft.slug}
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    maxLength={100}
                    disabled={draft.expectedVersion !== null}
                    onChange={(event) =>
                      setDraft({ ...draft, slug: event.target.value })
                    }
                  />
                </label>
                <label htmlFor="content-title">Name or title</label>
                <input
                  id="content-title"
                  value={draft.title}
                  required
                  minLength={2}
                  maxLength={100}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                />
                <label>
                  Summary{" "}
                  <textarea
                    value={draft.summary}
                    required
                    minLength={10}
                    maxLength={700}
                    rows={3}
                    onChange={(event) =>
                      setDraft({ ...draft, summary: event.target.value })
                    }
                  />
                </label>
                <label>
                  Details{" "}
                  <textarea
                    value={draft.details}
                    maxLength={2000}
                    rows={5}
                    onChange={(event) =>
                      setDraft({ ...draft, details: event.target.value })
                    }
                  />
                </label>
                <label>
                  Visibility{" "}
                  <select
                    value={draft.state}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        state: event.target.value as Draft["state"],
                      })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <div className="actions">
                  <button className="action" type="submit" disabled={busy}>
                    {busy ? "Saving…" : "Save entry"}
                  </button>
                  {draft.expectedVersion !== null && (
                    <button
                      type="button"
                      className="quiet-button"
                      onClick={() => setDraft(emptyDraft)}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
          <section id="team-comments" className="team-section">
            <div className="team-section-heading">
              <div>
                <p className="eyebrow">MODERATION</p>
                <h2>Comments</h2>
              </div>
              <p>
                Recent comments and reports. Hiding removes a comment from
                public view.
              </p>
            </div>
            {workspace.dashboard.reports.length > 0 && (
              <div className="team-record-list" aria-label="Reported comments">
                <p>
                  {workspace.dashboard.reports.length} reports on this page for
                  staff review.
                </p>
                {workspace.dashboard.reports.map((report) => (
                  <article
                    className="team-record"
                    key={`${report.comment_id}:${report.created_at}`}
                  >
                    <div className="team-record-head">
                      <h3>
                        {report.reason} report · {report.article_slug}
                      </h3>
                      <span>{report.state}</span>
                    </div>
                    <p>{report.body}</p>
                    {report.state === "published" && (
                      <button
                        type="button"
                        className="quiet-button"
                        disabled={busy}
                        onClick={() =>
                          void change("/api/team/comment", "PATCH", {
                            id: report.comment_id,
                          })
                        }
                      >
                        Hide reported comment
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
            {workspace.dashboard.comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              <div className="team-record-list">
                {workspace.dashboard.comments.map((comment) => (
                  <article className="team-record" key={comment.id}>
                    <div className="team-record-head">
                      <h3>{comment.article_slug}</h3>
                      <span>{comment.state}</span>
                    </div>
                    <p>{comment.body}</p>
                    {workspace.dashboard.reports.some(
                      (report) => report.comment_id === comment.id,
                    ) && (
                      <p className="small">
                        Reported:{" "}
                        {workspace.dashboard.reports
                          .filter((report) => report.comment_id === comment.id)
                          .map((report) => report.reason)
                          .join(", ")}
                      </p>
                    )}
                    {comment.state === "published" && (
                      <button
                        type="button"
                        className="quiet-button"
                        disabled={busy}
                        onClick={() =>
                          void change("/api/team/comment", "PATCH", {
                            id: comment.id,
                          })
                        }
                      >
                        Hide comment
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
          <section id="team-analytics" className="team-section">
            <div className="team-section-heading">
              <div>
                <p className="eyebrow">AGGREGATE TRAFFIC</p>
                <h2>Page counts</h2>
              </div>
              <p>
                Daily page views for public routes over the past 30 days. These
                are events, not unique visitors.
              </p>
            </div>
            {workspace.dashboard.pages.length === 0 ? (
              <p>No page counts have been collected.</p>
            ) : (
              <div className="table-scroll">
                <table className="team-table">
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">Page</th>
                      <th scope="col">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspace.dashboard.pages.map((row) => (
                      <tr key={`${row.day}:${row.path}`}>
                        <td>{row.day}</td>
                        <td>{row.path}</td>
                        <td>{row.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <nav className="team-pagination" aria-label="Older workspace records">
            <button
              type="button"
              className="quiet-button"
              disabled={page === 0 || busy}
              onClick={() => setPage((value) => value - 1)}
            >
              Newer records
            </button>
            <span>Page {page + 1}</span>
            <button
              type="button"
              className="quiet-button"
              disabled={
                busy ||
                !(
                  workspace.dashboard.more_inquiries ||
                  workspace.dashboard.more_comments ||
                  workspace.dashboard.more_reports ||
                  workspace.moreHorses ||
                  workspace.moreServices
                )
              }
              onClick={() => setPage((value) => value + 1)}
            >
              Older records
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
