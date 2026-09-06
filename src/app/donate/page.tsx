import Link from "next/link";
import { Action, FAQ, PageIntro, Photo } from "@/components/ui";
import { organization as org } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Support the mission",
  "Help keep ENVET’s equine therapy program going for veterans and their families. Donate through the organization’s official PayPal page.",
  "/donate",
);
export default function Donate() {
  return (
    <>
      <PageIntro
        eyebrow="Support ENVET"
        title="HELP KEEP THIS GATE OPEN."
        intro="The care behind every visit continues long after the day is done. Your generosity helps keep ENVET’s program going."
        path="/donate"
      />
      <section className="wrap donation-feature">
        <Photo
          src="/images/horse.jpg"
          alt="One of the horses at Eagle’s Nest"
          priority
        />
        <div className="donation-panel">
          <p className="eyebrow">FOR THE HORSES. FOR OUR HEROES.</p>
          <h2>
            A meaningful way
            <br />
            to say, “we’re here.”
          </h2>
          <p>
            Support equine therapy options for veterans and their families
            through ENVET’s official donation page.
          </p>
          <Action href={org.donate} external>
            Donate securely with PayPal
          </Action>
          <p className="small">
            You’ll leave this website to choose your gift and complete it on
            PayPal. ENVET’s website never receives your card details.
          </p>
          <div className="donation-note">
            <h3>Give in the way that fits.</h3>
            <p>
              No suggested amount. No pressure. Contact the team if you’d like
              to discuss an in-kind gift or another way to contribute.
            </p>
          </div>
        </div>
      </section>
      <section className="wrap support-ways">
        <p className="eyebrow">MORE THAN ONE WAY TO HELP</p>
        <h2>Bring what you can.</h2>
        <div className="value-row">
          <span>01</span>
          <h3>Share the mission</h3>
          <p>
            Help a veteran, family, or potential supporter find ENVET.{" "}
            <a href={org.facebook}>
              Follow and share the official Facebook page.
            </a>
          </p>
        </div>
        <div className="value-row">
          <span>02</span>
          <h3>Offer your time</h3>
          <p>
            Ask about current volunteer opportunities, requirements, and
            scheduling.{" "}
            <Link href="/contact">Start a conversation with the team.</Link>
          </p>
        </div>
        <div className="value-row">
          <span>03</span>
          <h3>Ask about current needs</h3>
          <p>
            Before purchasing or dropping off supplies, check what ENVET can use
            and accept. Thoughtful coordination makes your generosity go
            further.
          </p>
        </div>
      </section>
      <section className="wrap faq-section">
        <div>
          <p className="eyebrow">GIVING, WITH CLARITY</p>
          <h2>
            Know where
            <br />
            you’re giving.
          </h2>
        </div>
        <FAQ
          items={[
            {
              question: "Is this the official donation link?",
              answer: (
                <p>
                  The button uses the PayPal donation destination linked by
                  ENVET’s official Facebook page. Confirm the recipient details
                  on PayPal before completing your gift.
                </p>
              ),
            },
            {
              question: "Can I set up a recurring gift?",
              answer: (
                <p>
                  Check the options offered on the official PayPal donation
                  page. If the arrangement you want isn’t available, contact
                  ENVET directly.
                </p>
              ),
            },
            {
              question: "How do I get documentation for my donation?",
              answer: (
                <p>
                  Keep your payment confirmation and ask ENVET for any
                  organizational documentation you need. This website does not
                  determine tax deductibility or provide tax advice.
                </p>
              ),
            },
            {
              question: "Can I donate a horse or equipment?",
              answer: (
                <p>
                  Please talk with ENVET first. Acceptance depends on current
                  needs, capacity, and suitability; do not arrange a delivery
                  without confirmation.
                </p>
              ),
            },
          ]}
        />
      </section>
    </>
  );
}
