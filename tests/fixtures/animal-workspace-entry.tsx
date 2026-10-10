import React from "react";
import { createRoot } from "react-dom/client";
import { AnimalManager } from "../../src/components/animal-manager";
import { AnimalRoster } from "../../src/components/animal-roster";
import { MemberLink } from "../../src/components/member-link";
import {
  blankAnimal,
  type AnimalRecord,
} from "../../src/lib/community/animals";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "../../src/app/globals.css";
const params = new URLSearchParams(location.search);
document.documentElement.dataset.corvaTheme =
  params.get("theme") === "dark" ? "mint-dark" : "mint-light";
const photo = "44444444-4444-4444-8444-444444444444.webp";
let records: AnimalRecord[] = ["horse", "dog", "cat"].map((species, i) => ({
  ...blankAnimal,
  slug: `test-${species}`,
  name: ["Test Horse", "Test Dog", "Test Cat"][i],
  species: species as AnimalRecord["species"],
  photo,
  photoAlt: "Synthetic test portrait",
  summary: "Synthetic personality. Not real ENVET animal information.",
  story: "Synthetic story for interaction testing only.",
  visitTips: "Ask staff before approaching.",
  state: "published",
  version: 1,
  deleted_at: null,
  updated_at: "2026-10-10T03:00:00Z",
}));
const reply = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status });
let writes = 0;
window.fetch = async (url, options) => {
  if (String(url).endsWith("session"))
    return reply({
      signedIn: true,
      firstName: "Sam",
      manager: params.get("mode") !== "member",
    });
  if (!options?.method) return reply({ animals: records, more: false });
  writes++;
  if (params.get("mode") === "conflict" && writes === 1)
    return reply({ error: "This changed. Refresh and try again." }, 409);
  const value = JSON.parse(String(options.body));
  if (options.method === "POST") {
    const index = records.findIndex((item) => item.slug === value.slug);
    const next = {
      ...value,
      version: (value.expectedVersion ?? 0) + 1,
      deleted_at: null,
      updated_at: "2026-10-10T03:00:00Z",
    };
    if (index < 0) records.push(next);
    else records[index] = next;
    return reply({ version: next.version });
  }
  records = records.map((item) =>
    item.slug === value.slug
      ? {
          ...item,
          deleted_at:
            options.method === "DELETE" ? "2026-10-10T03:00:00Z" : null,
          state: "draft",
          version: item.version + 1,
        }
      : item,
  );
  return reply({ version: value.expectedVersion + 1 });
};
createRoot(document.getElementById("root")!).render(
  <>
    <header className="utility-bar">
      <div className="wrap">
        <p>Synthetic test. No remote writes.</p>
        <MemberLink pathname="/team/animals" />
      </div>
    </header>
    <main>
      <section className="wrap">
        <h1>Animal staff test workspace</h1>
      </section>
      {params.get("view") === "roster" ? (
        <AnimalRoster animals={records} />
      ) : (
        <AnimalManager />
      )}
    </main>
  </>,
);
