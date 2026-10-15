import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/community/supabase", () => ({
  staffUser: vi.fn(),
  serviceClient: vi.fn(),
}));
vi.mock("@/lib/community/config", () => ({
  dataConfig: vi.fn(() => ({})),
  communityConfig: vi.fn(() => ({
    url: "https://example.supabase.co",
    publishableKey: "synthetic-only",
  })),
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
import { staffUser, serviceClient } from "@/lib/community/supabase";
import { createClient } from "@supabase/supabase-js";
import { communityConfig, dataConfig } from "@/lib/community/config";
import {
  blankOrganization,
  organizationVersion,
  parseOrganization,
} from "@/lib/community/organizations";
import { publishedOrganizations } from "@/lib/community/public-organizations";
import { ContributingOrganizations } from "@/components/contributing-organizations";
import { organizationImport } from "@/lib/contributors";
import { GET, POST, DELETE, PATCH } from "@/app/api/team/organizations/route";
vi.stubGlobal("React", React);
const actor = "11111111-1111-4111-8111-111111111111";
const draft = {
  ...blankOrganization,
  slug: "synthetic-org",
  name: "Synthetic Organization",
  href: "https://example.org/",
};
const request = (
  body: unknown,
  method = "POST",
  origin = "http://localhost:3001",
) =>
  new Request("http://localhost:3001/api/team/organizations", {
    method,
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.mocked(staffUser).mockReset();
  vi.mocked(serviceClient).mockReset();
  vi.mocked(createClient).mockReset();
  vi.mocked(dataConfig).mockReturnValue({} as never);
});
describe("organization content and authorization", () => {
  it("preserves the approved eight entries and accepts optional links without inventing claims", () => {
    expect(organizationImport).toHaveLength(8);
    for (const org of organizationImport)
      expect(parseOrganization(org)).toEqual(org);
    expect(
      parseOrganization({ ...draft, href: "", description: "" }),
    ).not.toBeNull();
    for (const href of [
      "javascript:alert(1)",
      "data:text/html,hi",
      "http://example.org",
      "https://user:pass@example.org",
      "https://localhost/",
      "https://127.0.0.1/",
      "https://example.org:444/",
      "https://example.org/\nfoo",
      "https://example.org\\@evil.example/",
    ])
      expect(parseOrganization({ ...draft, href })).toBeNull();
    for (const patch of [
      { name: "x" },
      { description: "x".repeat(501) },
      { sort_order: -1 },
      { sort_order: 1.1 },
      { sort_order: "10" },
      { state: "archived" },
      { slug: "../a" },
    ])
      expect(parseOrganization({ ...draft, ...patch })).toBeNull();
    expect(organizationVersion(undefined)).toBe(false);
    expect(organizationVersion(2147483647)).toBe(false);
  });
  it("denies visitors, forged staff data, wrong origins and unconfigured service", async () => {
    vi.mocked(staffUser).mockResolvedValue(null);
    expect(
      (await GET(new Request("http://localhost:3001/api/team/organizations")))
        .status,
    ).toBe(403);
    for (const method of [POST, DELETE, PATCH])
      expect(
        (await method(request({ ...draft, expectedVersion: 1, manager: true })))
          .status,
      ).toBe(403);
    vi.mocked(staffUser).mockResolvedValue({ id: actor } as never);
    expect(
      (await POST(request(draft, "POST", "https://evil.example"))).status,
    ).toBe(403);
    vi.mocked(dataConfig).mockReturnValue(null);
    expect((await POST(request(draft))).status).toBe(503);
    expect(serviceClient).not.toHaveBeenCalled();
  });
  it("uses verified actor, bounded input, immutable current versions and no-store responses", async () => {
    vi.mocked(staffUser).mockResolvedValue({ id: actor } as never);
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    vi.mocked(serviceClient).mockReturnValue({ rpc } as never);
    const saved = await POST(
      request({ ...draft, expectedVersion: null, actor: "spoof" }),
    );
    expect(saved.status).toBe(200);
    expect(saved.headers.get("cache-control")).toContain("no-store");
    expect(rpc).toHaveBeenCalledWith("staff_save_organization", {
      p_actor: actor,
      p_entry: draft,
      p_expected: null,
    });
    expect((await POST(request({ ...draft, expectedVersion: 0 }))).status).toBe(
      400,
    );
    expect(
      (
        await POST(
          request({
            ...draft,
            extra: "x".repeat(13000),
            expectedVersion: null,
          }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await DELETE(
          request({ slug: draft.slug, expectedVersion: null }, "DELETE"),
        )
      ).status,
    ).toBe(400);
    expect(
      (await PATCH(request({ slug: draft.slug, expectedVersion: 1 }, "PATCH")))
        .status,
    ).toBe(200);
    expect(rpc).toHaveBeenLastCalledWith("staff_remove_organization", {
      p_actor: actor,
      p_slug: draft.slug,
      p_expected: 1,
      p_restore: true,
    });
    rpc.mockResolvedValue({ data: null, error: { code: "P0002" } });
    expect(
      (
        await DELETE(
          request({ slug: draft.slug, expectedVersion: 1 }, "DELETE"),
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await GET(
          new Request("http://localhost:3001/api/team/organizations?page=-1"),
        )
      ).status,
    ).toBe(400);
  });
  it("renders plain text, safe outbound labels, optional description and no-link names", () => {
    const html = renderToStaticMarkup(
      React.createElement(ContributingOrganizations, {
        organizations: [
          {
            ...draft,
            name: "<script>bad()</script>",
            description: "<img src=x onerror=alert(1)>",
            href: "",
          },
        ],
      }),
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<a ");
    const empty = renderToStaticMarkup(
      React.createElement(ContributingOrganizations, { organizations: [] }),
    );
    expect(empty).not.toContain("EQUUS Foundation");
  });
  it("paginates manager lists separately for active and removed entries", async () => {
    vi.mocked(staffUser).mockResolvedValue({ id: actor } as never);
    const query = {
      select: vi.fn(),
      is: vi.fn(),
      not: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
    };
    for (const key of ["select", "is", "not", "order"] as const)
      query[key].mockReturnValue(query);
    query.range.mockResolvedValue({ data: [draft], error: null, count: 101 });
    vi.mocked(serviceClient).mockReturnValue({
      from: vi.fn(() => query),
    } as never);
    const response = await GET(
      new Request(
        "http://localhost:3001/api/team/organizations?page=1&removed=true",
      ),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      organizations: [draft],
      more: true,
    });
    expect(query.not).toHaveBeenCalledWith("deleted_at", "is", null);
    expect(query.range).toHaveBeenCalledWith(50, 99);
    expect(
      (
        await GET(
          new Request(
            "http://localhost:3001/api/team/organizations?removed=maybe",
          ),
        )
      ).status,
    ).toBe(400);
  });
  it("reads published nonremoved rows with deterministic order and no static fallback", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      is: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
    };
    for (const key of ["select", "eq", "is", "order"] as const)
      query[key].mockReturnValue(query);
    query.range.mockResolvedValue({ data: [], error: null });
    const from = vi.fn(() => query);
    vi.mocked(createClient).mockReturnValue({ from } as never);
    expect(await publishedOrganizations()).toEqual([]);
    expect(from).toHaveBeenCalledWith("contributing_organizations");
    expect(query.eq).toHaveBeenCalledWith("state", "published");
    expect(query.is).toHaveBeenCalledWith("deleted_at", null);
    expect(query.order.mock.calls.map((call) => call[0])).toEqual([
      "sort_order",
      "name",
      "slug",
    ]);
    query.range.mockResolvedValue({
      data: null,
      error: { code: "unavailable" },
    });
    expect(await publishedOrganizations()).toEqual([]);
    vi.mocked(communityConfig).mockReturnValueOnce(null);
    expect(await publishedOrganizations()).toEqual([]);
  });
  it("continues public reads beyond the first Data API page", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      is: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
    };
    for (const key of ["select", "eq", "is", "order"] as const)
      query[key].mockReturnValue(query);
    query.range
      .mockResolvedValueOnce({
        data: Array.from({ length: 500 }, (_, i) => ({
          ...draft,
          slug: `synthetic-${i}`,
        })),
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ ...draft, slug: "last-synthetic" }],
        error: null,
      });
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => query),
    } as never);
    expect(await publishedOrganizations()).toHaveLength(501);
    expect(query.range.mock.calls).toEqual([
      [0, 499],
      [500, 999],
    ]);
  });
});
