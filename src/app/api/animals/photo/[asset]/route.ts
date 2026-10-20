import { apiJson } from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
import { photoPattern } from "@/lib/community/animals";
import { portraitWidths } from "@/lib/portrait-image";
import { optimizedPortrait } from "@/lib/portrait-server";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ asset: string }> },
) {
  const { asset } = await params;
  if (!photoPattern.test(asset))
    return apiJson({ error: "Photo not found." }, 404);
  const width = new URL(request.url).searchParams.get("w");
  if (
    width !== null &&
    !portraitWidths.some((value) => String(value) === width)
  )
    return apiJson({ error: "Photo size not supported." }, 400);
  const service = serviceClient();
  if (!service) return apiJson({ error: "Photo not found." }, 404);
  const visible = await service
    .from("animals")
    .select("slug")
    .eq("photo", asset)
    .eq("state", "published")
    .is("deleted_at", null)
    .limit(1);
  if (visible.error) return apiJson({ error: "Photo unavailable." }, 503);
  if (!visible.data?.length && !(await staffUser()))
    return apiJson({ error: "Photo not found." }, 404);
  const { data, error } = await service.storage
    .from("animal-portraits")
    .download(asset);
  if (error || !data) return apiJson({ error: "Photo not found." }, 404);
  let bytes: Buffer;
  try {
    // Authorization always precedes fetching/transforming bytes. Never put this
    // revocable URL behind Next's public image cache, even for published photos.
    const result = await optimizedPortrait(
      Buffer.from(await data.arrayBuffer()),
      width ? Number(width) : 1280,
      true,
    );
    bytes = result.data;
  } catch {
    return apiJson({ error: "Photo unavailable." }, 503);
  }
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
