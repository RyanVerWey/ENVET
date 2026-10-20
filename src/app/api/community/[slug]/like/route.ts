import { NextRequest } from "next/server";
import { getPost } from "@/lib/blog";
import { dataConfig } from "@/lib/community/config";
import {
  apiJson,
  dbError,
  rateKey,
  sameOrigin,
} from "@/lib/community/security";
import { currentUser, serviceClient } from "@/lib/community/supabase";

async function change(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
  add: boolean,
) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  const { slug } = await context.params;
  if (!getPost(slug)) return apiJson({ error: "Guide not found." }, 404);
  if (!dataConfig())
    return apiJson({ error: "Community features are unavailable." }, 503);
  const user = await currentUser();
  if (!user)
    return apiJson({ error: "Sign in with Google to like this guide." }, 401);
  const { error } = await serviceClient()!.rpc(
    add ? "add_article_like" : "remove_article_like",
    {
      p_slug: slug,
      p_actor: user.id,
      ...(add ? { p_rate_key: rateKey("like-member", user.id) } : {}),
    },
  );
  return error ? dbError(error) : apiJson({ saved: true });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  return change(request, context, true);
}
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  return change(request, context, false);
}
