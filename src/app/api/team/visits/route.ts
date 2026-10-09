import { randomUUID } from "node:crypto";
import {
  apiJson,
  dbError,
  jsonInput,
  sameOrigin,
} from "@/lib/community/security";
import { serviceClient, staffUser } from "@/lib/community/supabase";
import { uuidPattern } from "@/lib/community/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!serviceClient())
    return apiJson({ error: "Attendance is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const input = await jsonInput(request, 1000);
  if (
    !input ||
    typeof input.formId !== "string" ||
    !uuidPattern.test(input.formId) ||
    typeof input.requestId !== "string" ||
    !uuidPattern.test(input.requestId) ||
    typeof input.day !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.day) ||
    typeof input.session !== "string" ||
    !/^[a-z0-9][a-z0-9-]{0,39}$/.test(input.session) ||
    typeof input.service !== "string" ||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.service) ||
    input.attended !== true
  )
    return apiJson(
      { error: "Confirm actual attendance, date, session code and service." },
      400,
    );
  const { data, error } = await serviceClient()!.rpc("staff_record_visit", {
    p_actor: user.id,
    p_id: randomUUID(),
    p_request: input.requestId,
    p_form: input.formId,
    p_day: input.day,
    p_session: input.session,
    p_service: input.service,
  });
  return error ? dbError(error) : apiJson({ saved: true, id: data });
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!serviceClient())
    return apiJson({ error: "Attendance is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const input = await jsonInput(request, 300);
  if (
    !input ||
    typeof input.id !== "string" ||
    !uuidPattern.test(input.id) ||
    !["duplicate", "entry_error", "did_not_attend"].includes(
      String(input.reason),
    )
  )
    return apiJson({ error: "A correction reason is required." }, 400);
  const { data, error } = await serviceClient()!.rpc("staff_void_visit", {
    p_actor: user.id,
    p_id: input.id,
    p_reason: input.reason,
  });
  return error
    ? dbError(error)
    : data
      ? apiJson({ saved: true })
      : apiJson({ error: "Visit is already void or not found. Refresh." }, 409);
}
