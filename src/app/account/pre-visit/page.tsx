import Link from "next/link";
import type { Metadata } from "next";
import { currentUser } from "@/lib/community/supabase";
import { PreVisitChecklist } from "@/components/forms/pre-visit-checklist";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your pre-visit checklist",
  robots: { index: false, follow: false },
};
export default async function MemberPreparation() {
  const user = await currentUser();
  return (
    <div className="wrap pre-visit-page">
      <Link href="/account" className="sign-back">
        ← Your account & tasks
      </Link>
      <h1>Your pre-visit checklist</h1>
      {user ? (
        <PreVisitChecklist managed />
      ) : (
        <>
          <p>Sign in to save your preparation across visits to this website.</p>
          <Link className="action" href="/auth/sign-in?next=/account/pre-visit">
            Continue with Google
          </Link>
          <p>
            <Link href="/forms/pre-visit">Use a checklist without saving</Link>
          </p>
        </>
      )}
    </div>
  );
}
