import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { apiJson, dbError, sameOrigin } from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  const user = await staffUser();
  const service = serviceClient();
  if (!user || !service)
    return apiJson({ error: "Manager access required." }, 403);
  // Bound the stream before parsing multipart. Vercel's request limit is smaller than 5 MB.
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    return apiJson({ error: "Choose a portrait file." }, 400);
  const reader = request.body?.getReader();
  if (!reader) return apiJson({ error: "Choose a portrait file." }, 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 4_000_000) {
      await reader.cancel();
      return apiJson({ error: "Use a photo smaller than 3 MB." }, 413);
    }
    chunks.push(part.value);
  }
  try {
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": request.headers.get("content-type")! },
    }).formData();
    const file = form.get("photo");
    if (
      !(file instanceof File) ||
      file.size > 3_000_000 ||
      form.get("rights") !== "confirmed" ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return apiJson(
        {
          error:
            "Choose a JPEG, PNG or WebP under 3 MB and confirm photo permission.",
        },
        400,
      );
    const source = Buffer.from(await file.arrayBuffer());
    const jpeg = source.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    const png = source
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp =
      source.toString("ascii", 0, 4) === "RIFF" &&
      source.toString("ascii", 8, 12) === "WEBP";
    if (!jpeg && !png && !webp)
      return apiJson({ error: "Use a still JPEG, PNG or WebP portrait." }, 400);
    const processor = sharp(source, {
      limitInputPixels: 30_000_000,
      animated: false,
    });
    const info = await processor.metadata();
    if (
      !["jpeg", "png", "webp"].includes(info.format ?? "") ||
      (info.pages ?? 1) > 1
    )
      return apiJson({ error: "Use a still JPEG, PNG or WebP portrait." }, 400);
    const bytes = await processor
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    const path = `${randomUUID()}.webp`;
    const registered = await service.rpc("staff_register_animal_photo", {
      p_actor: user.id,
      p_path: path,
    });
    if (registered.error) return dbError(registered.error);
    const upload = await service.storage
      .from("animal-portraits")
      .upload(path, bytes, { contentType: "image/webp", upsert: false });
    if (upload.error)
      return apiJson({ error: "Photo did not upload. Try again." }, 503);
    return apiJson({ photo: path });
  } catch {
    return apiJson(
      {
        error:
          "That photo could not be read. Choose a valid still JPEG, PNG or WebP.",
      },
      400,
    );
  }
}
