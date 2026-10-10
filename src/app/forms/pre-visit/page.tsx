import Link from "next/link";
import type { Metadata } from "next";
import { PreVisitChecklist } from "@/components/forms/pre-visit-checklist";
import { preVisitSections } from "@/lib/forms/pre-visit";
export const metadata: Metadata = {
  title: "Pre-visit checklist",
  robots: { index: false, follow: false },
};
export default function PreVisitPage() {
  return (
    <div className="wrap pre-visit-page">
      <Link href="/forms" className="sign-back">
        ← All ENVET forms
      </Link>
      <h1>Before you visit Eagle’s Nest</h1>
      <PreVisitChecklist />
      <details className="pre-visit-call-guide" name="envet-accordion">
        <summary>ENVET staff: call / text conversation guide</summary>
        <p>
          Use these prompts before a guest form exists. This page does not save
          a call record. Once a guest record is available, authorized staff can
          save the checklist in <Link href="/team/forms">Forms review</Link>.
        </p>
        <ol>
          {preVisitSections.map((s) => (
            <li key={s.key}>
              <strong>{s.title}</strong>
              <p>{s.prompt}</p>
            </li>
          ))}
        </ol>
      </details>
      <p>
        When ENVET asks you to complete a release,{" "}
        <Link href="/forms/liability">review the guest form</Link>. This
        checklist does not replace it.
      </p>
    </div>
  );
}
