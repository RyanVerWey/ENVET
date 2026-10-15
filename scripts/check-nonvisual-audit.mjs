import assert from "node:assert/strict";

// Raw HTML regression checks supplement (not replace) browser/AT testing.
export function assertNonvisualAudit(html, path) {
  const brand = html.match(/<a\b[^>]*class="brand"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(brand, `${path}: brand link`);
  assert.doesNotMatch(
    brand[0].split(">")[0],
    /aria-label=/,
    `${path}: brand uses its visible name`,
  );
  assert.match(
    brand[1],
    /Eagle’s Nest<\/strong>\s*(?:<!-- -->)?\s*<small>Veterans’ Equine Therapy/,
    `${path}: separated brand words`,
  );
  for (const card of html.matchAll(
    /<article\b[^>]*class="post-card"[^>]*>([\s\S]*?)<\/article>/g,
  )) {
    const cover = card[1].match(/<a\b[^>]*>/)?.[0];
    assert.ok(cover, `${path}: article cover link`);
    assert.doesNotMatch(
      cover,
      /aria-hidden="true"/,
      `${path}: cover exposed to assistive technology`,
    );
    assert.match(cover, /aria-label="Read [^"]+"/, `${path}: named cover link`);
  }
  const nodes = [
    ...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g),
  ].flatMap((match) => {
    const data = JSON.parse(match[1]);
    return data["@graph"] ?? [data];
  });
  const pages = nodes.filter(
    (node) =>
      new URL(node["@id"] ?? "https://invalid.test").hash === "#webpage",
  );
  assert.equal(pages.length, 1, `${path}: one identified public page`);
  const page = pages[0];
  assert.equal(new URL(page.url).pathname, path, `${path}: schema URL`);
  assert.ok(page.name && page.description, `${path}: named/described page`);
  assert.ok(
    page.isPartOf?.["@id"].endsWith("/#website"),
    `${path}: website reference`,
  );
  assert.ok(
    page.about?.["@id"].endsWith("/#organization"),
    `${path}: organization reference`,
  );
  if (path !== "/") {
    assert.ok(
      nodes.some(
        (node) =>
          node["@type"] === "BreadcrumbList" &&
          node["@id"] === page.breadcrumb?.["@id"],
      ),
      `${path}: breadcrumb reference resolves`,
    );
  }
}
