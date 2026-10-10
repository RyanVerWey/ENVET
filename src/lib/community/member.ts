// Display only. Profile metadata must never determine access or staff authority.
export function memberFirstName(metadata: Record<string, unknown> = {}) {
  const raw = metadata.given_name || metadata.full_name || metadata.name;
  if (typeof raw !== "string") return null;
  const clean = raw
    .normalize("NFC")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .trim();
  const first = clean.split(/\s+/u)[0];
  return first && !first.includes("@")
    ? Array.from(first).slice(0, 40).join("")
    : null;
}
