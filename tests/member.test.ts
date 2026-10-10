import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/community/supabase", () => ({
  currentUser: vi.fn(),
  serviceClient: vi.fn(),
}));
vi.mock("@/lib/community/security", async (original) => ({
  ...(await original<typeof import("@/lib/community/security")>()),
  rateKey: () => "a".repeat(64),
}));
import { currentUser, serviceClient } from "@/lib/community/supabase";
import { memberFirstName } from "@/lib/community/member";
import { preparationInput, preparationKeys } from "@/lib/community/preparation";
import { preVisitVersion } from "@/lib/forms/pre-visit";
import { GET as session } from "@/app/api/account/session/route";
import { GET as read, POST as save } from "@/app/api/account/checklist/route";
import { articleShareLinks } from "@/lib/share";
import { getAuthor } from "@/lib/authors";
import { getPosts } from "@/lib/blog";
const actor = "22222222-2222-4222-8222-222222222222";
const input = {
  checked: ["pants"],
  version: 0,
  checklistVersion: preVisitVersion,
};
function request(value: unknown = input, origin = "http://localhost:3001") {
  return new Request("http://localhost:3001/api/account/checklist", {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
    },
    body: JSON.stringify(value),
  });
}
beforeEach(() => {
  vi.mocked(currentUser).mockReset();
  vi.mocked(serviceClient).mockReset();
});
describe("member display, private preparation and public sharing", () => {
  it("uses metadata for bounded display only and never falls back to email", () => {
    expect(memberFirstName({ full_name: "Ryan Verwey" })).toBe("Ryan");
    expect(
      memberFirstName({ given_name: "\u200bSam\n", name: "Other Person" }),
    ).toBe("Sam");
    expect(memberFirstName({ name: "person@example.com" })).toBeNull();
    expect(memberFirstName({ role: "admin" })).toBeNull();
    expect(memberFirstName({ name: "a".repeat(200) })).toHaveLength(40);
  });
  it("rejects arbitrary, duplicate, unknown-version and stale-invalid checklist input", () => {
    expect(preparationKeys).toHaveLength(10);
    expect(preparationInput(input)).toEqual(input);
    expect(preparationInput({ ...input, checked: ["diagnosis"] })).toBeNull();
    expect(
      preparationInput({ ...input, checked: ["pants", "pants"] }),
    ).toBeNull();
    expect(preparationInput({ ...input, version: -1 })).toBeNull();
    expect(preparationInput({ ...input, checklistVersion: "old" })).toBeNull();
  });
  it("returns only a first-name welcome, never tokens, account IDs or email", async () => {
    vi.mocked(currentUser).mockResolvedValue({
      id: actor,
      email: "synthetic@example.com",
      user_metadata: { given_name: "Sam", role: "admin" },
    } as never);
    const response = await session();
    expect(await response.json()).toEqual({
      signedIn: true,
      firstName: "Sam",
      manager: false,
    });
    expect(response.headers.get("cache-control")).toContain(
      "private, no-store",
    );
    vi.mocked(currentUser).mockResolvedValue(null);
    expect(await (await session()).json()).toEqual({
      signedIn: false,
      firstName: null,
      manager: false,
    });
  });
  it("denies cross-origin and signed-out checklist access before database use", async () => {
    expect((await save(request(input, "https://evil.example"))).status).toBe(
      403,
    );
    expect(currentUser).not.toHaveBeenCalled();
    vi.mocked(currentUser).mockResolvedValue(null);
    expect((await read()).status).toBe(401);
    expect((await save(request())).status).toBe(401);
    expect(serviceClient).not.toHaveBeenCalled();
  });
  it("shows management only after a fresh database grant, never from profile metadata", async () => {
    vi.mocked(currentUser).mockResolvedValue({
      id: actor,
      user_metadata: { given_name: "Sam", manager: true },
    } as never);
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    vi.mocked(serviceClient).mockReturnValue({ rpc } as never);
    expect(await (await session()).json()).toEqual({
      signedIn: true,
      firstName: "Sam",
      manager: true,
    });
    expect(rpc).toHaveBeenCalledWith("staff_access", { p_actor: actor });
    rpc.mockResolvedValue({ data: false, error: null });
    expect((await (await session()).json()).manager).toBe(false);
    rpc.mockResolvedValue({ data: true, error: { code: "42501" } });
    expect((await (await session()).json()).manager).toBe(false);
  });
  it("uses the verified account, rejects bad input and surfaces conflicts without false success", async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: actor } as never);
    const rpc = vi
      .fn()
      .mockResolvedValue({ data: { ...input, version: 1 }, error: null });
    vi.mocked(serviceClient).mockReturnValue({ rpc } as never);
    const response = await save(
      request({ ...input, actor: "spoof", staff: true }),
    );
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith(
      "member_save_preparation",
      expect.objectContaining({
        p_actor: actor,
        p_expected: 0,
        p_checked: ["pants"],
      }),
    );
    expect(
      (await save(request({ ...input, checked: ["medical-record"] }))).status,
    ).toBe(400);
    rpc.mockResolvedValue({ data: null, error: { code: "P0002" } });
    expect((await save(request())).status).toBe(409);
    rpc.mockResolvedValue({ data: null, error: null });
    expect((await save(request())).status).toBe(503);
  });
  it("shares only a canonical public article, encoding special characters without tracking SDKs", () => {
    const url = "https://envet.info/blog/first-visit-to-envet";
    const links = articleShareLinks("Veterans & families: a visit", url);
    expect(links.map((link) => link.network)).toEqual([
      "facebook",
      "linkedin",
      "x",
      "bluesky",
      "whatsapp",
      "reddit",
      "email",
    ]);
    for (const link of links)
      expect(decodeURIComponent(link.href)).toContain(url);
    expect(new URL(links[1].href).searchParams.get("url")).toBe(url);
    expect(new URL(links[2].href).searchParams.get("text")).toBe(
      "Veterans & families: a visit",
    );
  });
  it("uses the owner-supplied author identity and bio facts consistently", () => {
    const author = getAuthor("M. Lamm");
    expect(author?.type).toBe("Person");
    expect(author?.bio).toContain("Army Veteran");
    for (const post of getPosts()) expect(post.author).toBe(author?.name);
  });
});
