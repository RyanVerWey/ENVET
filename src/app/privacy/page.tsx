import { PageIntro } from "@/components/ui";
import { organization } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { dataConfig } from "@/lib/community/config";
export const metadata = pageMetadata(
  "Privacy & accessibility",
  "How the ENVET website handles privacy, external services, theme preferences, and accessibility feedback.",
  "/privacy",
);
export default function Privacy() {
  const communityEnabled = !!dataConfig();
  return (
    <>
      <PageIntro
        eyebrow="Privacy & accessibility"
        title="Privacy & accessibility"
        intro="A straightforward explanation of this website, what it stores, and where outside services take over."
        path="/privacy"
      />
      <section className="wrap legal-layout">
        <aside>
          Updated October 9, 2026.
          <br />
          Owner-review version.
        </aside>
        <div className="prose">
          <h2>A human introduction, not medical intake</h2>
          <p>
            Please don’t send medical records, military identity documents, or
            financial details through this site, email, or messaging. ENVET
            follows up with people directly about visits and program questions.
          </p>
          <h2>Inquiries and follow-up</h2>
          <p>
            {communityEnabled
              ? "The online inquiry form collects"
              : "When activated, the online inquiry form will collect"}{" "}
            your name, email address or phone number, service or activity of
            interest, an optional short note, and your permission to be
            contacted. ENVET uses this to respond by phone or email or arrange a
            visit. Team members can mark an inquiry new, contacted, booked, or
            closed. Inquiries remain until an authorized team member manually
            deletes them. Backup copies may expire on a separate provider
            schedule.
          </p>
          <h2>Google sign-in and journal discussion</h2>
          <p>
            {communityEnabled
              ? "Google sign-in lets"
              : "When activated, Google sign-in will let"}{" "}
            members like and comment on journal guides. Comments appear
            immediately in public as plain text and show only “Community
            member,” never a Google email address or profile picture. The text a
            member writes is public, so it should not include private
            information. Members can remove their own comments; ENVET can hide
            comments and review reports. Google and Supabase process sign-in
            information under their own service terms.
          </p>
          <h2>Anonymous page counts</h2>
          <p>
            {communityEnabled
              ? "The site counts"
              : "When activated, the site will count"}{" "}
            daily views of public pages by path. These counts do not identify
            unique visitors or store search queries, account routes, cookies, or
            visitor profiles. Hashed, time-windowed rate counters limit form and
            discussion abuse; expired counters are removed on subsequent writes.
            The application does not retain raw IP addresses in those counters.
            Hosting may keep its own technical logs.
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
            Production hosting, access controls, backup expiry, and retention
            settings must be reviewed before launch. No advertising tracker is
            included in this release.
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
            call <a href={organization.phoneHref}>{organization.phone}</a>. You
            can also ask ENVET to correct or manually delete an inquiry.
          </p>
        </div>
      </section>
    </>
  );
}
