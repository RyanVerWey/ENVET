import { dataConfig } from "@/lib/community/config";
import {
  apiJson,
  dbError,
  jsonInput,
  sameOrigin,
} from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
import {
  organizationColumns,
  organizationVersion,
  parseOrganization,
} from "@/lib/community/organizations";
import { articleSlugPattern } from "@/lib/community/validation";

export async function GET(request: Request) {
  if (!dataConfig())
    return apiJson({ error: "Organization management is unavailable." }, 503);
  if (!(await staffUser()))
    return apiJson({ error: "Manager access required." }, 403);
  const params = new URL(request.url).searchParams;
  const pageText = params.get("page") ?? "0";
  const removed = params.get("removed") ?? "false";
  if (
    !/^(0|[1-9][0-9]{0,3})$/.test(pageText) ||
    !["true", "false"].includes(removed)
  )
    return apiJson({ error: "Invalid list options." }, 400);
  const page = Number(pageText);
  let query = serviceClient()!
    .from("contributing_organizations")
    .select(organizationColumns, { count: "exact" });
  query =
    removed === "true"
      ? query.not("deleted_at", "is", null)
      : query.is("deleted_at", null);
  const { data, error, count } = await query
    .order("sort_order")
    .order("name")
    .order("slug")
    .range(page * 50, page * 50 + 49);
  return error
    ? dbError(error)
    : apiJson({
        organizations: data ?? [],
        more: (count ?? 0) > page * 50 + 50,
      });
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig())
    return apiJson({ error: "Organization management is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Manager access required." }, 403);
  const input = await jsonInput(request, 12000);
  const organization = input && parseOrganization(input);
  if (!organization || !organizationVersion(input?.expectedVersion))
    return apiJson(
      {
        error:
          "Check the name, HTTPS website, display order, visibility and version.",
      },
      400,
    );
  const { data, error } = await serviceClient()!.rpc(
    "staff_save_organization",
    {
      p_actor: user.id,
      p_entry: organization,
      p_expected: input!.expectedVersion,
    },
  );
  return error ? dbError(error) : apiJson({ version: data });
}
async function remove(request: Request, restore: boolean) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig())
    return apiJson({ error: "Organization management is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Manager access required." }, 403);
  const input = await jsonInput(request);
  if (
    !input ||
    typeof input.slug !== "string" ||
    input.slug.length > 100 ||
    !articleSlugPattern.test(input.slug) ||
    !organizationVersion(input.expectedVersion) ||
    input.expectedVersion === null
  )
    return apiJson(
      { error: "A current organization version is required." },
      400,
    );
  const { data, error } = await serviceClient()!.rpc(
    "staff_remove_organization",
    {
      p_actor: user.id,
      p_slug: input.slug,
      p_expected: input.expectedVersion,
      p_restore: restore,
    },
  );
  return error ? dbError(error) : apiJson({ version: data });
}
export const DELETE = (request: Request) => remove(request, false);
export const PATCH = (request: Request) => remove(request, true);
