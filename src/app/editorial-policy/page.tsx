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
        title="Our editorial standards"
        intro="The journal helps people understand ENVET, prepare questions, and support the mission. It is not a clinical advice publication."
        path="/editorial-policy"
      />
      <section className="wrap legal-layout">
        <aside>Updated October 9, 2026.</aside>
        <div className="prose">
          <h2>About the journal</h2>
          <p>
            The ENVET journal shares practical information for veterans,
            families, and supporters. Guides draw on ENVET’s program information
            and official public sources. They help you prepare for a
            conversation with the team, not replace professional healthcare
            advice.
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
            Photographs show the horses, people, and setting at Eagle’s Nest. We
            respect the privacy and dignity of everyone pictured. A person’s
            appearance in a photo is not a claim about their military service,
            diagnosis, or participation in treatment. We do not use identifying
            images of children without permission.
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
