import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { AnimalManager } from "@/components/animal-manager";
import { staffUser } from "@/lib/community/supabase";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Animal staff management",
  robots: { index: false, follow: false },
};
export default async function AnimalManagementPage() {
  const manager = await staffUser();
  return (
    <>
      <PageIntro
        eyebrow="Management"
        title="Meet your animal staff."
        intro="Create, care for and share the stories of ENVET’s Horse Heroes, dogs and cats."
        path="/team/animals"
      />
      {manager ? (
        <AnimalManager />
      ) : (
        <section className="wrap community-panel">
          <h2>Manager access required</h2>
          <p>
            Sign in with your authorized ENVET Google account to manage animal
            bios.
          </p>
          <a className="action" href="/auth/sign-in?next=/team/animals">
            Continue with Google
          </a>
        </section>
      )}
    </>
  );
}
