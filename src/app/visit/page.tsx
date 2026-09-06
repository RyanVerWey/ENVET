import Link from "next/link";
import { Action, FAQ, PageIntro, Photo } from "@/components/ui";
import { organization as org } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Plan a visit",
  "Contact ENVET about equine therapy options for veterans and families in Lovettsville, Virginia. Learn what to ask before your first visit.",
  "/visit",
);
export default function Visit() {
  return (
    <>
      <PageIntro
        eyebrow="Plan a visit"
        title="YOUR FIRST STEP CAN BE A SIMPLE HELLO."
        intro="You don’t need to know exactly what to ask. Tell the ENVET team you’re interested, and start there."
        path="/visit"
      />
      <section className="wrap story-split">
        <div>
          <p className="eyebrow">FOR VETERANS & FAMILIES</p>
          <h2>
            Let’s find out
            <br />
            what’s right for you.
          </h2>
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
      <section className="wrap visit-planning">
        <div>
          <p className="eyebrow">BEFORE YOU HEAD OUT</p>
          <h2>
            A few things
            <br />
            to talk through.
          </h2>
        </div>
        <ol className="steps">
          <li>
            <span>01</span>
            <div>
              <h3>Participation & availability</h3>
              <p>
                Ask who can participate, whether a family member can join, and
                which activities are currently available. Let the team explain
                any eligibility verification privately.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Comfort & access</h3>
              <p>
                Ask about terrain, seating, restrooms, mobility access, and
                accommodations you need. Confirm what the team can provide
                before traveling.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>The details of your visit</h3>
              <p>
                Confirm your time, meeting location, clothing and footwear,
                weather plans, and what to bring. Please do not arrive
                unannounced.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <section className="wrap faq-section">
        <div>
          <p className="eyebrow">GOOD QUESTIONS</p>
          <h2>
            No need to
            <br />
            guess.
          </h2>
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
          <p className="eyebrow">MAKE A PLAN, NOT A GUESS</p>
          <h2>We’d be glad to hear from you.</h2>
          <p>
            Read our{" "}
            <Link href="/blog/first-visit-to-envet">first-visit guide</Link> or
            reach out directly.
          </p>
        </div>
        <Action href="/contact">All contact options</Action>
      </section>
    </>
  );
}
