import Link from "next/link";
import { Action, FAQ, PageIntro, Photo } from "@/components/ui";
import { organization as org } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { publishedContent } from "@/lib/community/public-content";
import { PreVisitChecklist } from "@/components/forms/pre-visit-checklist";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Plan a visit",
  "Contact ENVET about equine therapy options for Veterans and families in Lovettsville, Virginia. Learn what to ask before your first visit.",
  "/visit",
);
export default async function Visit() {
  const { horses, services } = await publishedContent();
  return (
    <>
      <PageIntro
        eyebrow="Plan a visit"
        title="Make time for a different kind of connection."
        intro="Learn about equine therapy options at Eagle’s Nest, ask your questions, and arrange a visit with the ENVET team."
        path="/visit"
      />
      <section className="wrap story-split visit-story">
        <div>
          <p className="eyebrow">FOR VETERANS & FAMILIES</p>
          <h2>Let’s plan your first visit.</h2>
          <p>
            ENVET offers equine therapy options with rescued or donated horses.
            Veterans and family members can contact the team to discuss current
            participation opportunities.
          </p>
          <p>
            Activities, availability, eligibility, and access arrangements are
            confirmed by ENVET directly. Reaching out does not commit you to a
            visit.
          </p>
          <div className="actions">
            <Action href={org.phoneHref} external>
              Call the team
            </Action>
            <Action href={org.messenger} external secondary>
              Message ENVET
            </Action>
          </div>
          <p className="small">
            Prefer email? <a href={`mailto:${org.email}`}>{org.email}</a>
          </p>
        </div>
        <Photo
          src="/images/farm.jpg"
          alt="The outdoor setting at Eagle’s Nest in Lovettsville"
          priority
        />
      </section>
      {(horses.length > 0 || services.length > 0) && (
        <section
          className="wrap published-content"
          aria-labelledby="published-content-heading"
        >
          <p className="eyebrow">AT EAGLE’S NEST</p>
          <h2 id="published-content-heading">Meet the program.</h2>
          {services.length > 0 && (
            <div className="published-group">
              <h3>Current services</h3>
              <div className="published-list">
                {services.map((service) => (
                  <article key={service.slug}>
                    <h4>{service.title}</h4>
                    <p>{service.summary}</p>
                    {service.details && (
                      <p className="small">{service.details}</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
          {horses.length > 0 && (
            <div className="published-group">
              <h3>Horses</h3>
              <div className="published-list">
                {horses.map((horse) => (
                  <article key={horse.slug}>
                    <h4>{horse.name}</h4>
                    <p>{horse.summary}</p>
                    {horse.details && <p className="small">{horse.details}</p>}
                  </article>
                ))}
              </div>
            </div>
          )}
          <p className="small">
            Ask ENVET which activities are available and appropriate for your
            visit.
          </p>
        </section>
      )}
      <section className="wrap visit-planning pre-visit-on-visit">
        <PreVisitChecklist />
        <p className="small">
          Ask about terrain, seating, restrooms, mobility access and
          accommodations before traveling. Confirm your time and meeting
          location with ENVET. Please do not arrive unannounced.
        </p>
      </section>
      <section className="wrap faq-section">
        <div>
          <p className="eyebrow">Frequently asked questions</p>
          <h2>Know what to expect.</h2>
        </div>
        <FAQ
          items={[
            {
              question: "Do I need experience with horses?",
              answer: (
                <p>
                  Tell the team about your experience, including if you’ve never
                  been around horses. They can explain suitable activities and
                  how a visit is supported.
                </p>
              ),
            },
            {
              question: "Will I be riding?",
              answer: (
                <p>
                  Don’t assume a visit includes riding. Ask ENVET which
                  activities are available and appropriate for your visit.
                </p>
              ),
            },
            {
              question: "Should I send my DD214 or medical records?",
              answer: (
                <p>
                  No. Do not email or message military identity documents,
                  medical records, or other sensitive information through this
                  site’s contact links. Ask ENVET about any verification process
                  first.
                </p>
              ),
            },
            {
              question: "Is this a replacement for medical care?",
              answer: (
                <p>
                  This website does not provide diagnosis, treatment advice, or
                  a promise of clinical outcomes. Discuss your healthcare needs
                  with a qualified professional and ask ENVET about the scope of
                  its program.
                </p>
              ),
            },
          ]}
        />
      </section>
      <section className="wrap closing-cta">
        <div>
          <p className="eyebrow">Contact ENVET</p>
          <h2>We’d be glad to hear from you.</h2>
          <p>
            Read our{" "}
            <Link href="/blog/first-visit-to-envet">first-visit guide</Link> or
            reach out directly. When the team asks you to complete a release,
            use the <Link href="/forms/liability">guest form</Link>.
          </p>
        </div>
        <Action href="/contact">All contact options</Action>
      </section>
    </>
  );
}
