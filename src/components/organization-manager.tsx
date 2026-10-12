"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  blankOrganization,
  type OrganizationInput,
  type OrganizationRecord,
} from "@/lib/community/organizations";

export function OrganizationManager() {
  const [records, setRecords] = useState<OrganizationRecord[] | null>(null);
  const [draft, setDraft] = useState<OrganizationInput>({
    ...blankOrganization,
  });
  const [version, setVersion] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [removed, setRemoved] = useState(false);
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const readGeneration = useRef(0);
  const writeLock = useRef(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const invalidateReads = useCallback(() => {
    readGeneration.current++;
  }, []);
  const reload = useCallback(async () => {
    const generation = ++readGeneration.current;
    setLoading(true);
    setRecords(null);
    try {
      const response = await fetch(
        `/api/team/organizations?page=${page}&removed=${removed}`,
        { cache: "no-store" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Organizations could not load.");
      if (generation !== readGeneration.current) return false;
      setRecords(result.organizations);
      setMore(result.more);
      return true;
    } catch (error) {
      if (generation === readGeneration.current)
        setMessage(
          error instanceof Error
            ? error.message
            : "Organizations could not load.",
        );
      return false;
    } finally {
      if (generation === readGeneration.current) setLoading(false);
    }
  }, [page, removed]);
  useEffect(() => {
    const timer = setTimeout(() => void reload(), 0);
    return () => {
      clearTimeout(timer);
      invalidateReads();
    };
  }, [reload, invalidateReads]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function edit(item?: OrganizationRecord) {
    if (dirty && !window.confirm("Discard your unsaved organization changes?"))
      return;
    setDraft(
      item
        ? {
            slug: item.slug,
            name: item.name,
            href: item.href,
            description: item.description,
            sort_order: item.sort_order,
            state: item.state,
          }
        : { ...blankOrganization },
    );
    setVersion(item?.version ?? null);
    setDirty(false);
    setBlocked(false);
    setMessage("");
    setConfirm(null);
    document.getElementById("organization-name")?.focus();
  }
  function update<K extends keyof OrganizationInput>(
    key: K,
    value: OrganizationInput[K],
  ) {
    setDraft((old) => ({ ...old, [key]: value }));
    setDirty(true);
  }
  async function mutate(method: "POST" | "DELETE" | "PATCH", payload: unknown) {
    if (
      writeLock.current ||
      loading ||
      !records ||
      (blocked && method === "POST")
    )
      return;
    if (
      method !== "POST" &&
      dirty &&
      !window.confirm("Discard your unsaved organization changes and continue?")
    )
      return;
    writeLock.current = true;
    setBusy(true);
    setMessage("");
    setConfirm(null);
    try {
      const response = await fetch("/api/team/organizations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 403 || response.status === 409) {
          setRecords(null);
          setBlocked(true);
          setMessage(
            `${result.error} Refresh organizations and open the latest entry before saving again. Your unsaved changes are retained.`,
          );
        } else setMessage(result.error || "The change did not save.");
        return;
      }
      if (method === "POST") setVersion(result.version);
      else {
        setDraft({ ...blankOrganization });
        setVersion(null);
      }
      setDirty(false);
      const refreshed = await reload();
      setBlocked(!refreshed);
      setMessage(
        !refreshed
          ? "Change confirmed, but organizations could not refresh. Retry refresh; do not repeat the change."
          : method === "DELETE"
            ? "Organization removed from the website. You can restore it as a draft."
            : method === "PATCH"
              ? "Restored as a draft. Review before publishing."
              : "Organization saved.",
      );
      if (method !== "POST" || !refreshed) statusRef.current?.focus();
    } catch {
      setRecords(null);
      setBlocked(true);
      setMessage(
        "Could not confirm whether the change saved. Refresh organizations and open the latest entry before trying again. Your unsaved changes are retained.",
      );
    } finally {
      setBusy(false);
      writeLock.current = false;
    }
  }
  return (
    <div className="wrap team-workspace organization-manager">
      <nav className="team-nav" aria-label="Management navigation">
        <a href="/team">Management dashboard</a>
        <a href="/team/animals">Animal staff & bios</a>
        <a
          href="/about#contributing-organizations"
          target="_blank"
          rel="noopener noreferrer"
        >
          View public organizations{" "}
          <ArrowUpRight size={15} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </nav>
      <div className="animal-management-heading">
        <div>
          <p className="eyebrow">COMMUNITY SUPPORT</p>
          <h2>Give their support a place.</h2>
          <p>
            Published organizations appear on Our story. Contributions need not
            be monetary.
          </p>
        </div>
        <button
          className="action"
          type="button"
          disabled={busy || loading || !records}
          onClick={() => edit()}
        >
          <Plus size={18} aria-hidden="true" />
          Add organization
        </button>
      </div>
      <p
        ref={statusRef}
        tabIndex={-1}
        className={message ? "form-message" : undefined}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      {loading && <p role="status">Loading organizations…</p>}
      <button
        className="quiet-button"
        type="button"
        disabled={busy || loading}
        onClick={() => {
          setMessage("");
          void reload();
        }}
      >
        Refresh organizations
      </button>
      {records && (
        <>
          <div
            className="animal-filters"
            role="group"
            aria-label="Organization list"
          >
            <button
              type="button"
              disabled={busy || loading}
              aria-pressed={!removed}
              onClick={() => {
                setRemoved(false);
                setPage(0);
                setConfirm(null);
              }}
            >
              Organizations
            </button>
            <button
              type="button"
              disabled={busy || loading}
              aria-pressed={removed}
              onClick={() => {
                setRemoved(true);
                setPage(0);
                setConfirm(null);
              }}
            >
              Removed
            </button>
          </div>
          <div className="team-content-layout">
            <section aria-labelledby="organization-list-heading">
              <h3 id="organization-list-heading">
                {removed ? "Removed organizations" : "Your organizations"}
              </h3>
              {records.length === 0 && (
                <p>
                  {removed
                    ? "No removed organizations on this page."
                    : "No organizations on this page. Add one to start recognizing your contributors."}
                </p>
              )}
              <ul className="animal-admin-list">
                {records.map((item) => (
                  <li key={item.slug}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.deleted_at
                          ? "Removed"
                          : item.state === "published"
                            ? "Published"
                            : "Draft"}{" "}
                        · Order {item.sort_order}
                      </span>
                    </div>
                    <div className="actions">
                      {item.deleted_at ? (
                        <button
                          className="quiet-button"
                          type="button"
                          disabled={busy || loading}
                          aria-label={`Restore ${item.name} as draft`}
                          onClick={() =>
                            void mutate("PATCH", {
                              slug: item.slug,
                              expectedVersion: item.version,
                            })
                          }
                        >
                          <RotateCcw size={16} aria-hidden="true" />
                          Restore as draft
                        </button>
                      ) : (
                        <>
                          <button
                            className="quiet-button"
                            type="button"
                            disabled={busy || loading}
                            onClick={() => edit(item)}
                          >
                            Edit {item.name}
                          </button>
                          <button
                            className="quiet-button"
                            type="button"
                            disabled={busy || loading}
                            aria-label={`Remove ${item.name}`}
                            onClick={() => setConfirm(item.slug)}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                    {confirm === item.slug && (
                      <div className="animal-trash-confirm" role="alert">
                        <p>
                          Remove {item.name} from the website? You can restore
                          this entry later.
                        </p>
                        <button
                          className="quiet-button"
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirm(null)}
                        >
                          Keep organization
                        </button>
                        <button
                          className="action"
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void mutate("DELETE", {
                              slug: item.slug,
                              expectedVersion: item.version,
                            })
                          }
                        >
                          Confirm removal
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <nav className="actions" aria-label="Organization pages">
                <button
                  className="quiet-button"
                  type="button"
                  disabled={busy || loading || page === 0}
                  onClick={() => {
                    setPage((p) => p - 1);
                    setConfirm(null);
                  }}
                >
                  Previous
                </button>
                <span>Page {page + 1}</span>
                <button
                  className="quiet-button"
                  type="button"
                  disabled={busy || loading || !more}
                  onClick={() => {
                    setPage((p) => p + 1);
                    setConfirm(null);
                  }}
                >
                  Next
                </button>
              </nav>
            </section>
            <form
              className="team-content-form"
              onSubmit={(event) => {
                event.preventDefault();
                void mutate("POST", { ...draft, expectedVersion: version });
              }}
            >
              <h3>
                {version === null ? "Add an organization" : "Edit organization"}
              </h3>
              {blocked && (
                <p role="alert">
                  Open the latest entry or choose Add organization before
                  saving. Copy any unsaved changes you need first.
                </p>
              )}
              <fieldset disabled={busy || loading}>
                <legend className="sr-only">Organization details</legend>
                <label htmlFor="organization-name">Organization name</label>
                <input
                  id="organization-name"
                  value={draft.name}
                  required
                  minLength={2}
                  maxLength={150}
                  onChange={(event) => update("name", event.target.value)}
                />
                <label htmlFor="organization-slug">Entry ID</label>
                <input
                  id="organization-slug"
                  value={draft.slug}
                  required
                  maxLength={100}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  disabled={version !== null}
                  aria-describedby="organization-id-hint"
                  onChange={(event) => update("slug", event.target.value)}
                />
                <p className="small" id="organization-id-hint">
                  A unique lowercase ID, such as equus-foundation. It stays
                  fixed after creation.
                </p>
                <label htmlFor="organization-website">Website (optional)</label>
                <input
                  id="organization-website"
                  type="url"
                  value={draft.href}
                  maxLength={2048}
                  placeholder="https://"
                  aria-describedby="organization-website-hint"
                  onChange={(event) => update("href", event.target.value)}
                />
                <p className="small" id="organization-website-hint">
                  Use the organization’s HTTPS website. Leave blank to show its
                  name without a link.
                </p>
                <label htmlFor="organization-description">
                  Description (optional)
                </label>
                <textarea
                  id="organization-description"
                  value={draft.description}
                  maxLength={500}
                  rows={3}
                  aria-describedby="organization-description-hint"
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                />
                <p className="small" id="organization-description-hint">
                  Use confirmed facts. Do not imply accreditation, sponsorship
                  or a specific financial gift without evidence.
                </p>
                <label htmlFor="organization-order">Display order</label>
                <input
                  id="organization-order"
                  type="number"
                  min={0}
                  max={9999}
                  step={1}
                  value={Number.isNaN(draft.sort_order) ? "" : draft.sort_order}
                  required
                  onChange={(event) =>
                    update("sort_order", event.target.valueAsNumber)
                  }
                />
                <p className="small">
                  Lower numbers appear first. Matching numbers sort by name.
                </p>
                <label htmlFor="organization-state">Visibility</label>
                <select
                  id="organization-state"
                  value={draft.state}
                  onChange={(event) =>
                    update(
                      "state",
                      event.target.value as OrganizationInput["state"],
                    )
                  }
                >
                  <option value="draft">Draft, team only</option>
                  <option value="published">Published, on the website</option>
                </select>
                <div className="actions">
                  <button className="action" type="submit" disabled={blocked}>
                    {busy ? "Saving…" : "Save organization"}
                  </button>
                </div>
              </fieldset>
              <button
                type="button"
                className="quiet-button"
                disabled={busy || loading}
                onClick={() => edit()}
              >
                Cancel edit
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
