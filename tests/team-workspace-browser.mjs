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
  resolve: {
    alias: {
      "@": join(root, "../../src"),
      "next/navigation": join(root, "forms-next-navigation.ts"),
      "next/link": join(root, "forms-next-link.tsx"),
    },
  },
  esbuild: { jsx: "automatic" },
  optimizeDeps: {
    entries: [
      "team-workspace.html",
      "form-autofill.html",
      "form-guardian.html",
    ],
  },
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

  await page.goto(`${base}form-autofill.html`);
  const signerPhone = page.getByRole("textbox", {
    name: "Phone number",
    exact: true,
  });
  const emergencyPhone = page.getByRole("textbox", {
    name: "Emergency contact phone number",
    exact: true,
  });
  await signerPhone.waitFor();
  assert.equal(
    await signerPhone.getAttribute("autocomplete"),
    "section-signer tel",
  );
  assert.equal(await emergencyPhone.getAttribute("autocomplete"), "off");
  assert.equal(
    await page
      .getByRole("textbox", { name: "Emergency contact name", exact: true })
      .getAttribute("autocomplete"),
    "off",
  );
  assert.equal(await signerPhone.getAttribute("name"), "phone");
  assert.equal(await emergencyPhone.getAttribute("name"), "emergencyPhone");
  await signerPhone.fill("202-555-0100");
  assert.equal(await emergencyPhone.inputValue(), "");
  await emergencyPhone.fill("202-555-0199");
  await signerPhone.fill("202-555-0101");
  assert.equal(await emergencyPhone.inputValue(), "202-555-0199");
  await emergencyPhone.press("Tab");
  assert.equal(await signerPhone.inputValue(), "202-555-0101");
  assert.equal(await emergencyPhone.inputValue(), "202-555-0199");
  await page.goto(`${base}form-guardian.html`);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page
    .getByRole("checkbox", { name: "Guest is under 18", exact: true })
    .check();
  const childName = page.getByRole("textbox", {
    name: "Child’s full name",
    exact: true,
  });
  await childName.fill("Synthetic Child");
  assert.equal(await childName.getAttribute("autocomplete"), "off");
  assert.equal(
    await page
      .getByRole("textbox", { name: "Printed name of guest", exact: true })
      .count(),
    0,
  );
  await page
    .getByRole("spinbutton", { name: "Guest age (0–17)", exact: true })
    .fill("12");
  await page
    .getByRole("textbox", {
      name: "Parent / lawful guardian printed name",
      exact: true,
    })
    .fill("Synthetic Guardian");
  await page
    .getByRole("textbox", { name: "Address", exact: true })
    .fill("Synthetic test address");
  await page
    .getByRole("textbox", { name: "Phone number", exact: true })
    .fill("202-555-0100");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("guardian@example.test");
  await page
    .getByRole("textbox", { name: "Emergency contact name", exact: true })
    .fill("Synthetic Emergency");
  await page
    .getByRole("textbox", {
      name: "Emergency contact phone number",
      exact: true,
    })
    .fill("202-555-0199");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page
    .getByRole("heading", { name: "Read & initial", exact: true })
    .waitFor();
  for (const input of await page.locator('input[id^="initial-p"]').all())
    await input.fill("SC");
  await page.locator("#parent-initial").fill("SG");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page.getByRole("heading", { name: "Sign", exact: true }).waitFor();
  const guestSignature = page.getByRole("group", {
    name: "Child / guest signature",
    exact: true,
  });
  const guardianSignature = page.getByRole("group", {
    name: "Parent / lawful guardian signature",
    exact: true,
  });
  await guestSignature.getByRole("textbox").fill("Synthetic Child");
  await guardianSignature.getByRole("textbox").fill("Synthetic Guardian");
  const certification = page.getByRole("checkbox", {
    name: "I certify that I am the named child’s parent or lawful guardian and agree to the certification above.",
    exact: true,
  });
  assert.equal(await certification.isChecked(), false);
  assert.equal(await certification.getAttribute("required"), "");
  assert.equal(
    await certification.getAttribute("aria-describedby"),
    "guardian-certification-text",
  );
  for (const theme of ["mint-light", "mint-dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.corvaTheme = value;
    }, theme);
    for (const width of [320, 768, 1280, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await certification.isVisible(), true);
      assert.equal(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
        true,
        `Guardian certification overflows at ${width}/${theme}`,
      );
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator(".consent-line input").check();
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  assert.equal(
    await page.getByRole("heading", { name: "Sign", exact: true }).count(),
    1,
  );
  await certification.focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page
    .getByRole("heading", { name: "Review & finish", exact: true })
    .waitFor();
  await page
    .getByText("Guardian certification: agreed.", { exact: true })
    .waitFor();
  assert.equal(
    await page.getByText("Child’s full name", { exact: true }).count(),
    1,
  );
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Child’s full name", exact: true })
    .fill("Synthetic Child Updated");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  assert.equal(await certification.isChecked(), false);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Guest is under 18", exact: true })
    .uncheck();
  assert.equal(await childName.count(), 0);
  assert.equal(
    await page
      .getByRole("textbox", { name: "Printed name of guest", exact: true })
      .inputValue(),
    "",
  );
  assert.equal(
    await page
      .getByRole("spinbutton", { name: "Guest age (0–17)", exact: true })
      .count(),
    0,
  );
  assert.deepEqual(failures, []);
  console.log(
    "Browser regressions passed: team refresh/error/keyboard behavior; independent autofill values; named-child flow, separate signatures, required keyboard guardian certification and edit invalidation.",
  );
} finally {
  await browser?.close();
  await server.close();
}
