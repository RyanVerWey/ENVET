import Link from "next/link";
import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { currentUser, serviceClient } from "@/lib/community/supabase";
import { formTitles, isFormKind } from "@/lib/forms/definition";
import { uuidPattern } from "@/lib/community/validation";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your signed forms",
  robots: { index: false, follow: false },
};
type History = {
  records: { id: string; kind: "donation" | "liability"; created_at: string }[];
  more: boolean;
};
export default async function MemberForms({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await currentUser();
  const { page: rawPage = "0" } = await searchParams;
  const page = Number(rawPage);
  let history: History | null = null;
  let unavailable = !Number.isSafeInteger(page) || page < 0 || page > 100;
  if (user && !unavailable) {
    try {
      const service = serviceClient();
      const result = service
        ? await service.rpc("member_form_history", {
            p_actor: user.id,
            p_page: page,
          })
        : null;
      if (!result || result.error || !Array.isArray(result.data?.records))
        unavailable = true;
      else history = result.data as History;
    } catch {
      unavailable = true;
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="Your account"
        title="Your signed forms"
        intro="Private receipts for the forms you submitted with this Google account."
        path="/account/forms"
      />
      <section className="wrap member-records">
        <Link href="/account" className="text-link">
          ← Your account & tasks
        </Link>
        {!user ? (
          <p>
            <Link className="action" href="/auth/sign-in?next=/account/forms">
              Sign in with Google
            </Link>
          </p>
        ) : unavailable ? (
          <div role="alert">
            <h2>Your records could not load</h2>
            <p>
              Please try again. This does not mean your forms are missing or
              that you should submit them again.
            </p>
            <Link
              className="quiet-button"
              href="/account/forms"
              prefetch={false}
            >
              Try again
            </Link>
          </div>
        ) : (
          <>
            <h2>Submission history</h2>
            {!history?.records.length ? (
              <p>
                No signed forms on this page.{" "}
                <Link href="/forms">Choose a form</Link> when ENVET asks you to
                complete one.
              </p>
            ) : (
              <ul className="member-history">
                {history.records
                  .filter(
                    (record) =>
                      uuidPattern.test(record.id) && isFormKind(record.kind),
                  )
                  .map((record) => (
                    <li key={record.id}>
                      <div>
                        <strong>{formTitles[record.kind]}</strong>
                        <time dateTime={record.created_at}>
                          {new Date(record.created_at).toLocaleString("en-US", {
                            timeZone: "America/New_York",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}{" "}
                          Eastern
                        </time>
                      </div>
                      <Link
                        className="quiet-button"
                        href={`/forms/receipt?id=${record.id}`}
                        prefetch={false}
                        aria-label={`Open and print ${formTitles[record.kind]} submitted ${new Date(record.created_at).toLocaleDateString("en-US", { timeZone: "America/New_York" })}`}
                      >
                        Open & print
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
            <nav className="actions" aria-label="Submission history pages">
              {page > 0 && (
                <Link href={`/account/forms?page=${page - 1}`} prefetch={false}>
                  Newer submissions
                </Link>
              )}
              {history?.more && page < 100 && (
                <Link href={`/account/forms?page=${page + 1}`} prefetch={false}>
                  Older submissions
                </Link>
              )}
            </nav>
            <p className="small">
              Receipts contain personal information. Keep printed or downloaded
              copies private. A submitted form is not a confirmed booking.
            </p>
          </>
        )}
      </section>
    </>
  );
}
