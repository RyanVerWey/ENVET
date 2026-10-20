import assert from "node:assert/strict";
import sharp from "sharp";

export async function checkPortraitUploads(page, base, require) {
  const photo = "55555555-5555-4555-8555-555555555555.webp";
  const small = await sharp({
    create: { width: 900, height: 1200, channels: 3, background: "#557b66" },
  })
    .jpeg()
    .toBuffer();
  const noise = Buffer.alloc(4096 * 3072 * 3);
  let seed = 42;
  for (let i = 0; i < noise.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    noise[i] = seed >>> 24;
  }
  const large = await sharp(noise, {
    raw: { width: 4096, height: 3072, channels: 3 },
  })
    .jpeg({ quality: 92 })
    .toBuffer();
  assert.ok(large.length > 3_000_000 && large.length < 20_000_000);
  const input = (
    buffer = small,
    name = "portrait.jpg",
    mimeType = "image/jpeg",
  ) => ({ buffer, name, mimeType });

  // Synthetic transport makes progress, timeout, late ACK and retry deterministic.
  // A separate real XMLHttpRequest test below verifies the actual multipart bytes.
  await page.addInitScript(() => {
    if (!new URLSearchParams(location.search).has("portraitMock")) return;
    const fixture = { sends: [], aborts: 0, mode: "hold", finish: null };
    window.portraitFixture = fixture;
    window.XMLHttpRequest = class {
      upload = {};
      responseText = "";
      status = 0;
      open(method, url) {
        this.url = url;
        this.method = method;
      }
      send(data) {
        const file = data.get("photo");
        fixture.sends.push({
          size: file.size,
          type: file.type,
          name: file.name,
          rights: data.get("rights"),
        });
        this.upload.onprogress?.(
          new ProgressEvent("progress", {
            lengthComputable: true,
            loaded: 45,
            total: 100,
          }),
        );
        fixture.finish = (status = 200, malformed = false) => {
          this.upload.onload?.();
          this.status = status;
          this.responseText = malformed
            ? "<html>unavailable</html>"
            : JSON.stringify(
                status === 200
                  ? { photo: "55555555-5555-4555-8555-555555555555.webp" }
                  : { error: "Photo did not upload. Try again." },
              );
          this.onload?.();
        };
        fixture.secure = () => this.upload.onload?.();
        fixture.timeout = () => this.ontimeout?.();
        fixture.networkError = () => this.onerror?.();
      }
      abort() {
        fixture.aborts++;
      }
    };
  });
  await page.route("**/api/animals/photo/*", (route) =>
    route.fulfill({ status: 200, contentType: "image/jpeg", body: small }),
  );
  async function open(width = 1280, dark = false, mock = true) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      `${base}animal-workspace.html?${mock ? "portraitMock=1&" : ""}${dark ? "theme=dark" : ""}`,
    );
    await page
      .getByRole("button", { name: "Edit Test Dog", exact: true })
      .click();
  }
  async function choose(file = input()) {
    await page
      .getByLabel("Choose a photo", { exact: true })
      .setInputFiles(file);
    await page
      .getByText("Photo ready. Check the preview", { exact: false })
      .waitFor();
  }
  const permissions = () =>
    page.getByRole("checkbox", {
      name: "I have permission to publish this photo",
      exact: false,
    });
  const upload = () =>
    page.getByRole("button", { name: "Upload photo", exact: true });
  const save = () =>
    page.getByRole("button", { name: "Save & publish bio", exact: true });
  const waitForSave = () =>
    page.waitForFunction(() => {
      const button = document.querySelector(
        '.animal-editor-layout button[type="submit"]',
      );
      return button && !button.disabled;
    });
  async function axe() {
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    assert.deepEqual(
      await page.evaluate(async () =>
        (await window.axe.run()).violations.map((v) => v.id),
      ),
      [],
    );
  }
  await open();
  await page
    .getByLabel("Their story")
    .fill("Keep this unsaved story during every upload recovery.");
  await choose(input(large, "synthetic-phone-photo.jpg"));
  assert.equal(await save().isDisabled(), true);
  assert.equal(await upload().isDisabled(), true);
  assert.equal(
    await page
      .getByRole("button", { name: "Edit Test Horse", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(
    await page
      .getByRole("img", { name: "Selected portrait preview", exact: false })
      .count(),
    1,
  );
  const previewInfo = await page
    .locator(".portrait-upload-preview img")
    .evaluate(async (image) => {
      await image.decode();
      const blob = await (await fetch(image.src)).blob();
      return {
        width: image.naturalWidth,
        height: image.naturalHeight,
        bytes: blob.size,
        type: blob.type,
      };
    });
  assert.ok(previewInfo.width <= 1280 && previewInfo.height <= 1280);
  assert.ok(previewInfo.bytes <= 300_000);
  assert.equal(previewInfo.type, "image/webp");
  assert.equal(
    (await page.evaluate(() => window.portraitFixture)).sends.length,
    0,
  );
  console.log(
    `Portrait compression: ${large.length} bytes → ${previewInfo.bytes} bytes (${(100 * (1 - previewInfo.bytes / large.length)).toFixed(1)}% smaller), ${previewInfo.width}×${previewInfo.height} WebP.`,
  );
  await permissions().check();
  await upload().focus();
  await page.keyboard.press("Enter");
  const progress = page.getByRole("progressbar", {
    name: "Photo upload",
    exact: true,
  });
  await progress.waitFor();
  assert.equal(await progress.getAttribute("value"), "45");
  await axe();
  await page.evaluate(() => window.portraitFixture.secure());
  await page
    .getByRole("progressbar", { name: "Securing photo", exact: true })
    .waitFor();
  assert.equal(await page.getByRole("progressbar").getAttribute("value"), null);
  await page.evaluate(() => window.portraitFixture.finish());
  await page
    .getByText("Photo uploaded. Add a photo description", { exact: false })
    .waitFor();
  await waitForSave();
  assert.equal(await save().isEnabled(), true);
  assert.equal(
    await page.getByLabel("Their story").inputValue(),
    "Keep this unsaved story during every upload recovery.",
  );
  assert.equal(
    await page.locator(".animal-card-preview img").getAttribute("src"),
    `/api/animals/photo/${photo}?w=640`,
  );
  assert.match(
    await page.locator(".animal-card-preview img").getAttribute("srcset"),
    /w=320 320w/,
  );

  // Failures preserve both the prepared retry and existing portrait/draft.
  for (const outcome of [403, 503, "malformed", "network", "timeout"]) {
    await open();
    await page.getByLabel("Their story").fill("Preserve my unsaved text.");
    await choose();
    await permissions().check();
    await upload().click();
    await page.evaluate((mode) => {
      if (mode === "network") window.portraitFixture.networkError();
      else if (mode === "timeout") window.portraitFixture.timeout();
      else
        window.portraitFixture.finish(
          typeof mode === "number" ? mode : 200,
          mode === "malformed",
        );
    }, outcome);
    await page.getByRole("alert").waitFor();
    assert.equal(await upload().isEnabled(), true);
    assert.equal(
      await page.getByLabel("Their story").inputValue(),
      "Preserve my unsaved text.",
    );
    assert.match(
      await page.locator(".animal-card-preview img").getAttribute("src"),
      /44444444/,
    );
    await upload().click();
    await page.evaluate(() => window.portraitFixture.finish());
    await page
      .getByText("Photo uploaded. Add a photo description", { exact: false })
      .waitFor();
    assert.equal(
      (await page.evaluate(() => window.portraitFixture)).sends.length,
      2,
    );
  }
  await open();
  await choose();
  await permissions().check();
  await upload().click();
  await page.getByRole("button", { name: "Cancel photo", exact: true }).click();
  await page.evaluate(() => window.portraitFixture.finish()); // Late response must not attach.
  assert.match(
    await page.locator(".animal-card-preview img").getAttribute("src"),
    /44444444/,
  );
  assert.equal(
    await page
      .locator("#animal-photo")
      .evaluate((input) => input === document.activeElement),
    true,
  );
  await waitForSave();
  assert.equal(await save().isEnabled(), true);

  // Cancellation while conversion is awaiting decode must not resurrect a preview.
  await open();
  await page.evaluate(() => {
    const decode = window.createImageBitmap.bind(window);
    window.createImageBitmap = async (...args) => {
      await new Promise((resolve) => {
        window.finishPortraitDecode = resolve;
      });
      return decode(...args);
    };
  });
  await page
    .getByLabel("Choose a photo", { exact: true })
    .setInputFiles(input());
  await page
    .getByRole("progressbar", { name: "Photo conversion", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Cancel photo", exact: true }).click();
  await page.evaluate(() => window.finishPortraitDecode?.());
  await page.getByText("Photo selection canceled.", { exact: false }).waitFor();
  assert.equal(await page.locator(".portrait-upload-preview img").count(), 0);

  for (const [file, error] of [
    [
      input(Buffer.from("HEIC"), "iphone.heic", "image/heic"),
      "Choose a still JPG",
    ],
    [input(Buffer.from("<svg/>"), "fake.jpg"), "Choose a still JPG"],
    [input(Buffer.from([255, 216, 255]), "corrupt.jpg"), "could not be opened"],
    [input(Buffer.alloc(0), "empty.jpg"), "file is empty"],
    [input(Buffer.alloc(20_000_001), "too-large.jpg"), "over 20 MB"],
  ]) {
    await open(320, true);
    await page
      .getByLabel("Choose a photo", { exact: true })
      .setInputFiles(file);
    await page.getByRole("alert").filter({ hasText: error }).waitFor();
    await waitForSave();
    assert.equal(await save().isEnabled(), true);
    assert.equal(
      (await page.evaluate(() => window.portraitFixture)).sends.length,
      0,
    );
    await axe();
  }
  for (const format of ["png", "webp"]) {
    await open();
    await choose(
      input(
        await sharp(small)[format]().toBuffer(),
        `portrait.${format}`,
        `image/${format}`,
      ),
    );
    await page
      .getByRole("button", { name: "Cancel photo", exact: true })
      .click();
  }

  // Exercise real XHR/form-data (all bytes intercepted locally; no Supabase writes).
  let multipart;
  await page.route("**/api/team/animals/photo", async (route) => {
    multipart = route.request().postDataBuffer();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ photo }),
    });
  });
  await open(1280, false, false);
  await choose(input(large));
  await permissions().check();
  await upload().click();
  await page
    .getByText("Photo uploaded. Add a photo description", { exact: false })
    .waitFor();
  assert.ok(multipart.length < 301_000);
  assert.ok(multipart.includes(Buffer.from('filename="portrait.webp"')));
  assert.ok(multipart.includes(Buffer.from("Content-Type: image/webp")));
  assert.ok(multipart.includes(Buffer.from("RIFF")));
  assert.ok(!multipart.includes(large.subarray(0, 100)));
  await save().click();
  await page.getByText("Bio saved.", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Edit Test Dog", exact: true })
    .click();
  assert.match(
    await page.locator(".animal-card-preview img").getAttribute("src"),
    /55555555/,
  );

  // Whole manager responsive layout, both themes, ready and progress states.
  for (const dark of [false, true]) {
    for (const [width, height] of [
      [320, 568],
      [568, 320],
      [768, 1024],
      [1024, 768],
      [1280, 800],
      [3440, 1440],
    ]) {
      await open(width, dark);
      await page.setViewportSize({ width, height });
      await choose(
        input(
          small,
          "A very long but valid photo filename to check wrapping on a small screen.jpg",
        ),
      );
      assert.equal(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
        true,
        `portrait overflow ${width} ${dark}`,
      );
      await axe();
      await permissions().check();
      await upload().click();
      await page
        .getByRole("progressbar", { name: "Photo upload", exact: true })
        .waitFor();
      assert.equal(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
        true,
      );
      await page
        .getByRole("button", { name: "Cancel photo", exact: true })
        .click();
    }
  }
  await open(1280, false);
  await choose(input(small, "Example portrait.jpg"));
  await page
    .locator(".animal-upload")
    .screenshot({ path: "output/playwright/envet-portrait-upload.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content:
      "* {line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}",
  });
  assert.equal(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
  );
  await page.getByRole("button", { name: "Cancel photo", exact: true }).click();
  await page.unroute("**/api/team/animals/photo");
  await page.unroute("**/api/animals/photo/*");
  console.log(
    "Portrait browser checks passed: JPG/PNG/WebP conversion, >3 MB phone photo, 300 KB budget, preview, permission, real multipart upload, accurate progress, private attachment/save, errors/retry/cancel/late response, both mint themes, 320–3440px, keyboard, reduced motion, spacing and axe.",
  );
}
