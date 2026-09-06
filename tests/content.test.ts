import { describe, expect, it } from "vitest";
import {
  getPost,
  getPosts,
  parsePost,
  renderMarkdown,
  slugify,
  xmlEscape,
} from "../src/lib/blog";
import { isLaunchEnabled, jsonLd, organization } from "../src/lib/site";
import fs from "node:fs";
import path from "node:path";

describe("publication controls", () => {
  const valid = {
    SITE_APPROVED_FOR_LAUNCH: "true",
    CONTENT_AND_MEDIA_APPROVED: "true",
    SITE_URL: "https://envet.org",
  };
  it("requires both approvals and a real canonical origin", () => {
    expect(isLaunchEnabled({})).toBe(false);
    expect(
      isLaunchEnabled({ ...valid, SITE_APPROVED_FOR_LAUNCH: "false" }),
    ).toBe(false);
    expect(
      isLaunchEnabled({ ...valid, CONTENT_AND_MEDIA_APPROVED: "false" }),
    ).toBe(false);
    expect(isLaunchEnabled(valid)).toBe(true);
    for (const url of [
      "http://envet.org",
      "https://localhost",
      "https://127.0.0.1",
      "https://envet.vercel.app",
      "https://envet.org/preview",
      "https://envet.org/?preview=true",
      "https://name:secret@envet.org",
      "bad-url",
    ])
      expect(isLaunchEnabled({ ...valid, SITE_URL: url }), url).toBe(false);
  });
  it("never indexes Vercel preview even when production vars are inherited", () => {
    expect(isLaunchEnabled({ ...valid, VERCEL_ENV: "preview" })).toBe(false);
    expect(isLaunchEnabled({ ...valid, VERCEL_ENV: "production" })).toBe(true);
  });
});
describe("content engine", () => {
  it("includes three source-grounded articles and excludes drafts everywhere", () => {
    const posts = getPosts();
    expect(posts).toHaveLength(3);
    expect(getPost("editor-draft-example")).toBeUndefined();
    expect(getPost("../../package")).toBeUndefined();
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length);
    for (const post of posts) {
      expect(post.sources.length).toBeGreaterThan(0);
      expect(post.body.split(/\s+/).length).toBeGreaterThan(250);
      expect(
        fs.existsSync(path.join(process.cwd(), "public", post.image)),
      ).toBe(true);
    }
  });
  it("rejects invalid metadata rather than silently producing bad search data", () => {
    expect(() =>
      parsePost("invalid.md", "---\ntitle: Nope\n---\nText"),
    ).toThrow();
    const valid = fs.readFileSync(
      "content/blog/first-visit-to-envet.md",
      "utf8",
    );
    expect(() => parsePost("bad slug.md", valid)).toThrow("invalid slug");
    expect(() =>
      parsePost(
        "post.md",
        valid.replace('date: "2026-09-06"', 'date: "2026-02-30"'),
      ),
    ).toThrow("invalid date");
    expect(() =>
      parsePost(
        "post.md",
        valid.replace("published: true", 'published: "true"'),
      ),
    ).toThrow("published");
  });
  it("renders semantic markdown without executable HTML", async () => {
    const html = await renderMarkdown(
      "## Good question\n\nA **clear** answer.\n\n<script>alert(1)</script>\n\n[Unsafe](javascript:alert%281%29)",
    );
    expect(html).toContain("<h2>Good question</h2>");
    expect(html).toContain("<strong>clear</strong>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
  });
  it("normalizes categories and safely serializes structured content", () => {
    expect(slugify("Supporting the mission")).toBe("supporting-the-mission");
    expect(jsonLd({ text: "</script><script>bad</script>" })).not.toContain(
      "<",
    );
    expect(xmlEscape('Horses & "hope" <here>')).toBe(
      "Horses &amp; &quot;hope&quot; &lt;here&gt;",
    );
  });
});
describe("verified outbound destinations", () => {
  it("preserves case-sensitive PayPal ID and current contact channels", () => {
    expect(
      new URL(organization.donate).searchParams.get("hosted_button_id"),
    ).toBe("EK4AXP2E2WA5J");
    expect(organization.email).toBe("envet501c3@gmail.com");
    expect(organization.phoneHref).toBe("tel:+15405048401");
    expect(organization.whatsapp).toBe("https://wa.me/15405048401");
    expect(new URL(organization.facebook).searchParams.get("id")).toBe(
      "100068209587248",
    );
  });
});
