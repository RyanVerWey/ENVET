import { describe, expect, it } from "vitest";
import { evaluationInput } from "@/lib/forms/validation";
import { evaluationFields, formVersion } from "@/lib/forms/definition";
import {
  lovettsvilleForecast,
  preVisitComplete,
  preVisitSections,
  preVisitVersion,
  visitGoals,
} from "@/lib/forms/pre-visit";
import { screeningFixture } from "./fixtures/pre-visit";
describe("separate pre-visit operational screening", () => {
  it("retains complete preparation details and a Lovettsville-specific official link", () => {
    const text = preVisitSections
      .flatMap((s) => s.items.map((i) => `${i.title}. ${i.text}`))
      .join(" ");
    for (const requirement of [
      "Active Duty",
      "family",
      "Horse Heroes",
      "communication",
      "stretching",
      "Dresses are prohibited",
      "Crocs",
      "steel-toed",
      "spaghetti-strap",
      "lighter colors",
      "change of clothing",
      "outside activity",
      "Children under 10",
      "all times at the barn",
      "all mounted activities",
      "ASTM",
      "Gloves",
      "Eye",
      "ear",
      "larger or smaller",
    ]) {
      expect(text.toLowerCase()).toContain(requirement.toLowerCase());
    }
    expect(lovettsvilleForecast).toBe(
      "https://forecast.weather.gov/MapClick.php?lat=39.2698&lon=-77.6404",
    );
    expect(preVisitSections.flatMap((s) => [...s.items])).toHaveLength(10);
    expect(
      new Set(preVisitSections.flatMap((s) => s.items.map((i) => i.key))).size,
    ).toBe(10);
  });
  it("accepts complete staff screening and partial follow-up, independent of signed version", () => {
    const value = screeningFixture();
    expect(
      evaluationInput(
        { notes: "Synthetic operational note", ...value },
        "liability",
      ),
    ).toMatchObject(value);
    expect(preVisitComplete(value)).toBe(true);
    expect(
      evaluationInput(
        {
          ...value,
          pvEligibility: "pending",
          pvOutcome: "followup",
          pvPurposeDiscussed: "",
        },
        "liability",
      ),
    ).not.toBeNull();
    expect(formVersion("liability")).not.toContain(preVisitVersion);
  });
  it("keeps old notes-only/blank legacy reviews valid; rejects horse fields on guest reviews", () => {
    expect(evaluationInput({ notes: "Synthetic" }, "liability")).not.toBeNull();
    const legacy = Object.fromEntries(evaluationFields.map((f) => [f.key, ""]));
    expect(evaluationInput(legacy, "liability")).not.toBeNull();
    const horseField = evaluationFields.find((f) => f.key !== "notes")!.key;
    expect(
      evaluationInput(
        { [horseField]: "Unallowed guest evaluation" },
        "liability",
      ),
    ).toBeNull();
    expect(evaluationInput(screeningFixture(), "donation")).toBeNull();
  });
  it("rejects unrelated/unknown eligibility confirmations and incomplete complete-conversation claims", () => {
    for (const pvAffiliation of ["unknown", "unrelated", "forged_staff"]) {
      expect(
        evaluationInput({ ...screeningFixture(), pvAffiliation }, "liability"),
      ).toBeNull();
    }
    for (const section of preVisitSections) {
      expect(
        evaluationInput(
          { ...screeningFixture(), [section.key]: "" },
          "liability",
        ),
      ).toBeNull();
    }
    const missingGoals = {
      ...screeningFixture(),
      ...Object.fromEntries(visitGoals.map(([key]) => [key, ""])),
    };
    expect(evaluationInput(missingGoals, "liability")).toBeNull();
  });
  it("bounds version, date, channel, enums and checklist values; rejects added medical/identity fields", () => {
    for (const extra of [
      { pvVersion: "old" },
      { pvContactDate: "2026-02-31" },
      { pvContactDate: "" },
      { pvChannel: "email" },
      { pvEligibility: "auto_verified" },
      { pvOutcome: "booked" },
      { pvPpeDiscussed: true },
      { pvGoalCommunication: "x".repeat(1000) },
      { medicalRecords: "not allowed" },
      { verifiedBy: "forged actor" },
    ])
      expect(
        evaluationInput({ ...screeningFixture(), ...extra }, "liability"),
      ).toBeNull();
  });
});
