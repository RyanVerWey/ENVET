import React from "react";
import { createRoot } from "react-dom/client";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "../../src/app/globals.css";
import "../../src/app/forms.css";
import { SigningRoom } from "../../src/components/forms/signing-room";

// Isolated synthetic test. Never contact real auth, APIs or storage.
window.fetch = async () =>
  new Response(JSON.stringify({ error: "Synthetic test: no record saved." }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
document.documentElement.dataset.corvaTheme =
  new URLSearchParams(location.search).get("theme") === "dark"
    ? "mint-dark"
    : "mint-light";
createRoot(document.getElementById("root")!).render(
  <>
    <p className="wrap">
      Synthetic local test. No Google account, submission or saved personal
      data.
    </p>
    <SigningRoom kind="liability" enabled={true} signedIn={true} />
  </>,
);
