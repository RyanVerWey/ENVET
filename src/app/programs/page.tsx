import Link from "next/link";
import { Action, PageIntro, Photo } from "@/components/ui";
import { publishedContent } from "@/lib/community/public-content";
import { ProgramCatalog } from "@/components/program-catalog";
import { pageMetadata } from "@/lib/seo";
import { programServiceSchema } from "@/lib/page-schema";
import {
  organization as org,
  absoluteUrl,
  jsonLd,
  launchEnabled,
} from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Equine-assisted programs for Veterans & military families",
  "Explore ENVET’s free equine-assisted programs: psychotherapy, therapeutic horsemanship, deployment and family support, and specialty workshops in Lovettsville, Virginia.",
  "/programs",
);
export default async function Programs() {
  const { services } = await publishedContent();
  return (
    <>
      <PageIntro
        eyebrow="Our programs"
        title="Horse Heroes. New possibilities."
        intro="Meaningful equine-assisted activities and therapies, completely free of charge to those we serve. Find the right opportunity with the ENVET team."
        path="/programs"
      />
      <section className="wrap story-split programs-approach">
        <div>
          <p className="eyebrow">OUR THERAPEUTIC APPROACH</p>
          <h2>Practical skills. Personal goals.</h2>
          <p>
            Through equine interaction, participants work on coping strategies,
            positive communication and connection. Every session is adapted to
            individual goals.
          </p>
          <p>
            ENVET’s mental-health programs incorporate the EAGALA model,
            bringing together a licensed Mental Health Professional, a certified
            Equine Specialist and our Horse Heroes for ground-level experiences.
            EAGALA-model psychotherapy is unmounted, separate from therapeutic
            horsemanship’s riding activities.
          </p>
          <a
            className="text-link"
            href="https://www.eagala.org/about-us/what-is-the-eagala-model/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn about the EAGALA model
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <Photo
          src="/images/farm.jpg"
          alt="People and horses beside the paddock at Eagle’s Nest"
          priority
        />
      </section>
      <ProgramCatalog services={services} />
      <section className="participation-section">
        <div className="wrap programs-community">
          <p className="eyebrow">COMMUNITY & CONNECTION</p>
          <h2>Connection beyond the pasture.</h2>
          <p>
            Whenever time permits, sessions include communal time with homemade
            meals or snacks. It’s a relaxed place to connect with peers, reflect
            on equine experiences and share stories of military service.
          </p>
          <Link href="/gallery" className="text-link">
            Life at the farm →
          </Link>
        </div>
      </section>
      <section className="wrap closing-cta">
        <div>
          <p className="eyebrow">LET’S FIND WHAT FITS</p>
          <h2>Start with a conversation.</h2>
          <p>
            {org.audience} are welcome to contact ENVET. Eligibility and
            arrangements are confirmed privately; please don’t send medical or
            military identity documents.
          </p>
          <p>
            Participation is by arrangement. Programs are not a promise of a
            particular outcome or a substitute for emergency care.
          </p>
        </div>
        <div className="actions">
          <Action href="/visit">Plan your visit</Action>
          <Action href="/account" secondary>
            Your participant account
          </Action>
        </div>
      </section>
      {launchEnabled && services.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "@id": absoluteUrl("/programs#program-list"),
              name: "ENVET programs",
              mainEntityOfPage: { "@id": absoluteUrl("/programs#webpage") },
              itemListElement: services.map((service, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: service.title,
                url: absoluteUrl(`/programs#${service.slug}`),
                item: programServiceSchema(service),
              })),
            }),
          }}
        />
      )}
    </>
  );
}
