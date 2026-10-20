import { afterEach, describe, expect, it, vi } from "vitest";
import { getPosts } from "../src/lib/blog";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
function production() {
  vi.stubEnv("SITE_URL", "https://envet.org");
  vi.stubEnv("SITE_APPROVED_FOR_LAUNCH", "true");
  vi.stubEnv("CONTENT_AND_MEDIA_APPROVED", "true");
  vi.stubEnv("VERCEL_ENV", "production");
}
describe("nonvisual audit remediation", () => {
  it.each([
    ["/about", "AboutPage"],
    ["/contact", "ContactPage"],
    ["/programs", "CollectionPage"],
    ["/gallery", "CollectionPage"],
    ["/blog/category/for-families", "CollectionPage"],
    ["/blog/first-visit-to-envet", "WebPage"],
  ])(
    "connects %s to the real organization, website and breadcrumbs",
    async (path, type) => {
      production();
      const { pageSchema } = await import("../src/lib/page-schema");
      expect(
        pageSchema({
          path,
          name: "Visible page name",
          description: "Visible introduction",
        }),
      ).toMatchObject({
        "@type": type,
        "@id": `https://envet.org${path}#webpage`,
        url: `https://envet.org${path}`,
        about: { "@id": "https://envet.org/#organization" },
        isPartOf: { "@id": "https://envet.org/#website" },
        breadcrumb: { "@id": `https://envet.org${path}#breadcrumbs` },
      });
    },
  );
  it("excludes private, unknown and independently defined author pages", async () => {
    const { pageSchema } = await import("../src/lib/page-schema");
    for (const path of [
      "/forms",
      "/forms/liability",
      "/account",
      "/team",
      "/unknown",
      "/blog/authors/m-lamm",
    ])
      expect(
        pageSchema({ path, name: "Private", description: "Private" }),
      ).toBeNull();
  });
  it("describes only supplied service facts without invented offers or outcomes", async () => {
    production();
    const { programServiceSchema } = await import("../src/lib/page-schema");
    const service = programServiceSchema({
      slug: "horsemanship",
      title: "Horsemanship",
      summary: "Learn with Horse Heroes.",
    });
    expect(service).toMatchObject({
      "@type": "Service",
      name: "Horsemanship",
      description: "Learn with Horse Heroes.",
      provider: { "@id": "https://envet.org/#organization" },
    });
    expect(service).not.toHaveProperty("offers");
    expect(service).not.toHaveProperty("aggregateRating");
  });
  it("uses real editorial dates, never the current build date", async () => {
    production();
    const { default: sitemap } = await import("../src/app/sitemap");
    const { pageSchema } = await import("../src/lib/page-schema");
    const entries = sitemap();
    const posts = getPosts();
    expect(
      entries.find((entry) => entry.url.endsWith("/privacy"))?.lastModified,
    ).toBe("2026-10-09");
    expect(
      pageSchema({ path: "/privacy", name: "Privacy", description: "Privacy" })
        ?.dateModified,
    ).toBe("2026-10-09");
    expect(
      entries.find((entry) => entry.url.endsWith("/blog"))?.lastModified,
    ).toBe(
      posts
        .map((post) => post.updated)
        .sort()
        .at(-1),
    );
    for (const post of posts)
      expect(
        entries.find((entry) =>
          entry.url.endsWith(`/blog/category/${post.categorySlug}`),
        )?.lastModified,
      ).toBe(
        posts
          .filter((p) => p.categorySlug === post.categorySlug)
          .map((p) => p.updated)
          .sort()
          .at(-1),
      );
    expect(
      entries.find((entry) => entry.url.endsWith("/staff")),
    ).not.toHaveProperty("lastModified");
    expect(
      entries.some((entry) => /\/forms|\/account|\/team/.test(entry.url)),
    ).toBe(false);
  });
});
