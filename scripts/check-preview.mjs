import assert from "node:assert/strict";
const origin = process.env.PREVIEW_ORIGIN || "http://127.0.0.1:3000";
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))
  throw new Error("This smoke test only targets a local review server.");
const routes = [
  "/",
  "/about",
  "/visit",
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
];
const internal = new Set();
for (const route of routes) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 200, route);
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/, route);
  const html = await response.text();
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) || []).length,
    1,
    `${route}: one h1`,
  );
  assert.match(
    html,
    /name="description" content="[^"]+"/,
    `${route}: description`,
  );
  assert.match(
    html,
    /name="robots" content="[^"]*noindex/,
    `${route}: noindex`,
  );
  assert.doesNotMatch(
    html,
    /rel="canonical"/,
    `${route}: no fake preview canonical`,
  );
  assert.doesNotMatch(
    html,
    /Owner-only draft example/,
    `${route}: no leaked draft`,
  );
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([^<]+)<\/script>/g,
  ))
    JSON.parse(match[1]);
  for (const match of html.matchAll(/<a[^>]*href="(\/[^"#?]*)[^"]*"/g))
    internal.add(match[1]);
  console.log(
    `PASS ${route}: HTML, metadata, structured data, preview protection`,
  );
}
for (const route of internal)
  assert.equal(
    (await fetch(origin + route)).status,
    200,
    `Internal link ${route}`,
  );
for (const route of [
  "/not-a-real-page",
  "/blog/editor-draft-example",
  "/blog/not-a-real-article",
  "/blog/category/not-a-category",
])
  assert.equal((await fetch(origin + route)).status, 404, route);
for (const [legacy, target] of [
  ["/services", "/visit"],
  ["/legal", "/privacy"],
  ["/tax", "/donate"],
]) {
  const response = await fetch(origin + legacy, { redirect: "manual" });
  assert.equal(response.status, 308);
  assert.equal(
    new URL(response.headers.get("location"), origin).pathname,
    target,
  );
}
assert.match(
  await (await fetch(origin + "/robots.txt")).text(),
  /Disallow: \//,
);
assert.doesNotMatch(
  await (await fetch(origin + "/sitemap.xml")).text(),
  /<loc>/,
);
assert.doesNotMatch(await (await fetch(origin + "/feed.xml")).text(), /<item>/);
for (const file of [
  "horse.jpg",
  "farm.jpg",
  "connection.jpg",
  "envet-logo.jpg",
]) {
  const response = await fetch(`${origin}/images/${file}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /image\//);
}
const og = await fetch(origin + "/opengraph-image");
assert.equal(og.status, 200);
assert.match(og.headers.get("content-type"), /image\/png/);
console.log(
  `PASS ${internal.size} internal targets, draft/unknown 404s, legacy redirects, media, OG image, robots, sitemap and RSS.`,
);
