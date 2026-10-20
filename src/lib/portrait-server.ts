import "server-only";
import sharp from "sharp";
import { portraitByteLimit, portraitMaxEdge } from "./portrait-image";

export async function optimizedPortrait(
  source: Buffer,
  edge = portraitMaxEdge,
  alreadyStored = false,
) {
  const processor = sharp(source, {
    limitInputPixels: 30_000_000,
    animated: false,
  });
  const info = await processor.metadata();
  if (
    !["jpeg", "png", "webp"].includes(info.format ?? "") ||
    (info.pages ?? 1) > 1
  )
    throw new Error("Use a still JPEG, PNG or WebP portrait.");
  // Stored WebPs were re-encoded on upload. Avoid another lossy encode when
  // already within this display size/budget. New uploads never take this path.
  if (
    alreadyStored &&
    info.format === "webp" &&
    source.length <= portraitByteLimit &&
    (info.width ?? Infinity) <= edge &&
    (info.height ?? Infinity) <= edge &&
    !info.exif &&
    !info.xmp &&
    !info.iptc
  )
    return { data: source, info };
  for (let attempt = 0; attempt < 8; attempt++) {
    const result = await processor
      .clone()
      .rotate()
      .resize(edge, edge, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: attempt === 0 ? 80 : 70, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    if (result.data.length <= portraitByteLimit) return result;
    edge = Math.max(320, Math.round(edge * 0.8));
  }
  throw new Error("Photo could not be optimized. Choose another photo.");
}
