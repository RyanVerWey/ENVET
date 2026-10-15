import { NextRequest } from "next/server";
import { dataConfig } from "@/lib/community/config";
import {
  apiJson,
  dbError,
  jsonInput,
  rateKey,
  sameOrigin,
} from "@/lib/community/security";
import { serviceClient } from "@/lib/community/supabase";
import { parseInquiry } from "@/lib/community/validation";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  if (!dataConfig())
    return apiJson(
      {
        error:
          "Online inquiries are not available yet. Please call or email ENVET.",
      },
      503,
    );
  const input = await jsonInput(request);
  const value = input && parseInquiry(input);
  if (!value)
    return apiJson(
      {
        error:
          "Enter your name, a contact method, interest, and permission to follow up.",
      },
      400,
    );
  const service = serviceClient()!;
  const { error } = await service.rpc("submit_inquiry", {
    p_name: value.name,
    p_email: value.email,
    p_phone: value.phone,
    p_service_interest: value.serviceInterest,
    p_note: value.note,
    p_consent: true,
    p_contact_key: rateKey("inquiry-contact", value.email || value.phone),
    p_global_key: rateKey("inquiry-global", "all"),
  });
  if (error) return dbError(error);
  return apiJson(
    {
      message:
        "Thank you. ENVET will follow up by phone or email to discuss your interest or arrange a visit.",
    },
    201,
  );
}
