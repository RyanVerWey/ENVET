import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/community/public-content", () => ({
  publishedContent: vi.fn(),
}));
vi.mock("@/lib/community/public-organizations", () => ({
  publishedOrganizations: vi.fn().mockResolvedValue([]),
}));
import { publishedContent } from "@/lib/community/public-content";
import Programs from "@/app/programs/page";
import { ContributingOrganizations } from "@/components/contributing-organizations";
import {
  initialContributingOrganizations as contributingOrganizations,
  organizationImport,
} from "@/lib/contributors";
import { parseContent } from "@/lib/community/validation";
import programs from "../content/programs.json";
import Home from "@/app/page";
import About from "@/app/about/page";
vi.stubGlobal("React", React);
describe("owner-supplied program and contributor content", () => {
  it("renders the expanded military audience and free donor-supported care on mission pages", async () => {
    for (const element of [React.createElement(Home), await About()]) {
      const html = renderToStaticMarkup(element);
      expect(html).toContain("United States and partner-nation Veterans");
      expect(html).toContain("Active Duty and Reserve Service Members");
      expect(html).toContain("Families of Fallen Heroes");
      expect(html).toContain("free of charge");
      expect(html).not.toContain("Facebook page describes free");
    }
  });
  it("imports exactly five real program descriptions compatible with existing manager validation", () => {
    expect(programs).toHaveLength(5);
    expect(new Set(programs.map((p) => p.slug)).size).toBe(5);
    for (const program of programs)
      expect(
        parseContent({
          ...program,
          kind: "service",
          state: "published",
          expectedVersion: null,
        }),
      ).not.toBeNull();
    expect(programs[0].details).toContain("No riding");
  });
  it("uses the owner-requested nonfinancial label and eight safe official links, not badges", () => {
    const html = renderToStaticMarkup(
      React.createElement(ContributingOrganizations, {
        organizations: organizationImport,
      }),
    );
    expect(html).toContain("Contributing Organizations");
    expect(html).toContain("not only financial gifts");
    expect(contributingOrganizations).toHaveLength(8);
    for (const org of contributingOrganizations) {
      expect(new URL(org.href).protocol).toBe("https:");
      expect(html).toContain(org.href.replaceAll("&", "&amp;"));
    }
    expect(html).not.toMatch(/<img|accredited|sponsored by|donated \$/i);
  });
  it("shows only published database results and never resurrects archived entries from the import file", async () => {
    vi.mocked(publishedContent).mockResolvedValue({
      horses: [],
      services: [programs[1]],
    });
    const html = renderToStaticMarkup(await Programs());
    expect(html).toContain("Therapeutic Horsemanship");
    expect(html).not.toContain('id="specialty-workshops"');
    expect(html).toContain('name="envet-accordion"');
    expect(html).toContain("EAGALA-model psychotherapy is unmounted");
    vi.mocked(publishedContent).mockResolvedValue({ horses: [], services: [] });
    const empty = renderToStaticMarkup(await Programs());
    expect(empty).toContain("Find your opportunity with the team");
    expect(empty).not.toContain('id="therapeutic-horsemanship"');
  });
});
