import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SigningRoom } from "@/components/forms/signing-room";
import { communityConfig } from "@/lib/community/config";
import { currentUser } from "@/lib/community/supabase";
import { isFormKind } from "@/lib/forms/definition";
import { collectionEnabled } from "@/lib/forms/server";
import { FormOverview } from "@/components/forms/form-overview";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "ENVET guest & horse donation forms",
  robots: { index: false, follow: false },
};
export default async function SigningPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isFormKind(kind)) notFound();
  const enabled = collectionEnabled(kind);
  if (!enabled) return <FormOverview kind={kind} />;
  const user = communityConfig() ? await currentUser() : null;
  return <SigningRoom kind={kind} enabled={enabled} signedIn={!!user} />;
}
