import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  formSource,
  formVersion,
  guardianCertificationVersion,
  liabilityInitials,
} from "@/lib/forms/definition";
import {
  signatureInput,
  submissionInput,
  initialMarkInput,
} from "@/lib/forms/validation";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { DocumentView } from "@/components/forms/document-view";
import { decrypt, digest, encrypt, encryptionReady } from "@/lib/forms/crypto";
import { collectionEnabled } from "@/lib/forms/server";
const key = Buffer.alloc(32, 7).toString("base64");
describe("applied initials", () => {
  const drawn = {
    method: "drawn",
    strokes: [
      [
        [0.1, 0.2],
        [0.4, 0.6],
        [0.8, 0.2],
      ],
    ],
  };
  it("validates bounded real strokes and typed / legacy marks, never arbitrary images or audit text", () => {
    expect(initialMarkInput(drawn)).toEqual(drawn);
    expect(initialMarkInput("TG")).toBe("TG");
    expect(initialMarkInput({ method: "typed", text: " TG " })).toEqual({
      method: "typed",
      text: "TG",
    });
    for (const bad of [
      { method: "drawn", strokes: [] },
      { ...drawn, text: "fake consent" },
      { method: "typed", text: "123" },
      {
        method: "drawn",
        strokes: [
          [
            [0, 0],
            [2, 0],
          ],
        ],
      },
      {
        method: "drawn",
        strokes: [Array.from({ length: 201 }, (_, i) => [i / 201, 0.2])],
      },
    ])
      expect(initialMarkInput(bad)).toBeNull();
  });
  it("fills all initial blanks with separate guest and guardian marks without mutating source", () => {
    const source = formSource("liability");
    const original = JSON.stringify(source);
    const initials = Object.fromEntries(
      liabilityInitials.map((i) => [`p${i}`, "TG"]),
    );
    const html = renderToStaticMarkup(
      createElement(DocumentView, {
        source,
        initials: { ...initials, parent: { method: "typed", text: "PG" } },
        minor: true,
      }),
    );
    expect(html.match(/data-applied-initials="true"/g)).toHaveLength(17);
    expect(html).toContain("PG");
    expect(html).not.toMatch(/_{2,}\s*Initials/);
    expect(JSON.stringify(source)).toBe(original);
    const adult = renderToStaticMarkup(
      createElement(DocumentView, { source, initials, minor: false }),
    );
    expect(adult.match(/data-applied-initials="true"/g)).toHaveLength(16);
    expect(adult).toContain("Not applicable (adult guest)");
  });
});
export function donationFixture() {
  return {
    kind: "donation",
    version: formVersion("donation"),
    requestId: "11111111-1111-4111-8111-111111111111",
    fields: {
      ownerName: "Test Owner",
      signedDate: "2026-10-09",
      phone: "540-555-0100",
      email: "owner@example.test",
      address: "Test address",
      cityStateZip: "Test city VA 00000",
      barnName: "Test horse",
      breed: "Test breed",
      dobAge: "10 years",
      gender: "Gelding",
      colorMarkings: "Bay",
    },
    minor: false,
    riding: ["Trail"],
    conditions: [],
    initials: {},
    guestSignature: { method: "typed", name: "Test Owner" },
    guardianSignature: null,
    consent: true,
  };
}
export function liabilityFixture(minor = false) {
  return {
    ...donationFixture(),
    kind: "liability",
    version: formVersion("liability"),
    fields: {
      guestName: "Test Guest",
      signedDate: "2026-10-09",
      phone: "540-555-0100",
      email: "guest@example.test",
      address: "Test address",
      emergencyName: "Test Contact",
      emergencyPhone: "540-555-0101",
      ...(minor ? { minorAge: "12", guardianName: "Test Guardian" } : {}),
    },
    minor,
    guardianCertified: minor,
    riding: [],
    initials: {
      ...Object.fromEntries(liabilityInitials.map((i) => [`p${i}`, "TG"])),
      ...(minor ? { parent: "TG" } : {}),
    },
    guestSignature: { method: "typed", name: "Test Guest" },
    guardianSignature: minor
      ? { method: "typed", name: "Test Guardian" }
      : null,
  };
}
afterEach(() => vi.unstubAllEnvs());
describe("source-preserving forms and signing validation", () => {
  it("pins supplied source revisions including the missing clause 3 and legacy statute wording", () => {
    expect(formSource("liability").sourceSha256).toBe(
      "4faaa9f75fa60d12e86594f0f2a8cbb7bafe9173db5a8debb5ae1f94f7eb67d6",
    );
    expect(formSource("donation").sourceSha256).toBe(
      "546fb70d3d2e8a6101afffd8b893e70b8310fb704efa0c9c31842cd635aadfb3",
    );
    expect(formSource("liability").paragraphs).toHaveLength(37);
    expect(formSource("donation").paragraphs).toHaveLength(96);
    expect(formSource("liability").paragraphs[16]).toContain(
      "fifteen (15) days",
    );
    expect(formSource("liability").paragraphs[19]).toMatch(/^4\./);
    expect(
      formSource("liability")
        .extraParts.flatMap((p) => p.paragraphs)
        .join(" "),
    ).toContain("PERSONAL PROTECTIVE EQUIPMENT");
  });
  it("accepts complete owner and adult/guardian records, requires separate guardian signature and initials", () => {
    expect(submissionInput(donationFixture())).not.toBeNull();
    expect(submissionInput(liabilityFixture())).not.toBeNull();
    expect(submissionInput(liabilityFixture(true))).not.toBeNull();
    expect(
      submissionInput({ ...liabilityFixture(true), guardianSignature: null }),
    ).toBeNull();
    const bad = liabilityFixture(true);
    delete (bad.initials as Record<string, string>).parent;
    expect(submissionInput(bad)).toBeNull();
  });
  it("rejects missing consent, staff fields, forged identity/version, impossible dates, excessive fields and wrong signature names", () => {
    const valid = donationFixture();
    for (const bad of [
      { ...valid, consent: false },
      { ...valid, actorId: "forged" },
      { ...valid, version: "old" },
      { ...valid, fields: { ...valid.fields, status: "accepted" } },
      { ...valid, fields: { ...valid.fields, signedDate: "2026-02-31" } },
      { ...valid, guestSignature: { method: "typed", name: "Someone Else" } },
      { ...valid, fields: { ...valid.fields, ownerName: "x".repeat(101) } },
    ])
      expect(submissionInput(bad)).toBeNull();
  });
  it("requires named child, lawful guardian certification and independent matching signatures", () => {
    const valid = liabilityFixture(true);
    for (const bad of [
      { ...valid, guardianCertified: undefined },
      { ...valid, guardianCertified: false },
      { ...valid, guardianCertified: "true" },
      { ...valid, fields: { ...valid.fields, guestName: "" } },
      { ...valid, fields: { ...valid.fields, minorAge: "18" } },
      { ...valid, fields: { ...valid.fields, guardianName: "" } },
      { ...valid, guestSignature: valid.guardianSignature },
      { ...valid, guardianSignature: valid.guestSignature },
    ])
      expect(submissionInput(bad)).toBeNull();
    expect(
      submissionInput({ ...liabilityFixture(), guardianCertified: true }),
    ).toBeNull();
    expect(
      submissionInput({ ...donationFixture(), guardianCertified: true }),
    ).toBeNull();
    expect(
      submissionInput({ ...valid, fields: { ...valid.fields, minorAge: "0" } }),
    ).not.toBeNull();
    expect(
      submissionInput({
        ...valid,
        fields: { ...valid.fields, minorAge: "17" },
      }),
    ).not.toBeNull();
  });
  it("requires a new liability approval version without changing donor version or source text", () => {
    expect(formVersion("liability")).toContain(guardianCertificationVersion);
    expect(formVersion("donation")).not.toContain(guardianCertificationVersion);
    const current = liabilityFixture(true);
    expect(
      submissionInput({
        ...current,
        version: current.version.replace(
          `-${guardianCertificationVersion}`,
          "",
        ),
      }),
    ).toBeNull();
  });
  it("validates bounded normalized strokes, not SVG/image URLs, empty taps or NaN", () => {
    expect(
      signatureInput(
        {
          method: "drawn",
          name: "Test",
          strokes: [
            [
              [0.1, 0.2],
              [0.8, 0.5],
            ],
          ],
        },
        "Test",
      ),
    ).not.toBeNull();
    for (const strokes of [
      [],
      [[[0, 0]]],
      [
        [
          [0, 0],
          [0, 0],
        ],
      ],
      [
        [
          [0, 0],
          [NaN, 1],
        ],
      ],
      [
        [
          [0, 0],
          [2, 1],
        ],
      ],
      [Array.from({ length: 2001 }, (_, i) => [i % 2, 0.1])],
    ])
      expect(
        signatureInput({ method: "drawn", name: "Test", strokes }, "Test"),
      ).toBeNull();
    expect(
      signatureInput(
        {
          method: "drawn",
          name: "Test",
          url: "https://evil.test/signature.svg",
          strokes: [
            [
              [0, 0],
              [1, 1],
            ],
          ],
        },
        "Test",
      ),
    ).toBeNull();
  });
});
describe("record encryption and release gates", () => {
  it("round-trips with AEAD, hides names, rejects changed ciphertext and wrong record context", () => {
    vi.stubEnv("FORM_ENCRYPTION_KEYS", JSON.stringify({ v1: key }));
    vi.stubEnv("FORM_ACTIVE_KEY_ID", "v1");
    expect(encryptionReady()).toBe(true);
    const value = {
      signature: "Test Signature",
      fields: { name: "Test Name" },
    };
    const box = encrypt(value, "record-1");
    expect(JSON.stringify(box)).not.toContain("Test");
    expect(decrypt(box, "record-1")).toEqual(value);
    expect(() => decrypt(box, "record-2")).toThrow();
    expect(() =>
      decrypt({ ...box, tag: Buffer.alloc(16).toString("base64") }, "record-1"),
    ).toThrow();
    expect(digest({ b: 2, a: 1 })).toBe(digest({ a: 1, b: 2 }));
  });
  it("decrypts old keys after rotation but fails closed without the original key", () => {
    vi.stubEnv("FORM_ENCRYPTION_KEYS", JSON.stringify({ v1: key }));
    vi.stubEnv("FORM_ACTIVE_KEY_ID", "v1");
    const box = encrypt({ value: 1 }, "context");
    vi.stubEnv(
      "FORM_ENCRYPTION_KEYS",
      JSON.stringify({ v1: key, v2: Buffer.alloc(32, 9).toString("base64") }),
    );
    vi.stubEnv("FORM_ACTIVE_KEY_ID", "v2");
    expect(decrypt(box, "context")).toEqual({ value: 1 });
    vi.stubEnv(
      "FORM_ENCRYPTION_KEYS",
      JSON.stringify({ v2: Buffer.alloc(32, 9).toString("base64") }),
    );
    expect(() => decrypt(box, "context")).toThrow();
  });
  it("never enables collection with absent keys/approval/data configuration", () => {
    vi.stubEnv("FORM_COLLECTION_ENABLED", "true");
    vi.stubEnv("FORM_APPROVED_DONATION_VERSION", formVersion("donation"));
    vi.stubEnv("FORM_APPROVED_LIABILITY_VERSION", formVersion("liability"));
    vi.stubEnv("FORM_ENCRYPTION_KEYS", "{}");
    vi.stubEnv("FORM_ACTIVE_KEY_ID", "constructor");
    expect(encryptionReady()).toBe(false);
    expect(collectionEnabled("liability")).toBe(false);
  });
});
