"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Download, Printer } from "lucide-react";
import {
  fieldSections,
  formTitles,
  initialLabels,
  type FormKind,
} from "@/lib/forms/definition";
import type { Signature, InitialMark } from "@/lib/forms/validation";
import type { InitialAcknowledgement } from "@/lib/forms/records";
import type { DocumentSource } from "./document-view";
import { DocumentView } from "./document-view";
import { SignatureDrawing } from "./signature-input";
import { InitialMarkView } from "./initial-mark";
export type ReceiptData = {
  id: string;
  kind: FormKind;
  created_at: string;
  record_digest: string;
  status: string;
  version: number;
  participant_id: string | null;
  evaluation: Record<string, string> | null;
  visits: {
    id: string;
    day: string;
    session: string;
    service: string;
    state: "completed" | "void";
  }[];
  record: {
    source: DocumentSource;
    fields: Record<string, string>;
    minor: boolean;
    riding: string[];
    conditions: string[];
    initials: Record<string, InitialMark>;
    initialAcknowledgements?: InitialAcknowledgement[];
    guestSignature: Signature;
    guardianSignature: Signature | null;
    receivedAt: string;
    signer: { id: string; email: string; role: string };
    electronicConsent: { version: string; text: string };
    guardianCertification?: { version: string; text: string; certified: true };
    attribution: string;
    version: string;
  };
};
export function SignedDocument({ data }: { data: ReceiptData }) {
  const r = data.record;
  const fieldLabels = Object.fromEntries(
    fieldSections[data.kind].flatMap((section) =>
      section.fields.map((field) => [field.key, field.label]),
    ),
  );
  Object.assign(fieldLabels, {
    minorAge: "Guest age (0–17)",
    guardianName: "Parent / lawful guardian printed name",
    ...(r.minor ? { guestName: "Child’s full name" } : {}),
  });
  return (
    <div className="signed-record">
      <h2>{formTitles[data.kind]}</h2>
      <p>
        Submitted {new Date(data.created_at).toLocaleString()} · reference{" "}
        <code>{data.id}</code>
      </p>
      <p>
        Document version: <code>{r.version}</code>
      </p>
      <h3>Submitted information</h3>
      <dl className="record-fields">
        {Object.entries(r.fields).map(([k, v]) => (
          <div key={k}>
            <dt>{fieldLabels[k] ?? k}</dt>
            <dd>{v || "Not provided"}</dd>
          </div>
        ))}
      </dl>
      {r.riding.length > 0 && <p>Riding history: {r.riding.join(", ")}</p>}
      {r.conditions.length > 0 && (
        <p>Horse health history: {r.conditions.join(", ")}</p>
      )}
      <h3>Initials</h3>
      <dl className="record-fields">
        {Object.entries(r.initials).map(([k, v]) => (
          <div key={k}>
            <dt>
              {k === "parent"
                ? "Parent / guardian opening initials"
                : (initialLabels[Number(k.replace(/^p/, ""))] ?? k)}
            </dt>
            <dd>
              <InitialMarkView mark={v} label={`Recorded initials: ${k}`} />
            </dd>
          </div>
        ))}
      </dl>
      <h3>{r.minor ? "Child / guest signature" : "Guest / owner signature"}</h3>
      {r.guestSignature.method === "typed" ? (
        <p className="typed-signature">{r.guestSignature.name}</p>
      ) : (
        <SignatureDrawing
          strokes={r.guestSignature.strokes}
          label={`Signature of ${r.guestSignature.name}`}
        />
      )}
      <p>
        {r.guestSignature.name} · {r.guestSignature.method}
      </p>
      {r.guardianSignature && (
        <>
          <h3>Parent / lawful guardian signature</h3>
          {r.guardianSignature.method === "typed" ? (
            <p className="typed-signature">{r.guardianSignature.name}</p>
          ) : (
            <SignatureDrawing
              strokes={r.guardianSignature.strokes}
              label={`Guardian signature of ${r.guardianSignature.name}`}
            />
          )}
          <p>
            {r.guardianSignature.name} · {r.guardianSignature.method}
          </p>
        </>
      )}
      <h3>Electronic consent & attribution</h3>
      {r.guardianCertification && (
        <>
          <h4>Parent / lawful guardian certification</h4>
          <p>{r.guardianCertification.text}</p>
          <p>
            Certified by the submitting guardian. Certification version:{" "}
            {r.guardianCertification.version}.
          </p>
        </>
      )}
      <p>{r.electronicConsent.text}</p>
      <p>
        Consent version: {r.electronicConsent.version}. Submitting Google
        account: {r.signer.email} ({r.signer.role}). Recorded {r.receivedAt}.
      </p>
      <p>{r.attribution}</p>
      <p>
        Record SHA-256: <code>{data.record_digest}</code>. This digest detects
        content differences; it is not a certificate of identity or legal
        validity.
      </p>
      <h3>Completed document</h3>
      <DocumentView
        source={r.source}
        initials={r.initials}
        minor={r.minor}
        fields={data.kind === "liability" ? r.fields : undefined}
      />
      {r.initialAcknowledgements && r.initialAcknowledgements.length > 0 && (
        <details className="document-disclosure" name="envet-accordion">
          <summary>Initialled acceptance audit</summary>
          <div className="source-document">
            {r.initialAcknowledgements.map((entry) => (
              <section key={entry.key}>
                <h4>
                  {entry.signerRole === "guardian"
                    ? "Parent / guardian"
                    : "Guest"}{" "}
                  · acknowledgement {entry.key}
                </h4>
                <p>{entry.text}</p>
                <InitialMarkView
                  mark={entry.mark}
                  label={`Recorded ${entry.signerRole} initials: ${entry.key}`}
                />
                <p>Acceptance recorded on submission: {entry.recordedAt}</p>
              </section>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
export function Receipt({ id }: { id: string }) {
  const [data, setData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/forms?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: abort.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error ?? "Receipt unavailable.");
        if (!abort.signal.aborted) setData(result);
      })
      .catch((e) => {
        if (!abort.signal.aborted)
          setError(e instanceof Error ? e.message : "Receipt unavailable.");
      });
    return () => abort.abort();
  }, [id, retry]);
  function download() {
    if (!data) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `envet-signed-record-${data.id}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="wrap receipt-page">
      {!data && <h1>Your submission receipt</h1>}
      {!data && !error && <p role="status">Verifying your private receipt…</p>}
      {error && (
        <>
          <h2>We couldn’t retrieve your receipt</h2>
          <p role="alert">{error}</p>
          <p>
            This page does not confirm a new submission. Sign in with the
            submitting Google account, then retry. Do not submit another form to
            retrieve a receipt.
          </p>
          <Link className="action" href="/account">
            Your account
          </Link>
          <button
            type="button"
            className="quiet-button"
            onClick={() => {
              setData(null);
              setError("");
              setRetry((v) => v + 1);
            }}
          >
            Retry receipt
          </button>
        </>
      )}
      {data && (
        <>
          <div className="receipt-confirmation">
            <CheckCircle2 size={38} />
            <p className="eyebrow">Submission received</p>
            <h1>Thank you for your submission.</h1>
            <p>
              Your signed record is saved for ENVET’s review.{" "}
              {data.kind === "donation"
                ? "The team will review your horse candidate and follow up. This is not an acceptance, ownership transfer or tax receipt."
                : "The team will review your release. This is not a booking or a determination that the waiver is valid."}
            </p>
            <div className="receipt-actions">
              <button
                type="button"
                className="quiet-button"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Print / save PDF
              </button>
              <button type="button" className="quiet-button" onClick={download}>
                <Download size={16} />
                Save complete record
              </button>
              <Link href="/forms">Return to forms</Link>
            </div>
            <p className="field-hint">
              This copy contains personal information. Keep it private. ENVET
              retains signed records indefinitely; deletion requires explicit
              administrative authorization.
            </p>
          </div>
          <SignedDocument data={data} />
        </>
      )}
    </section>
  );
}
