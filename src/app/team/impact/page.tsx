import type { Metadata } from "next";
import { TeamAccess } from "@/components/forms/team-access";
import { ProgramDashboard } from "@/components/forms/program-dashboard";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Program activity",
  robots: { index: false, follow: false },
};
export default function ProgramReportPage() {
  return (
    <TeamAccess next="/team/impact">
      <ProgramDashboard />
    </TeamAccess>
  );
}
