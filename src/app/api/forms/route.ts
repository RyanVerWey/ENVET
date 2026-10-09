import { randomUUID } from "node:crypto";
import {
  apiJson,
  dbError,
  jsonInput,
  rateKey,
  sameOrigin,
} from "@/lib/community/security";
import { currentUser, serviceClient } from "@/lib/community/supabase";
import { uuidPattern } from "@/lib/community/validation";
import {
  consentVersion,
  electronicConsent,
  guardianCertificationText,
  guardianCertificationVersion,
  formSource,
  isFormKind,
} from "@/lib/forms/definition";
import { digest, encrypt, encryptionReady } from "@/lib/forms/crypto";
import { collectionEnabled } from "@/lib/forms/server";
import { submissionInput } from "@/lib/forms/validation";
import { openForm, type SignedRecord } from "@/lib/forms/records";

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return apiJson({ error: "Request origin not allowed." }, 403);
  const raw = await jsonInput(request, 160000);
  if (!raw || !isFormKind(raw.kind))
    return apiJson({ error: "Please check the form." }, 400);
  if (!collectionEnabled(raw.kind))
    return apiJson(
      {
        error:
          "Signing is not enabled for this document. Nothing was submitted.",
      },
      503,
    );
  const user = await currentUser();
  if (!user?.email)
    return apiJson({ error: "Google sign-in is required." }, 401);
  const input = submissionInput(raw);
  if (!input)
    return apiJson(
      { error: "Review required fields, initials, signatures and consent." },
      400,
    );
  try {
    const id = randomUUID();
    const record: SignedRecord = {
      ...input,
      id,
      receivedAt: new Date().toISOString(),
      source: formSource(input.kind),
      electronicConsent: { version: consentVersion, text: electronicConsent },
      ...(input.minor
        ? {
            guardianCertification: {
              version: guardianCertificationVersion,
              text: guardianCertificationText,
              certified: true as const,
            },
          }
        : {}),
      signer: {
        id: user.id,
        email: user.email,
        role: input.minor
          ? "guardian"
          : input.kind === "donation"
            ? "owner"
            : "guest",
      },
      attribution: input.minor
        ? "Google authentication records the submitting guardian account. Participant and guardian names, age, authority and signatures are self-declared; the child's identity is not independently verified."
        : "Google authentication records the submitting account. Name, authority and signature are self-declared; Google sign-in is not independent proof of legal identity or authority.",
    };
    const { data, error } = await serviceClient()!.rpc("submit_signed_form", {
      p_id: id,
      p_actor: user.id,
      p_request: input.requestId,
      p_kind: input.kind,
      p_version: input.version,
      p_request_digest: digest(input),
      p_record_digest: digest(record),
      p_record: encrypt(record, `${input.kind}:${id}:signed:v1`),
      p_rate_key: rateKey("signed-form", user.id),
    });
    if (error) return dbError(error);
    if (typeof data !== "string" || !uuidPattern.test(data))
      throw new Error("Commit receipt unavailable");
    return apiJson({ submitted: true, id: data }, 201);
  } catch {
    return apiJson(
      {
        error:
          "Submission could not be confirmed. Keep this page open and retry with the same information.",
      },
      503,
    );
  }
}

export async function GET(request: Request) {
  if (!serviceClient() || !encryptionReady())
    return apiJson({ error: "Receipts are unavailable." }, 503);
  const user = await currentUser();
  if (!user) return apiJson({ error: "Google sign-in is required." }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !uuidPattern.test(id))
    return apiJson({ error: "Receipt not found." }, 404);
  const { data, error } = await serviceClient()!.rpc("read_signed_form", {
    p_actor: user.id,
    p_id: id,
    p_staff: false,
  });
  if (error) return dbError(error);
  if (!data) return apiJson({ error: "Receipt not found." }, 404);
  try {
    return apiJson(openForm(data));
  } catch {
    return apiJson(
      { error: "Receipt protection could not be verified. Contact ENVET." },
      503,
    );
  }
}
