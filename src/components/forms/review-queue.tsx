"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Button } from "@corvaui/react";
import { FileCheck2, LockKeyhole } from "lucide-react";
import {
  evaluationFields,
  formStatuses,
  formTitles,
  type FormKind,
} from "@/lib/forms/definition";
import { FormField } from "./signing-room";
import { SignedDocument, type ReceiptData } from "./receipt";
import { PreVisitScreening } from "./pre-visit-screening";
import { evaluationInput } from "@/lib/forms/validation";
type QueueRow = {
  id: string;
  kind: FormKind;
  created_at: string;
  status: string;
  version: number;
};
type Queue = {
  rows: QueueRow[];
  more: boolean;
  services: { slug: string; title: string }[];
  moreServices: boolean;
};
const labels: Record<string, string> = {
  all: "All records",
  submitted: "Awaiting review",
  needs_followup: "Needs follow-up",
  reviewed: "Reviewed",
  revoked: "Revocation recorded",
  trial: "Horse trial",
  accepted: "Candidate accepted",
  declined: "Candidate declined",
};
export function FormReviewQueue() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [detail, setDetail] = useState<ReceiptData | null>(null);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("submitted");
  const [status, setStatus] = useState("submitted");
  const [evaluation, setEvaluation] = useState<Record<string, string>>({});
  const [participant, setParticipant] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState("");
  const [session, setSession] = useState("");
  const [service, setService] = useState("");
  const [attended, setAttended] = useState(false);
  const visitNonce = useRef<string | null>(null);
  const requestSequence = useRef(0);
  const detailRef = useRef<HTMLDivElement>(null);
  const reload = useCallback(async () => {
    const ticket = ++requestSequence.current;
    setQueue(null);
    setDetail(null);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/team/forms?page=${page}&status=${filter}`,
        { cache: "no-store" },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Queue unavailable.");
      if (ticket !== requestSequence.current) return false;
      setQueue(result);
      setMessage("");
      return true;
    } catch (e) {
      if (ticket === requestSequence.current)
        setMessage(e instanceof Error ? e.message : "Queue unavailable.");
      return false;
    } finally {
      if (ticket === requestSequence.current) setLoading(false);
    }
  }, [page, filter]);
  useEffect(() => {
    const invalidate = () => {
      requestSequence.current++;
    };
    const timer = window.setTimeout(() => {
      setMessage("");
      void reload();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      invalidate();
    };
  }, [reload]);
  async function open(id: string) {
    setBusy(true);
    setDetail(null);
    setMessage("");
    const ticket = ++requestSequence.current;
    try {
      const response = await fetch(`/api/team/forms?id=${id}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Record unavailable.");
      if (ticket !== requestSequence.current) return;
      setDetail(result);
      setStatus(result.status);
      setEvaluation(result.evaluation ?? {});
      setParticipant(result.participant_id ?? "");
      setDay("");
      setSession("");
      setService("");
      setAttended(false);
      visitNonce.current = null;
      window.setTimeout(() => {
        detailRef.current?.focus();
        detailRef.current?.scrollIntoView({ block: "start" });
      }, 0);
    } catch (e) {
      setQueue(null);
      setMessage(e instanceof Error ? e.message : "Record unavailable.");
    } finally {
      setBusy(false);
    }
  }
  async function change(url: string, method: string, payload: unknown) {
    setBusy(true);
    setMessage("");
    setDetail(null);
    setQueue(null);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(
          `${result.error ?? "Change not confirmed."} Refresh before making another change.`,
        );
        return;
      }
      const refreshed = await reload();
      setMessage(
        refreshed
          ? "Change confirmed. Open the current record to continue."
          : "Change confirmed, but refresh failed. Current records are hidden. Retry refresh; do not repeat the change.",
      );
    } catch {
      setMessage(
        "Change could not be confirmed. Current records are hidden. Refresh before another change; do not repeat the action.",
      );
    } finally {
      setBusy(false);
    }
  }
  function review(event: FormEvent) {
    event.preventDefault();
    if (!detail) return;
    const validated = evaluationInput(evaluation, detail.kind);
    if (!validated) {
      setMessage(
        "Review not sent. Check the screening date, contact channel, connection and eligibility decision. A complete conversation needs a goal and all five topics discussed. Your edits are still here.",
      );
      document.getElementById("pre-visit-screening")?.focus();
      return;
    }
    void change("/api/team/forms", "PATCH", {
      id: detail.id,
      kind: detail.kind,
      version: detail.version,
      status,
      evaluation: validated,
      participantId:
        detail.kind === "liability" && status === "reviewed" && participant
          ? participant
          : null,
    });
  }
  function attendance(event: FormEvent) {
    event.preventDefault();
    if (!detail) return;
    if (!visitNonce.current) visitNonce.current = crypto.randomUUID();
    void change("/api/team/visits", "POST", {
      formId: detail.id,
      requestId: visitNonce.current,
      day,
      session,
      service,
      attended,
    });
  }
  return (
    <section className="wrap form-review-workspace">
      <nav className="team-nav" aria-label="Team navigation">
        <Link href="/team">Workspace</Link>
        <Link href="/team/forms" aria-current="page">
          Forms review
        </Link>
        <Link href="/team/impact">Program activity</Link>
      </nav>
      <div className="program-heading">
        <div>
          <p className="eyebrow">ENVET · protected records</p>
          <h1>
            A clear queue.
            <br />A thoughtful review.
          </h1>
          <p>
            Open only the records you need. Names and signatures stay out of the
            queue overview and charts.
          </p>
        </div>
        <FileCheck2 size={38} />
      </div>
      <div className="queue-toolbar">
        <label>
          Review status
          <select
            value={filter}
            disabled={busy}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(0);
            }}
          >
            {Object.entries(labels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="quiet-button"
          disabled={busy || loading}
          onClick={() => void reload()}
        >
          Refresh queue
        </button>
      </div>
      <p className="field-hint">
        Screening a caller before a guest form exists? Use the{" "}
        <Link href="/forms/pre-visit">pre-visit call guide</Link>. Save the
        private checklist when their guest record is available.
      </p>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      {loading && <p role="status">Loading protected queue…</p>}
      {!loading && !queue && (
        <p>Records are hidden until a successful refresh.</p>
      )}
      {queue && (
        <>
          <div className="queue-table-wrap">
            <table className="queue-table">
              <caption>
                Page {page + 1} · {labels[filter]} · up to 50 records
              </caption>
              <thead>
                <tr>
                  <th scope="col">Document</th>
                  <th scope="col">Received</th>
                  <th scope="col">Status</th>
                  <th scope="col">Review</th>
                </tr>
              </thead>
              <tbody>
                {queue.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{formTitles[row.kind]}</strong>
                      <code>{row.id}</code>
                    </td>
                    <td>
                      <time dateTime={row.created_at}>
                        {new Date(row.created_at).toLocaleDateString()}
                      </time>
                    </td>
                    <td>
                      <span className="record-status">
                        {labels[row.status] ?? row.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="quiet-button"
                        disabled={busy}
                        aria-label={`Open ${formTitles[row.kind]} record ${row.id}`}
                        onClick={() => void open(row.id)}
                      >
                        Open record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!queue.rows.length && (
              <div className="chart-empty">
                <FileCheck2 size={27} />
                <h2>No records in this queue</h2>
                <p>
                  Completed submissions appear here when signing is enabled.
                  Other statuses may have records.
                </p>
              </div>
            )}
          </div>
          <div className="queue-pagination">
            <button
              type="button"
              className="quiet-button"
              disabled={busy || page === 0}
              onClick={() => setPage((v) => v - 1)}
            >
              Previous page
            </button>
            <span>Page {page + 1}</span>
            <button
              type="button"
              className="quiet-button"
              disabled={busy || !queue.more}
              onClick={() => setPage((v) => v + 1)}
            >
              Next page
            </button>
          </div>
          {queue.moreServices && (
            <p role="status">
              Only the first 100 published services are available in attendance
              selection. Ask an operator to narrow or paginate service selection
              before using a missing service.
            </p>
          )}
        </>
      )}
      {detail && (
        <div ref={detailRef} tabIndex={-1} className="review-detail">
          <div className="review-detail-header">
            <h2>Review this record</h2>
            <button
              type="button"
              className="quiet-button"
              onClick={() => setDetail(null)}
            >
              Close private record
            </button>
          </div>
          <p className="field-hint">
            <LockKeyhole size={15} />
            Opening this record is audited. Signed content cannot be edited.
            Retained indefinitely; no routine delete action.
          </p>
          <details className="document-disclosure">
            <summary>Open complete signed document & signatures</summary>
            <SignedDocument data={detail} />
          </details>
          <form onSubmit={review}>
            <h3>Staff review — separate from signed content</h3>
            <label>
              Review status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {formStatuses(detail.kind).map((s) => (
                  <option key={s} value={s}>
                    {labels[s]}
                  </option>
                ))}
              </select>
            </label>
            <p className="field-hint">
              {detail.kind === "liability"
                ? "Reviewed is an operational status, not a legal-validity determination. Record revocation separately; deleting data is not revocation."
                : "Candidate accepted is a staff decision, not completed transfer of ownership. Follow the supplied acceptance-letter process."}
            </p>
            <div className="sign-field-grid">
              {(detail.kind === "donation"
                ? evaluationFields
                : evaluationFields.filter((f) => f.key === "notes")
              ).map((f) => (
                <FormField
                  key={f.key}
                  field={f}
                  value={evaluation[f.key] ?? ""}
                  onChange={(v) => setEvaluation((s) => ({ ...s, [f.key]: v }))}
                />
              ))}
            </div>
            {detail.kind === "liability" && (
              <PreVisitScreening value={evaluation} onChange={setEvaluation} />
            )}
            {detail.kind === "liability" && status === "reviewed" && (
              <label>
                Existing participant reference (optional)
                <input
                  value={participant}
                  maxLength={36}
                  onChange={(e) => setParticipant(e.target.value)}
                  placeholder="Existing ENVET participant UUID"
                />
                <span className="field-hint">
                  Use an existing reference for the same person’s renewed form.
                  Blank creates a reference on first review; an existing link is
                  retained. The account is not the participant identity. Linking
                  after attendance requires operator reconciliation.
                </span>
              </label>
            )}
            <Button type="submit" variant="primary" disabled={busy}>
              Save staff review
            </Button>
          </form>
          {detail.kind === "liability" && detail.status === "reviewed" && (
            <form className="attendance-form" onSubmit={attendance}>
              <h3>Record a visit that happened</h3>
              <p>
                Participant reference: <code>{detail.participant_id}</code>.
                Signing and bookings are not attendance. Use the same session
                code for everyone attending the same session.
              </p>
              <div className="sign-field-grid">
                <label>
                  Date attended
                  <input
                    type="date"
                    value={day}
                    required
                    onChange={(e) => setDay(e.target.value)}
                  />
                </label>
                <label>
                  Session code
                  <input
                    value={session}
                    required
                    pattern="[a-z0-9][a-z0-9-]{0,39}"
                    maxLength={40}
                    onChange={(e) => setSession(e.target.value)}
                    placeholder="morning-01"
                  />
                </label>
                <label>
                  Service
                  <select
                    value={service}
                    required
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="">Choose a published service</option>
                    {queue?.services.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={attended}
                  required
                  onChange={(e) => setAttended(e.target.checked)}
                />
                I confirm this person actually attended this service on this
                date.
              </label>
              <Button
                type="submit"
                variant="primary"
                disabled={busy || !queue?.services.length}
              >
                Confirm completed visit
              </Button>
              {!queue?.services.length && (
                <p className="field-hint">
                  Publish a service in the workspace before recording
                  attendance.
                </p>
              )}
            </form>
          )}
          {detail.visits.length > 0 && (
            <section>
              <h3>Recorded visits (latest 100)</h3>
              <ul className="visit-log">
                {detail.visits.map((v) => (
                  <li key={v.id}>
                    <span>
                      {v.day} · {v.session} · {v.service} · {v.state}
                    </span>
                    {v.state === "completed" && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const reason = new FormData(e.currentTarget).get(
                            "reason",
                          );
                          void change("/api/team/visits", "DELETE", {
                            id: v.id,
                            reason,
                          });
                        }}
                      >
                        <label>
                          Correction reason
                          <select name="reason" required defaultValue="">
                            <option value="">Choose reason</option>
                            <option value="duplicate">Duplicate</option>
                            <option value="entry_error">Entry error</option>
                            <option value="did_not_attend">
                              Did not attend
                            </option>
                          </select>
                        </label>
                        <button
                          className="quiet-button"
                          disabled={busy}
                          type="submit"
                        >
                          Void visit
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
              <p className="field-hint">
                Void records retain their audit trail and are excluded from
                program metrics. Correct an entry by voiding it, then recording
                the correct attendance.
              </p>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
