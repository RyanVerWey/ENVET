import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const server = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  esbuild: { jsx: "automatic" },
  server: {
    host: "127.0.0.1",
    port: 0,
    fs: { allow: [join(root, "../..")], strict: true },
  },
});
let browser;
try {
  await server.listen();
  const base = server.resolvedUrls.local[0];
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));

  async function open(scenario, options = {}) {
    await page.setViewportSize({ width: options.width ?? 1280, height: 800 });
    await page.goto(
      `${base}team-workspace.html?scenario=${scenario}${options.dark ? "&theme=dark" : ""}`,
    );
    await page.getByRole("heading", { name: "Inquiries" }).waitFor();
    await page.getByLabel("Status for Sam Visitor").waitFor();
  }
  async function state() {
    return page.evaluate(() => window.fixtureState);
  }
  async function assertNoStaleAndRetry(expectedText) {
    await page.getByText(expectedText).waitFor();
    assert.equal(await page.getByLabel("Status for Sam Visitor").count(), 0);
    assert.equal(
      await page.getByRole("button", { name: "Retry refresh" }).count(),
      1,
    );
    assert.equal((await state()).mutations, 1);
    await page.getByRole("button", { name: "Retry refresh" }).click();
    assert.equal((await state()).mutations, 1);
  }

  await open("success");
  await page.getByLabel("Status for Sam Visitor").selectOption("closed");
  await page.getByText("Saved.", { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("Status for Sam Visitor").inputValue(),
    "closed",
  );

  await open("status-503");
  await page.getByLabel("Status for Sam Visitor").selectOption("closed");
  await assertNoStaleAndRetry(
    "Change confirmed, but the latest records could not load. Current records are hidden. Retry refresh; do not repeat the change.",
  );
  assert.equal(
    await page.getByLabel("Status for Sam Visitor").inputValue(),
    "closed",
  );

  await open("status-403");
  await page.getByLabel("Status for Sam Visitor").selectOption("closed");
  await assertNoStaleAndRetry(
    "Change confirmed, but team access is now denied. Current records are hidden. Ask an operator to verify access, then retry refresh. Do not repeat the change.",
  );
  assert.equal(
    await page.getByLabel("Status for Sam Visitor").inputValue(),
    "closed",
  );

  for (const scenario of ["delete-503", "delete-403"]) {
    await open(scenario);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete inquiry" }).click();
    await assertNoStaleAndRetry(
      scenario.endsWith("403")
        ? "Change confirmed, but team access is now denied. Current records are hidden. Ask an operator to verify access, then retry refresh. Do not repeat the change."
        : "Change confirmed, but the latest records could not load. Current records are hidden. Retry refresh; do not repeat the change.",
    );
    await page.getByText("No inquiries yet.", { exact: false }).waitFor();
    assert.equal(
      await page.getByRole("button", { name: "Delete inquiry" }).count(),
      0,
    );
  }

  for (const scenario of ["hide-503", "hide-403"]) {
    await open(scenario);
    await page.getByRole("button", { name: "Hide reported comment" }).click();
    await assertNoStaleAndRetry(
      scenario.endsWith("403")
        ? "Change confirmed, but team access is now denied. Current records are hidden. Ask an operator to verify access, then retry refresh. Do not repeat the change."
        : "Change confirmed, but the latest records could not load. Current records are hidden. Retry refresh; do not repeat the change.",
    );
    await page.getByText("Reported older comment text").first().waitFor();
    assert.equal(
      await page.getByRole("button", { name: "Hide reported comment" }).count(),
      0,
    );
  }

  await open("report-old", { width: 320, dark: true });
  assert.equal(await page.getByText("Reported older comment text").count(), 1);
  assert.equal(
    await page.getByRole("button", { name: "Hide reported comment" }).count(),
    1,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  let keyboardReachedReport = false;
  for (let step = 0; step < 40; step++) {
    await page.keyboard.press("Tab");
    keyboardReachedReport = await page.evaluate(
      () =>
        document.activeElement?.textContent?.trim() === "Hide reported comment",
    );
    if (keyboardReachedReport) break;
  }
  assert.equal(keyboardReachedReport, true);
  assert.deepEqual(
    await page.evaluate(() => ({
      outline: getComputedStyle(document.activeElement).outlineStyle,
      animation: getComputedStyle(document.activeElement).animationName,
    })),
    { outline: "solid", animation: "none" },
  );
  assert.deepEqual(
    await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      theme: document.documentElement.dataset.corvaTheme,
    })),
    { width: 320, scroll: 320, theme: "mint-dark" },
  );
  await page.getByRole("button", { name: "Hide reported comment" }).click();
  await page.getByText("Saved.", { exact: true }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Hide reported comment" }).count(),
    0,
  );
  assert.equal((await state()).mutations, 1);

  assert.deepEqual(failures, []);
  console.log(
    "Team workspace browser regressions passed: success; status/delete/hide 503 and 403; old reported target at 320px dark with keyboard and reduced motion.",
  );
} finally {
  await browser?.close();
  await server.close();
}
