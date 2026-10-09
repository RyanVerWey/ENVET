import { randomUUID } from "node:crypto";
import {
  apiJson,
  dbError,
  jsonInput,
  sameOrigin,
} from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
import { uuidPattern } from "@/lib/community/validation";
import { encrypt, encryptionReady } from "@/lib/forms/crypto";
import { isFormKind } from "@/lib/forms/definition";
import { openForm } from "@/lib/forms/records";
import { evaluationInput, validStatus } from "@/lib/forms/validation";

export async function GET(request: Request) {
  if (!serviceClient() || !encryptionReady())
    return apiJson({ error: "Protected forms are unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const query = new URL(request.url).searchParams;
  const id = query.get("id");
  if (id) {
    if (!uuidPattern.test(id))
      return apiJson({ error: "Form not found." }, 404);
    const { data, error } = await serviceClient()!.rpc("read_signed_form", {
      p_actor: user.id,
      p_id: id,
      p_staff: true,
    });
    if (error) return dbError(error);
    if (!data) return apiJson({ error: "Form not found." }, 404);
    try {
      return apiJson(openForm(data));
    } catch {
      return apiJson(
        {
          error:
            "Record protection could not be verified. No document displayed.",
        },
        503,
      );
    }
  }
  const page = query.get("page") ?? "0";
  const status = query.get("status") ?? "all";
  if (
    !/^(0|[1-9][0-9]{0,4})$/.test(page) ||
    Number(page) > 10000 ||
    ![
      "all",
      "submitted",
      "needs_followup",
      "reviewed",
      "revoked",
      "trial",
      "accepted",
      "declined",
    ].includes(status)
  )
    return apiJson({ error: "Invalid queue filter." }, 400);
  const [queue, services] = await Promise.all([
    serviceClient()!.rpc("staff_form_queue", {
      p_actor: user.id,
      p_page: Number(page),
      p_status: status,
    }),
    serviceClient()!
      .from("services")
      .select("slug,title")
      .eq("state", "published")
      .order("title")
      .range(0, 100),
  ]);
  if (queue.error || services.error)
    return dbError(queue.error || services.error);
  return apiJson({
    ...queue.data,
    services: services.data?.slice(0, 100) ?? [],
    moreServices: (services.data?.length ?? 0) > 100,
  });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!serviceClient() || !encryptionReady())
    return apiJson({ error: "Protected forms are unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const input = await jsonInput(request, 25000);
  if (
    !input ||
    typeof input.id !== "string" ||
    !uuidPattern.test(input.id) ||
    !isFormKind(input.kind) ||
    !validStatus(input.kind, input.status) ||
    !Number.isInteger(input.version) ||
    Number(input.version) < 1 ||
    Number(input.version) > 2147483646 ||
    (input.participantId !== null &&
      (typeof input.participantId !== "string" ||
        !uuidPattern.test(input.participantId)))
  )
    return apiJson({ error: "Invalid review." }, 400);
  const current = await serviceClient()!.rpc("read_signed_form", {
    p_actor: user.id,
    p_id: input.id.toLowerCase(),
    p_staff: true,
  });
  if (current.error) return dbError(current.error);
  if (!current.data) return apiJson({ error: "Form not found." }, 404);
  if (current.data.kind !== input.kind)
    return apiJson({ error: "Review type does not match this form." }, 400);
  const evaluation = evaluationInput(input.evaluation, input.kind);
  if (!evaluation)
    return apiJson(
      {
        error:
          "Check review fields and pre-visit screening: date, channel, connection, eligibility and discussion outcome.",
      },
      400,
    );
  try {
    const event = randomUUID();
    const normalizedId = input.id.toLowerCase();
    const { data, error } = await serviceClient()!.rpc("staff_review_form", {
      p_actor: user.id,
      p_id: normalizedId,
      p_expected: input.version,
      p_status: input.status,
      p_event: event,
      p_evaluation: encrypt(evaluation, `${normalizedId}:${event}:review:v1`),
      p_participant: input.participantId,
    });
    return error
      ? dbError(error)
      : data
        ? apiJson({ saved: true })
        : apiJson({ error: "Form not found." }, 404);
  } catch {
    return apiJson(
      {
        error:
          "Review could not be confirmed. Refresh before trying another change.",
      },
      503,
    );
  }
}
