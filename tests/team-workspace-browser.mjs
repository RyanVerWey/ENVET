import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
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
      "next/image": join(root, "animals-next-image.tsx"),
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
  const guestInitials = page.getByRole("group", {
    name: "Guest initials",
    exact: true,
  });
  const pad = guestInitials.getByRole("img", {
    name: "Guest initials: drawing area",
  });
  await pad.scrollIntoViewIfNeeded();
  const box = await pad.boundingBox();
  await page.mouse.move(box.x + box.width * 0.2, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.4, box.y + 100, { steps: 12 });
  await page.mouse.move(box.x + box.width * 0.6, box.y + 40, { steps: 12 });
  await page.mouse.up();
  for (const button of await page.locator('button[id^="initial-p"]').all())
    await button.click();
  assert.equal(
    await page.locator(".initial-sections [data-applied-initials] svg").count(),
    16,
  );
  // A new draft must not silently replace any acknowledgement already applied.
  await guestInitials
    .getByRole("button", { name: "Type initials", exact: true })
    .click();
  await guestInitials
    .getByRole("textbox", { name: "Typed initials" })
    .fill("SC");
  assert.equal(
    await page.locator(".initial-sections [data-applied-initials] svg").count(),
    16,
  );
  const parentInitials = page.getByRole("group", {
    name: "Parent / guardian initials",
    exact: true,
  });
  await parentInitials
    .getByRole("button", { name: "Type initials", exact: true })
    .click();
  await parentInitials
    .getByRole("textbox", { name: "Typed initials" })
    .fill("SG");
  await page.locator("#parent-initial").focus();
  await page.keyboard.press("Enter");
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
  assert.equal(
    await page.locator(".source-document [data-applied-initials]").count(),
    17,
  );
  assert.equal(
    await page.locator(".source-document [data-applied-initials] svg").count(),
    16,
  );
  for (const theme of ["mint-light", "mint-dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.corvaTheme = value;
    }, theme);
    for (const width of [320, 768, 1280, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
        true,
        `Filled review overflows at ${width}/${theme}`,
      );
      assert.equal(
        await page.locator(".source-document [data-applied-initials]").count(),
        17,
      );
    }
  }
  await page.evaluate(() => {
    document.documentElement.dataset.corvaTheme = "mint-light";
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page
    .getByRole("heading", { name: "Completed document preview", exact: true })
    .scrollIntoViewIfNeeded();
  const proofDir = join(root, "../../output/playwright");
  await mkdir(proofDir, { recursive: true });
  await page.screenshot({ path: join(proofDir, "envet-applied-initials.png") });
  await page
    .getByRole("button", { name: "Finish & submit", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Synthetic test: no record saved." })
    .waitFor();
  await page
    .getByRole("button", { name: "Retry unchanged submission", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Thank you for your submission.",
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page.locator(".source-document [data-applied-initials]").count(),
    17,
  );
  assert.equal(
    await page.locator(".source-document [data-applied-initials] svg").count(),
    16,
  );
  await page.goto(`${base}form-guardian.html`);
  // Restart rather than edit a payload held unchanged after an ambiguous response.
  await page
    .getByRole("checkbox", { name: "Guest is under 18", exact: true })
    .check();
  await childName.fill("Synthetic Child");
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
  await guestInitials
    .getByRole("button", { name: "Type initials", exact: true })
    .click();
  await guestInitials
    .getByRole("textbox", { name: "Typed initials" })
    .fill("SC");
  for (const button of await page.locator('button[id^="initial-p"]').all())
    await button.click();
  await parentInitials
    .getByRole("button", { name: "Type initials", exact: true })
    .click();
  await parentInitials
    .getByRole("textbox", { name: "Typed initials" })
    .fill("SG");
  await page.locator("#parent-initial").click();
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await guestSignature.getByRole("textbox").fill("Synthetic Child");
  await guardianSignature.getByRole("textbox").fill("Synthetic Guardian");
  await certification.check();
  await page.locator(".consent-line input").check();
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Child’s full name", exact: true })
    .fill("Synthetic Child Updated");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  assert.equal(
    await page.locator(".initial-sections [data-applied-initials]").count(),
    1,
  );
  await guestInitials
    .getByRole("button", { name: "Type initials", exact: true })
    .click();
  await guestInitials
    .getByRole("textbox", { name: "Typed initials" })
    .fill("SC");
  for (const button of await page.locator('button[id^="initial-p"]').all())
    await button.click();
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
  // Both production routes must retain the full guided UI while intake is off.
  for (const kind of ["liability", "donation"]) {
    await page.goto(`${base}form-guardian.html?mode=offline&kind=${kind}`);
    await page
      .getByText("Review your form, step by step", { exact: true })
      .waitFor();
    assert.equal(
      await page.getByRole("link", { name: "Continue with Google" }).count(),
      0,
    );
    const contactSteps = kind === "liability" ? 1 : 3;
    for (let step = 0; step < contactSteps; step++) {
      for (const input of await page
        .locator("input[required], textarea[required]")
        .all()) {
        const type = await input.getAttribute("type");
        if (type === "checkbox") continue;
        const name = await input.getAttribute("name");
        await input.fill(
          type === "date"
            ? "2026-10-09"
            : type === "email"
              ? "synthetic@example.test"
              : type === "tel"
                ? "202-555-0100"
                : /guestName|ownerName/.test(name)
                  ? "Synthetic Signer"
                  : "Synthetic test information",
        );
      }
      await page
        .getByRole("button", { name: "Continue", exact: false })
        .click();
    }
    await page
      .getByRole("heading", {
        name: kind === "liability" ? "Read & initial" : "Read & review",
        exact: true,
      })
      .waitFor();
    if (kind === "liability") {
      const mark = page.getByRole("group", {
        name: "Guest initials",
        exact: true,
      });
      await mark
        .getByRole("button", { name: "Type initials", exact: true })
        .click();
      await mark.getByRole("textbox", { name: "Typed initials" }).fill("SS");
      for (const button of await page.locator('button[id^="initial-p"]').all())
        await button.click();
    }
    await page.getByRole("button", { name: "Continue", exact: false }).click();
    const signature = page.getByRole("group", {
      name: kind === "liability" ? "Guest signature" : "Owner signature",
      exact: true,
    });
    await signature.getByRole("textbox").fill("Synthetic Signer");
    await page.locator(".consent-line input").check();
    await page.getByRole("button", { name: "Continue", exact: false }).click();
    await page
      .getByRole("heading", { name: "Review & finish", exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Finish & submit", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal(
      await page.locator(".source-document [data-applied-initials]").count(),
      kind === "liability" ? 16 : 0,
    );
    assert.equal(
      await page.getByRole("heading", { name: /Thank you/i }).count(),
      0,
    );
    for (const theme of ["mint-light", "mint-dark"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.corvaTheme = value;
      }, theme);
      for (const width of [320, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          true,
          `${kind} ${theme} ${width}: no overflow`,
        );
      }
    }
    await page.evaluate(() => {
      document.documentElement.dataset.corvaTheme = "mint-light";
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await mkdir("output/playwright", { recursive: true });
    await page.screenshot({
      path: `output/playwright/envet-${kind}-guided-review.png`,
      fullPage: true,
    });
  }
  // Member controls run against isolated, nonbinding mock responses only.
  for (const mode of ["success", "conflict", "lost-response"]) {
    await page.goto(`${base}member-workspace.html?mode=${mode}`);
    await page.getByText("Your preparation has not been saved yet.").waitFor();
    await page
      .getByRole("link", { name: "Your ENVET account and tasks" })
      .waitFor();
    await page
      .getByLabel("Choose your next step")
      .selectOption("/account/pre-visit");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByText("/account/pre-visit", { exact: true }).waitFor();
    const pants = page.getByRole("checkbox", {
      name: /Long pants with room to move/,
    });
    await pants.check();
    await page
      .getByRole("button", { name: "Save preparation", exact: true })
      .click();
    if (mode === "conflict") {
      await page.getByText(/changed in another window/).waitFor();
      assert.equal(
        await page
          .getByRole("button", { name: "Save preparation", exact: true })
          .isDisabled(),
        true,
      );
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: "Reload saved checks" }).click();
      await page
        .getByText("Your preparation has not been saved yet.")
        .waitFor();
      assert.equal(await pants.isChecked(), false);
      assert.equal(
        await page
          .getByRole("checkbox", { name: /Shoes that cover/ })
          .isChecked(),
        true,
      );
    } else {
      if (mode === "lost-response") {
        await page.getByText(/Saving could not be confirmed/).waitFor();
        assert.equal(await pants.isChecked(), true);
        await page
          .getByRole("button", { name: "Save preparation", exact: true })
          .click();
      }
      await page
        .getByText("Your preparation is saved to your account.")
        .waitFor();
      assert.equal(
        await page
          .getByRole("button", { name: "Save preparation", exact: true })
          .isDisabled(),
        true,
      );
    }
    const facebook = page.getByRole("link", {
      name: "Share this article on Facebook (opens in a new tab)",
      exact: true,
    });
    assert.match(await facebook.getAttribute("href"), /envet.info/);
    assert.match(await facebook.getAttribute("rel"), /noopener/);
    assert.equal(
      await page
        .getByRole("link", { name: /Share this article on LinkedIn/ })
        .count(),
      1,
    );
    for (const theme of ["mint-light", "mint-dark"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.corvaTheme = value;
      }, theme);
      for (const width of [320, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          true,
          `member ${theme} ${width}: no overflow`,
        );
      }
    }
  }
  await page.goto(`${base}member-workspace.html`);
  await page.getByText("Your preparation has not been saved yet.").waitFor();
  await page.setViewportSize({ width: 1280, height: 900 });
  const require = createRequire(import.meta.url);
  await page.addScriptTag({
    content: await readFile(require.resolve("axe-core/axe.min.js"), "utf8"),
  });
  const memberAccessibility = await page.evaluate(async () =>
    (await window.axe.run()).violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
    })),
  );
  assert.deepEqual(
    memberAccessibility,
    [],
    "member task/checklist/sharing accessibility",
  );
  await page.screenshot({
    path: "output/playwright/envet-member-workspace.png",
    fullPage: true,
  });
  await page.goto(`${base}animal-workspace.html`);
  await page.getByRole("link", { name: "Management", exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Edit Test Dog", exact: true })
    .click();
  await page.getByLabel("Nickname", { exact: true }).fill("Sunny");
  await page
    .getByRole("button", { name: "Save & publish bio", exact: true })
    .click();
  await page.getByText("Bio saved.", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Move Test Dog to trash", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm move to trash", exact: true })
    .click();
  await page.getByText("Moved to trash.", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Trash", exact: true }).click();
  await page
    .getByRole("button", { name: "Restore as draft", exact: true })
    .click();
  await page.getByText("Restored as a draft.", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Profiles", exact: true }).click();
  await page.getByRole("button", { name: "New animal", exact: true }).click();
  await page.getByLabel("Animal name", { exact: false }).fill("New Test Cat");
  await page.getByLabel("Animal type", { exact: true }).selectOption("cat");
  await page
    .getByLabel("Short introduction", { exact: false })
    .fill("Synthetic cat bio for browser creation tests only.");
  await page.getByRole("button", { name: "Save bio", exact: true }).click();
  await page.getByText("Bio saved.", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Edit New Test Cat", exact: true })
    .waitFor();
  await page.goto(`${base}animal-workspace.html?mode=conflict`);
  await page
    .getByRole("button", { name: "Edit Test Horse", exact: true })
    .click();
  await page.getByLabel("Nickname", { exact: true }).fill("Unsaved draft");
  await page
    .getByRole("button", { name: "Save & publish bio", exact: true })
    .click();
  await page.getByText("This changed.", { exact: false }).waitFor();
  assert.equal(
    await page.getByLabel("Nickname", { exact: true }).inputValue(),
    "Unsaved draft",
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Save & publish bio", exact: true })
      .isDisabled(),
    true,
  );
  await page
    .getByRole("button", { name: "Refresh profiles", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit Test Horse", exact: true })
    .waitFor();
  await page.goto(`${base}animal-workspace.html?mode=member&view=roster`);
  await page
    .getByRole("link", { name: "Your ENVET account and tasks" })
    .waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Management", exact: true }).count(),
    0,
  );
  await page.getByText("Get to know Test Horse", { exact: false }).click();
  await page.getByText("Get to know Test Dog", { exact: false }).click();
  assert.equal(await page.locator("details[open]").count(), 1);
  await page.getByRole("button", { name: "Cats 1", exact: true }).click();
  assert.equal(await page.locator(".animal-card").count(), 1);
  assert.equal(
    await page.getByRole("heading", { name: "Test Cat", exact: true }).count(),
    1,
  );
  for (const view of ["roster", "manager"]) {
    for (const dark of [false, true])
      for (const width of [320, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `${base}animal-workspace.html?view=${view}${dark ? "&theme=dark" : ""}`,
        );
        await page
          .getByText(
            view === "roster"
              ? "Big personalities. Good company."
              : "Create an animal bio",
            { exact: true },
          )
          .waitFor();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          true,
          `${view} ${width} ${dark}`,
        );
        await page.addScriptTag({
          path: require.resolve("axe-core/axe.min.js"),
        });
        assert.deepEqual(
          await page.evaluate(async () =>
            (await window.axe.run()).violations.map((v) => v.id),
          ),
          [],
          `${view} axe ${width} ${dark}`,
        );
      }
  }
  await page.screenshot({
    path: "output/playwright/envet-animal-manager.png",
    fullPage: true,
  });
  assert.deepEqual(failures, []);
  console.log(
    "Browser regressions passed: team refresh/errors, independent autofill, drawn and keyboard-applied initials, filled review/receipts, unchanged signing retry, separate guardian signatures; member task navigation, checklist conflict/retry states, share links; animal CRUD/trash/restore/conflicts, manager-only navigation, filters and single-open stories; 320/768/1280 mint light/dark layouts and axe accessibility.",
  );
} finally {
  await browser?.close();
  await server.close();
}
