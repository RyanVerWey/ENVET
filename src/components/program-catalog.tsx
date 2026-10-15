import Link from "next/link";
import { Action } from "./ui";
import type { PublishedContent } from "@/lib/community/public-content";
export function ProgramCatalog({
  services,
}: {
  services: PublishedContent["services"];
}) {
  return (
    <section
      className="wrap program-catalog"
      aria-labelledby="program-catalog-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">FIND YOUR NEXT STEP</p>
          <h2 id="program-catalog-heading">Our programs</h2>
        </div>
        <p>
          Tell the team about your experience with horses. Discuss goals,
          suitable activities and the next available session.
        </p>
      </div>
      {services.length ? (
        services.map((service, index) => (
          <article className="program-row" key={service.slug} id={service.slug}>
            <span className="program-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              {service.details && (
                <details name="envet-accordion" className="program-details">
                  <summary>
                    Session format & team
                    <span className="sr-only"> for {service.title}</span>
                  </summary>
                  <div>
                    {service.details
                      .split(/\n+/)
                      .filter(Boolean)
                      .map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                  </div>
                </details>
              )}
              <Link className="text-link" href="/contact">
                Talk with ENVET
                <span className="sr-only"> about {service.title}</span> →
              </Link>
            </div>
          </article>
        ))
      ) : (
        <div className="program-contact">
          <h3>Find your opportunity with the team.</h3>
          <p>
            Speak with ENVET about current programs and arrangements for your
            visit.
          </p>
          <Action href="/contact">Start a conversation</Action>
        </div>
      )}
    </section>
  );
}
