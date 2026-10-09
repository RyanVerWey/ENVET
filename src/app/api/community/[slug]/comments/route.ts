import { NextRequest } from "next/server";
import { getPost } from "@/lib/blog";
import { dataConfig } from "@/lib/community/config";
import {
  apiJson,
  dbError,
  jsonInput,
  rateKey,
  sameOrigin,
} from "@/lib/community/security";
import { currentUser, serviceClient } from "@/lib/community/supabase";
import { parseComment } from "@/lib/community/validation";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  const { slug } = await context.params;
  if (!getPost(slug)) return apiJson({ error: "Guide not found." }, 404);
  if (!dataConfig())
    return apiJson({ error: "Comments are unavailable." }, 503);
  const user = await currentUser();
  if (!user) return apiJson({ error: "Sign in with Google to comment." }, 401);
  const input = await jsonInput(request);
  const body = input && parseComment(input);
  if (!body)
    return apiJson(
      { error: "Write a comment between 2 and 2,000 characters." },
      400,
    );
  const { error } = await serviceClient()!.rpc("create_comment", {
    p_slug: slug,
    p_actor: user.id,
    p_body: body,
    p_rate_key: rateKey("comment-member", user.id),
  });
  return error ? dbError(error) : apiJson({ published: true }, 201);
}
