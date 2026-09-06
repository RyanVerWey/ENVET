import { PageIntro } from "@/components/ui";
import { organization } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Privacy & accessibility",
  "How the ENVET website handles privacy, external services, theme preferences, and accessibility feedback.",
  "/privacy",
);
export default function Privacy() {
  return (
    <>
      <PageIntro
        eyebrow="Privacy & accessibility"
        title="YOUR TRUST MATTERS."
        intro="A straightforward explanation of this website, what it stores, and where outside services take over."
        path="/privacy"
      />
      <section className="wrap legal-layout">
        <aside>
          Updated September 6, 2026.
          <br />
          Owner-review version.
        </aside>
        <div className="prose">
          <h2>A website, not an intake system</h2>
          <p>
            This release has no accounts, medical intake forms, document
            uploads, newsletter signups, or site database. Please don’t send
            medical records, military identity documents, or financial details
            through ordinary email or messaging.
          </p>
          <h2>Your theme preference</h2>
          <p>
            The light/dark control saves your choice in your browser’s local
            storage under <code>envet-theme</code>. This is used only to
            remember your display preference. Clear your site storage to remove
            it. If storage is unavailable, the control still changes the current
            page.
          </p>
          <h2>External links and donations</h2>
          <p>
            Facebook, Messenger, WhatsApp, PayPal, Google Maps, and your email
            or phone application operate separately. Their privacy policies
            apply when you choose to use them. This website does not embed
            social feeds, load advertising trackers, or receive payment-card
            details.
          </p>
          <h2>Hosting and technical records</h2>
          <p>
            A web host may process routine technical information such as IP
            addresses and request logs to deliver and protect the site.
            Production hosting, access controls, and retention settings must be
            reviewed before launch. No marketing analytics are included in this
            release.
          </p>
          <h2>Accessibility</h2>
          <p>
            The site is designed for keyboard use, readable contrast,
            reduced-motion preferences, and both light and dark themes. If a
            page is difficult to use, contact the team and describe the page and
            what you were trying to do. You may use phone or email instead of
            navigating the website.
          </p>
          <h2>Questions or corrections</h2>
          <p>
            Email{" "}
            <a href={`mailto:${organization.email}`}>{organization.email}</a> or
            call <a href={organization.phoneHref}>{organization.phone}</a>. If
            you contact ENVET, the information you choose to share is handled in
            that communication channel, not a database on this site.
          </p>
        </div>
      </section>
    </>
  );
}
