import React from "react";
import { createRoot } from "react-dom/client";
import { MemberLink } from "../../src/components/member-link";
import { MemberTasks } from "../../src/components/member-tasks";
import { PreVisitChecklist } from "../../src/components/forms/pre-visit-checklist";
import { ArticleShare } from "../../src/components/article-share";
import { preVisitVersion } from "../../src/lib/forms/pre-visit";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "../../src/app/globals.css";
import "../../src/app/forms.css";
const mode = new URLSearchParams(location.search).get("mode");
let saved = {
  checked: [] as string[],
  checklistVersion: preVisitVersion,
  version: 0,
  updatedAt: null as string | null,
};
let posts = 0;
const reply = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
// Entirely local synthetic simulation. No account, API or remote database calls.
window.fetch = async (url, options) => {
  if (String(url).endsWith("session"))
    return reply({ signedIn: true, firstName: "Sam" });
  if (options?.method === "POST") {
    posts++;
    if (mode === "conflict" && posts === 1) {
      saved = { ...saved, checked: ["shoes"], version: 1 };
      return reply({ error: "Synthetic version conflict" }, 409);
    }
    const input = JSON.parse(String(options.body));
    saved = { ...input, version: 1, updatedAt: "2026-10-10T00:00:00Z" };
    if (mode === "lost-response" && posts === 1)
      throw new Error("Synthetic lost response after commit.");
  }
  return reply(saved);
};
document.documentElement.dataset.corvaTheme =
  new URLSearchParams(location.search).get("theme") === "dark"
    ? "mint-dark"
    : "mint-light";
window.addEventListener("synthetic-navigation", (event) => {
  document.getElementById("test-navigation")!.textContent = (
    event as CustomEvent<string>
  ).detail;
});
createRoot(document.getElementById("root")!).render(
  <>
    <header className="utility-bar">
      <div className="wrap">
        <p>Synthetic test. No data saved remotely.</p>
        <MemberLink pathname="/account" />
      </div>
    </header>
    <main>
      <section className="wrap community-panel account-panel">
        <h1>Hello, Sam. Welcome to ENVET.</h1>
        <MemberTasks />
        <p id="test-navigation" role="status" />
      </section>
      <section className="wrap">
        <PreVisitChecklist managed />
      </section>
      <ArticleShare
        title="Synthetic guide & families"
        url="https://envet.info/blog/first-visit-to-envet"
      />
    </main>
  </>,
);
