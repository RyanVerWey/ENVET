import { ArrowUpRight, MapPin } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { organization as org } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Contact ENVET",
  "Call, email, or message Eagle’s Nest Veterans’ Equine Therapy in Lovettsville, Virginia. Arrange a visit or ask how to support the program.",
  "/contact",
);
export default function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="A CONVERSATION STARTS HERE."
        intro="A question about visiting, a way to help, or just an introduction. Reach the ENVET team in the way that works for you."
        path="/contact"
      />
      <section className="wrap contact-layout">
        <div className="contact-options">
          {[
            {
              label: "Give us a call",
              value: org.phone,
              href: org.phoneHref,
              note: "For visit questions and a personal conversation.",
            },
            {
              label: "Send an email",
              value: org.email,
              href: `mailto:${org.email}`,
              note: "For introductions, volunteering, and partnerships.",
            },
            {
              label: "Message the team",
              value: "Facebook Messenger",
              href: org.messenger,
              note: "Continue the conversation on Facebook.",
            },
            {
              label: "Reach us on WhatsApp",
              value: "Open WhatsApp",
              href: org.whatsapp,
              note: "Uses ENVET’s listed contact number.",
            },
          ].map((item) => (
            <a className="contact-option" href={item.href} key={item.label}>
              <span className="eyebrow">{item.label}</span>
              <strong>
                {item.value}
                <ArrowUpRight size={22} aria-hidden="true" />
              </strong>
              <span>{item.note}</span>
            </a>
          ))}
        </div>
        <aside className="location-panel">
          <MapPin size={32} aria-hidden="true" />
          <p className="eyebrow">OUR CORNER OF VIRGINIA</p>
          <h2>Lovettsville.</h2>
          <address>{org.address}</address>
          <p>
            Visits by arrangement.
            <br />
            Please contact ENVET before traveling.
          </p>
          <a
            className="text-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(org.address)}`}
          >
            Open directions <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <hr />
          <h3>A note on privacy</h3>
          <p>
            Keep your first message simple. Don’t include military identity
            documents, medical records, Social Security numbers, or financial
            details. Ask how any necessary information should be shared.
          </p>
        </aside>
      </section>
      <section className="wrap closing-cta">
        <div>
          <p className="eyebrow">LIFE BETWEEN VISITS</p>
          <h2>Stay close to the farm.</h2>
          <p>Follow the official page for community moments and updates.</p>
        </div>
        <a href={org.facebook} className="action">
          Follow ENVET on Facebook <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
