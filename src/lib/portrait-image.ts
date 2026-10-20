// Shared budgets keep original phone photos off the upload/API request path.
export const portraitSourceLimit = 20_000_000;
export const portraitByteLimit = 300_000;
export const portraitMaxEdge = 1280;
export const portraitWidths = [320, 640, 960, 1280] as const;

export function photoSize(bytes: number) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function stillPhoto(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end));
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return true;
  if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") {
    // VP8X's animation flag: do not silently turn an animation into a still.
    return !(text(12, 16) === "VP8X" && bytes[20] & 2);
  }
  if (
    bytes.length >= 24 &&
    bytes
      .slice(0, 8)
      .every((value, i) => value === [137, 80, 78, 71, 13, 10, 26, 10][i])
  ) {
    for (let offset = 8; offset + 12 <= bytes.length;) {
      if (text(offset + 4, offset + 8) === "acTL") return false;
      const length = view.getUint32(offset);
      offset += length + 12;
    }
    return true;
  }
  return false;
}

export async function preparePortrait(file: File, signal: AbortSignal) {
  if (!file.size) throw new Error("This file is empty. Choose another photo.");
  if (file.size > portraitSourceLimit)
    throw new Error(
      "This photo is over 20 MB. Export a smaller JPEG, then try again.",
    );
  if (!stillPhoto(new Uint8Array(await file.arrayBuffer())))
    throw new Error(
      "Choose a still JPG, JPEG, PNG or WebP. For an iPhone HEIC/HEIF photo, export it as JPEG first; changing its filename does not convert it.",
    );
  signal.throwIfAborted();
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      "This photo could not be opened. Export a new JPEG or PNG and try again.",
    );
  }
  const canvas = document.createElement("canvas");
  try {
    signal.throwIfAborted();
    if (bitmap.width * bitmap.height > 50_000_000)
      throw new Error(
        "This photo is over 50 megapixels. Export a smaller copy first.",
      );
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "Photo conversion is unavailable. Try a current Chrome, Edge, Safari or Firefox browser.",
      );
    let edge = Math.min(portraitMaxEdge, Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 8; attempt++) {
      signal.throwIfAborted();
      const scale = edge / Math.max(bitmap.width, bitmap.height);
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      // Encoding is asynchronous; never block the UI with a synchronous data URL.
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", attempt === 0 ? 0.8 : 0.7),
      );
      signal.throwIfAborted();
      if (!blob || blob.type !== "image/webp")
        throw new Error(
          "Your browser could not create a WebP photo. Update your browser, then try again.",
        );
      if (blob.size <= portraitByteLimit)
        return {
          file: new File([blob], "portrait.webp", { type: "image/webp" }),
          width: canvas.width,
          height: canvas.height,
        };
      edge = Math.max(320, Math.round(edge * 0.8));
    }
    throw new Error(
      "This photo could not be made small enough. Choose a simpler or smaller photo.",
    );
  } finally {
    bitmap.close();
    canvas.width = canvas.height = 0;
  }
}
