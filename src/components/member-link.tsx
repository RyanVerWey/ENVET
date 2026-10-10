"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound, Settings2 } from "lucide-react";

export function MemberLink({ pathname }: { pathname: string }) {
  const [member, setMember] = useState<{
    signedIn: boolean;
    firstName: string | null;
    manager?: boolean;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/account/session", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.ok) setMember(await response.json());
        else setMember(null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setMember(null);
      });
    return () => controller.abort();
  }, [pathname]);
  return (
    <div className="member-actions">
      {member?.manager && (
        <Link className="manager-link" href="/team" prefetch={false}>
          <Settings2 size={16} aria-hidden="true" /> Management
        </Link>
      )}
      <Link
        className="member-link"
        href="/account"
        prefetch={false}
        aria-label={
          member?.signedIn ? "Your ENVET account and tasks" : "Sign in to ENVET"
        }
      >
        <UserRound size={16} aria-hidden="true" />
        {member?.signedIn
          ? member.firstName
            ? `Hello, ${member.firstName}`
            : "Your account"
          : "Sign in"}
      </Link>
    </div>
  );
}
