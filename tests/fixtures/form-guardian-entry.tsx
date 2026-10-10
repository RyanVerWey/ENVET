import React from "react";
import { createRoot } from "react-dom/client";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "../../src/app/globals.css";
import "../../src/app/forms.css";
import { SigningRoom } from "../../src/components/forms/signing-room";
import { Receipt, type ReceiptData } from "../../src/components/forms/receipt";
import {
  formSource,
  electronicConsent,
  consentVersion,
  guardianCertificationText,
  guardianCertificationVersion,
} from "../../src/lib/forms/definition";
import type { Submission } from "../../src/lib/forms/validation";

// Isolated synthetic test. Never contact real auth, APIs or storage.
let saved: ReceiptData | null = null;
let firstPayload = "";
let attempts = 0;
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
window.fetch = async (_url, options) => {
  if (options?.method !== "POST")
    return saved
      ? reply(saved)
      : reply({ error: "No synthetic receipt." }, 404);
  const payload = String(options.body);
  if (++attempts === 1) {
    firstPayload = payload;
    return reply({ error: "Synthetic test: no record saved." }, 503);
  }
  if (payload !== firstPayload)
    throw new Error("Retry mutated the frozen synthetic submission.");
  const input: Submission = JSON.parse(payload);
  const at = "2026-10-09T20:00:00.000Z";
  saved = {
    id: input.requestId,
    kind: input.kind,
    created_at: at,
    record_digest: "synthetic-nonbinding-test",
    status: "submitted",
    version: 1,
    participant_id: null,
    evaluation: null,
    visits: [],
    record: {
      ...input,
      source: formSource(input.kind),
      receivedAt: at,
      signer: {
        id: "synthetic",
        email: "guardian@example.test",
        role: "guardian",
      },
      electronicConsent: { text: electronicConsent, version: consentVersion },
      guardianCertification: {
        text: guardianCertificationText,
        version: guardianCertificationVersion,
        certified: true,
      },
      attribution:
        "Synthetic nonbinding browser fixture; nothing saved outside this page.",
    },
  };
  return reply({ submitted: true, id: input.requestId }, 201);
};
const root = createRoot(document.getElementById("root")!);
window.addEventListener("synthetic-navigation", (event) => {
  const path = (event as CustomEvent<string>).detail;
  const id = new URL(path, location.origin).searchParams.get("id");
  if (!id) throw new Error("Synthetic navigation lacks receipt ID.");
  root.render(<Receipt id={id} />);
});
document.documentElement.dataset.corvaTheme =
  new URLSearchParams(location.search).get("theme") === "dark"
    ? "mint-dark"
    : "mint-light";
root.render(
  <>
    <p className="wrap">
      Synthetic local test. No Google account, submission or saved personal
      data.
    </p>
    <SigningRoom kind="liability" enabled={true} signedIn={true} />
  </>,
);
