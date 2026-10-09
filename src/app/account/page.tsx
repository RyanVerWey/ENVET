import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { communityConfig } from "@/lib/community/config";
import { currentUser, staffUser } from "@/lib/community/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};
type Props = { searchParams: Promise<{ error?: string }> };

export default async function Account({ searchParams }: Props) {
  const configured = !!communityConfig();
  const user = configured ? await currentUser() : null;
  const staff = user ? await staffUser() : null;
  const { error } = await searchParams;
  return (
    <>
      <PageIntro
        eyebrow="Community"
        title="Your account"
        intro="Join the conversation around ENVET’s journal."
        path="/account"
      />
      <section className="wrap community-panel account-panel">
        {!configured ? (
          <>
            <h2>Community sign-in is being prepared.</h2>
            <p>
              Google sign-in is not available yet. You can still read every
              guide and contact ENVET directly.
            </p>
            <Link className="text-link" href="/blog">
              Read the journal
            </Link>
          </>
        ) : user ? (
          <>
            <h2>You’re signed in.</h2>
            <p>
              Use your Google account to like, comment on, and share published
              guides. Your email is not shown with comments.
            </p>
            <div className="actions">
              <Link className="action" href="/blog">
                Go to the journal
              </Link>
              {staff && (
                <Link className="action action-secondary" href="/team">
                  Open team workspace
                </Link>
              )}
            </div>
            <form action="/auth/sign-out" method="post">
              <button className="quiet-button" type="submit">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Sign in with Google</h2>
            <p>
              A Google account is needed to like and comment. Reading and
              sharing remain open to everyone.
            </p>
            <Link className="action" href="/auth/sign-in?next=/account">
              Continue with Google
            </Link>
          </>
        )}
        {error && (
          <p className="form-message" role="alert">
            {error === "signout"
              ? "Sign-out could not be confirmed. Please try again; your session may still be active."
              : "Sign-in could not finish. Please try again or contact ENVET if the problem continues."}
          </p>
        )}
      </section>
    </>
  );
}
