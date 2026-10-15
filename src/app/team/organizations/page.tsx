import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { OrganizationManager } from "@/components/organization-manager";
import { staffUser } from "@/lib/community/supabase";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contributing Organizations management",
  robots: { index: false, follow: false },
};
export default async function OrganizationsPage() {
  const manager = await staffUser();
  return (
    <>
      <PageIntro
        eyebrow="Management"
        title="Contributing Organizations"
        intro="Recognize the organizations that support ENVET, in all the ways that count."
        path="/team/organizations"
      />
      {manager ? (
        <OrganizationManager />
      ) : (
        <section className="wrap community-panel">
          <h2>Manager access required</h2>
          <p>
            Sign in with your authorized ENVET Google account to manage
            organizations.
          </p>
          <a className="action" href="/auth/sign-in?next=/team/organizations">
            Continue with Google
          </a>
        </section>
      )}
    </>
  );
}
