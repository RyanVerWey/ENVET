import { describe, expect, it } from "vitest";
import { fieldAutocomplete } from "@/lib/forms/autofill";
import { fieldSections } from "@/lib/forms/definition";

describe("signed-form autofill ownership", () => {
  it("opts only the signer's contact details into a named autofill section", () => {
    expect(fieldAutocomplete("phone")).toBe("section-signer tel");
    expect(fieldAutocomplete("guestName")).toBe("section-signer name");
    expect(fieldAutocomplete("ownerName")).toBe("section-signer name");
    expect(fieldAutocomplete("email")).toBe("section-signer email");
    expect(fieldAutocomplete("address")).toBe("section-signer street-address");
  });
  it.each([
    "emergencyPhone",
    "emergencyName",
    "guardianName",
    "barnName",
    "registeredName",
  ])("requires separate entry for %s", (key) => {
    expect(fieldAutocomplete(key)).toBe("off");
  });
  it("keeps each liability telephone field's autofill policy distinct", () => {
    const phones = fieldSections.liability
      .flatMap((s) => s.fields)
      .filter((f) => f.type === "tel");
    expect(phones.map((f) => [f.key, fieldAutocomplete(f.key)])).toEqual([
      ["phone", "section-signer tel"],
      ["emergencyPhone", "off"],
    ]);
  });
});
