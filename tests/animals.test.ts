import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/community/supabase", () => ({
  staffUser: vi.fn(),
  serviceClient: vi.fn(),
}));
vi.mock("@/lib/community/config", () => ({ dataConfig: () => ({}) }));
import { staffUser, serviceClient } from "@/lib/community/supabase";
import { blankAnimal, parseAnimal } from "@/lib/community/animals";
import { POST, DELETE, PATCH, GET } from "@/app/api/team/animals/route";
const actor = "11111111-1111-4111-8111-111111111111";
const draft = {
  ...blankAnimal,
  name: "Synthetic Horse",
  slug: "synthetic-horse",
  summary: "A synthetic profile for isolated tests.",
};
function request(
  body: unknown,
  method = "POST",
  origin = "http://localhost:3001",
) {
  return new Request("http://localhost:3001/api/team/animals", {
    method,
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.mocked(staffUser).mockReset();
  vi.mocked(serviceClient).mockReset();
});
describe("animal management boundary", () => {
  it("allows only horse dog cat, bounded plain text and valid private photo keys", () => {
    for (const species of ["horse", "dog", "cat"])
      expect(parseAnimal({ ...draft, species })).not.toBeNull();
    for (const species of ["Horse", "bird", "__proto__"])
      expect(parseAnimal({ ...draft, species })).toBeNull();
    expect(parseAnimal({ ...draft, story: "x".repeat(4001) })).toBeNull();
    expect(
      parseAnimal({ ...draft, photo: "https://evil.example/track.jpg" }),
    ).toBeNull();
    expect(parseAnimal({ ...draft, state: "published" })).toBeNull();
  });
  it("rejects visitors, metadata-role spoofing and cross-origin mutations", async () => {
    vi.mocked(staffUser).mockResolvedValue(null);
    expect(
      (await POST(request({ ...draft, expectedVersion: null, manager: true })))
        .status,
    ).toBe(403);
    expect(
      (await GET(new Request("http://localhost:3001/api/team/animals"))).status,
    ).toBe(403);
    expect(
      (
        await DELETE(
          request({ slug: draft.slug, expectedVersion: 1 }, "DELETE"),
        )
      ).status,
    ).toBe(403);
    expect(
      (await POST(request({}, "POST", "https://evil.example"))).status,
    ).toBe(403);
    expect(serviceClient).not.toHaveBeenCalled();
  });
  it("uses verified actor, validates versions, reports conflicts and restores via separate action", async () => {
    vi.mocked(staffUser).mockResolvedValue({ id: actor } as never);
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    vi.mocked(serviceClient).mockReturnValue({ rpc } as never);
    expect(
      (await POST(request({ ...draft, expectedVersion: null, actor: "spoof" })))
        .status,
    ).toBe(200);
    expect(rpc).toHaveBeenCalledWith("staff_save_animal", {
      p_actor: actor,
      p_bio: draft,
      p_expected: null,
    });
    expect((await POST(request({ ...draft, expectedVersion: 0 }))).status).toBe(
      400,
    );
    expect(
      (await PATCH(request({ slug: draft.slug, expectedVersion: 1 }, "PATCH")))
        .status,
    ).toBe(200);
    expect(rpc).toHaveBeenLastCalledWith("staff_trash_animal", {
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
  });
});
