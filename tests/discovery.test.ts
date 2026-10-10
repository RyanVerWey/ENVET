import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock("../docs/media-manifest.json");
  vi.resetModules();
});

describe("discovery release states", () => {
  it("exposes no crawl targets before approval", async () => {
    vi.stubEnv("SITE_APPROVED_FOR_LAUNCH", "false");
    vi.resetModules();
    const { default: sitemap } = await import("../src/app/sitemap");
    const { default: robots } = await import("../src/app/robots");
    const { GET } = await import("../src/app/feed.xml/route");
    expect(sitemap()).toEqual([]);
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    expect(await GET().text()).not.toContain("<item>");
  });
  it("generates consistent canonicals, sitemap, feed and article dates after approved configuration", async () => {
    // Pure metadata test only. Does not change media approvals or deploy anything.
    vi.stubEnv("SITE_APPROVED_FOR_LAUNCH", "true");
    vi.stubEnv("CONTENT_AND_MEDIA_APPROVED", "true");
    vi.stubEnv("SITE_URL", "https://envet.org");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.resetModules();
    const { default: sitemap } = await import("../src/app/sitemap");
    const { default: robots } = await import("../src/app/robots");
    const { GET } = await import("../src/app/feed.xml/route");
    const { pageMetadata } = await import("../src/lib/seo");
    const entries = sitemap();
    expect(entries).toHaveLength(16);
    expect(new Set(entries.map((e) => e.url)).size).toBe(16);
    expect(
      entries.some(
        (entry) => entry.url === "https://envet.org/blog/authors/m-lamm",
      ),
    ).toBe(true);
    expect(entries.every((e) => e.url.startsWith("https://envet.org/"))).toBe(
      true,
    );
    expect(JSON.stringify(entries)).not.toContain("editor-draft");
    expect(robots().sitemap).toBe("https://envet.org/sitemap.xml");
    expect(
      pageMetadata("Visit", "Description", "/visit").alternates?.canonical,
    ).toBe("https://envet.org/visit");
    const feed = await GET().text();
    expect(feed.match(/<item>/g)).toHaveLength(3);
    expect(feed).not.toContain("editor-draft");
    expect(feed).toContain("https://envet.org/blog/first-visit-to-envet");
  });
  it("requires manual media clearance before an indexable build", async () => {
    vi.stubEnv("SITE_APPROVED_FOR_LAUNCH", "true");
    vi.stubEnv("CONTENT_AND_MEDIA_APPROVED", "true");
    vi.stubEnv("SITE_URL", "https://envet.org");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.doMock("../docs/media-manifest.json", () => ({
      default: { assets: [{ publicApproved: false }] },
    }));
    vi.resetModules();
    await expect(import("../next.config")).rejects.toThrow(
      "every deployed image",
    );
  });
  it("permits the owner-cleared manifest with approved production configuration", async () => {
    vi.stubEnv("SITE_APPROVED_FOR_LAUNCH", "true");
    vi.stubEnv("CONTENT_AND_MEDIA_APPROVED", "true");
    vi.stubEnv("SITE_URL", "https://envet.info");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.resetModules();
    const media = await import("../docs/media-manifest.json");
    expect(media.default.assets).toHaveLength(4);
    for (const asset of media.default.assets) {
      expect(asset.publicApproved).toBe(true);
      expect(asset.approvedAt).toBe("2026-10-09");
      expect(asset.approvalEvidence).toContain("use them, its fine");
    }
    await expect(import("../next.config")).resolves.toHaveProperty("default");
  });
});
