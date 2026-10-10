import {
  preVisitSections,
  preVisitVersion,
} from "../../src/lib/forms/pre-visit";
export function screeningFixture() {
  return {
    pvVersion: preVisitVersion,
    pvContactDate: "2026-10-09",
    pvChannel: "call",
    pvAffiliation: "family_veteran",
    pvEligibility: "confirmed",
    pvOutcome: "conversation_complete",
    ...Object.fromEntries(preVisitSections.map((s) => [s.key, "yes"])),
    pvGoalCommunication: "yes",
  };
}
