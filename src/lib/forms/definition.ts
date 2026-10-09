import sources from "./source-templates.json";

export type FormKind = "donation" | "liability";
export type Field = {
  key: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  type?: "email" | "tel" | "date" | "number";
  max?: number;
};
export type FieldSection = { title: string; fields: Field[] };
const f = (
  key: string,
  label: string,
  required = false,
  multiline = false,
  type?: Field["type"],
): Field => ({
  key,
  label,
  required,
  multiline,
  type,
  max: multiline ? 1500 : key.endsWith("Name") ? 100 : 254,
});
export const electronicConsent =
  "I agree to use electronic records and signatures for this submission. I have reviewed the complete document and my information, and intend my signature to sign this record. I declare that I am the adult guest or legal horse owner, or the parent/lawful guardian of the named minor, using my own Google account with authority to submit this record. I can save or print a copy. ENVET retains signed records indefinitely; deletion requires explicit administrative authorization. I may contact ENVET for a paper process instead.";
export const consentVersion = "electronic-consent-2026-10-09-v1";
export const guardianCertificationVersion =
  "guardian-certification-2026-10-09-v1";
export const guardianCertificationText =
  "I certify that I am at least 18 years old and am the parent or lawful guardian of the minor named in this form. I have legal authority to give permission for the minor's participation and to complete this document; no court order or other legal restriction prevents me from doing so. The child's name, age and the guardian information I have provided are accurate to the best of my knowledge. I am using my own Google account, not the child's account or another person's account. I have read the complete equine activity release, including its risk acknowledgements and photo, video and audio provisions, and have had an opportunity to ask ENVET questions. I give permission for the named minor to participate subject to ENVET's arrangements and safety requirements, and make the acknowledgements and permissions in the release only to the extent I am legally authorized to do so. My signature is my own; the guest's signature is recorded separately and does not replace my authorization. I will not sign the child's name as though I were the child; if the child cannot sign, I will contact ENVET for signing arrangements. I understand that Google sign-in and this certification do not independently verify guardianship, guarantee the legal effect of the release, book a visit or confirm participation. I will notify ENVET before participation if my authority or the information provided changes.";
export const liabilityInitials = [
  1, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 24,
];
export const initialLabels: Record<number, string> = {
  1: "Opening acknowledgement",
  4: "Engaging in equine activity",
  5: "Meaning of equine",
  6: "Equine activities",
  7: "Activity sponsors",
  8: "Equine professionals",
  9: "Intrinsic dangers",
  10: "Participants",
  15: "Liability limits — paragraph A",
  16: "Waiver — paragraph B",
  17: "Release — clause 1",
  18: "Risks — clause 2",
  19: "Intent — clause 4",
  20: "Ability assessment — clause 5",
  21: "Additional release — clause 6",
  24: "Images / video / audio — clause 7",
};
export const formTitles: Record<FormKind, string> = {
  donation: "Equine candidate donation",
  liability: "Equine activity release",
};
export const fieldSections: Record<FormKind, FieldSection[]> = {
  liability: [
    {
      title: "Participant & contact",
      fields: [
        f("guestName", "Printed name of guest", true),
        f("signedDate", "Date", true, false, "date"),
        f("address", "Address", true, true),
        f("phone", "Phone number", true, false, "tel"),
        f("email", "Email", true, false, "email"),
        f("emergencyName", "Emergency contact name", true),
        f(
          "emergencyPhone",
          "Emergency contact phone number",
          true,
          false,
          "tel",
        ),
      ],
    },
  ],
  donation: [
    {
      title: "Owner & horse",
      fields: [
        f("ownerName", "Owner name", true),
        f("signedDate", "Date", true, false, "date"),
        f("phone", "Owner phone", true, false, "tel"),
        f("email", "Owner email", true, false, "email"),
        f("address", "Owner address", true),
        f("cityStateZip", "City / state / ZIP", true),
        f("registeredName", "Registered horse name"),
        f("barnName", "Barn name", true),
        f("breed", "Breed", true),
        f("dobAge", "Date of birth / age", true),
        f("gender", "Gender", true),
        f("colorMarkings", "Color / markings", true, true),
      ],
    },
    {
      title: "History & care",
      fields: [
        f("ridingOther", "Other show or riding history", false, true),
        f(
          "additionalConditions",
          "Additional conditions, lameness, conformation, habits or behaviors",
          false,
          true,
        ),
        f("medications", "Current medications / treatments", false, true),
        f(
          "feeding",
          "Current food / feeding regimen (type and amount)",
          false,
          true,
        ),
        f(
          "vetContact",
          "Current veterinarian & contact information",
          false,
          true,
        ),
        f("bloodDonor", "Blood donor"),
        f("mareBred", "If mare, has she ever been bred?"),
        f("ownershipHistory", "Ownership history", false, true),
      ],
    },
    {
      title: "Rider & requests",
      fields: [
        f("riderAge", "Current rider age"),
        f("riderWeight", "Current rider weight (include unit)"),
        f("riderHeight", "Current rider height (include unit)"),
        f("riderAbility", "Current rider ability level"),
        f("lastRidden", "Additional data / last ridden", false, true),
        f(
          "specialRequests",
          "Special requests (including return arrangements)",
          false,
          true,
        ),
      ],
    },
  ],
};
export const ridingOptions = [
  "Trail",
  "Dressage",
  "Lesson Horse",
  "Hunter/Jumper",
  "Pleasure",
  "English",
  "Western",
  "Liberty",
  "Driving",
];
export const conditionOptions = [
  "Ring Bone",
  "Navicular",
  "Founder/Laminitis",
  "Arthritis",
  "Colic",
  "Ulcers",
  "Cribbing/Wind Sucking",
  "Cold-backed",
  "EIA",
  "EPM",
  "Strangles/Equine Distemper",
  "Glanders",
  "E. Tetanus",
  "Botulism",
  "Lordosis",
  "Allergies/Fevers",
  "E. Influenza",
  "E. Rhino Pneumonitis/Herpes",
  "Sleeping Sickness",
  "Potomac Horse Fever/E. Monocytic Ehrlichiosis",
  "African Horse Sickness",
  "Azoturia/Tying Up",
  "Gravels/Abscesses",
  "Hoof Issues",
  "Kissing Spine",
];
export const evaluationFields = [
  f("decisionDate", "Date of acceptance / denial", false, false, "date"),
  f("denialReason", "Reason for denial", false, true),
  f("horseHeight", "Current height (HH)"),
  f("horseWeight", "Current weight (include unit)"),
  f("bodyCondition", "Body condition"),
  f("initialObservations", "Initial observations", false, true),
  f("groundTest", "Ground test", false, true),
  f("lungingTest", "Lunging test", false, true),
  f("ridingTest", "Riding test", false, true),
  f("testObservations", "Post-test observations", false, true),
  f("extensionReason", "Extension reason", false, true),
  f("decisionData", "Acceptance / denial data", false, true),
  f("disposition", "Disposition", false, true),
  f("notes", "Additional notes", false, true),
];
export function isFormKind(value: unknown): value is FormKind {
  return value === "liability" || value === "donation";
}
export function formSource(kind: FormKind) {
  return sources[kind];
}
export function formVersion(kind: FormKind) {
  return `${kind}-${formSource(kind).sourceSha256}-${consentVersion}${kind === "liability" ? `-${guardianCertificationVersion}` : ""}`;
}
export function formStatuses(kind: FormKind) {
  return kind === "liability"
    ? ["submitted", "needs_followup", "reviewed", "revoked"]
    : ["submitted", "needs_followup", "trial", "accepted", "declined"];
}
