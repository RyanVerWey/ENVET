import { describe, expect, it } from "vitest";
// @ts-expect-error The read-only smoke-test helper is plain JavaScript.
import { assertPolishedPage } from "../scripts/check-page-ui.mjs";

const page = `<a href="#main">Skip to content</a><main id="main" tabindex="-1"><h1>Welcome to ENVET</h1><input placeholder="For example, a first visit" /></main><footer><nav aria-label="Footer navigation"></nav><nav aria-label="ENVET social channels">${["Facebook", "Messenger", "WhatsApp"].map((name) => `<a href="https://example.com" aria-label="ENVET on ${name}"><svg aria-hidden="true"></svg></a>`).join("")}</nav></footer>`;

describe("visitor-facing UI contract", () => {
  it("accepts semantic navigation and real field hints", () => {
    expect(() => assertPolishedPage(page, "/")).not.toThrow();
  });
  it("ignores internal serialized state", () => {
    expect(() =>
      assertPolishedPage(`${page}<script>"owner-only draft"</script>`, "/"),
    ).not.toThrow();
  });
  it.each([
    "AI-assisted articles",
    "Owner-review version",
    "Preview only",
    "Sign-in is being prepared",
  ])("rejects leaked editorial copy: %s", (copy) => {
    expect(() =>
      assertPolishedPage(page.replace("Welcome to ENVET", copy), "/"),
    ).toThrow(/visitor-facing copy/);
  });
  it("rejects forced positive tab order", () => {
    expect(() =>
      assertPolishedPage(page.replace('tabindex="-1"', 'tabindex="2"'), "/"),
    ).toThrow();
  });
  it("rejects unlabeled social icons", () => {
    expect(() =>
      assertPolishedPage(
        page.replace('aria-label="ENVET on Facebook"', ""),
        "/",
      ),
    ).toThrow(/labeled Facebook/);
  });
});
