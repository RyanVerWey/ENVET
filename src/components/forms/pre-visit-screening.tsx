"use client";
import {
  affiliations,
  lovettsvilleForecast,
  preVisitComplete,
  preVisitSections,
  preVisitVersion,
  visitGoals,
} from "@/lib/forms/pre-visit";

export function PreVisitScreening({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}) {
  function field(key: string, next: string) {
    onChange({
      ...value,
      pvVersion: preVisitVersion,
      pvEligibility: value.pvEligibility || "pending",
      pvAffiliation: value.pvAffiliation || "unknown",
      pvOutcome: "followup",
      [key]: next,
    });
  }
  return (
    <fieldset
      className="pre-visit-screening"
      id="pre-visit-screening"
      tabIndex={-1}
    >
      <legend>Pre-visit call / text checklist</legend>
      <p className="field-hint">
        Separate staff record, never part of the signed release. Select only
        what you established or discussed. Do not record diagnoses, trauma
        histories, military IDs or document numbers. Saving is not a booking,
        safety clearance or attendance.
      </p>
      <div className="sign-field-grid">
        <label>
          Conversation date
          <input
            type="date"
            value={value.pvContactDate ?? ""}
            onChange={(e) => field("pvContactDate", e.target.value)}
          />
        </label>
        <label>
          Contact channel
          <select
            value={value.pvChannel ?? ""}
            onChange={(e) => field("pvChannel", e.target.value)}
          >
            <option value="">Choose channel</option>
            <option value="call">Call</option>
            <option value="text">Text</option>
          </select>
        </label>
        <label>
          Reported service / family connection
          <select
            value={value.pvAffiliation ?? "unknown"}
            onChange={(e) => {
              onChange({
                ...value,
                pvVersion: preVisitVersion,
                pvAffiliation: e.target.value,
                pvEligibility: "pending",
                pvOutcome: "followup",
              });
            }}
          >
            {affiliations.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Staff eligibility decision
          <select
            value={value.pvEligibility ?? "pending"}
            onChange={(e) => field("pvEligibility", e.target.value)}
          >
            <option value="pending">Follow-up / confirmation needed</option>
            <option
              value="confirmed"
              disabled={["unknown", "unrelated", ""].includes(
                value.pvAffiliation ?? "",
              )}
            >
              Confirmed by ENVET staff
            </option>
            <option value="not_eligible">
              Not eligible for participant program
            </option>
          </select>
        </label>
      </div>
      <p className="field-hint">
        A caller’s report is not verification. ENVET confirms status or family
        connection privately; this site does not collect proof documents.
      </p>
      <fieldset className="pre-visit-goals">
        <legend>What are they looking for?</legend>
        {visitGoals.map(([key, label]) => (
          <label className="check-line" key={key}>
            <input
              type="checkbox"
              checked={value[key] === "yes"}
              onChange={(e) => field(key, e.target.checked ? "yes" : "")}
            />
            {label}
          </label>
        ))}
      </fieldset>
      {preVisitSections.map((section) => (
        <div className="pre-visit-topic" key={section.key}>
          <label className="check-line">
            <input
              type="checkbox"
              checked={value[section.key] === "yes"}
              onChange={(e) =>
                field(section.key, e.target.checked ? "yes" : "")
              }
            />
            <strong>{section.title}: discussed with caller</strong>
          </label>
          <p>{section.prompt}</p>
          <details>
            <summary>Read full caller guidance</summary>
            {section.items.map((item) => (
              <p key={item.key}>
                <strong>{item.title}. </strong>
                {item.text}
              </p>
            ))}
          </details>
        </div>
      ))}
      <a href={lovettsvilleForecast} target="_blank" rel="noreferrer">
        Check Lovettsville forecast (opens in a new tab)
      </a>
      <p className="field-hint">
        Helmet policy review: owner supplied bicycle-helmet acceptance. Do not
        assume all bicycle helmets are suitable for riding. Confirm type and fit
        with ENVET; blanket guidance awaits safety confirmation.
      </p>
      <label>
        Conversation outcome
        <select
          value={value.pvOutcome ?? "followup"}
          onChange={(e) => field("pvOutcome", e.target.value)}
        >
          <option value="followup">Follow-up needed / in progress</option>
          <option
            value="conversation_complete"
            disabled={!preVisitComplete(value)}
          >
            Eligibility confirmed & all topics discussed
          </option>
        </select>
      </label>
      <p className="field-hint">
        Use Save staff review below to save this checklist. Changes are not
        autosaved. A complete conversation still requires ENVET to arrange the
        visit and check safety on the day.
      </p>
    </fieldset>
  );
}
