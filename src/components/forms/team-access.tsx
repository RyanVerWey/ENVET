import Link from "next/link";
import type { ReactNode } from "react";
import { dataConfig } from "@/lib/community/config";
import { staffUser } from "@/lib/community/supabase";
export async function TeamAccess({
  children,
  next,
}: {
  children: ReactNode;
  next: string;
}) {
  const configured = !!dataConfig();
  const staff = configured ? await staffUser() : null;
  return staff ? (
    <>{children}</>
  ) : (
    <section className="wrap community-panel">
      <h1>Team access required</h1>
      <p>
        {configured
          ? "Use an authorized ENVET team Google account. Access is granted manually by an operator."
          : "Contact ENVET for assistance accessing protected records and program reports."}
      </p>
      {configured && (
        <Link className="action" href={`/auth/sign-in?next=${next}`}>
          Continue with Google
        </Link>
      )}
      <Link href="/team">Return to workspace</Link>
    </section>
  );
}
