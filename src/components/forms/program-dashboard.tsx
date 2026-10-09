"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Chart } from "@corvaui/react";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Users,
  Footprints,
} from "lucide-react";
export type ProgramMetrics = {
  from: string;
  to: string;
  visits: number;
  participants: number;
  repeat_participants: number;
  pending: number;
  pending_over_seven_days: number;
  median_review_hours: number | null;
  daily: { day: string; visits: number }[];
  services: { service: string; visits: number }[];
  candidates: { stage: string; candidates: number }[];
};
const stageLabels: Record<string, string> = {
  submitted: "Awaiting review",
  needs_followup: "Follow-up",
  trial: "In trial",
  accepted: "Candidate accepted",
  declined: "Declined",
};
export function ProgramReport({ data }: { data: ProgramMetrics }) {
  const repeat = data.participants
    ? `${Math.round((data.repeat_participants / data.participants) * 100)}%`
    : "—";
  return (
    <>
      <div className="impact-period">
        <CalendarDays size={17} />
        {data.from} – {data.to}
        <span>Eastern time · recorded activity only</span>
      </div>
      <dl className="impact-kpis">
        <div>
          <dt>
            <Footprints size={19} />
            Completed visits
          </dt>
          <dd>{data.visits.toLocaleString()}</dd>
          <p>Staff-confirmed attendance, excluding void entries.</p>
        </div>
        <div>
          <dt>
            <Users size={19} />
            Active participants
          </dt>
          <dd>{data.participants.toLocaleString()}</dd>
          <p>Distinct staff-linked participants with a visit in this period.</p>
        </div>
        <div>
          <dt>
            <ArrowUpRight size={19} />
            Repeat participation
          </dt>
          <dd>{repeat}</dd>
          <p>
            {data.repeat_participants} of {data.participants} participants
            attended twice or more in this period.
          </p>
        </div>
        <div>
          <dt>
            <Clock3 size={19} />
            Awaiting review
          </dt>
          <dd>{data.pending}</dd>
          <p>
            {data.pending_over_seven_days} submitted records are more than seven
            days old. All-time queue.
          </p>
        </div>
      </dl>
      <div className="impact-chart-grid">
        <section className="impact-chart impact-chart-main">
          <div className="impact-chart-heading">
            <div>
              <p className="eyebrow">Participation over time</p>
              <h2>Visits that happened</h2>
            </div>
            <span>{data.visits} visits</span>
          </div>
          {data.visits > 0 ? (
            <Chart
              label="Completed program visits by day"
              data={data.daily}
              xKey="day"
              series={[{ key: "visits", type: "area" }]}
              type="area"
              controls={["range", "data-table"]}
              height={300}
              showTable={false}
              animated={false}
            />
          ) : (
            <div className="chart-empty">
              <Footprints size={26} />
              <h3>No completed visits recorded yet</h3>
              <p>
                Review a release, link the participant, then confirm actual
                attendance. A submission is not a visit.
              </p>
              <Link href="/team/forms">Open forms review →</Link>
            </div>
          )}
        </section>
        <section className="impact-chart">
          <p className="eyebrow">Program mix</p>
          <h2>Where people participated</h2>
          {data.services.length ? (
            <Chart
              label="Completed visits by service"
              data={data.services}
              xKey="service"
              series={[{ key: "visits", type: "bar" }]}
              type="bar"
              controls={["data-table"]}
              height={300}
              animated={false}
            />
          ) : (
            <p className="chart-empty">
              Service activity appears after staff confirm visits.
            </p>
          )}
        </section>
        <section className="impact-chart">
          <p className="eyebrow">Equine readiness pipeline</p>
          <h2>Candidate progress</h2>
          {data.candidates.length ? (
            <Chart
              label="Current stage of horse candidates submitted in the reporting period"
              data={data.candidates.map((c) => ({
                ...c,
                stage: stageLabels[c.stage] ?? c.stage,
              }))}
              xKey="stage"
              series={[{ key: "candidates", type: "bar" }]}
              type="bar"
              controls={["data-table"]}
              height={270}
              animated={false}
            />
          ) : (
            <p className="chart-empty">
              No horse candidates submitted in this period. Applications are not
              completed donations.
            </p>
          )}
          <p className="field-hint">
            Current stage of candidates received in the selected period; not a
            conversion rate or completed ownership transfer.
          </p>
        </section>
        <section className="impact-chart impact-review-time">
          <p className="eyebrow">Care in the follow-through</p>
          <h2>Time to first review</h2>
          <p className="review-time-value">
            {data.median_review_hours === null
              ? "—"
              : Math.round(data.median_review_hours * 10) / 10}
            <span>
              {data.median_review_hours === null
                ? "No reviewed records in this cohort"
                : "median hours"}
            </span>
          </p>
          <p>
            From submission to the first move out of “submitted”, for forms
            received in this period. Calendar hours, not business hours.
            Unreviewed forms are excluded—not treated as instant reviews.
          </p>
          <Link href="/team/forms">Keep the queue moving →</Link>
        </section>
      </div>
      <details className="kpi-definitions" name="envet-accordion">
        <summary>How ENVET’s activity measures are calculated</summary>
        <p>
          One completed visit means one staff-linked participant, one date and
          one session code. Shared sessions use the same code. Duplicate or
          mistaken entries are voided, not silently erased. Staff link renewed
          forms to an existing participant before recording attendance; separate
          forms for the same person do not automatically prove separate people.
        </p>
        <p>
          Active participants counts distinct participant references, not Google
          accounts, page views, bookings or signed waivers. It includes guests
          recorded as program participants; it is not a verified count of United
          States veterans. Repeat participation is participants with at least
          two visits in this period divided by participants with any visit in
          this period. No participants means no percentage.
        </p>
        <p>
          These charts show operational participation and workload, not clinical
          outcomes, therapy effectiveness, donation revenue or capacity
          utilization. Only aggregates enter charts; names, contact details,
          signatures, emergency contacts, rider measurements and horse health
          descriptions do not.
        </p>
      </details>
    </>
  );
}
export function ProgramDashboard() {
  const [days, setDays] = useState(90);
  const [data, setData] = useState<ProgramMetrics | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/team/impact?days=${days}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error ?? "Report unavailable.");
        if (!controller.signal.aborted) setData(result);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Report unavailable.");
      });
    return () => controller.abort();
  }, [days, retry]);
  return (
    <section className="wrap program-dashboard">
      <nav className="team-nav" aria-label="Team navigation">
        <Link href="/team">Workspace</Link>
        <Link href="/team/forms">Forms review</Link>
        <Link href="/team/impact" aria-current="page">
          Program activity
        </Link>
      </nav>
      <div className="program-heading">
        <div>
          <p className="eyebrow">ENVET · program activity</p>
          <h1>
            Meaningful work.
            <br />
            Measurable follow-through.
          </h1>
          <p>
            Attendance and operational measures to help the team keep its
            promises.
          </p>
        </div>
        <label>
          Reporting period
          <select
            value={days}
            onChange={(e) => {
              setData(null);
              setError("");
              setDays(Number(e.target.value));
            }}
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 365 days</option>
          </select>
        </label>
      </div>
      {!data && !error && (
        <div className="report-skeleton" role="status">
          Loading recorded program activity…
        </div>
      )}
      {error && (
        <div className="sign-banner">
          <p role="alert">{error} Current report is hidden.</p>
          <button
            type="button"
            className="quiet-button"
            onClick={() => {
              setData(null);
              setError("");
              setRetry((v) => v + 1);
            }}
          >
            Retry report
          </button>
        </div>
      )}
      {data && <ProgramReport data={data} />}
    </section>
  );
}
