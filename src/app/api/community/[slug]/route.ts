import { NextRequest } from "next/server";
import { getPost } from "@/lib/blog";
import { dataConfig } from "@/lib/community/config";
import { apiJson, dbError } from "@/lib/community/security";
import { currentUser, serviceClient } from "@/lib/community/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!getPost(slug)) return apiJson({ error: "Guide not found." }, 404);
  if (!dataConfig())
    return apiJson({ error: "Community features are not available yet." }, 503);
  const rawPage = request.nextUrl.searchParams.get("page") ?? "0";
  const page = Number(rawPage);
  if (!Number.isSafeInteger(page) || page < 0 || page > 100)
    return apiJson({ error: "Invalid page." }, 400);
  const service = serviceClient()!;
  const user = await currentUser();
  const [
    { count, error: likesError },
    { data: ownLike, error: ownError },
    commentsResult,
  ] = await Promise.all([
    service
      .from("article_likes")
      .select("article_slug", { count: "exact", head: true })
      .eq("article_slug", slug),
    user
      ? service
          .from("article_likes")
          .select("article_slug")
          .eq("article_slug", slug)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    service
      .from("comments")
      .select("id, author_id, author_label, body, created_at", {
        count: "exact",
      })
      .eq("article_slug", slug)
      .eq("state", "published")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * 20, page * 20 + 19),
  ]);
  if (likesError || ownError || commentsResult.error)
    return dbError(likesError || ownError || commentsResult.error);
  const comments = (commentsResult.data ?? []).map((comment) => ({
    id: comment.id,
    authorLabel: comment.author_label,
    body: comment.body,
    createdAt: comment.created_at,
    mine: !!user && comment.author_id === user.id,
  }));
  return apiJson({
    signedIn: !!user,
    likes: count ?? 0,
    liked: !!ownLike,
    comments,
    hasMore: (commentsResult.count ?? 0) > (page + 1) * 20,
  });
}
