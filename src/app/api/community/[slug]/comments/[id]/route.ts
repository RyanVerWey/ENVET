import { NextRequest } from "next/server";
import { getPost } from "@/lib/blog";
import { dataConfig } from "@/lib/community/config";
import { apiJson, dbError, sameOrigin } from "@/lib/community/security";
import { currentUser, serviceClient } from "@/lib/community/supabase";
import { uuidPattern } from "@/lib/community/validation";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> },
) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  const { slug, id } = await context.params;
  if (!getPost(slug) || !uuidPattern.test(id))
    return apiJson({ error: "Comment not found." }, 404);
  if (!dataConfig())
    return apiJson({ error: "Comments are unavailable." }, 503);
  const user = await currentUser();
  if (!user) return apiJson({ error: "Sign in to remove your comment." }, 401);
  const { data, error } = await serviceClient()!.rpc("remove_comment", {
    p_id: id,
    p_actor: user.id,
  });
  if (error) return dbError(error);
  return data
    ? apiJson({ removed: true })
    : apiJson({ error: "Comment not found." }, 404);
}
