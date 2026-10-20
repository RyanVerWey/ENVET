import { describe, expect, it, vi, afterEach } from "vitest";
import { getPosts } from "../src/lib/blog";
import { categoryDescriptions } from "../src/lib/blog-categories";
// @ts-expect-error Read-only smoke helper is plain JavaScript.
import { assertShareMetadata } from "../scripts/check-sharing.mjs";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
const tags: Record<string, string> = {
  description: "Arrange a visit with ENVET.",
  "og:title": "Visit | ENVET",
  "twitter:title": "Visit | ENVET",
  "og:description": "Arrange a visit with ENVET.",
  "twitter:description": "Arrange a visit with ENVET.",
  "twitter:card": "summary_large_image",
  "og:image": "https://envet.org/opengraph-image?v=2",
  "twitter:image": "https://envet.org/opengraph-image?v=2",
  "og:image:width": "1200",
  "og:image:height": "630",
  "og:image:type": "image/png",
  "og:image:alt": "ENVET and the farm",
  "twitter:image:alt": "ENVET and the farm",
  "og:type": "website",
};
const headFixture = `<html><head><title>Visit | ENVET</title>${Object.entries(
  tags,
)
  .map(([name, content]) => `<meta name="${name}" content="${content}">`)
  .join("")}</head><body></body></html>`;
describe("complete social metadata", () => {
  it("accepts complete server-rendered share metadata", () => {
    expect(() => assertShareMetadata(headFixture, "/visit")).not.toThrow();
  });
  it.each(["og:image", "twitter:image", "og:image:alt", "twitter:image:alt"])(
    "rejects a missing %s independently",
    (name) => {
      expect(() =>
        assertShareMetadata(
          headFixture.replace(
            `<meta name="${name}" content="${tags[name]}">`,
            "",
          ),
          "/visit",
        ),
      ).toThrow(name);
    },
  );
  it("does not accept image metadata appended after head", () => {
    const image = `<meta name="og:image" content="${tags["og:image"]}">`;
    expect(() =>
      assertShareMetadata(
        headFixture.replace(image, "").replace("</body>", `${image}</body>`),
        "/visit",
      ),
    ).toThrow("og:image");
  });
  it("only selects approved local photographs, never URLs or file paths", async () => {
    const { socialPhotograph } = await import("../src/lib/social-image");
    expect(socialPhotograph("/images/farm.jpg")).toBe("farm");
    expect(socialPhotograph("/images/horse.jpg")).toBe("horse");
    for (const value of [
      "https://example.com/photo.jpg",
      "../../secret",
      "/images/unapproved.jpg",
    ])
      expect(socialPhotograph(value)).toBe("connection");
  });
  it("includes explicit default images, size, alt text and nonrepeating branding", async () => {
    const { pageMetadata } = await import("../src/lib/seo");
    const meta = pageMetadata("Contact ENVET", "Contact the team.", "/contact");
    expect(meta.title).toEqual({ absolute: "Contact ENVET" });
    expect(meta.openGraph).toMatchObject({
      title: "Contact ENVET",
      images: [
        {
          width: 1200,
          height: 630,
          type: "image/png",
          alt: expect.any(String),
          url: expect.stringContaining("/opengraph-image?v=2"),
        },
      ],
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      images: [{ url: expect.any(String), alt: expect.any(String) }],
    });
    expect(meta.alternates).toBeUndefined();
  });
  it("keeps production canonical and image origins on envet.org", async () => {
    vi.stubEnv("SITE_URL", "https://envet.org");
    vi.stubEnv("SITE_APPROVED_FOR_LAUNCH", "true");
    vi.stubEnv("CONTENT_AND_MEDIA_APPROVED", "true");
    vi.stubEnv("VERCEL_ENV", "production");
    const { pageMetadata } = await import("../src/lib/seo");
    const meta = pageMetadata("Visit", "Arrange your visit.", "/visit");
    expect(meta.alternates).toEqual({ canonical: "https://envet.org/visit" });
    expect(meta.openGraph).toMatchObject({
      url: "https://envet.org/visit",
      images: [
        {
          url: "https://envet.org/opengraph-image?v=2",
          width: 1200,
          height: 630,
        },
      ],
    });
  });
  it("uses purposeful descriptions for every published category", () => {
    for (const post of getPosts())
      expect(categoryDescriptions[post.categorySlug]).toBeTruthy();
    expect(new Set(Object.values(categoryDescriptions)).size).toBe(
      Object.keys(categoryDescriptions).length,
    );
    expect(categoryDescriptions["for-families"]).not.toContain(
      "about for families",
    );
  });
  it("rejects incomplete or body-only share tags", () => {
    expect(() =>
      assertShareMetadata(
        '<html><head><title>Visit | ENVET</title><meta name="description" content="Plan a visit"></head><body><meta property="og:image" content="https://envet.org/image.png"></body></html>',
        "/visit",
      ),
    ).toThrow();
  });
});
