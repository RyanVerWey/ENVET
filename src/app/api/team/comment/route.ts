import { NextRequest } from "next/server";
import { dataConfig } from "@/lib/community/config";
import {
  apiJson,
  dbError,
  jsonInput,
  sameOrigin,
} from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
import { uuidPattern } from "@/lib/community/validation";

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig())
    return apiJson({ error: "Team workspace is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const input = await jsonInput(request, 200);
  const id = input?.id;
  if (typeof id !== "string" || !uuidPattern.test(id))
    return apiJson({ error: "Invalid comment." }, 400);
  const { data, error } = await serviceClient()!.rpc("staff_hide_comment", {
    p_actor: user.id,
    p_id: id,
  });
  if (error) return dbError(error);
  return data
    ? apiJson({ saved: true })
    : apiJson({ error: "Comment not found." }, 404);
}
