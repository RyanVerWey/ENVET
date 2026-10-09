"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@corvaui/react";
import {
  Check,
  ChevronRight,
  FileText,
  LockKeyhole,
  PenLine,
} from "lucide-react";
import {
  conditionOptions,
  electronicConsent,
  guardianCertificationText,
  fieldSections,
  formSource,
  formTitles,
  formVersion,
  liabilityInitials,
  initialLabels,
  ridingOptions,
  type Field,
  type FormKind,
} from "@/lib/forms/definition";
import {
  signatureInput,
  fieldInput,
  initialInput,
  submissionInput,
  type Signature,
  type Submission,
} from "@/lib/forms/validation";
import { SignatureDrawing, SignatureInput } from "./signature-input";
import { SourceDisclosure } from "./document-view";
import { fieldAutocomplete } from "@/lib/forms/autofill";

export function FormField({
  field,
  value,
  onChange,
  autoComplete,
}: {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  const id = `field-${field.key}`;
  return (
    <div className={`sign-field${field.multiline ? " sign-field-wide" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {field.required && <span aria-hidden="true"> *</span>}
      </label>
      {field.multiline ? (
        <textarea
          id={id}
          name={field.key}
          autoComplete={autoComplete ?? fieldAutocomplete(field.key)}
          value={value}
          rows={3}
          maxLength={field.max ?? 1500}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          name={field.key}
          autoComplete={autoComplete ?? fieldAutocomplete(field.key)}
          type={field.type ?? "text"}
          min={field.key === "minorAge" ? 0 : undefined}
          max={field.key === "minorAge" ? 17 : undefined}
          step={field.key === "minorAge" ? 1 : undefined}
          value={value}
          maxLength={field.max ?? 254}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
function Choices({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <fieldset className="sign-choices">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...value, option]
                    : value.filter((v) => v !== option),
                )
              }
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function SigningRoom({
  kind,
  enabled,
  signedIn,
}: {
  kind: FormKind;
  enabled: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const sections = fieldSections[kind];
  const steps = [
    ...sections.map((s) => s.title),
    "Read & initial",
    "Sign",
    "Review & finish",
  ];
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<Record<string, string>>({
    signedDate: new Date().toISOString().slice(0, 10),
  });
  const [minor, setMinor] = useState(false);
  const [riding, setRiding] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [initials, setInitials] = useState<Record<string, string>>({});
  const [guest, setGuest] = useState<Signature>({ method: "typed", name: "" });
  const [guardian, setGuardian] = useState<Signature>({
    method: "typed",
    name: "",
  });
  const [consent, setConsent] = useState(false);
  const [guardianCertified, setGuardianCertified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [frozen, setFrozen] = useState(false);
  const pending = useRef<Submission | null>(null);
  const requestId = useRef<string | null>(null);
  const complete = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const dirty =
    Object.keys(fields).length > 1 ||
    !!guest.name ||
    !!guardian.name ||
    Object.keys(initials).length > 0;
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      if (!complete.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function go(next: number) {
    setStep(next);
    setMessage("");
    window.setTimeout(() => heading.current?.focus(), 0);
  }
  function field(key: string, value: string) {
    setFields((v) => ({ ...v, [key]: value }));
    setGuardianCertified(false);
  }
  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentSection = sections[step];
    if (currentSection) {
      const invalid = currentSection.fields.find(
        (field) => fieldInput(field, fields[field.key] ?? "") === null,
      );
      if (invalid) {
        setMessage(
          `Check ${minor && invalid.key === "guestName" ? "the child’s full name" : invalid.label.toLowerCase()} before continuing.`,
        );
        document.getElementById(`field-${invalid.key}`)?.focus();
        return;
      }
      if (
        kind === "liability" &&
        minor &&
        step === 0 &&
        (!/^([0-9]|1[0-7])$/.test(fields.minorAge ?? "") ||
          !fields.guardianName?.trim())
      ) {
        setMessage(
          "Enter guest age 0–17 and the parent / lawful guardian name.",
        );
        return;
      }
    }
    if (
      step === sections.length &&
      kind === "liability" &&
      (liabilityInitials.some((i) => !initialInput(initials[`p${i}`])) ||
        (minor && !initialInput(initials.parent)))
    ) {
      setMessage(
        "Initial each marked section using letters before continuing.",
      );
      return;
    }
    if (step === sections.length + 1) {
      const name =
        fields[kind === "liability" ? "guestName" : "ownerName"] ?? "";
      if (
        !signatureInput(guest, name) ||
        (minor && !signatureInput(guardian, fields.guardianName ?? "")) ||
        (minor && !guardianCertified) ||
        !consent
      ) {
        setMessage(
          "Match printed names, provide separate signatures, complete any guardian certification and agree to electronic records before continuing.",
        );
        return;
      }
    }
    go(step + 1);
  }
  async function submit() {
    if (!enabled || !signedIn || busy) return;
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const input =
      pending.current ??
      submissionInput({
        kind,
        version: formVersion(kind),
        requestId: requestId.current,
        fields,
        minor,
        riding,
        conditions,
        initials,
        guestSignature: guest,
        guardianSignature: minor ? guardian : null,
        guardianCertified: minor && guardianCertified,
        consent,
      });
    if (!input) {
      setMessage(
        "Required information is missing or invalid. Go back and check your details, initials and signatures.",
      );
      return;
    }
    pending.current = input;
    setFrozen(true);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (response.ok && result.submitted && typeof result.id === "string") {
        complete.current = true;
        router.replace(`/forms/receipt?id=${encodeURIComponent(result.id)}`);
        return;
      }
      if ([400, 401, 403, 409, 429].includes(response.status)) {
        pending.current = null;
        setFrozen(false);
      }
      setMessage(
        result.error ??
          "Submission could not be confirmed. Retry this unchanged submission.",
      );
    } catch {
      setMessage(
        "Connection interrupted. Submission may have saved. Keep this page open and retry unchanged; the same submission ID prevents a second record.",
      );
    } finally {
      setBusy(false);
    }
  }
  const current = sections[step];
  const documentStep = step === sections.length;
  const signStep = step === sections.length + 1;
  const final = step === steps.length - 1;
  return (
    <div className="wrap signing-layout">
      <aside className="signing-sidebar">
        <Link href="/forms" className="sign-back">
          ← All ENVET forms
        </Link>
        {kind === "liability" && (
          <Link
            href="/forms/pre-visit"
            target="_blank"
            rel="noreferrer"
            className="sign-pre-visit"
          >
            Pre-visit checklist ↗
            <span className="field-hint">
              Opens in a new tab so your unsigned work stays here. Separate from
              the release.
            </span>
          </Link>
        )}
        <div className="sign-document-icon">
          <FileText size={26} />
        </div>
        <p className="eyebrow">Secure signing room</p>
        <h2>{formTitles[kind]}</h2>
        <ol className="sign-steps">
          {steps.map((title, i) => (
            <li key={title} aria-current={i === step ? "step" : undefined}>
              <span>{i < step ? <Check size={15} /> : i + 1}</span>
              {title}
            </li>
          ))}
        </ol>
        <p className="sign-private">
          <LockKeyhole size={17} />
          Details stay on this page until you submit. No draft is saved.
        </p>
        <p className="field-hint">
          Required fields are marked *. Typed signatures work with a keyboard.
        </p>
      </aside>
      <section className="signing-sheet" aria-label="Document signing">
        {!enabled && (
          <div className="sign-banner">
            <LockKeyhole size={19} />
            <div>
              <strong>Complete your paperwork with ENVET</strong>
              <p>
                Online submissions are not accepted. Contact the team for
                signing arrangements.
              </p>
            </div>
          </div>
        )}
        {enabled && !signedIn && (
          <div className="sign-banner">
            <div>
              <strong>Google sign-in required before submission</strong>
              <p>
                Sign in before filling out the form; unsaved details do not
                carry across sign-in.
              </p>
              <Link
                className="action"
                href={`/auth/sign-in?next=/forms/${kind}`}
              >
                Continue with Google
              </Link>
            </div>
          </div>
        )}
        <div className="sign-progress">
          <span>
            Step {step + 1} of {steps.length}
          </span>
          <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
          <progress
            aria-label="Signing progress"
            value={step + 1}
            max={steps.length}
          />
        </div>
        <h1 ref={heading} tabIndex={-1}>
          {steps[step]}
        </h1>
        <form onSubmit={next}>
          {current && (
            <>
              <p className="sign-step-intro">
                {step === 0
                  ? "Provide the information shown in the supplied form. Take your time; you can review everything before signing."
                  : "Complete the relevant details. Optional fields may be left blank."}
              </p>
              <div className="sign-field-grid">
                {current.fields
                  .filter((f) => !(minor && f.key === "guestName"))
                  .map((f) => (
                    <FormField
                      key={f.key}
                      field={f}
                      value={fields[f.key] ?? ""}
                      onChange={(v) => field(f.key, v)}
                    />
                  ))}
              </div>
              {kind === "liability" && step === 0 && (
                <fieldset className="sign-guardian">
                  <legend>Participant age & guardian</legend>
                  <label className="check-line">
                    <input
                      type="checkbox"
                      checked={minor}
                      onChange={(e) => {
                        setMinor(e.target.checked);
                        setGuardianCertified(false);
                        setConsent(false);
                        setGuest({ method: "typed", name: "" });
                        field("guestName", "");
                        if (!e.target.checked) {
                          setFields(({ minorAge, guardianName, ...rest }) => {
                            void minorAge;
                            void guardianName;
                            return rest;
                          });
                          setInitials(({ parent, ...rest }) => {
                            void parent;
                            return rest;
                          });
                          setGuardian({ method: "typed", name: "" });
                        }
                      }}
                    />
                    Guest is under 18
                  </label>
                  {minor ? (
                    <>
                      <div className="sign-field-grid">
                        <FormField
                          field={{
                            key: "guestName",
                            label: "Child’s full name",
                            required: true,
                            max: 100,
                          }}
                          value={fields.guestName ?? ""}
                          onChange={(v) => field("guestName", v)}
                          autoComplete="off"
                        />
                        <FormField
                          field={{
                            key: "minorAge",
                            label: "Guest age (0–17)",
                            type: "number",
                            required: true,
                            max: 2,
                          }}
                          value={fields.minorAge ?? ""}
                          onChange={(v) => field("minorAge", v)}
                        />
                        <FormField
                          field={{
                            key: "guardianName",
                            label: "Parent / lawful guardian printed name",
                            required: true,
                            max: 100,
                          }}
                          value={fields.guardianName ?? ""}
                          onChange={(v) => field("guardianName", v)}
                        />
                      </div>
                      <p className="field-hint">
                        The adult guardian must use their own Google account.
                        Guest and guardian signatures are collected separately;
                        a child does not need a Google account.
                      </p>
                    </>
                  ) : (
                    <p className="field-hint">
                      For adult guests, the submitting Google account belongs to
                      the guest. Name and authority are self-declared.
                    </p>
                  )}
                </fieldset>
              )}
              {kind === "donation" && step === 1 && (
                <>
                  <Choices
                    label="Show or riding history"
                    options={ridingOptions}
                    value={riding}
                    onChange={setRiding}
                  />
                  <Choices
                    label="Current issues or issues in the last 10 years"
                    options={conditionOptions}
                    value={conditions}
                    onChange={setConditions}
                  />
                </>
              )}
              {kind === "donation" && step === 2 && (
                <p className="field-hint">
                  Rider details describe the current rider, not a veteran
                  receiving services. Staff evaluation, acceptance and
                  disposition are completed by ENVET separately. No upload is
                  requested here; ENVET follows up for photos, registration
                  papers, Coggins and the veterinarian letter before any trial.
                </p>
              )}
            </>
          )}
          {documentStep && (
            <>
              <p className="sign-step-intro">
                Read the complete supplied document. Its original
                wording—including blanks and numbering—is preserved. Your
                entered details accompany the signed record.
              </p>
              <SourceDisclosure kind={kind} />
              {kind === "liability" && (
                <div className="initial-guide">
                  <p className="field-hint">
                    {
                      [
                        ...liabilityInitials.map((i) => initials[`p${i}`]),
                        ...(minor ? [initials.parent] : []),
                      ].filter((v) => initialInput(v)).length
                    }{" "}
                    of {liabilityInitials.length + (minor ? 1 : 0)}{" "}
                    acknowledgements initialled.
                  </p>
                  <button
                    type="button"
                    className="quiet-button"
                    onClick={() => {
                      const next = liabilityInitials.find(
                        (i) => !initialInput(initials[`p${i}`]),
                      );
                      const input =
                        next !== undefined
                          ? document.getElementById(`initial-p${next}`)
                          : minor
                            ? document.getElementById("parent-initial")
                            : null;
                      input?.scrollIntoView({ block: "center" });
                      input?.focus();
                    }}
                  >
                    Next required initials
                  </button>
                </div>
              )}
              {kind === "donation" ? (
                <p>
                  The owner declaration appears in the supplied document. Your
                  signature will accompany that declaration. Submission is a
                  candidate application, not an ownership transfer or tax
                  receipt.
                </p>
              ) : (
                <div className="initial-sections">
                  {liabilityInitials.map((i) => (
                    <section key={i}>
                      <p className="source-clause">
                        {formSource(kind).paragraphs[i]}
                      </p>
                      <label htmlFor={`initial-p${i}`}>
                        Guest initials — {initialLabels[i]}
                        <span aria-hidden="true"> *</span>
                      </label>
                      <input
                        id={`initial-p${i}`}
                        value={initials[`p${i}`] ?? ""}
                        maxLength={12}
                        required
                        autoComplete="off"
                        onChange={(e) =>
                          setInitials((v) => ({
                            ...v,
                            [`p${i}`]: e.target.value,
                          }))
                        }
                      />
                    </section>
                  ))}
                  {minor && (
                    <label className="parent-initial">
                      Parent / guardian opening initials *
                      <input
                        id="parent-initial"
                        value={initials.parent ?? ""}
                        required
                        maxLength={12}
                        onChange={(e) =>
                          setInitials((v) => ({ ...v, parent: e.target.value }))
                        }
                      />
                    </label>
                  )}
                </div>
              )}
            </>
          )}
          {signStep && (
            <>
              <p className="sign-step-intro">
                <PenLine size={20} />
                Choose how to sign. Both methods record your intent; neither
                verifies identity on its own.
              </p>
              <SignatureInput
                label={
                  kind === "donation"
                    ? "Owner signature"
                    : minor
                      ? "Child / guest signature"
                      : "Guest signature"
                }
                value={guest}
                onChange={setGuest}
              />
              {minor && (
                <>
                  <SignatureInput
                    label="Parent / lawful guardian signature"
                    value={guardian}
                    onChange={setGuardian}
                  />
                  <fieldset className="sign-guardian">
                    <legend>Parent / lawful guardian certification</legend>
                    <p id="guardian-certification-text">
                      {guardianCertificationText}
                    </p>
                    <label className="check-line">
                      <input
                        type="checkbox"
                        name="guardianCertified"
                        checked={guardianCertified}
                        onChange={(e) => setGuardianCertified(e.target.checked)}
                        aria-describedby="guardian-certification-text"
                        required
                      />
                      I certify that I am the named child’s parent or lawful
                      guardian and agree to the certification above.
                    </label>
                  </fieldset>
                </>
              )}
              <label className="check-line consent-line">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                {electronicConsent}
              </label>
              <p className="field-hint">
                Your electronic-signature consent is separate from the terms in
                the document above.{" "}
                {minor
                  ? "Submitting guardian declares lawful authority; the child's identity is not independently verified."
                  : "Signer declares they are the adult guest or legal owner identified in the form."}
              </p>
            </>
          )}
          {final && (
            <>
              <p className="sign-step-intro">
                Check the complete record before finishing. Use Back to correct
                anything. Submission does not book a visit, accept a horse or
                approve a waiver.
              </p>
              <div className="review-summary">
                <h2>Information you provided</h2>
                <dl>
                  {Object.entries(fields)
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt>
                          {[
                            ...sections
                              .flatMap((s) => s.fields)
                              .map((f) =>
                                minor && f.key === "guestName"
                                  ? { ...f, label: "Child’s full name" }
                                  : f,
                              ),
                            { key: "minorAge", label: "Guest age (0–17)" },
                            {
                              key: "guardianName",
                              label: "Parent / lawful guardian printed name",
                            },
                          ].find((f) => f.key === k)?.label ?? k}
                        </dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                </dl>
                {riding.length > 0 && (
                  <p>Riding history: {riding.join(", ")}</p>
                )}
                {conditions.length > 0 && (
                  <p>Horse health history: {conditions.join(", ")}</p>
                )}
                <h2>Signatures</h2>
                {guest.method === "typed" ? (
                  <p className="typed-signature">{guest.name}</p>
                ) : (
                  <SignatureDrawing
                    strokes={guest.strokes}
                    label={`Guest / owner signature: ${guest.name}`}
                  />
                )}
                <p>
                  {guest.name} · {guest.method}
                </p>
                {minor && (
                  <>
                    <h3>Guardian certification</h3>
                    <p>{guardianCertificationText}</p>
                    <p>
                      Guardian certification:{" "}
                      {guardianCertified ? "agreed" : "not agreed"}.
                    </p>
                    <h3>Parent / lawful guardian</h3>
                    {guardian.method === "typed" ? (
                      <p className="typed-signature">{guardian.name}</p>
                    ) : (
                      <SignatureDrawing
                        strokes={guardian.strokes}
                        label={`Guardian signature: ${guardian.name}`}
                      />
                    )}
                    <p>
                      {guardian.name} · {guardian.method}
                    </p>
                  </>
                )}
                <p>
                  {Object.keys(initials).length} initialled acknowledgements.
                  Electronic consent: {consent ? "agreed" : "not agreed"}.
                </p>
              </div>
              <SourceDisclosure kind={kind} />
              {frozen && (
                <p role="status">
                  This submission is held unchanged while its result is
                  uncertain. Retry uses the same ID. Keep this page open.
                </p>
              )}
            </>
          )}
          {message && (
            <p role="alert" className="form-message">
              {message}
            </p>
          )}
          <div className="sign-actions">
            {step > 0 && (
              <button
                className="quiet-button"
                type="button"
                disabled={busy || frozen}
                onClick={() => go(step - 1)}
              >
                Back
              </button>
            )}
            {!final ? (
              <Button type="submit" variant="primary">
                Continue <ChevronRight size={17} />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                disabled={!enabled || !signedIn || busy}
                onClick={() => void submit()}
              >
                {busy
                  ? "Confirming submission…"
                  : frozen
                    ? "Retry unchanged submission"
                    : "Finish & submit"}
              </Button>
            )}
          </div>
          <p className="sign-footnote">
            <LockKeyhole size={14} />
            {!enabled
              ? "Contact ENVET to arrange signing."
              : "Google sign-in · private signed record · indefinite retention"}
          </p>
        </form>
      </section>
    </div>
  );
}
