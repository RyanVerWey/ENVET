import React from "react";
import { createRoot } from "react-dom/client";
import { ProgramCatalog } from "../../src/components/program-catalog";
import { ContributingOrganizations } from "../../src/components/contributing-organizations";
import { Header } from "../../src/components/header";
import programs from "../../content/programs.json";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "../../src/app/globals.css";
document.documentElement.dataset.corvaTheme =
  new URLSearchParams(location.search).get("theme") === "dark"
    ? "mint-dark"
    : "mint-light";
document.documentElement.style.setProperty("--font-body", "Arial, sans-serif");
window.fetch = async () =>
  new Response(
    JSON.stringify({ signedIn: false, firstName: null, manager: false }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
createRoot(document.getElementById("root")!).render(
  <>
    <a className="skip-link" href="#main">
      Skip to content
    </a>
    <Header />
    <main id="main" tabIndex={-1}>
      <div className="wrap">
        <h1>Owner-approved content component verification</h1>
        <p>Local-only layout test. No remote records or donations.</p>
      </div>
      <ProgramCatalog services={programs} />
      <ContributingOrganizations />
    </main>
  </>,
);
