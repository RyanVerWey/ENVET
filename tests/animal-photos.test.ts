import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/community/supabase", () => ({
  staffUser: vi.fn(),
  serviceClient: vi.fn(),
}));
import { staffUser, serviceClient } from "@/lib/community/supabase";
import { POST } from "@/app/api/team/animals/photo/route";
import { GET } from "@/app/api/animals/photo/[asset]/route";
const actor = "11111111-1111-4111-8111-111111111111";
const asset = "22222222-2222-4222-8222-222222222222.webp";
function uploadRequest(
  bytes: Uint8Array,
  type = "image/jpeg",
  rights = "confirmed",
) {
  const form = new FormData();
  form.append(
    "photo",
    new File([new Uint8Array(bytes)], "portrait.jpg", { type }),
  );
  form.append("rights", rights);
  return new Request("http://localhost:3001/api/team/animals/photo", {
    method: "POST",
    headers: { origin: "http://localhost:3001" },
    body: form,
  });
}
beforeEach(() => {
  vi.mocked(staffUser).mockReset();
  vi.mocked(serviceClient).mockReset();
});
describe("private animal portrait boundary", () => {
  it("requires a fresh manager and confirms permission before processing", async () => {
    vi.mocked(staffUser).mockResolvedValue(null);
    expect((await POST(uploadRequest(new Uint8Array()))).status).toBe(403);
    vi.mocked(staffUser).mockResolvedValue({ id: actor } as never);
    const rpc = vi.fn();
    vi.mocked(serviceClient).mockReturnValue({ rpc } as never);
    expect(
      (await POST(uploadRequest(new Uint8Array(), "image/jpeg", "no"))).status,
    ).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("decodes actual image bytes, downsizes, strips metadata and writes only a private WebP", async () => {
    vi.mocked(staffUser).mockResolvedValue({ id: actor } as never);
    const bytes = await sharp({
      create: { width: 2000, height: 1000, channels: 3, background: "green" },
    })
      .jpeg()
      .withExif({ IFD0: { Artist: "Synthetic metadata" } })
      .toBuffer();
    const upload = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upload });
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(serviceClient).mockReturnValue({
      rpc,
      storage: { from },
    } as never);
    const response = await POST(uploadRequest(bytes));
    expect(response.status).toBe(200);
    const { photo } = await response.json();
    expect(photo).toMatch(/^[0-9a-f-]{36}\.webp$/);
    expect(rpc).toHaveBeenCalledWith("staff_register_animal_photo", {
      p_actor: actor,
      p_path: photo,
    });
    expect(from).toHaveBeenCalledWith("animal-portraits");
    const info = await sharp(upload.mock.calls[0][1]).metadata();
    expect(info.format).toBe("webp");
    expect(info.width).toBe(1600);
    expect(info.exif).toBeUndefined();
    expect(info.xmp).toBeUndefined();
    expect(upload.mock.calls[0][2]).toEqual({
      contentType: "image/webp",
      upsert: false,
    });
    expect(
      (
        await POST(
          uploadRequest(
            new TextEncoder().encode(
              '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
            ),
          ),
        )
      ).status,
    ).toBe(400);
    upload.mockResolvedValue({ error: { message: "unavailable" } });
    expect((await POST(uploadRequest(bytes))).status).toBe(503);
  });
  it("denies draft portraits to visitors, serves published portraits without reusable public caching", async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    const download = vi
      .fn()
      .mockResolvedValue({ data: new Blob(["synthetic"]), error: null });
    vi.mocked(serviceClient).mockReturnValue({
      from: () => query,
      storage: { from: () => ({ download }) },
    } as never);
    vi.mocked(staffUser).mockResolvedValue(null);
    const read = () =>
      GET(new Request("http://localhost:3001/api/animals/photo/" + asset), {
        params: Promise.resolve({ asset }),
      });
    expect((await read()).status).toBe(404);
    expect(download).not.toHaveBeenCalled();
    query.limit.mockResolvedValue({
      data: [{ slug: "synthetic" }] as never,
      error: null,
    });
    const response = await read();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-type")).toBe("image/webp");
    query.limit.mockResolvedValue({ data: [], error: null });
    expect((await read()).status).toBe(404);
  });
});
