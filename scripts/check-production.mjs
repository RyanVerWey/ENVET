import assert from "node:assert/strict";
import { assertPolishedPage } from "./check-page-ui.mjs";

// Read-only acceptance probes. Never submit participant records or reuse a
// browser session. OAuth starts below inspect headers only; no login completes.
const origin = "https://envet.org";
const portal = "https://portal.envet.org";
const aliases = [
  "www.envet.org",
  ...["info", "net", "store", "xyz"].flatMap((suffix) => [
    `envet.${suffix}`,
    `www.envet.${suffix}`,
  ]),
];

function assertPrivate(response, label) {
  assert.match(response.headers.get("cache-control") || "", /no-store/, label);
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/, label);
}

async function assertRedirect(url, destination, statuses = [308]) {
  const response = await fetch(url, { redirect: "manual" });
  assert.ok(statuses.includes(response.status), `${url}: redirect status`);
  assert.equal(
    new URL(response.headers.get("location"), url).href,
    destination,
    `${url}: redirect destination and query`,
  );
  return response;
}
const publicRoutes = [
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
for (const [host, paths] of [
  [
    origin,
    [
      "/forms",
      "/forms/pre-visit",
      "/forms/liability",
      "/forms/donation",
      "/forms/receipt",
      "/account",
      "/account/forms",
      "/account/pre-visit",
    ],
  ],
  [
    portal,
    [
      "/team",
      "/team/forms",
      "/team/impact",
      "/team/animals",
      "/team/organizations",
      "/account",
      "/account/forms",
      "/account/pre-visit",
    ],
  ],
]) {
  for (const path of paths) {
    const label = host + path;
    const response = await fetch(label, { redirect: "manual" });
    assert.equal(response.status, 200, label);
    assertPrivate(response, label);
    const html = await response.text();
    assertPolishedPage(html, path);
    assert.match(html, /name="robots" content="[^"]*noindex/, label);
    assert.doesNotMatch(html, /rel="canonical"/, label);
    console.log(`PASS private ${label}: no-store, noindex, no canonical`);
  }
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
const bookmark = "/visit?source=domain-check&interest=family";
for (const alias of aliases) {
  await assertRedirect(`https://${alias}${bookmark}`, origin + bookmark);
  const response = await fetch(`http://${alias}${bookmark}`, {
    redirect: "manual",
  });
  assert.ok(
    [301, 307, 308].includes(response.status),
    `${alias}: HTTP redirect`,
  );
  const firstHop = new URL(response.headers.get("location"));
  assert.equal(firstHop.protocol, "https:", `${alias}: HTTP upgrades to HTTPS`);
  assert.ok(
    [alias, "envet.org"].includes(firstHop.host),
    `${alias}: no unexpected redirect host`,
  );
  assert.equal(firstHop.pathname + firstHop.search, bookmark);
  if (firstHop.origin !== origin)
    await assertRedirect(firstHop.href, origin + bookmark);
  console.log(
    `PASS alias ${alias}: HTTPS certificate, permanent path/query redirect`,
  );
}
await assertRedirect(
  `http://envet.org${bookmark}`,
  origin + bookmark,
  [307, 308],
);
await assertRedirect(`${portal}/`, `${portal}/team`, [302, 307, 308]);
for (const path of ["/team", "/team/animals", "/team/organizations"]) {
  const query = "?page=2&source=bookmark";
  const response = await assertRedirect(
    origin + path + query,
    portal + path + query,
  );
  assertPrivate(response, `public management redirect ${path}`);
}
const stripped = await assertRedirect(
  `${origin}/team?tab=animals&code=synthetic-domain-probe`,
  `${portal}/team?tab=animals`,
);
assertPrivate(stripped, "credential-free management redirect");
for (const path of [
  "/about",
  "/forms/liability",
  "/sitemap.xml",
  "/feed.xml",
]) {
  const response = await assertRedirect(portal + path, origin + path);
  assertPrivate(response, `portal public redirect ${path}`);
}
const portalRobots = await fetch(`${portal}/robots.txt`, {
  redirect: "manual",
});
assert.equal(portalRobots.status, 200);
assertPrivate(portalRobots, "portal robots");
const portalRules = await portalRobots.text();
assert.match(portalRules, /Disallow:\s*\/\s*(?:\n|$)/);
assert.doesNotMatch(portalRules, /(?:^|\n)Allow:|Sitemap:/);
assert.equal(
  (await fetch(`${origin}/teammate`, { redirect: "manual" })).status,
  404,
);
const robots = await (await fetch(origin + "/robots.txt")).text();
assert.match(robots, /Allow: \//);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
assert.equal((sitemap.match(/<loc>/g) || []).length, 18);
assert.ok(sitemap.includes(`${origin}/blog/authors/m-lamm`));
assert.doesNotMatch(
  sitemap,
  /localhost|envet\.(?:info|net|store|xyz)|portal\.envet\.org|\/forms|\/team|\/account/,
);
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g))
  assert.equal(new URL(match[1]).origin, origin);
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
for (const host of [origin, portal]) {
  const session = await fetch(host + "/api/account/session");
  assertPrivate(session, `${host}: anonymous session`);
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
    "/api/team/organizations",
  ]) {
    const response = await fetch(host + path, { redirect: "manual" });
    assert.ok(
      [401, 403].includes(response.status),
      `${host}${path}: denied anonymously, not configuration failure`,
    );
    assertPrivate(response, host + path);
  }
}

