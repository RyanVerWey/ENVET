import { dataConfig } from "@/lib/community/config";
import { apiJson, dbError } from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";

export async function GET(request: Request) {
  if (!dataConfig())
    return apiJson({ error: "Team workspace is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const pageText = new URL(request.url).searchParams.get("page") ?? "0";
  if (!/^(0|[1-9][0-9]{0,4})$/.test(pageText) || Number(pageText) > 10000)
    return apiJson({ error: "Invalid page." }, 400);
  const page = Number(pageText);
  const first = page * 100;
  const service = serviceClient()!;
  const [horses, services, dashboard] = await Promise.all([
    service
      .from("horses")
      .select("slug,name,summary,details,state,version,updated_at", {
        count: "exact",
      })
      .order("name")
      .range(first, first + 99),
    service
      .from("services")
      .select("slug,title,summary,details,state,version,updated_at", {
        count: "exact",
      })
      .order("title")
      .range(first, first + 99),
    service.rpc("staff_dashboard", { p_actor: user.id, p_page: page }),
  ]);
  if (horses.error || services.error || dashboard.error)
    return dbError(horses.error || services.error || dashboard.error);
  return apiJson({
    horses: horses.data,
    services: services.data,
    dashboard: dashboard.data,
    moreHorses: (horses.count ?? 0) > first + 100,
    moreServices: (services.count ?? 0) > first + 100,
  });
}
