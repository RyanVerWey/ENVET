import { apiJson } from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
import { photoPattern } from "@/lib/community/animals";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> },
) {
  const { asset } = await params;
  if (!photoPattern.test(asset))
    return apiJson({ error: "Photo not found." }, 404);
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
  return new Response(await data.arrayBuffer(), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
