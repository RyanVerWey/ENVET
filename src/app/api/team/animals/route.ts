import { dataConfig } from "@/lib/community/config";
import {
  apiJson,
  dbError,
  jsonInput,
  sameOrigin,
} from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
import {
  animalColumns,
  expectedAnimalVersion,
  parseAnimal,
} from "@/lib/community/animals";
import { articleSlugPattern } from "@/lib/community/validation";

export async function GET(request: Request) {
  if (!dataConfig())
    return apiJson({ error: "Animal management is unavailable." }, 503);
  if (!(await staffUser()))
    return apiJson({ error: "Manager access required." }, 403);
  const pageText = new URL(request.url).searchParams.get("page") ?? "0";
  if (!/^(0|[1-9][0-9]{0,3})$/.test(pageText))
    return apiJson({ error: "Invalid page." }, 400);
  const page = Number(pageText);
  const { data, error, count } = await serviceClient()!
    .from("animals")
    .select(animalColumns, { count: "exact" })
    .order("name")
    .order("slug")
    .range(page * 50, page * 50 + 49);
  return error
    ? dbError(error)
    : apiJson({ animals: data, more: (count ?? 0) > page * 50 + 50 });
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig())
    return apiJson({ error: "Animal management is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Manager access required." }, 403);
  const input = await jsonInput(request, 30000);
  const bio = input && parseAnimal(input);
  if (!bio || !expectedAnimalVersion(input?.expectedVersion))
    return apiJson(
      {
        error:
          "Check the bio fields. Published profiles need a portrait, story and visit tips.",
      },
      400,
    );
  const { data, error } = await serviceClient()!.rpc("staff_save_animal", {
    p_actor: user.id,
    p_bio: bio,
    p_expected: input!.expectedVersion,
  });
  return error ? dbError(error) : apiJson({ version: data });
}
async function trash(request: Request, restore: boolean) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig())
    return apiJson({ error: "Animal management is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Manager access required." }, 403);
  const input = await jsonInput(request);
  if (
    !input ||
    typeof input.slug !== "string" ||
    input.slug.length > 100 ||
    !articleSlugPattern.test(input.slug) ||
    !expectedAnimalVersion(input.expectedVersion) ||
    input.expectedVersion === null
  )
    return apiJson({ error: "A current profile version is required." }, 400);
  const { data, error } = await serviceClient()!.rpc("staff_trash_animal", {
    p_actor: user.id,
    p_slug: input.slug,
    p_expected: input.expectedVersion,
    p_restore: restore,
  });
  return error ? dbError(error) : apiJson({ version: data });
}
export const DELETE = (request: Request) => trash(request, false);
export const PATCH = (request: Request) => trash(request, true);
