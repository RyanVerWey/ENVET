import assert from "node:assert/strict";
import { assertPolishedPage } from "./check-page-ui.mjs";

// Read-only probes of the explicitly authorized production origin.
const origin = "https://envet.info";
const publicRoutes = [
  "/",
  "/about",
  "/visit",
  "/staff",
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
for (const path of publicRoutes) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  assert.doesNotMatch(
    response.headers.get("x-robots-tag") || "",
    /noindex/,
    path,
  );
  const html = await response.text();
  assertPolishedPage(html, path);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonical, `${path}: canonical present`);
  assert.equal(
    new URL(canonical[1]).href,
    new URL(path, origin).href,
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
  "/forms",
  "/forms/pre-visit",
  "/forms/liability",
  "/forms/donation",
  "/forms/receipt",
  "/team",
  "/team/forms",
  "/team/impact",
  "/team/animals",
  "/account",
  "/account/forms",
  "/account/pre-visit",
]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("cache-control") || "", /no-store/, path);
  const html = await response.text();
  assertPolishedPage(html, path);
  assert.match(html, /name="robots" content="[^"]*noindex/, path);
  if (path.startsWith("/forms"))
    assert.match(response.headers.get("x-robots-tag") || "", /noindex/, path);
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
const http = await fetch("http://envet.info/visit", { redirect: "manual" });
assert.ok([307, 308].includes(http.status), "HTTP redirects to HTTPS");
assert.equal(http.headers.get("location"), `${origin}/visit`);
const robots = await (await fetch(origin + "/robots.txt")).text();
assert.match(robots, /Allow: \//);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
assert.equal((sitemap.match(/<loc>/g) || []).length, 17);
assert.ok(sitemap.includes(`${origin}/blog/authors/m-lamm`));
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
const session = await fetch(origin + "/api/account/session");
assert.match(session.headers.get("cache-control") || "", /no-store/);
assert.deepEqual(await session.json(), {
  signedIn: false,
  firstName: null,
  manager: false,
});
for (const path of [
  "/api/account/checklist",
  "/api/forms?id=44444444-4444-4444-8444-444444444444",
  "/api/team/forms",
  "/api/team/animals",
]) {
  const response = await fetch(origin + path);
  assert.ok(
    [401, 403].includes(response.status),
    `${path}: denied anonymously, not configuration failure`,
  );
  assert.match(response.headers.get("cache-control") || "", /no-store/);
}
for (const kind of ["liability", "donation"]) {
  const response = await fetch(origin + "/api/forms", {
    method: "POST",
    headers: {
      origin,
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
    },
    body: JSON.stringify({ kind }),
  });
  assert.equal(
    response.status,
    401,
    `${kind}: collection configured, Google required, no record submitted`,
  );
}
const community = await fetch(origin + "/api/community/first-visit-to-envet");
assert.equal(community.status, 200, "configured community reads");
assert.match(community.headers.get("cache-control") || "", /no-store/);
assert.equal((await community.json()).signedIn, false);
console.log(
  "PASS configured Google-only signing gates, private member/API denials and public discussion read. No records submitted.",
);
