import { afterEach, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join, sep } from "node:path";
import sharp from "sharp";
// @ts-expect-error Offline maintenance is a native Node module, not bundled app code.
import { optimizeUploadedPortraits } from "../scripts/optimize-uploaded-portraits.mjs";
const owned: string[] = [];
const key = "11111111-1111-4111-8111-111111111111.webp";
async function fixture(width = 1600) {
  const root = await mkdtemp(join(tmpdir(), "envet-portrait-test-"));
  owned.push(root);
  const source = join(root, "originals");
  const output = join(root, "optimized");
  await mkdir(source);
  const bytes = await sharp({
    create: { width, height: 800, channels: 3, background: "#557b66" },
  })
    .withExif({ IFD0: { Artist: "Synthetic test" } })
    .webp()
    .toBuffer();
  await writeFile(join(source, key), bytes);
  return { root, source, output, bytes };
}
afterEach(async () => {
  for (const directory of owned.splice(0)) {
    if (
      !resolve(directory).startsWith(
        resolve(tmpdir()) + sep + "envet-portrait-test-",
      )
    )
      throw new Error("Refuse cleanup outside owned test directory.");
    await rm(directory, { recursive: true, force: true });
  }
});
it("keeps originals unchanged, writes smaller metadata-free WebP and produces hashes", async () => {
  const { source, output, bytes } = await fixture();
  const report = await optimizeUploadedPortraits(source, output, 1);
  expect(report.changed).toBe(1);
  expect(report.afterBytes).toBeLessThan(report.beforeBytes);
  expect(await readFile(join(source, key))).toEqual(bytes);
  const image = await sharp(await readFile(join(output, key))).metadata();
  expect(image.width).toBe(1280);
  expect(image.exif).toBeUndefined();
  expect(report.results[0].beforeSha256).toMatch(/^[a-f0-9]{64}$/);
  expect(report.results[0].afterSha256).not.toBe(
    report.results[0].beforeSha256,
  );
});
it("refuses incomplete backups and existing output folders without touching originals", async () => {
  const { source, output, bytes } = await fixture();
  await expect(optimizeUploadedPortraits(source, output, 2)).rejects.toThrow(
    "Incomplete backup",
  );
  await expect(optimizeUploadedPortraits(source, source, 1)).rejects.toThrow(
    "separate",
  );
  await mkdir(output);
  await expect(optimizeUploadedPortraits(source, output, 1)).rejects.toThrow();
  expect(await readFile(join(source, key))).toEqual(bytes);
});
it("does not recompress already optimized copies on a second run", async () => {
  const { root, source, output } = await fixture();
  await optimizeUploadedPortraits(source, output, 1);
  const again = await optimizeUploadedPortraits(output, join(root, "again"), 1);
  expect(again.changed).toBe(0);
  expect(again.results[0].beforeSha256).toBe(again.results[0].afterSha256);
});
