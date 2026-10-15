import React from "react";
import { createRoot } from "react-dom/client";
import { OrganizationManager } from "../../src/components/organization-manager";
import { ContributingOrganizations } from "../../src/components/contributing-organizations";
import {
  blankOrganization,
  type OrganizationRecord,
} from "../../src/lib/community/organizations";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "../../src/app/globals.css";
const params = new URLSearchParams(location.search);
document.documentElement.dataset.corvaTheme =
  params.get("theme") === "dark" ? "mint-dark" : "mint-light";
document.documentElement.style.setProperty("--font-body", "Arial, sans-serif");
let records: OrganizationRecord[] = [
  {
    ...blankOrganization,
    slug: "test-organization",
    name: "Test Organization",
    description:
      "Synthetic support for isolated verification, not real ENVET content.",
    state: "published",
    version: 1,
    updated_at: "2026-10-12T00:00:00Z",
    deleted_at: null,
  },
];
let writes = 0,
  failedRefresh = false;
if (params.get("mode") === "layout")
  records.push({
    ...records[0],
    slug: "long-test-org",
    name: "X".repeat(150),
    description: "x".repeat(500),
  });
const reply = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status });
declare global {
  interface Window {
    organizationFixture: { writes: number; records: OrganizationRecord[] };
  }
}
window.organizationFixture = { writes, records };
window.fetch = async (url, options) => {
  if (!options?.method) {
    if (
      params.get("mode") === "refresh-error" &&
      writes > 0 &&
      !failedRefresh
    ) {
      failedRefresh = true;
      return reply({ error: "Manager access required." }, 403);
    }
    const removed =
      new URL(String(url), location.origin).searchParams.get("removed") ===
      "true";
    return reply({
      organizations: records.filter((item) =>
        removed ? !!item.deleted_at : !item.deleted_at,
      ),
      more: false,
    });
  }
  writes++;
  window.organizationFixture.writes = writes;
  if (params.get("mode") === "conflict" && writes === 1)
    return reply({ error: "This changed. Refresh and try again." }, 409);
  const value = JSON.parse(String(options.body));
  if (options.method === "POST") {
    const { expectedVersion, ...fields } = value;
    const index = records.findIndex((item) => item.slug === value.slug);
    const next = {
      ...fields,
      version: (expectedVersion ?? 0) + 1,
      deleted_at: null,
      updated_at: "2026-10-12T00:00:00Z",
    };
    if (index < 0) records.push(next);
    else records[index] = next;
  } else
    records = records.map((item) =>
      item.slug === value.slug
        ? {
            ...item,
            deleted_at:
              options.method === "DELETE" ? "2026-10-12T00:00:00Z" : null,
            state: "draft",
            version: item.version + 1,
          }
        : item,
    );
  window.organizationFixture.records = records;
  if (params.get("mode") === "uncertain" && writes === 1)
    throw new Error("Synthetic connection loss after write");
  return reply({ version: (value.expectedVersion ?? 0) + 1 });
};
createRoot(document.getElementById("root")!).render(
  <main id="main">
    <div className="wrap">
      <h1>Organization management test workspace</h1>
      <p>Isolated synthetic content. No external writes.</p>
    </div>
    {params.get("view") === "public" ? (
      <ContributingOrganizations organizations={records} />
    ) : (
      <OrganizationManager />
    )}
  </main>,
);
