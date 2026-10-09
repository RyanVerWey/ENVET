import { Action, PageIntro } from "@/components/ui";
import { formTitles, type FormKind } from "@/lib/forms/definition";
import { SourceDisclosure } from "./document-view";

export function FormOverview({ kind }: { kind: FormKind }) {
  return (
    <>
      <PageIntro
        eyebrow="ENVET forms"
        title={formTitles[kind]}
        intro={
          kind === "liability"
            ? "Read the equine activity release and discuss your visit with ENVET."
            : "Learn what ENVET needs to know about a horse being considered for the program."
        }
        path={`/forms/${kind}`}
      />
      <section
        className="wrap form-overview"
        aria-labelledby="paperwork-heading"
      >
        <div className="form-overview-intro">
          <h2 id="paperwork-heading">Complete your paperwork with the team.</h2>
          <p>
            {kind === "liability"
              ? "Contact ENVET for the release and signing arrangements before your visit. A parent or lawful guardian must complete the required paperwork for a guest under 18."
              : "Talk with ENVET about your horse’s history, care, and suitability. The team will explain the application and evaluation process. An application does not transfer ownership."}
          </p>
          <p>
            Online submissions are not accepted. Please do not email completed
            forms containing personal information; ask the team how to provide
            them securely.
          </p>
          <Action href="/contact">Contact ENVET about this form</Action>
        </div>
        <SourceDisclosure kind={kind} />
      </section>
    </>
  );
}
