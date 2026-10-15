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

async function change(request: NextRequest, remove: boolean) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig())
    return apiJson({ error: "Team workspace is unavailable." }, 503);
  const user = await staffUser();
  if (!user) return apiJson({ error: "Team access denied." }, 403);
  const input = await jsonInput(request, 300);
  const id = input?.id;
  const status = input?.status;
  if (
    typeof id !== "string" ||
    !uuidPattern.test(id) ||
    (!remove &&
      status !== "new" &&
      status !== "contacted" &&
      status !== "booked" &&
      status !== "closed")
  )
    return apiJson({ error: "Invalid inquiry change." }, 400);
  const { data, error } = await serviceClient()!.rpc(
    remove ? "staff_delete_inquiry" : "staff_set_inquiry_status",
    { p_actor: user.id, p_id: id, ...(!remove ? { p_status: status } : {}) },
  );
  if (error) return dbError(error);
  return data
    ? apiJson({ saved: true })
    : apiJson({ error: "Inquiry not found." }, 404);
}

export async function PATCH(request: NextRequest) {
  return change(request, false);
}
export async function DELETE(request: NextRequest) {
  return change(request, true);
}
