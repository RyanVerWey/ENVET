import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { TeamWorkspace } from "@/components/team-workspace";
import { dataConfig } from "@/lib/community/config";
import { currentUser, staffUser } from "@/lib/community/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Team workspace",
  robots: { index: false, follow: false },
};

export default async function TeamPage() {
  const configured = !!dataConfig();
  const user = configured ? await currentUser() : null;
  const staff = user ? await staffUser() : null;
  return (
    <>
      <PageIntro
        eyebrow="ENVET team"
        title="Team workspace"
        intro="Keep public information current and follow up with people who asked to hear from ENVET."
        path="/team"
      />
      {!configured ? (
        <section className="wrap community-panel">
          <h2>ENVET team access</h2>
          <p>For help accessing team tools, contact ENVET.</p>
          <Link href="/contact">Contact options</Link>
        </section>
      ) : !user ? (
        <section className="wrap community-panel">
          <h2>Sign in to continue</h2>
          <p>Team access requires an authorized Google account.</p>
          <Link className="action" href="/auth/sign-in?next=/team">
            Continue with Google
          </Link>
        </section>
      ) : !staff ? (
        <section className="wrap community-panel">
          <h2>Team access unavailable</h2>
          <p>
            This account is not on the ENVET team. An authorized operator must
            first verify the Google account and grant access.
          </p>
          <Link href="/account">Return to your account</Link>
        </section>
      ) : (
        <TeamWorkspace />
      )}
    </>
  );
}
