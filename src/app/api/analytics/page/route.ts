import { NextRequest } from "next/server";
import { dataConfig } from "@/lib/community/config";
import { isCountablePath } from "@/lib/community/paths";
import {
  apiJson,
  dbError,
  jsonInput,
  rateKey,
  sameOrigin,
} from "@/lib/community/security";
import { serviceClient } from "@/lib/community/supabase";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig()) return apiJson({ error: "Unavailable." }, 503);
  const input = await jsonInput(request, 300);
  const path = input?.path;
  if (typeof path !== "string" || !isCountablePath(path))
    return apiJson({ error: "Invalid public path." }, 400);
  const { error } = await serviceClient()!.rpc("record_page_count", {
    p_path: path,
    p_rate_key: rateKey("page-hour", path),
  });
  return error ? dbError(error) : apiJson({ counted: true }, 201);
}
