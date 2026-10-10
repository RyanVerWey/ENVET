import Link from "next/link";
import type { Metadata } from "next";
import { FileHeart, Sprout, LockKeyhole, PenLine } from "lucide-react";
export const metadata: Metadata = {
  title: "ENVET forms",
  robots: { index: false, follow: false },
};
export default function FormsPage() {
  return (
    <section className="wrap forms-home">
      <p className="eyebrow">Before the next chapter</p>
      <h1>
        A thoughtful start.
        <br />A clear record.
      </h1>
      <p className="forms-lead">
        Read ENVET’s guest release and horse-candidate application at your own
        pace. The team can help you understand the paperwork and next steps.
      </p>
      <div className="pre-visit-link">
        <div>
          <p className="eyebrow">For program participants</p>
          <h2>Start with the pre-visit checklist.</h2>
          <p>
            Confirm your connection and goals, then plan clothing, local weather
            and protective equipment with ENVET.
          </p>
        </div>
        <Link className="action" href="/forms/pre-visit">
          Prepare for your visit →
        </Link>
      </div>
      <div className="form-options">
        <Link href="/forms/liability" className="form-option">
          <FileHeart size={30} aria-hidden="true" />
          <span className="form-option-type">For guests & families</span>
          <h2>Equine activity release</h2>
          <p>
            Understand the equine activity release, participant information, and
            parent or guardian requirements for guests under 18.
          </p>
          <span className="form-option-action">Open the guided release →</span>
        </Link>
        <Link href="/forms/donation" className="form-option">
          <Sprout size={30} aria-hidden="true" />
          <span className="form-option-type">For horse owners</span>
          <h2>Equine candidate donation</h2>
          <p>
            Tell ENVET about your horse, its history and care. The team
            evaluates candidates separately; applying does not transfer
            ownership.
          </p>
          <span className="form-option-action">
            Open the guided application →
          </span>
        </Link>
      </div>
      <div className="forms-assurance">
        <p>
          <PenLine size={19} aria-hidden="true" />
          Typed or hand-drawn signatures
        </p>
        <p>
          <LockKeyhole size={19} aria-hidden="true" />
          Details stay on this page until submission
        </p>
      </div>
      <p className="field-hint">
        Need help completing a form?{" "}
        <Link href="/contact">Contact ENVET for signing arrangements</Link>.
      </p>
    </section>
  );
}
