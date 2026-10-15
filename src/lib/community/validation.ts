export const articleSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//"))
    return "/account";
  if (/[\\\u0000-\u001f]/.test(value) || value.length > 500) return "/account";
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u001f]/.test(decoded))
      return "/account";
    const parsed = new URL(value, "https://envet.invalid");
    if (
      parsed.origin !== "https://envet.invalid" ||
      parsed.pathname.startsWith("/auth/")
    )
      return "/account";
    return parsed.pathname + parsed.search;
  } catch {
    return "/account";
  }
}
export type InquiryInput = {
  name: string;
  email: string;
  phone: string;
  serviceInterest: string;
  note: string;
  consent: true;
};

function string(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : null;
}

export function parseInquiry(
  value: Record<string, unknown>,
): InquiryInput | null {
  const name = string(value.name, 100);
  const email = string(value.email ?? "", 254)?.toLowerCase();
  const phone = string(value.phone ?? "", 30);
  const serviceInterest = string(value.serviceInterest, 100);
  const note = string(value.note ?? "", 500);
  if (
    !name ||
    name.length < 2 ||
    email === undefined ||
    phone === null ||
    !serviceInterest ||
    serviceInterest.length < 2 ||
    note === null ||
    (!email && !phone) ||
    value.consent !== true
  )
    return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (phone && !/^[+() .0-9-]{7,30}$/.test(phone)) return null;
  return {
    name,
    email: email ?? "",
    phone,
    serviceInterest,
    note,
    consent: true,
  };
}

export function parseComment(value: Record<string, unknown>) {
  const body = string(value.body, 2000);
  return body && body.length >= 2 ? body : null;
}

export type ContentInput = {
  kind: "horse" | "service";
  slug: string;
  title: string;
  summary: string;
  details: string;
  state: "draft" | "published" | "archived";
  expectedVersion: number | null;
};
export function parseContent(
  value: Record<string, unknown>,
): ContentInput | null {
  const kind = value.kind;
  const slug = string(value.slug, 100);
  const title = string(value.title, 100);
  const summary = string(value.summary, 700);
  const details = string(value.details, 2000);
  const state = value.state;
  const expectedVersion = value.expectedVersion;
  if (
    (kind !== "horse" && kind !== "service") ||
    !slug ||
    !articleSlugPattern.test(slug) ||
    !title ||
    title.length < 2 ||
    !summary ||
    summary.length < 10 ||
    details === null ||
    (state !== "draft" && state !== "published" && state !== "archived") ||
    (expectedVersion !== null &&
      (!Number.isSafeInteger(expectedVersion) || Number(expectedVersion) < 1))
  )
    return null;
  return {
    kind,
    slug,
    title,
    summary,
    details,
    state,
    expectedVersion: expectedVersion as number | null,
  };
}
