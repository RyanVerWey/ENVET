import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : path.endsWith(".tsx")
        ? [path]
        : [];
  });
}

describe("site disclosure contract", () => {
  it("groups every expandable section into the same single-open page accordion", () => {
    const disclosures = sourceFiles("src").flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/<details\b[^>]*>/g)].map(
        ([tag]) => ({ path, tag }),
      ),
    );
    expect(disclosures.length).toBeGreaterThanOrEqual(6);
    for (const { path, tag } of disclosures) {
      expect(tag, path).toContain('name="envet-accordion"');
      expect(tag, path).not.toMatch(/\bopen(?:\s|=|>)/);
    }
  });

  it("places approved farm photography directly beneath the giving clarity heading", () => {
    const donate = readFileSync("src/app/donate/page.tsx", "utf8");
    expect(donate).toMatch(
      /Know where[\s\S]*?you’re giving\.[\s\S]*?<\/h2>\s*<Photo\s+src="\/images\/farm\.jpg"/,
    );
    const manifest = JSON.parse(
      readFileSync("docs/media-manifest.json", "utf8"),
    );
    expect(
      manifest.assets.find((asset: { file: string }) =>
        asset.file.endsWith("farm.jpg"),
      ).publicApproved,
    ).toBe(true);
  });
});