// Deliberately unauthenticated and empty: every request must fail before any
// record write. Sibling origins are same-site, never same-origin.
for (const [host, source] of [
  [portal, origin],
  [origin, portal],
  [portal, "https://example.invalid"],
]) {
  const response = await fetch(host + "/api/team/organizations", {
    method: "POST",
    redirect: "manual",
    headers: {
      origin: source,
      "sec-fetch-site":
        source === "https://example.invalid" ? "cross-site" : "same-site",
      "content-type": "application/json",
    },
    body: "{}",
  });
  assert.equal(response.status, 403, `${source} cannot write to ${host}`);
  assertPrivate(response, "cross-origin write denial");
}
const replay = await fetch(origin + "/team", {
  method: "POST",
  redirect: "manual",
  body: "",
});
assert.equal(
  replay.status,
  409,
  "management navigation never replays POST cross-origin",
);
assertPrivate(replay, "navigation POST denial");

for (const [host, next] of [
  [origin, "/account"],
  [portal, "/team"],
]) {
  const response = await fetch(
    `${host}/auth/sign-in?next=${encodeURIComponent(next)}`,
    {
      redirect: "manual",
    },
  );
  assert.ok([302, 307].includes(response.status), `${host}: OAuth start`);
  assertPrivate(response, `${host}: OAuth start`);
  const authorize = new URL(response.headers.get("location"));
  assert.equal(authorize.origin, "https://rpkxpsnqlhcepyxclgau.supabase.co");
  assert.equal(authorize.pathname, "/auth/v1/authorize");
  assert.equal(authorize.searchParams.get("provider"), "google");
  assert.equal(
    authorize.searchParams.get("redirect_to"),
    `${host}/auth/callback`,
  );
  const cookies = response.headers.getSetCookie();
  assert.ok(cookies.some((cookie) => cookie.startsWith("envet-auth-next=")));
  assert.ok(
    cookies.some((cookie) => /^sb-[^=]+-code-verifier=/.test(cookie)),
    `${host}: PKCE verifier set`,
  );
  for (const cookie of cookies) {
    // Test booleans so assertion failures cannot log verifier cookie values.
    assert.ok(
      !/(?:^|;)\s*domain=/i.test(cookie),
      `${host}: host-only auth cookie`,
    );
    assert.ok(/;\s*Secure(?:;|$)/i.test(cookie), `${host}: secure auth cookie`);
    assert.ok(
      /;\s*HttpOnly(?:;|$)/i.test(cookie),
      `${host}: HttpOnly auth cookie`,
    );
    assert.ok(
      /;\s*SameSite=Lax(?:;|$)/i.test(cookie),
      `${host}: SameSite auth cookie`,
    );
  }
  const callback = await assertRedirect(
    `${host}/auth/callback`,
    `${host}/account?error=callback`,
    [302, 307],
  );
  assertPrivate(callback, `${host}: missing-code callback`);
  console.log(
    `PASS OAuth ${host}: exact callback, host-only secure PKCE cookies; no identity sign-in completed`,
  );
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
