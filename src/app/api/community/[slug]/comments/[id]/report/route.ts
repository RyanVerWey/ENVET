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
import { uuidPattern } from "@/lib/community/validation";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> },
) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  const { slug, id } = await context.params;
  if (!getPost(slug) || !uuidPattern.test(id))
    return apiJson({ error: "Comment not found." }, 404);
  if (!dataConfig())
    return apiJson({ error: "Reporting is unavailable." }, 503);
  const user = await currentUser();
  if (!user) return apiJson({ error: "Sign in to report a comment." }, 401);
  const input = await jsonInput(request, 200);
  const reason = input?.reason;
  if (
    reason !== "spam" &&
    reason !== "privacy" &&
    reason !== "harmful" &&
    reason !== "other"
  )
    return apiJson({ error: "Choose a report reason." }, 400);
  const service = serviceClient()!;
  const { data: comment, error: lookupError } = await service
    .from("comments")
    .select("id")
    .eq("id", id)
    .eq("article_slug", slug)
    .eq("state", "published")
    .maybeSingle();
  if (lookupError) return dbError(lookupError);
  if (!comment) return apiJson({ error: "Comment not found." }, 404);
  const { error } = await service.rpc("report_comment", {
    p_id: id,
    p_actor: user.id,
    p_reason: reason,
    p_rate_key: rateKey("report-member", user.id),
  });
  return error ? dbError(error) : apiJson({ reported: true }, 201);
}
