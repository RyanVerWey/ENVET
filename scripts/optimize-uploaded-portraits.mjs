import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const photoKey =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/;
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

// Offline maintenance only: no credentials, network, uploads, deletions or
// database changes. Input must be a separate, retained originals backup.
export async function optimizeUploadedPortraits(
  sourceDirectory,
  destination,
  expectedCount,
) {
  const source = resolve(sourceDirectory);
  const output = resolve(destination);
  assert.notEqual(
    source,
    output,
    "Keep originals and optimized copies separate.",
  );
  const files = (await readdir(source, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && photoKey.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  assert.ok(
    files.length > 0 && files.length <= 500,
    "Expected 1–500 UUID-named WebP portraits.",
  );
  assert.ok(
    Number.isSafeInteger(expectedCount) &&
      expectedCount > 0 &&
      expectedCount <= 500,
    "Supply the independently verified storage file count.",
  );
  assert.equal(
    files.length,
    expectedCount,
    "Incomplete backup: file count differs from storage inventory.",
  );
  // Must be new. Never overwrite either a backup or a previous run's outputs.
  await mkdir(output);
  const results = [];
  for (const name of files) {
    const original = await readFile(join(source, name));
    assert.ok(
      original.length > 0 && original.length <= 3_000_000,
      `${name}: stored upload size`,
    );
    const image = sharp(original, {
      limitInputPixels: 30_000_000,
      animated: false,
    });
    const before = await image.metadata();
    assert.equal(before.format, "webp", `${name}: actual WebP bytes`);
    assert.equal(before.pages ?? 1, 1, `${name}: still portrait`);
    let bytes = original;
    const alreadyOptimized =
      original.length <= 300_000 &&
      Math.max(before.width, before.height) <= 1280 &&
      !before.exif &&
      !before.xmp &&
      !before.iptc;
    if (!alreadyOptimized) {
      for (
        let attempt = 0, edge = 1280;
        attempt < 8;
        attempt++, edge = Math.max(320, Math.round(edge * 0.8))
      ) {
        bytes = await image
          .clone()
          .rotate()
          .resize(edge, edge, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: attempt === 0 ? 80 : 70, effort: 4 })
          .toBuffer();
        if (bytes.length <= 300_000) break;
      }
    }
    const after = await sharp(bytes).metadata();
    assert.equal(after.format, "webp");
    assert.ok(
      bytes.length <= 300_000 && Math.max(after.width, after.height) <= 1280,
      `${name}: web budget`,
    );
    assert.ok(
      !after.exif && !after.xmp && !after.iptc,
      `${name}: no embedded metadata`,
    );
    const changed = !alreadyOptimized;
    const final = changed ? bytes : original;
    await writeFile(join(output, name), final, { flag: "wx" });
    results.push({
      name,
      changed,
      beforeBytes: original.length,
      afterBytes: final.length,
      beforeWidth: before.width,
      beforeHeight: before.height,
      afterWidth: changed ? after.width : before.width,
      afterHeight: changed ? after.height : before.height,
      beforeSha256: digest(original),
      afterSha256: digest(final),
    });
  }
  const report = {
    source,
    output,
    files: results.length,
    changed: results.filter((entry) => entry.changed).length,
    beforeBytes: results.reduce((total, entry) => total + entry.beforeBytes, 0),
    afterBytes: results.reduce((total, entry) => total + entry.afterBytes, 0),
    results,
  };
  await writeFile(
    join(output, "optimization-report.json"),
    JSON.stringify(report, null, 2) + "\n",
    { flag: "wx" },
  );
  return report;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const [source, output, count] = process.argv.slice(2);
  assert.ok(
    source && output && count && process.argv.length === 5,
    "Usage: node scripts/optimize-uploaded-portraits.mjs <originals-directory> <new-output-directory> <expected-file-count>",
  );
  console.log(
    JSON.stringify(
      await optimizeUploadedPortraits(source, output, Number(count)),
      null,
      2,
    ),
  );
}
