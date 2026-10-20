import type { Metadata } from "next";
import { TeamAccess } from "@/components/forms/team-access";
import { FormReviewQueue } from "@/components/forms/review-queue";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Signed forms review",
  robots: { index: false, follow: false },
};
export default function FormReviewPage() {
  return (
    <TeamAccess next="/team/forms">
      <FormReviewQueue />
    </TeamAccess>
  );
}
