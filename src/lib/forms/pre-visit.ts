// Operational preparation, never part of the immutable supplied release.
export const preVisitVersion = "pre-visit-2026-10-09-v1";
export const lovettsvilleForecast =
  "https://forecast.weather.gov/MapClick.php?lat=39.2698&lon=-77.6404";
export const affiliations = [
  ["veteran", "Veteran"],
  ["active_duty", "Active Duty"],
  ["family_veteran", "Family member of a Veteran"],
  ["family_active_duty", "Family member of Active Duty"],
  ["unrelated", "No Veteran / Active Duty family connection"],
  ["unknown", "Not established yet"],
] as const;
export const visitGoals = [
  ["pvGoalCommunication", "Communication & connection"],
  ["pvGoalMovement", "Movement & learning new skills"],
  ["pvGoalFamily", "Family teamwork & situational awareness"],
  ["pvGoalDiscuss", "Discuss suitable opportunities with ENVET"],
] as const;
export const preVisitSections = [
  {
    key: "pvEligibilityDiscussed",
    title: "Start with a conversation",
    prompt:
      "Ask: Are you a Veteran, Active Duty service member, or a family member from the United States or a partner nation? What service or family connection should ENVET confirm?",
    items: [
      {
        key: "connection",
        title: "Confirm participation with ENVET",
        text: "The program serves Veterans and Active Duty service members from the United States and partner nations, along with their families, not unrelated civilian recreation. ENVET confirms eligibility privately. Do not upload or message military identity documents or medical records.",
      },
    ],
  },
  {
    key: "pvPurposeDiscussed",
    title: "Find the right opportunity",
    prompt:
      "Ask: What are you hoping to work on? Explain supported activities, family participation and access needs. This is not horse rental.",
    items: [
      {
        key: "purpose",
        title: "Talk about your goals",
        text: "Horse Heroes help Veterans and families explore their new normal after injury, illness or trauma. Ask about communication, learning new skills, supported physical activity and stretching, and family teamwork. Practicing awareness of who is doing what, and where, helps everyone work safely together. Discuss adaptations with the team. Riding is not guaranteed; ENVET is not a horse-rental service.",
      },
    ],
  },
  {
    key: "pvClothingDiscussed",
    title: "Dress for safe movement",
    prompt:
      "Explain every clothing restriction. Ask the caller to check that they can stretch and squat in their chosen pants.",
    items: [
      {
        key: "pants",
        title: "Long pants with room to move",
        text: "Loose jeans or yoga-type pants are suitable. If you cannot stretch or squat in them, they are too tight for riding. Dresses are prohibited.",
      },
      {
        key: "shoes",
        title: "Shoes that cover the whole foot",
        text: "Running shoes are acceptable; leather shoes are preferred. No sandals, Crocs, open-toed shoes or steel-toed boots.",
      },
      {
        key: "shirt",
        title: "A family-friendly regular T-shirt",
        text: "No spaghetti-strap shirts. Choose clothing suitable for the weather; lighter colors help on hot days.",
      },
      {
        key: "layers",
        title: "Weather-ready layers",
        text: "Prepare for hot, cold, wet or windy conditions. Expect to get dirty. You may bring a change of clothing.",
      },
    ],
  },
  {
    key: "pvWeatherDiscussed",
    title: "Check the weather at the farm",
    prompt:
      "Check Lovettsville conditions and the forecast with the caller. Confirm arrangements with ENVET; weather elsewhere may be different.",
    items: [
      {
        key: "weather",
        title: "Look up Lovettsville, Virginia",
        text: "This is an outside activity. Conditions at home may differ from conditions at Eagle’s Nest. Check the local forecast before leaving and contact ENVET about weather changes or whether the visit can proceed.",
      },
    ],
  },
  {
    key: "pvPpeDiscussed",
    title: "Plan your protective equipment",
    prompt:
      "Explain mounted and under-10 helmet rules, available equipment and any individual fit needs. Confirm helmet type with ENVET before the visit.",
    items: [
      {
        key: "helmets",
        title: "Helmets for all mounted activities",
        text: "Helmets will be worn during all mounted activities. Children under 10 are expected to wear helmets at all times at the barn. ENVET has a full range of ASTM equestrian helmets available. Ask staff to confirm helmet type and fit before bringing your own, including a bicycle helmet.",
      },
      {
        key: "gloves",
        title: "Gloves for hands-on work",
        text: "Gloves for rope work, handling hooves and equipment are available. You may bring your own.",
      },
      {
        key: "protection",
        title: "Eye and ear protection that fits",
        text: "Standard sizes are available. Bring your own if you need larger or smaller sizes, and discuss fit with the team.",
      },
    ],
  },
] as const;
export const preVisitKeys = [
  "pvVersion",
  "pvContactDate",
  "pvChannel",
  "pvAffiliation",
  "pvEligibility",
  "pvOutcome",
  ...visitGoals.map(([key]) => key),
  ...preVisitSections.map((s) => s.key),
] as const;
export function preVisitComplete(value: Record<string, string>) {
  return (
    value.pvEligibility === "confirmed" &&
    affiliations.slice(0, 4).some(([v]) => v === value.pvAffiliation) &&
    visitGoals.some(([key]) => value[key] === "yes") &&
    preVisitSections.every((s) => value[s.key] === "yes")
  );
}
export function preVisitInput(
  value: Record<string, unknown>,
): Record<string, string> | null {
  const result: Record<string, string> = {};
  for (const key of preVisitKeys) {
    const v = value[key] ?? "";
    if (typeof v !== "string") return null;
    result[key] = v;
  }
  if (!Object.values(result).some(Boolean)) return result;
  if (
    result.pvVersion !== preVisitVersion ||
    !/^\d{4}-\d{2}-\d{2}$/.test(result.pvContactDate)
  )
    return null;
  const date = new Date(`${result.pvContactDate}T12:00:00Z`);
  if (
    !Number.isFinite(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== result.pvContactDate
  )
    return null;
  if (
    !["call", "text"].includes(result.pvChannel) ||
    !affiliations.some(([v]) => v === result.pvAffiliation) ||
    !["pending", "confirmed", "not_eligible"].includes(result.pvEligibility) ||
    !["followup", "conversation_complete"].includes(result.pvOutcome)
  )
    return null;
  for (const key of [
    ...visitGoals.map(([k]) => k),
    ...preVisitSections.map((s) => s.key),
  ])
    if (!["", "yes"].includes(result[key])) return null;
  if (
    result.pvEligibility === "confirmed" &&
    !affiliations.slice(0, 4).some(([v]) => v === result.pvAffiliation)
  )
    return null;
  if (result.pvOutcome === "conversation_complete" && !preVisitComplete(result))
    return null;
  return result;
}
