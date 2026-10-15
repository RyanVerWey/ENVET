import { absoluteUrl, organization } from "./site";

// Only public editorial destinations belong in the page graph. Signing and
// account routes deliberately remain outside discovery/schema optimization.
const publicPages: Record<string, string> = {
  "/": "WebPage",
  "/about": "AboutPage",
  "/contact": "ContactPage",
  "/visit": "WebPage",
  "/staff": "CollectionPage",
  "/programs": "CollectionPage",
  "/donate": "WebPage",
  "/gallery": "CollectionPage",
  "/blog": "CollectionPage",
  "/privacy": "WebPage",
  "/editorial-policy": "WebPage",
};
// These dates are already disclosed on the policy pages. Never use build time
// as a substitute for an editorial content modification date.
export const policyUpdated = "2026-10-09";

export function pageSchema({
  path,
  name,
  headline,
  description,
}: {
  path: string;
  name: string;
  headline?: string;
  description: string;
}) {
  const type =
    publicPages[path] ??
    (/^\/blog\/category\/[a-z0-9-]+$/.test(path)
      ? "CollectionPage"
      : /^\/blog\/[a-z0-9-]+$/.test(path)
        ? "WebPage"
        : undefined);
  if (!type) return null;
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": absoluteUrl(`${path}#webpage`),
    url: absoluteUrl(path),
    name: `${name} | ENVET`,
    ...(headline ? { headline } : {}),
    description,
    inLanguage: "en-US",
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#organization") },
    publisher: { "@id": absoluteUrl("/#organization") },
    ...(path === "/"
      ? {}
      : { breadcrumb: { "@id": absoluteUrl(`${path}#breadcrumbs`) } }),
    ...(path === "/privacy" || path === "/editorial-policy"
      ? { dateModified: policyUpdated }
      : {}),
  };
}

export function programServiceSchema(service: {
  slug: string;
  title: string;
  summary: string;
}) {
  return {
    "@type": "Service",
    "@id": absoluteUrl(`/programs#${service.slug}`),
    url: absoluteUrl(`/programs#${service.slug}`),
    name: service.title,
    description: service.summary,
    provider: { "@id": absoluteUrl("/#organization") },
    audience: { "@type": "Audience", audienceType: organization.audience },
  };
}
