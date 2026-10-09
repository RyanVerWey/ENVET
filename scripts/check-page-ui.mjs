import assert from "node:assert/strict";

// Check rendered HTML, not React's serialized payload or useful input hints.
export function assertPolishedPage(html, route) {
  const markup = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const text = markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.doesNotMatch(
    text,
    /\bveterans?\b/,
    `${route}: capitalize Veteran, including plurals and possessives`,
  );
  assert.equal(
    (markup.match(/<h1(?:\s|>)/g) || []).length,
    1,
    `${route}: one h1`,
  );
  assert.equal(
    (markup.match(/<main(?:\s|>)/g) || []).length,
    1,
    `${route}: one main`,
  );
  assert.match(
    markup,
    /<main[^>]*id="main"[^>]*tabindex="-1"/,
    `${route}: focusable skip target`,
  );
  assert.match(markup, /href="#main"/, `${route}: skip link`);
  assert.doesNotMatch(
    markup,
    /tabindex="[1-9]\d*"/i,
    `${route}: natural tab order`,
  );
  assert.doesNotMatch(
    text,
    /AI[- ]assist|AI wrote|written by AI|owner[-/ ]review|owner-only draft|preview only|being prepared|awaiting approval|placeholder content/i,
    `${route}: visitor-facing copy`,
  );
  assert.match(
    markup,
    /<nav[^>]*aria-label="Footer navigation"/,
    `${route}: footer landmark`,
  );
  assert.match(
    markup,
    /<nav[^>]*aria-label="ENVET social channels"/,
    `${route}: social landmark`,
  );
  for (const network of ["Facebook", "Messenger", "WhatsApp"]) {
    const anchor = markup.match(
      new RegExp(
        `<a[^>]*aria-label="ENVET on ${network}"[^>]*>([\\s\\S]*?)<\\/a>`,
      ),
    );
    assert.ok(anchor, `${route}: labeled ${network} link`);
    assert.match(
      anchor[1],
      /<svg[^>]*aria-hidden="true"/,
      `${route}: decorative social icon`,
    );
  }
}
