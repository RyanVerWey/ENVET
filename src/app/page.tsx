import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { Action, FAQ, Photo, PostList } from "@/components/ui";
import { getPosts } from "@/lib/blog";
import { organization as org } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Equine therapy for Veterans & families",
  org.description,
  "/",
);

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="wrap hero-heading">
          <div>
            <p className="eyebrow">Eagle’s Nest Veterans’ Equine Therapy</p>
            <h1>
              Equine therapy for Veterans <span>and their families.</span>
            </h1>
          </div>
          <div className="hero-introduction">
            <p className="lead">
              A calm and peaceful haven in the Virginia countryside. Connect
              with our Horse Heroes, learn new skills and find support in a
              family-friendly community. Our programs are free of charge to
              those we serve.
            </p>
            <div className="actions">
              <Action href="/visit">Plan a visit</Action>
              <Action href="/donate" secondary>
                Support ENVET
              </Action>
            </div>
          </div>
        </div>
        <figure className="hero-photograph wrap">
          <Photo
            src="/images/connection.jpg"
            alt="A helmeted rider leans toward a paint horse, with a handler beside them at Eagle’s Nest"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <figcaption>
            <span>
              <MapPin size={15} aria-hidden="true" /> Eagle’s Nest ·
              Lovettsville, Virginia
            </span>
            <Link href="/gallery">
              Life at the farm <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </figcaption>
        </figure>
      </section>

      <section className="mission-section wrap">
        <div>
          <p className="eyebrow">Our mission</p>
          <h2>
            Supporting those who served.
            <br />
            Building connection through horses.
          </h2>
        </div>
        <div className="mission-copy">
          <p>
            Eagle’s Nest Veterans’ Equine Therapy supports {org.audience}
            through equine-assisted activities and therapies.
          </p>
          <p>
            Our Horse Heroes are at the heart of this work. As a donor-supported
            nonprofit, we rely on public and private contributions to keep our
            programs completely free of charge.
          </p>
          <Link href="/about" className="text-link">
            Learn about ENVET <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="participation-section">
        <div className="wrap participation-layout">
          <div className="participation-copy">
            <p className="eyebrow">For Veterans & families</p>
            <h2>Your visit starts with a conversation.</h2>
            <p>
              Get to know the program before you come to the farm. Contact ENVET
              to discuss participation, available activities, and any questions
              about your visit.
            </p>
            <ol className="steps">
              <li>
                <span>01</span>
                <div>
                  <h3>Connect with the team</h3>
                  <p>Call or message us to introduce yourself.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Discuss what works for you</h3>
                  <p>
                    Ask about eligibility, family participation, and access.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Arrange your visit</h3>
                  <p>Confirm the date and details before traveling.</p>
                </div>
              </li>
            </ol>
            <Action href="/visit">Explore visiting ENVET</Action>
          </div>
          <figure className="participation-photo">
            <Photo
              src="/images/farm.jpg"
              alt="Two people tending horses beside a black fence at the Eagle’s Nest farm"
            />
            <figcaption>
              Time with horses, in the open space of the Virginia countryside.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="giving-section wrap">
        <Photo
          src="/images/horse.jpg"
          alt="A horse beside the pasture fence at Eagle’s Nest"
        />
        <div className="giving-copy">
          <p className="eyebrow">A community-supported mission</p>
          <h2>Help keep equine therapy accessible to Veterans.</h2>
          <p>
            Your generosity helps care for our Horse Heroes and sustain a
            peaceful place for our military community. Public and private
            contributions keep ENVET’s programs free of charge.
          </p>
          <Action href="/donate">Support our Horse Heroes</Action>
          <Link href="/contact" className="text-link">
            Ask about volunteering or in-kind support{" "}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <p className="small">
            Donations are made through ENVET’s official PayPal page.
          </p>
        </div>
      </section>

      <section className="journal-section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The ENVET journal</p>
            <h2>Resources for your next step.</h2>
          </div>
          <Link href="/blog" className="text-link">
            View all resources <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <PostList posts={getPosts().slice(0, 3)} />
      </section>

      <section className="faq-section wrap">
        <div>
          <p className="eyebrow">Frequently asked questions</p>
          <h2>Before your first visit.</h2>
          <p>We’re happy to answer your questions directly.</p>
          <Link className="text-link" href="/contact">
            Contact the team <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <FAQ
          items={[
            {
              question: "What is ENVET?",
              answer: (
                <p>
                  Eagle’s Nest Veterans’ Equine Therapy is a nonprofit in
                  Lovettsville, Virginia, providing equine therapy options for
                  {org.audience}.
                </p>
              ),
            },
            {
              question: "Who can contact ENVET about a visit?",
              answer: (
                <p>
                  Veterans and family members are welcome to reach out. Contact
                  the team to confirm current eligibility, family participation,
                  available activities, and scheduling.
                </p>
              ),
            },
            {
              question: "Is there a cost to take part?",
              answer: (
                <p>
                  ENVET’s equine-assisted programs are completely free of charge
                  to those we serve. Donations make that possible. Contact the
                  team to arrange participation before attending.
                </p>
              ),
            },
            {
              question: "Can I come by without an appointment?",
              answer: (
                <p>
                  Please contact ENVET first. Visits are arranged with the team;
                  this website does not book or confirm appointments.
                </p>
              ),
            },
            {
              question: "How can I support the program?",
              answer: (
                <p>
                  <Link href="/donate">Make a donation</Link> through the
                  official PayPal page, share ENVET’s work, or{" "}
                  <Link href="/contact">
                    ask about volunteering and in-kind needs
                  </Link>
                  .
                </p>
              ),
            },
          ]}
        />
      </section>

      <section className="contact-band">
        <div className="wrap">
          <div>
            <h2>Let’s take the next step together.</h2>
            <p>
              Reach out about visiting, supporting, or partnering with ENVET.
            </p>
          </div>
          <a href={org.phoneHref} className="action">
            Call {org.phone} <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
