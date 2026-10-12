import { articleSlugPattern } from "./validation";

export type OrganizationInput = {
  slug: string;
  name: string;
  href: string;
  description: string;
  sort_order: number;
  state: "draft" | "published";
};
export type OrganizationRecord = OrganizationInput & {
  version: number;
  deleted_at: string | null;
  updated_at: string;
};
export type PublicOrganization = Pick<
  OrganizationInput,
  "slug" | "name" | "href" | "description" | "sort_order"
>;
export const blankOrganization: OrganizationInput = {
  slug: "",
  name: "",
  href: "",
  description: "",
  sort_order: 10,
  state: "draft",
};
export const organizationColumns =
  "slug,name,href,description,sort_order,state,version,deleted_at,updated_at";
export function organizationVersion(value: unknown): value is number | null {
  return (
    value === null ||
    (Number.isSafeInteger(value) &&
      Number(value) > 0 &&
      Number(value) < 2147483647)
  );
}
export function organizationWebsite(value: string): string | null {
  if (!value) return "";
  if (value.length > 2048 || /[\s\\\u0000-\u001f\u007f]/.test(value))
    return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(url.hostname)
    )
      return null;
    return url.href.length <= 2048 ? url.href : null;
  } catch {
    return null;
  }
}
export function parseOrganization(
  value: Record<string, unknown>,
): OrganizationInput | null {
  const fields: Record<string, string> = {};
  for (const [key, max] of Object.entries({
    slug: 100,
    name: 150,
    href: 2048,
    description: 500,
  })) {
    if (typeof value[key] !== "string") return null;
    const text = value[key].trim();
    if (
      text.length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)
    )
      return null;
    fields[key] = text;
  }
  const href = organizationWebsite(fields.href);
  if (
    !articleSlugPattern.test(fields.slug) ||
    /[\u0000-\u001f\u007f]/.test(fields.name) ||
    fields.name.length < 2 ||
    href === null ||
    !Number.isInteger(value.sort_order) ||
    Number(value.sort_order) < 0 ||
    Number(value.sort_order) > 9999 ||
    (value.state !== "draft" && value.state !== "published")
  )
    return null;
  return {
    slug: fields.slug,
    name: fields.name,
    href,
    description: fields.description,
    sort_order: value.sort_order as number,
    state: value.state,
  };
}
