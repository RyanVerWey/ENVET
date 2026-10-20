import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/community/supabase", () => ({
  staffUser: vi.fn(),
  serviceClient: vi.fn(),
}));
vi.mock("@/lib/community/config", () => ({ dataConfig: () => ({}) }));
import { staffUser, serviceClient } from "@/lib/community/supabase";
import { optimizedPortrait } from "@/lib/portrait-server";
import { portraitByteLimit, photoSize } from "@/lib/portrait-image";
import { POST } from "@/app/api/team/animals/photo/route";
import { GET } from "@/app/api/animals/photo/[asset]/route";
const asset = "44444444-4444-4444-8444-444444444444.webp";
const actor = { id: "11111111-1111-4111-8111-111111111111" };
const base = "http://localhost:3001";
let source: Buffer;
beforeEach(async () => {
  vi.mocked(staffUser).mockReset();
  vi.mocked(serviceClient).mockReset();
  source = await sharp({
    create: { width: 2400, height: 1800, channels: 3, background: "#5e7850" },
  })
    .jpeg()
    .toBuffer();
});
function upload(
  bytes = source,
  type = "image/jpeg",
  rights = "confirmed",
  origin = base,
) {
  const data = new FormData();
  data.set("photo", new File([new Uint8Array(bytes)], "test.jpg", { type }));
  data.set("rights", rights);
  return new Request(`${base}/api/team/animals/photo`, {
    method: "POST",
    headers: { origin },
    body: data,
  });
}
function storage(visible = true) {
  const limit = vi.fn().mockResolvedValue({
    data: visible ? [{ slug: "synthetic" }] : [],
    error: null,
  });
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    limit,
  };
  const download = vi.fn().mockResolvedValue({
    data: new Blob([new Uint8Array(source)]),
    error: null,
  });
  const write = vi.fn().mockResolvedValue({ error: null });
  const rpc = vi.fn().mockResolvedValue({ error: null });
  vi.mocked(serviceClient).mockReturnValue({
    from: () => query,
    storage: { from: () => ({ download, upload: write }) },
    rpc,
  } as never);
  return { query, download, write, rpc, limit };
}
describe("optimized portrait boundaries", () => {
  it("resizes, applies orientation and strips metadata within a 300 KB WebP budget", async () => {
    const oriented = await sharp(source)
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const result = await optimizedPortrait(oriented);
    const info = await sharp(result.data).metadata();
    expect(info.format).toBe("webp");
    expect(info.width).toBe(960);
    expect(info.height).toBe(1280);
    expect(info.exif).toBeUndefined();
    expect(result.data.length).toBeLessThanOrEqual(portraitByteLimit);
    expect(photoSize(250_000)).toBe("250 KB");
  });
  it("does not enlarge small portraits or accept animation", async () => {
    const small = await sharp(source).resize(120, 90).png().toBuffer();
    expect((await optimizedPortrait(small)).info.width).toBe(120);
    const frames = Buffer.concat([
      Buffer.alloc(40 * 40 * 3, 0),
      Buffer.alloc(40 * 40 * 3, 255),
    ]);
    const animated = await sharp(frames, {
      raw: { width: 40, height: 80, channels: 3, pageHeight: 40 },
    })
      .webp()
      .toBuffer();
    expect((await sharp(animated).metadata()).pages).toBe(2);
    await expect(optimizedPortrait(animated)).rejects.toThrow("still");
  });
  it("requires manager identity and same origin before consuming an upload", async () => {
    vi.mocked(staffUser).mockResolvedValue(null);
    expect((await POST(upload())).status).toBe(403);
    vi.mocked(staffUser).mockResolvedValue(actor as never);
    expect(
      (
        await POST(
          upload(source, "image/jpeg", "confirmed", "https://evil.example"),
        )
      ).status,
    ).toBe(403);
  });
  it("re-encodes server-side and preserves private, immutable audited storage", async () => {
    vi.mocked(staffUser).mockResolvedValue(actor as never);
    const client = storage();
    const result = await POST(upload());
    expect(result.status).toBe(200);
    const { photo } = await result.json();
    expect(photo).toMatch(/^[0-9a-f-]+\.webp$/);
    expect(client.rpc).toHaveBeenCalledWith("staff_register_animal_photo", {
      p_actor: actor.id,
      p_path: photo,
    });
    const [path, bytes, options] = client.write.mock.calls[0];
    expect(path).toBe(photo);
    expect(options).toEqual({ contentType: "image/webp", upsert: false });
    expect(bytes.length).toBeLessThanOrEqual(portraitByteLimit);
    expect((await sharp(bytes).metadata()).width).toBe(1280);
  });
  it("rejects missing rights, spoofed MIME, corrupt files and oversized request streams", async () => {
    vi.mocked(staffUser).mockResolvedValue(actor as never);
    const client = storage();
    for (const request of [
      upload(source, "image/jpeg", ""),
      upload(Buffer.from("<svg/>"), "image/jpeg"),
      upload(Buffer.from([255, 216, 255]), "image/jpeg"),
      upload(source, "image/svg+xml"),
      upload(Buffer.alloc(4_000_001)),
    ])
      expect([400, 413]).toContain((await POST(request)).status);
    expect(client.write).not.toHaveBeenCalled();
    expect(client.rpc).not.toHaveBeenCalled();
  });
  it("reports storage or registration errors without claiming success", async () => {
    vi.mocked(staffUser).mockResolvedValue(actor as never);
    const client = storage();
    client.write.mockResolvedValue({
      error: { message: "unavailable" },
    } as never);
    expect((await POST(upload())).status).toBe(503);
    client.rpc.mockResolvedValue({ error: { code: "42501" } } as never);
    client.write.mockClear();
    expect((await POST(upload())).status).toBe(403);
    expect(client.write).not.toHaveBeenCalled();
  });
});
describe("responsive revocable portrait delivery", () => {
  const get = (query = "?w=320", path = asset) =>
    GET(new Request(`${base}/api/animals/photo/${path}${query}`), {
      params: Promise.resolve({ asset: path }),
    });
  it("delivers small WebP variants with no public cache or metadata", async () => {
    const client = storage();
    for (const width of [320, 640, 960, 1280]) {
      const response = await get(`?w=${width}`);
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe(
        "private, no-store, max-age=0",
      );
      expect(response.headers.get("content-type")).toBe("image/webp");
      const bytes = Buffer.from(await response.arrayBuffer());
      expect(bytes.length).toBeLessThanOrEqual(portraitByteLimit);
      expect((await sharp(bytes).metadata()).width).toBe(width);
    }
    expect(client.query.eq).toHaveBeenCalledWith("state", "published");
    expect(client.query.is).toHaveBeenCalledWith("deleted_at", null);
  });
  it("revokes visitors immediately after unpublish, including every variant", async () => {
    const client = storage();
    expect((await get()).status).toBe(200);
    client.download.mockClear();
    client.limit.mockResolvedValue({ data: [], error: null });
    vi.mocked(staffUser).mockResolvedValue(null);
    for (const width of [320, 640, 960, 1280])
      expect((await get(`?w=${width}`)).status).toBe(404);
    expect(client.download).not.toHaveBeenCalled();
    vi.mocked(staffUser).mockResolvedValue(actor as never);
    expect((await get()).status).toBe(200);
  });
  it("bounds transformations and rejects foreign paths before storage access", async () => {
    const client = storage();
    for (const width of ["1", "20000", "NaN", "0320", "-640", "640.0"])
      expect((await get(`?w=${width}`)).status).toBe(400);
    expect((await get("", "..%2Fsecret.jpg")).status).toBe(404);
    expect(client.download).not.toHaveBeenCalled();
    client.limit.mockResolvedValue({
      data: null,
      error: { message: "unavailable" },
    } as never);
    expect((await get()).status).toBe(503);
    expect(client.download).not.toHaveBeenCalled();
  });
});
