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
        Review ENVET’s forms at your own pace. When signing opens, your Google
        account, initials and signature accompany a private record for the team.
      </p>
      <div className="form-options">
        <Link href="/forms/liability" className="form-option">
          <FileHeart size={30} />
          <span className="form-option-type">For guests & families</span>
          <h2>Equine activity release</h2>
          <p>
            Participant details, the supplied release, initials and a guest
            signature. A separate parent or guardian signature for guests under
            18.
          </p>
          <span className="form-option-action">Review the release →</span>
        </Link>
        <Link href="/forms/donation" className="form-option">
          <Sprout size={30} />
          <span className="form-option-type">For horse owners</span>
          <h2>Equine candidate donation</h2>
          <p>
            Tell ENVET about your horse, its history and care. The team
            evaluates candidates separately; applying does not transfer
            ownership.
          </p>
          <span className="form-option-action">
            Start a candidate application →
          </span>
        </Link>
      </div>
      <div className="forms-assurance">
        <p>
          <PenLine size={19} />
          Typed or hand-drawn signatures
        </p>
        <p>
          <LockKeyhole size={19} />
          Private records · no saved drafts
        </p>
      </div>
      <p className="field-hint">
        Signing remains disabled while documents and activation checks are
        reviewed. Need a paper form or help?{" "}
        <Link href="/contact">Contact ENVET</Link>.
      </p>
    </section>
  );
}
