import { NextRequest } from "next/server";
import { dataConfig } from "@/lib/community/config";
import {
  apiJson,
  dbError,
  jsonInput,
  sameOrigin,
} from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
import { parseContent } from "@/lib/community/validation";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig())
    return apiJson({ error: "Team workspace is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const input = await jsonInput(request);
  const content = input && parseContent(input);
  if (!content)
    return apiJson(
      { error: "Check the title, slug, description, state, and version." },
      400,
    );
  const { data, error } = await serviceClient()!.rpc("staff_save_content", {
    p_actor: user.id,
    p_kind: content.kind,
    p_slug: content.slug,
    p_title: content.title,
    p_summary: content.summary,
    p_details: content.details,
    p_state: content.state,
    p_expected_version: content.expectedVersion,
  });
  return error ? dbError(error) : apiJson({ version: data }, 200);
}
