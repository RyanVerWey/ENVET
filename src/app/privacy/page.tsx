import { PageIntro } from "@/components/ui";
import { organization } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { dataConfig } from "@/lib/community/config";
import { collectionEnabled } from "@/lib/forms/server";
export const metadata = pageMetadata(
  "Privacy & accessibility",
  "How the ENVET website handles privacy, external services, theme preferences, and accessibility feedback.",
  "/privacy",
);
export default function Privacy() {
  const communityEnabled = !!dataConfig();
  const formsEnabled =
    collectionEnabled("donation") || collectionEnabled("liability");
  return (
    <>
      <PageIntro
        eyebrow="Privacy & accessibility"
        title="Privacy & accessibility"
        intro="A straightforward explanation of this website, what it stores, and where outside services take over."
        path="/privacy"
      />
      <section className="wrap legal-layout">
        <aside>Updated October 9, 2026.</aside>
        <div className="prose">
          <h2>A human introduction, not medical intake</h2>
          <p>
            Please don’t send medical records, military identity documents, or
            financial details through this site, email, or messaging. ENVET
            follows up with people directly about visits and program questions.
          </p>
          {communityEnabled && (
            <>
              <h2>Inquiries and follow-up</h2>
              <p>
                The online inquiry form collects your name, email address or
                phone number, service or activity of interest, an optional short
                note, and your permission to be contacted. ENVET uses this to
                respond by phone or email or arrange a visit. Team members can
                mark an inquiry new, contacted, booked, or closed. Inquiries
                remain until an authorized team member manually deletes them.
                Backup copies may expire on a separate provider schedule.
              </p>
              <h2>Google sign-in and journal discussion</h2>
              <p>
                Google sign-in lets members like and comment on journal guides.
                Comments appear immediately in public as plain text and show
                only “Community member,” never a Google email address or profile
                picture. The text a member writes is public, so it should not
                include private information. Members can remove their own
                comments; ENVET can hide comments and review reports. Google and
                Supabase process sign-in information under their own service
                terms.
              </p>
            </>
          )}
          {formsEnabled ? (
            <>
              <h2>Signed guest and horse-candidate forms</h2>
              <p>
                Online forms require Google sign-in and collect the details in
                ENVET’s supplied documents, initials where requested, typed or
                drawn signatures, electronic consent and submission time. The
                guest form includes emergency contacts and a separate parent or
                lawful guardian flow for minors. The horse form includes animal
                history, care and optional current-rider information—not a
                veteran’s medical intake. The submitting adult’s Google account
                and email accompany the record; sign-in is not independent proof
                of identity or guardian authority.
              </p>
              <p>
                Signed content is encrypted server-side and kept in private
                database records. The submitting account and currently
                authorized ENVET staff may retrieve it. Staff document access
                and review changes are audited. Signed records are retained
                indefinitely, including after account removal, with deletion
                only after explicit administrative authorization. Routine staff
                screens have no signed-record delete action. Backup copies have
                a separate recovery/expiry policy; deleting an active record
                does not erase existing backups or revoke a release. No form
                draft is saved in browser storage. Copies you choose to save or
                print contain personal information and should be kept private.
              </p>
              <p>
                Staff may separately record completed visits and horse
                evaluations. Program charts use aggregated activity without
                names, contact details, signatures or health descriptions.
                Signing forms are not counted as visits, donations or clinical
                outcomes. Forms, receipts, accounts and team pages are excluded
                from first-party page counting. Ask ENVET about paper
                alternatives, corrections, revocation or an authorized deletion
                request.
              </p>
              <p>
                Authorized staff may attach a call/text screening to a guest
                record: conversation date and channel, reported Veteran/Active
                Duty or family connection, staff eligibility decision, selected
                goals, discussed safety topics and follow-up outcome. This
                separate encrypted review record is staff-only, audited and
                retained indefinitely with the guest record. It does not alter
                the signed release or appear in the signer’s receipt. No proof
                documents, diagnoses or trauma histories are requested. Neither
                checkmarks nor screening count as attendance or clinical
                outcomes; affiliation is not used in program charts.
              </p>
            </>
          ) : (
            <>
              <h2>Guest releases and horse-candidate applications</h2>
              <p>
                You can read ENVET’s forms on this website. Online submissions
                are not accepted. Contact the team to arrange your paperwork and
                ask how to provide it securely. Do not email completed forms
                containing personal information.
              </p>
            </>
          )}
          <h2>Your pre-visit checklist</h2>
          <p>
            Checkmarks stay on the current page and reset when it reloads. They
            are not sent to ENVET or saved in browser storage. Checking an item
            does not confirm eligibility or book a visit.
          </p>
          {communityEnabled && (
            <>
              <h2>Anonymous page counts</h2>
              <p>
                The site counts daily views of public pages by path. These
                counts do not identify unique visitors or store search queries,
                account routes, cookies, or visitor profiles. Hashed,
                time-windowed rate counters limit form and discussion abuse;
                expired counters are removed on subsequent writes. The
                application does not retain raw IP addresses in those counters.
                Hosting may keep its own technical logs.
              </p>
            </>
          )}
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
            Facebook, Messenger, WhatsApp, PayPal, Google Maps, the National
            Weather Service, and your email or phone application operate
            separately. Their privacy policies apply when you choose to use
            them. This website does not embed social feeds, load advertising
            trackers, or receive payment-card details.
          </p>
          <h2>Hosting and technical records</h2>
          <p>
            Vercel hosts this website and may process routine technical
            information such as IP addresses and request logs to deliver and
            protect it. Hosting records follow the provider’s policies, separate
            from ENVET’s application records. No advertising tracker is included
            on this website.
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
