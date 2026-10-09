"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: string;
  authorLabel: string;
  body: string;
  createdAt: string;
  mine: boolean;
};
type Community = {
  signedIn: boolean;
  likes: number;
  liked: boolean;
  comments: Comment[];
  hasMore: boolean;
};

export function CommunityPanel({
  slug,
  title,
  enabled,
}: {
  slug: string;
  title: string;
  enabled: boolean;
}) {
  const [data, setData] = useState<Community | null>(null);
  const [state, setState] = useState<
    "loading" | "ready" | "error" | "unavailable"
  >(enabled ? "loading" : "unavailable");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [body, setBody] = useState("");
  const [page, setPage] = useState(0);
  const [reporting, setReporting] = useState<string | null>(null);
  const [reason, setReason] = useState("spam");

  const load = useCallback(
    async (targetPage = 0) => {
      try {
        const response = await fetch(
          `/api/community/${slug}?page=${targetPage}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("unavailable");
        const next: Community = await response.json();
        setData((previous) =>
          targetPage === 0 || !previous
            ? next
            : { ...next, comments: [...previous.comments, ...next.comments] },
        );
        setPage(targetPage);
        setState("ready");
      } catch {
        setState("error");
        setMessage("The conversation could not load. Please try again.");
      }
    },
    [slug],
  );

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [enabled, load]);

  async function mutate(url: string, method: string, payload?: unknown) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(url, {
        method,
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Please try again.");
        return false;
      }
      await load();
      return true;
    } catch {
      setMessage("Could not connect. Check your connection and try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    const url = new URL(`/blog/${slug}`, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Guide link copied.");
    } catch {
      setMessage(`Copy this link: ${url}`);
    }
  }

  async function share() {
    const url = new URL(`/blog/${slug}`, window.location.origin).toString();
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({ title, url });
      setMessage("Shared using your device.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Sharing did not finish. You can copy the link instead.");
    }
  }

  return (
    <section
      className="wrap community-section"
      aria-labelledby="community-heading"
    >
      <div className="community-heading">
        <p className="eyebrow">COMMUNITY</p>
        <h2 id="community-heading">
          {enabled
            ? "Keep the conversation going."
            : "Share a helpful next step."}
        </h2>
        <p>
          {enabled
            ? "Share this guide, or sign in with Google to leave a comment. Comments appear as soon as they are posted and may be removed by ENVET."
            : "Know someone who could use this guide? Share it with a veteran, family member, or friend."}
        </p>
      </div>
      <div className="community-actions">
        <button
          type="button"
          className="quiet-button"
          onClick={() => void share()}
        >
          Share this guide
        </button>
        <button
          type="button"
          className="quiet-button"
          onClick={() => void copyLink()}
        >
          Copy link
        </button>
        {state === "ready" &&
          data &&
          (data.signedIn ? (
            <button
              type="button"
              className="quiet-button"
              disabled={busy}
              aria-pressed={data.liked}
              onClick={() =>
                void mutate(
                  `/api/community/${slug}/like`,
                  data.liked ? "DELETE" : "POST",
                )
              }
            >
              {data.liked ? "Liked" : "Like"}{" "}
              <span aria-label={`${data.likes} likes`}>({data.likes})</span>
            </button>
          ) : (
            <span className="small">
              {data.likes} likes ·{" "}
              <Link href={`/auth/sign-in?next=/blog/${slug}`}>
                Sign in to like
              </Link>
            </span>
          ))}
      </div>
      {state === "loading" && <p role="status">Loading the conversation…</p>}
      {state === "error" && (
        <button
          type="button"
          className="quiet-button"
          onClick={() => void load()}
        >
          Try loading comments again
        </button>
      )}
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      {state === "ready" && data && (
        <div className="community-content">
          <div>
            <h3>Comments</h3>
            {data.comments.length === 0 ? (
              <p className="small">
                No comments yet. You can start the conversation.
              </p>
            ) : (
              <ol className="comment-list">
                {data.comments.map((comment) => (
                  <li key={comment.id}>
                    <div className="comment-meta">
                      <strong>{comment.authorLabel}</strong>
                      <time dateTime={comment.createdAt}>
                        {new Date(comment.createdAt).toLocaleDateString(
                          "en-US",
                        )}
                      </time>
                    </div>
                    <p>{comment.body}</p>
                    {data.signedIn && (
                      <div className="comment-tools">
                        {comment.mine ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              if (window.confirm("Remove your comment?"))
                                void mutate(
                                  `/api/community/${slug}/comments/${comment.id}`,
                                  "DELETE",
                                );
                            }}
                          >
                            Remove
                          </button>
                        ) : reporting === comment.id ? (
                          <div className="report-controls">
                            <label>
                              Reason{" "}
                              <select
                                value={reason}
                                onChange={(event) =>
                                  setReason(event.target.value)
                                }
                              >
                                <option value="spam">Spam</option>
                                <option value="privacy">
                                  Private information
                                </option>
                                <option value="harmful">Harmful content</option>
                                <option value="other">Other</option>
                              </select>
                            </label>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void mutate(
                                  `/api/community/${slug}/comments/${comment.id}/report`,
                                  "POST",
                                  { reason },
                                ).then((ok) => {
                                  if (ok) {
                                    setReporting(null);
                                    setMessage("Report sent to ENVET.");
                                  }
                                })
                              }
                            >
                              Send report
                            </button>
                            <button
                              type="button"
                              onClick={() => setReporting(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReporting(comment.id)}
                          >
                            Report
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {data.hasMore && (
              <button
                className="quiet-button"
                type="button"
                disabled={busy}
                onClick={() => void load(page + 1)}
              >
                Load older comments
              </button>
            )}
          </div>
          <div className="comment-compose">
            <h3>Add a comment</h3>
            {data.signedIn ? (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (
                    await mutate(`/api/community/${slug}/comments`, "POST", {
                      body,
                    })
                  )
                    setBody("");
                }}
              >
                <label htmlFor="new-comment">Your comment</label>
                <textarea
                  id="new-comment"
                  value={body}
                  minLength={2}
                  maxLength={2000}
                  required
                  rows={5}
                  onChange={(event) => setBody(event.target.value)}
                />
                <p className="small">
                  Shown as “Community member.” Please do not include private or
                  medical information.
                </p>
                <button
                  className="action"
                  type="submit"
                  disabled={busy || body.trim().length < 2}
                >
                  {busy ? "Posting…" : "Post comment"}
                </button>
              </form>
            ) : (
              <p>
                <Link href={`/auth/sign-in?next=/blog/${slug}`}>
                  Sign in with Google
                </Link>{" "}
                to comment. Your email and Google profile picture are not
                displayed.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
