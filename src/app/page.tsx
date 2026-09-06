import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Action, FAQ, Photo, PostList } from "@/components/ui";
import { getPosts } from "@/lib/blog";
import { organization as org } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "A place to reconnect",
  org.description,
  "/",
);
export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-star">✦</span> Horses. Hope. A place to
            belong.
          </p>
          <h1>
            YOU’VE SERVED.
            <br />
            THIS SPACE
            <br />
            IS <span>FOR YOU.</span>
          </h1>
          <p className="lead">
            A little fresh air. A connection that asks for no words. Equine
            therapy options for veterans and their families, here at Eagle’s
            Nest.
          </p>
          <div className="actions">
            <Action href="/visit">Find your first step</Action>
            <Link href="/about" className="text-link">
              Meet ENVET <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <p className="hero-location">
            <MapPin size={16} aria-hidden="true" /> Lovettsville, Virginia{" "}
            <span>·</span> United by service
          </p>
        </div>
        <div className="hero-visual">
          <Photo
            src="/images/connection.jpg"
            alt="A helmeted rider leans toward a paint horse, with a handler beside them at Eagle’s Nest"
            priority
            sizes="(max-width: 760px) 100vw, 55vw"
          />
          <div className="photo-note">
            <span>FROM OUR LITTLE CORNER OF VIRGINIA</span>
            <strong>
              A different kind
              <br />
              of connection.
            </strong>
          </div>
          <span className="image-index">01 / LIFE AT EAGLE’S NEST</span>
        </div>
      </section>
      <div className="mission-strip">
        <div className="wrap">
          <span>For veterans & their families</span>
          <span aria-hidden="true">✦</span>
          <span>Rescued & donated horses</span>
          <span aria-hidden="true">✦</span>
          <span>Community makes it possible</span>
        </div>
      </div>
      <section className="intro-section wrap">
        <p className="eyebrow">WELCOME TO EAGLE’S NEST</p>
        <div>
          <h2>
            Not another thing to navigate.
            <br />A place to <span className="accent-text">just begin.</span>
          </h2>
          <div className="intro-columns">
            <p>
              ENVET is a nonprofit providing equine therapy options for United
              States veterans and their families. Our work brings people and
              rescued or donated horses together in Lovettsville, Virginia.
            </p>
            <p>
              You don’t have to have every answer before reaching out. Tell us
              you’re interested. We’ll talk through the program, your questions,
              and what a first visit could look like.
            </p>
          </div>
          <Link href="/about" className="text-link">
            The story behind ENVET <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="visit-feature wrap">
        <Photo
          src="/images/farm.jpg"
          alt="Two people tending horses beside a black fence, with the Eagle’s Nest farmhouse beyond"
        />
        <div className="visit-copy">
          <p className="eyebrow">COME AS YOU ARE</p>
          <h2>
            One conversation.
            <br />
            An open gate.
          </h2>
          <p>
            Curious about the horses? Reaching out for a family member? Start
            with a conversation, not a commitment.
          </p>
          <ol className="steps">
            <li>
              <span>01</span>
              <div>
                <h3>Say hello</h3>
                <p>Call or message the ENVET team.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Ask your questions</h3>
                <p>Discuss eligibility, access, and available visits.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Make a plan together</h3>
                <p>Confirm the details before coming to the farm.</p>
              </div>
            </li>
          </ol>
          <Action href="/visit">Plan a visit</Action>
        </div>
      </section>
      <section className="support-section">
        <div className="wrap support-inner">
          <div>
            <p className="eyebrow">KEEP THE GATE OPEN</p>
            <h2>
              THEY SHOWED UP
              <br />
              FOR OUR COUNTRY.
              <br />
              <span>
                LET’S SHOW UP
                <br />
                FOR THEM.
              </span>
            </h2>
          </div>
          <div className="support-detail">
            <span className="large-star" aria-hidden="true">
              ✦
            </span>
            <p>
              Free access to horses takes a community behind it. Your generosity
              helps keep ENVET’s program going for veterans and their families.
            </p>
            <Action href="/donate">Support the mission</Action>
            <p className="small">
              Give through ENVET’s official PayPal donation page. Every act of
              support matters.
            </p>
          </div>
        </div>
      </section>
      <section className="journal-section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FROM THE JOURNAL</p>
            <h2>
              A little understanding.
              <br />A good place to start.
            </h2>
          </div>
          <Link href="/blog" className="text-link">
            Explore the journal <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <PostList posts={getPosts().slice(0, 3)} />
      </section>
      <section className="faq-section wrap">
        <div>
          <p className="eyebrow">BEFORE YOU REACH OUT</p>
          <h2>
            Questions
            <br />
            are welcome.
          </h2>
          <p>
            Need something else?
            <br />
            <Link className="text-link" href="/contact">
              Talk with our team <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </p>
        </div>
        <FAQ
          items={[
            {
              question: "What is ENVET?",
              answer: (
                <p>
                  Eagle’s Nest Veterans’ Equine Therapy is a nonprofit in
                  Lovettsville, Virginia, providing equine therapy options for
                  United States veterans and their families.
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
                  ENVET’s official page describes free access to rescued or
                  donated horses for veterans. Ask the team about your specific
                  visit and any arrangements before attending.
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
              question: "How can I help keep the program going?",
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
    </>
  );
}
