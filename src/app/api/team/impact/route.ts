import { apiJson, dbError } from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
export async function GET(request: Request) {
  if (!serviceClient())
    return apiJson({ error: "Reporting is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const days = new URL(request.url).searchParams.get("days") ?? "90";
  if (!["30", "90", "365"].includes(days))
    return apiJson({ error: "Invalid reporting range." }, 400);
  const { data, error } = await serviceClient()!.rpc("staff_program_metrics", {
    p_actor: user.id,
    p_days: Number(days),
  });
  return error ? dbError(error) : apiJson(data);
}
