import React from "react";
import { createRoot } from "react-dom/client";
import { TeamWorkspace } from "../../src/components/team-workspace";
import "../../src/app/globals.css";

const scenario =
  new URLSearchParams(location.search).get("scenario") ?? "success";
if (new URLSearchParams(location.search).get("theme") === "dark")
  document.documentElement.dataset.corvaTheme = "mint-dark";

const inquiry = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Sam Visitor",
  email: "sam@example.com",
  phone: null,
  service_interest: "Visit",
  note: "Please call.",
  status: "new",
  created_at: "2026-10-09T18:00:00Z",
};
const report = {
  comment_id: "22222222-2222-4222-8222-222222222222",
  reason: "privacy",
  created_at: "2026-10-09T19:00:00Z",
  article_slug: "first-visit-to-envet",
  body: "Reported older comment text",
  state: "published",
};
const dashboard = {
  page: 0,
  more_inquiries: false,
  more_comments: false,
  more_reports: false,
  inquiries: [inquiry],
  pages: [],
  comments:
    scenario === "report-old"
      ? []
      : [
          {
            id: report.comment_id,
            article_slug: report.article_slug,
            author_label: "Community member",
            body: report.body,
            state: "published",
            created_at: "2026-10-08T18:00:00Z",
          },
        ],
  reports: [report],
};
const initial = {
  horses: [],
  services: [],
  dashboard,
  moreHorses: false,
  moreServices: false,
};
let reads = 0;
let mutations = 0;
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });

window.fetch = async (input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  if (url.startsWith("/api/team?")) {
    reads++;
    if (reads === 2 && scenario.endsWith("-503"))
      return response({ error: "Synthetic refresh unavailable." }, 503);
    if (reads === 2 && scenario.endsWith("-403"))
      return response({ error: "Team access denied." }, 403);
    if (reads === 1) return response(initial);
    const changed = structuredClone(initial);
    if (scenario.startsWith("status") || scenario === "success")
      changed.dashboard.inquiries[0].status = "closed";
    if (scenario.startsWith("delete")) changed.dashboard.inquiries = [];
    if (scenario.startsWith("hide") || scenario === "report-old") {
      changed.dashboard.reports[0].state = "hidden";
      if (changed.dashboard.comments[0])
        changed.dashboard.comments[0].state = "hidden";
    }
    return response(changed);
  }
  if (url.startsWith("/api/team/")) {
    mutations++;
    if (init?.method === "DELETE" || init?.method === "PATCH")
      return response({ saved: true });
  }
  return response({ error: "Unexpected fixture request." }, 500);
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
createRoot(document.getElementById("root")!).render(<TeamWorkspace />);
