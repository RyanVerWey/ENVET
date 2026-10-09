import assert from "node:assert/strict";

// Read-only probes of the explicitly authorized production origin.
const origin = "https://envet.info";
const publicRoutes = [
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
for (const path of publicRoutes) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  assert.doesNotMatch(
    response.headers.get("x-robots-tag") || "",
    /noindex/,
    path,
  );
  const html = await response.text();
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
  assert.ok(
    html.includes(`rel="canonical" href="${origin}${path}"`),
    `${path}: canonical`,
  );
  assert.doesNotMatch(
    html,
    /Owner-review version|Initial articles prepared for owner review|Owner-only draft example/,
    path,
  );
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([^<]+)<\/script>/g,
  ))
    JSON.parse(match[1]);
  console.log(`PASS public ${path}: HTTPS, canonical, HTML, structured data`);
}
for (const path of [
  "/forms/pre-visit",
  "/forms/liability",
  "/forms/donation",
  "/forms/receipt",
  "/team",
  "/team/forms",
  "/team/impact",
  "/account",
]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("cache-control") || "", /no-store/, path);
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/, path);
  const html = await response.text();
  assert.doesNotMatch(html, /rel="canonical"/, path);
  console.log(`PASS private ${path}: no-store, noindex, no canonical`);
}
for (const [path, target] of [
  ["/services", "/visit"],
  ["/legal", "/privacy"],
  ["/tax", "/donate"],
]) {
  const response = await fetch(origin + path, { redirect: "manual" });
  assert.equal(response.status, 308, path);
  assert.equal(
    new URL(response.headers.get("location"), origin).pathname,
    target,
  );
}
const www = await fetch("https://www.envet.info/visit", { redirect: "manual" });
assert.equal(www.status, 308, "www redirect");
assert.equal(www.headers.get("location"), `${origin}/visit`);
const robots = await (await fetch(origin + "/robots.txt")).text();
assert.match(robots, /Allow: \//);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
assert.equal((sitemap.match(/<loc>/g) || []).length, 15);
assert.doesNotMatch(sitemap, /localhost|envet\.org|\/forms|\/team|\/account/);
const feed = await (await fetch(origin + "/feed.xml")).text();
assert.equal((feed.match(/<item>/g) || []).length, 3);
assert.ok(feed.includes(`${origin}/blog/first-visit-to-envet`));
for (const file of [
  "horse.jpg",
  "farm.jpg",
  "connection.jpg",
  "envet-logo.jpg",
]) {
  const response = await fetch(`${origin}/images/${file}`);
  assert.equal(response.status, 200, file);
  assert.match(response.headers.get("content-type") || "", /image\//, file);
}
for (const path of [
  "/opengraph-image",
  "/_next/image?url=%2Fimages%2Ffarm.jpg&w=1200&q=75",
]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type") || "", /image\//, path);
}
for (const path of [
  "/not-a-real-page",
  "/blog/editor-draft-example",
  "/blog/not-a-real-article",
])
  assert.equal((await fetch(origin + path)).status, 404, path);
console.log(
  "PASS production redirects, robots, sitemap/RSS, approved images, optimization, OG and 404s.",
);
