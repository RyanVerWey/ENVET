import { describe, expect, it } from "vitest";
import { oauthRequestOrigin } from "../src/lib/community/config";
import {
  parseComment,
  parseContent,
  parseInquiry,
  safeReturnPath,
} from "../src/lib/community/validation";

describe("community input boundaries", () => {
  it("bounds local cookie origins and ignores production Host spoofing", () => {
    const local = "http://127.0.0.1:3001";
    for (const host of ["localhost:3001", "127.0.0.1:3001"])
      expect(
        oauthRequestOrigin("http://localhost:3001/auth/sign-in", host, local),
      ).toBe(`http://${host}`);
    for (const host of [
      "evil.example",
      "localhost:3002",
      "localhost:3001/evil",
      "user@localhost:3001",
    ])
      expect(
        oauthRequestOrigin("http://localhost:3001/auth/sign-in", host, local),
      ).toBeNull();
    expect(
      oauthRequestOrigin(
        "https://envet.info/auth/sign-in",
        "evil.example",
        "https://envet.info",
      ),
    ).toBe("https://envet.info");
    expect(
      oauthRequestOrigin(
        "http://localhost:3002/auth/sign-in",
        "localhost:3001",
        local,
      ),
    ).toBeNull();
  });

  it("rejects external, encoded, and auth-loop return paths", () => {
    for (const unsafe of [
      "https://evil.example/",
      "//evil.example/",
      "/%2f%2fevil.example/",
      "/%5cevil.example/",
      "/auth/sign-in",
      "/blog/%0aevil",
    ])
      expect(safeReturnPath(unsafe)).toBe("/account");
    expect(safeReturnPath("/blog/first-visit-to-envet?from=account")).toBe(
      "/blog/first-visit-to-envet?from=account",
    );
  });

  it("requires consent and a valid reply channel without accepting extra authority fields", () => {
    const good = {
      name: "Sam Visitor",
      email: "sam@example.com",
      phone: "",
      serviceInterest: "A first visit",
      note: "Please call after noon.",
      consent: true,
      role: "admin",
      status: "closed",
    };
    expect(parseInquiry(good)).toEqual({
      name: "Sam Visitor",
      email: "sam@example.com",
      phone: "",
      serviceInterest: "A first visit",
      note: "Please call after noon.",
      consent: true,
    });
    expect(parseInquiry({ ...good, consent: false })).toBeNull();
    expect(parseInquiry({ ...good, email: "", phone: "" })).toBeNull();
    expect(parseInquiry({ ...good, email: "not an email" })).toBeNull();
    expect(parseInquiry({ ...good, note: "x".repeat(501) })).toBeNull();
  });

  it("bounds plain text comments and content edits", () => {
    expect(parseComment({ body: "<script>alert(1)</script>" })).toBe(
      "<script>alert(1)</script>",
    );
    expect(parseComment({ body: "x" })).toBeNull();
    expect(parseComment({ body: "x".repeat(2001) })).toBeNull();
    const content = {
      kind: "horse",
      slug: "first-horse",
      title: "First horse",
      summary: "A factual description",
      details: "",
      state: "draft",
      expectedVersion: null,
      actor: "forged-admin-id",
    };
    expect(parseContent(content)).toEqual({
      kind: "horse",
      slug: "first-horse",
      title: "First horse",
      summary: "A factual description",
      details: "",
      state: "draft",
      expectedVersion: null,
    });
    expect(parseContent({ ...content, slug: "../admin" })).toBeNull();
    expect(parseContent({ ...content, expectedVersion: -1 })).toBeNull();
  });
});
