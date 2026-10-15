import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

export const shareRoutes = [
  "/",
  "/about",
  "/visit",
  "/staff",
  "/programs",
  "/donate",
  "/contact",
  "/gallery",
  "/blog",
  "/privacy",
  "/editorial-policy",
  "/blog/first-visit-to-envet",
  "/blog/questions-families-can-ask",
  "/blog/support-envet-beyond-a-donation",
  "/blog/category/getting-started",
  "/blog/category/for-families",
  "/blog/category/supporting-the-mission",
  "/blog/authors/m-lamm",
];
const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export function assertShareMetadata(html, path) {
  const head = html.split(/<\/head>/i)[0];
  const values = new Map();
  for (const [tag] of head.matchAll(/<meta\s+[^>]*>/gi)) {
    const attrs = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
        key,
        decode(value),
      ]),
    );
    const key = attrs.property ?? attrs.name;
    if (key) values.set(key, [...(values.get(key) ?? []), attrs.content]);
  }
  function one(name) {
    const tags = values.get(name) ?? [];
    assert.equal(tags.length, 1, `${path}: one ${name} in head`);
    assert.ok(tags[0]?.trim(), `${path}: nonempty ${name}`);
    return tags[0];
  }
  const description = one("description");
  const title = decode(head.match(/<title>([^<]+)<\/title>/)?.[1] ?? "");
  assert.ok(title.includes("ENVET"), `${path}: branded title`);
  assert.equal(one("og:title"), title, `${path}: matching social title`);
  assert.equal(one("twitter:title"), title, `${path}: matching card title`);
  assert.equal(one("og:description"), description);
  assert.equal(one("twitter:description"), description);
  assert.equal(one("twitter:card"), "summary_large_image");
  const image = new URL(one("og:image"));
  const twitterImage = new URL(one("twitter:image"));
  assert.equal(
    image.pathname,
    twitterImage.pathname,
    `${path}: matching share image`,
  );
  assert.equal(one("og:image:width"), "1200");
  assert.equal(one("og:image:height"), "630");
  assert.equal(one("og:image:type"), "image/png");
  one("og:image:alt");
  one("twitter:image:alt");
  const article = /^\/blog\/[^/]+$/.test(path);
  assert.equal(one("og:type"), article ? "article" : "website");
  if (article) {
    one("author");
    assert.ok(Number.isFinite(Date.parse(one("article:published_time"))));
    assert.ok(Number.isFinite(Date.parse(one("article:modified_time"))));
    assert.match(
      new URL(one("article:author")).pathname,
      /^\/blog\/authors\/[a-z0-9-]+$|^\/editorial-policy$/,
    );
    one("article:section");
    assert.equal(image.pathname, `${path}/opengraph-image`);
  }
  return { title, description, image, twitterImage };
}

export async function checkSharing(origin) {
  const parsedOrigin = new URL(origin);
  assert.ok(
    parsedOrigin.origin === "https://envet.org" ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin),
    "Only ENVET production or loopback preview allowed",
  );
  const images = new Set();
  const titles = new Set();
  const descriptions = new Set();
  for (const path of shareRoutes) {
    for (const bot of [
      "facebookexternalhit/1.1",
      "LinkedInBot/1.0",
      "Twitterbot/1.0",
      "WhatsApp/2.0",
      "Slackbot-LinkExpanding 1.0",
    ]) {
      const response = await fetch(origin + path, {
        headers: { "user-agent": bot },
        signal: AbortSignal.timeout(20000),
      });
      assert.equal(response.status, 200, `${path}: ${bot} status`);
      const { title, description, image, twitterImage } = assertShareMetadata(
        await response.text(),
        path,
      );
      assert.equal(image.origin, twitterImage.origin);
      if (origin === "https://envet.org") {
        assert.equal(image.origin, origin, `${path}: production image origin`);
      }
      images.add(image.pathname + image.search);
      images.add(twitterImage.pathname + twitterImage.search);
      if (bot.startsWith("facebook")) {
        assert.ok(!titles.has(title), `${path}: unique title`);
        assert.ok(
          !descriptions.has(description),
          `${path}: unique description`,
        );
        titles.add(title);
        descriptions.add(description);
      }
    }
    console.log(
      `PASS share ${path}: complete head metadata for Facebook, LinkedIn, X, WhatsApp and Slack user agents`,
    );
  }
  for (const path of images) {
    const response = await fetch(origin + path, {
      headers: { "user-agent": "facebookexternalhit/1.1" },
      signal: AbortSignal.timeout(20000),
    });
    assert.equal(response.status, 200, `${path}: image status`);
    assert.match(response.headers.get("content-type") ?? "", /^image\/png/);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
    assert.ok(bytes.length < 5 * 1024 * 1024, `${path}: image below 5 MiB`);
  }
  for (const slug of ["editor-draft-example", "not-a-published-article"]) {
    const response = await fetch(`${origin}/blog/${slug}/opengraph-image`, {
      signal: AbortSignal.timeout(20000),
    });
    assert.equal(
      response.status,
      404,
      "Unpublished article image is not available",
    );
  }
  console.log(
    `PASS ${images.size} image URLs: PNG, 1200×630, public fetch, bounded size; unpublished images 404. No social posts created.`,
  );
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await checkSharing(process.env.SHARE_ORIGIN || "https://envet.org");
}
