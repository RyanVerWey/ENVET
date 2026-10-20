import {
  apiJson,
  dbError,
  jsonInput,
  rateKey,
  sameOrigin,
} from "@/lib/community/security";
import { currentUser, serviceClient } from "@/lib/community/supabase";
import { preparationInput } from "@/lib/community/preparation";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user)
      return apiJson(
        { error: "Sign in with Google to open your checklist." },
        401,
      );
    const service = serviceClient();
    if (!service)
      return apiJson(
        { error: "Your checklist could not load. Please try again." },
        503,
      );
    const { data, error } = await service.rpc("member_get_preparation", {
      p_actor: user.id,
    });
    if (error) return dbError(error);
    return data
      ? apiJson(data)
      : apiJson({ error: "Your checklist could not load." }, 503);
  } catch {
    return apiJson({ error: "Your checklist could not load." }, 503);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request not allowed." }, 403);
  try {
    const user = await currentUser();
    if (!user)
      return apiJson(
        { error: "Sign in with Google to save your checklist." },
        401,
      );
    const input = preparationInput(await jsonInput(request));
    if (!input)
      return apiJson({ error: "Please check your preparation items." }, 400);
    const service = serviceClient();
    if (!service)
      return apiJson(
        { error: "Your checks were not saved. Please try again." },
        503,
      );
    const { data, error } = await service.rpc("member_save_preparation", {
      p_actor: user.id,
      p_expected: input.version,
      p_checked: input.checked,
      p_checklist_version: input.checklistVersion,
      p_rate_key: rateKey("member-preparation", user.id),
    });
    if (error) return dbError(error);
    return data
      ? apiJson(data)
      : apiJson(
          { error: "Saving could not be confirmed. Please try again." },
          503,
        );
  } catch {
    return apiJson(
      {
        error:
          "Saving could not be confirmed. Your checks remain on this page.",
      },
      503,
    );
  }
}
