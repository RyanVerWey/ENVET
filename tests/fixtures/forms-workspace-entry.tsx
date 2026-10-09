import React from "react";
import { createRoot } from "react-dom/client";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "../../src/app/globals.css";
import "../../src/app/forms.css";
import { ProgramDashboard } from "../../src/components/forms/program-dashboard";
import { FormReviewQueue } from "../../src/components/forms/review-queue";
import { Receipt } from "../../src/components/forms/receipt";
import {
  formSource,
  formVersion,
  electronicConsent,
  consentVersion,
  liabilityInitials,
} from "../../src/lib/forms/definition";
const query = new URLSearchParams(location.search);
const scenario = query.get("scenario") ?? "report";
document.documentElement.dataset.corvaTheme =
  query.get("theme") === "dark" ? "mint-dark" : "mint-light";
const id = "11111111-1111-4111-8111-111111111111",
  actor = "22222222-2222-4222-8222-222222222222";
const source = formSource("liability");
let status = "submitted",
  version = 1,
  reads = 0,
  mutations = 0;
const detail = {
  id,
  kind: "liability",
  created_at: "2026-10-09T21:00:00Z",
  record_digest: "a".repeat(64),
  status,
  version,
  participant_id: null,
  evaluation: null,
  visits: [],
  record: {
    source,
    version: formVersion("liability"),
    fields: {
      guestName: "Synthetic Guest",
      signedDate: "2026-10-09",
      address: "Synthetic test address",
      phone: "540-555-0100",
      email: "guest@example.test",
      emergencyName: "Synthetic Contact",
      emergencyPhone: "540-555-0101",
    },
    minor: false,
    riding: [],
    conditions: [],
    initials: Object.fromEntries(liabilityInitials.map((i) => [`p${i}`, "SG"])),
    guestSignature: { method: "typed", name: "Synthetic Guest" },
    guardianSignature: null,
    receivedAt: "2026-10-09T21:00:00Z",
    signer: { id: actor, email: "guest@example.test", role: "guest" },
    electronicConsent: { version: consentVersion, text: electronicConsent },
    attribution:
      "Synthetic browser fixture. No authenticated signer and no database submission.",
  },
};
const response = (value: unknown, statusCode = 200) =>
  new Response(JSON.stringify(value), {
    status: statusCode,
    headers: { "content-type": "application/json" },
  });
window.fetch = async (input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  if (url.startsWith("/api/team/impact")) {
    if (scenario === "report-denied")
      return response({ error: "Synthetic access denied." }, 403);
    return response({
      from: "2026-07-12",
      to: "2026-10-09",
      visits: 36,
      participants: 18,
      repeat_participants: 11,
      pending: 4,
      pending_over_seven_days: 1,
      median_review_hours: 18.5,
      daily: Array.from({ length: 90 }, (_, i) => ({
        day: new Date(Date.UTC(2026, 6, 12 + i)).toISOString().slice(0, 10),
        visits: i % 8 === 0 ? 3 : 0,
      })),
      services: [
        { service: "Synthetic introductory visit", visits: 21 },
        { service: "Synthetic equine session", visits: 15 },
      ],
      candidates: [
        { stage: "submitted", candidates: 2 },
        { stage: "trial", candidates: 2 },
        { stage: "accepted", candidates: 1 },
      ],
    });
  }
  if (url.startsWith("/api/forms?"))
    return scenario === "receipt-denied"
      ? response({ error: "Synthetic receipt access denied." }, 403)
      : response({ ...detail, status, version });
  if (url.startsWith("/api/team/forms?") && url.includes("id="))
    return response({
      ...detail,
      status,
      version,
      participant_id: status === "reviewed" ? actor : null,
    });
  if (url.startsWith("/api/team/forms?")) {
    reads++;
    if (reads === 2 && scenario === "queue-refresh-failure")
      return response({ error: "Synthetic refresh failure." }, 503);
    return response({
      rows:
        new URL(url, location.origin).searchParams.get("status") === "all" ||
        new URL(url, location.origin).searchParams.get("status") === status
          ? [
              {
                id,
                kind: "liability",
                created_at: detail.created_at,
                status,
                version,
              },
            ]
          : [],
      more: false,
      services: [{ slug: "test-service", title: "Synthetic service" }],
      moreServices: false,
    });
  }
  if (url === "/api/team/forms" && init?.method === "PATCH") {
    mutations++;
    const payload = JSON.parse(String(init.body));
    status = payload.status;
    version++;
    return response({ saved: true });
  }
  return response({ error: "Unexpected synthetic fixture request." }, 500);
};
Object.assign(window, {
  fixtureState: {
    get reads() {
      return reads;
    },
    get mutations() {
      return mutations;
    },
  },
});
createRoot(document.getElementById("root")!).render(
  scenario.startsWith("receipt") ? (
    <Receipt id={id} />
  ) : scenario.startsWith("queue") ? (
    <FormReviewQueue />
  ) : (
    <ProgramDashboard />
  ),
);
