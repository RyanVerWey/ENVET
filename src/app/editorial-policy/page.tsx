import { PageIntro } from "@/components/ui";
import { organization } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Editorial standards",
  "How ENVET’s journal uses source-grounded answers, clear authorship, useful links, and careful language for veterans and families.",
  "/editorial-policy",
);
export default function Editorial() {
  return (
    <>
      <PageIntro
        eyebrow="Editorial standards"
        title="USEFUL ANSWERS. HONEST LIMITS."
        intro="The journal helps people understand ENVET, prepare questions, and support the mission. It is not a clinical advice publication."
        path="/editorial-policy"
      />
      <section className="wrap legal-layout">
        <aside>
          Updated September 6, 2026.
          <br />
          Initial articles prepared for owner review.
        </aside>
        <div className="prose">
          <h2>Who writes these guides?</h2>
          <p>
            The ENVET website editorial team prepares program information under
            the shared byline “ENVET editorial.” Initial website copy was
            developed with AI assistance from the project brief and ENVET’s
            official public information. The organization owner must review and
            approve it before public launch. The byline does not imply a medical
            qualification.
          </p>
          <h2>Sources you can follow</h2>
          <p>
            Articles link to the official sources behind organizational facts.
            Visit details, eligibility, accommodations, and current needs should
            always be confirmed with ENVET. We distinguish published facts from
            questions a visitor should ask.
          </p>
          <h2>Helpful, not inflated</h2>
          <p>
            We don’t invent success rates, testimonials, horse names, staff
            credentials, clinical outcomes, or donation impact amounts. We don’t
            publish generic pages for towns we don’t serve or repeat keywords to
            manufacture relevance.
          </p>
          <h2>Dates and corrections</h2>
          <p>
            Each guide shows a publication date and, when materially revised, an
            updated date. Dates are not refreshed merely to suggest new content.
            Report a factual error or outdated link to{" "}
            <a href={`mailto:${organization.email}`}>{organization.email}</a>.
          </p>
          <h2>Photographs and dignity</h2>
          <p>
            Photos come from ENVET’s official page. Publication requires owner
            clearance of rights and consent. A person’s appearance in a photo is
            not a claim about their military service, diagnosis, or
            participation in treatment. We do not use identifying images of
            children without explicit approval.
          </p>
          <h2>Healthcare boundaries</h2>
          <p>
            The journal offers general program information, not diagnosis or
            treatment advice. Healthcare decisions belong with qualified
            professionals. Contact ENVET for the scope of its program and speak
            with your healthcare professional about your individual needs.
          </p>
        </div>
      </section>
    </>
  );
}
