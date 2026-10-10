"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, ClipboardCheck, Printer } from "lucide-react";
import {
  lovettsvilleForecast,
  preVisitSections,
  preVisitVersion,
} from "@/lib/forms/pre-visit";
import type { Preparation } from "@/lib/community/preparation";

export function PreVisitChecklist({ managed = false }: { managed?: boolean }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [version, setVersion] = useState<number | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [busy, setBusy] = useState(managed);
  const [message, setMessage] = useState("");
  const [conflict, setConflict] = useState(false);
  const items = preVisitSections.flatMap((s) => [...s.items]);
  const count = items.filter((i) => checked[i.key]).length;
  const selected = items
    .filter((item) => checked[item.key])
    .map((item) => item.key);
  const dirty = JSON.stringify(selected) !== JSON.stringify(saved);
  const load = useCallback(async (signal?: AbortSignal) => {
    setBusy(true);
    try {
      const response = await fetch("/api/account/checklist", {
        cache: "no-store",
        signal,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Your checklist could not load.");
      const data = result as Preparation;
      if (
        !Array.isArray(data.checked) ||
        data.checklistVersion !== preVisitVersion ||
        !Number.isSafeInteger(data.version)
      )
        throw new Error("Your checklist could not load.");
      setChecked(Object.fromEntries(data.checked.map((key) => [key, true])));
      setSaved(data.checked);
      setVersion(data.version);
      setConflict(false);
      setMessage(
        data.updatedAt
          ? "Your saved preparation is ready."
          : "Your preparation has not been saved yet.",
      );
    } catch (error) {
      if (!signal?.aborted)
        setMessage(
          error instanceof Error
            ? error.message
            : "Your checklist could not load.",
        );
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, []);
  useEffect(() => {
    if (!managed) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [managed, load]);
  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checked: selected,
          version,
          checklistVersion: preVisitVersion,
        }),
      });
      const result = await response.json();
      if (response.status === 409) {
        setConflict(true);
        setMessage(
          "Your checklist changed in another window. Reload saved checks before saving again. Your current choices have not replaced them.",
        );
      } else if (!response.ok)
        setMessage(
          result.error || "Saving could not be confirmed. Please try again.",
        );
      else {
        setVersion(result.version);
        setSaved(selected);
        setMessage("Your preparation is saved to your account.");
      }
    } catch {
      setMessage(
        "Saving could not be confirmed. Your checks remain on this page. Try saving again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="pre-visit-checklist"
      aria-labelledby="pre-visit-heading"
    >
      <div className="pre-visit-heading">
        <div>
          <p className="eyebrow">Your first visit · Lovettsville, Virginia</p>
          <h2 id="pre-visit-heading">
            A little preparation. A better first visit.
          </h2>
          <p>
            Use this checklist when speaking with ENVET and getting ready for
            the barn. Your family can work through it together.
          </p>
        </div>
        <ClipboardCheck size={32} aria-hidden="true" />
      </div>
      <div className="pre-visit-toolbar">
        {managed && (
          <button
            type="button"
            className="action"
            disabled={busy || version === null || conflict || !dirty}
            onClick={() => void save()}
          >
            {busy ? "Please wait…" : "Save preparation"}
          </button>
        )}
        <p role="status" aria-live="polite">
          {count} of {items.length} preparation items checked
        </p>
        <button
          type="button"
          className="quiet-button"
          onClick={() => window.print()}
        >
          <Printer size={16} aria-hidden="true" /> Print checklist
        </button>
        <button
          type="button"
          className="quiet-button"
          disabled={!count || busy}
          onClick={() => setChecked({})}
        >
          Reset checks
        </button>
      </div>
      <p className="field-hint">
        {managed ? (
          "Save your personal checkmarks to return to them on another device. Changes are saved only when you choose Save preparation. This is not ENVET’s staff screening or a booking."
        ) : (
          <>
            Checkmarks on this page reset when you reload.{" "}
            <Link href="/account/pre-visit">
              Sign in to save your preparation
            </Link>
            .
          </>
        )}{" "}
        Arrange your visit with the team.
      </p>
      {managed && (
        <div className="preparation-status">
          <p role="status" aria-live="polite">
            {message || "Loading your saved preparation…"}
            {dirty && " You have unsaved changes."}
          </p>
          {!busy && (version === null || conflict) && (
            <button
              type="button"
              className="quiet-button"
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm(
                    "Reload saved checks and replace your unsaved choices?",
                  )
                )
                  void load();
              }}
            >
              Reload saved checks
            </button>
          )}
        </div>
      )}
      <ol className="pre-visit-sections">
        {preVisitSections.map((section, index) => (
          <li key={section.key}>
            <div className="pre-visit-section-heading">
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{section.title}</h3>
            </div>
            <div className="pre-visit-items">
              {section.items.map((item) => (
                <label key={item.key} className="pre-visit-item">
                  <input
                    type="checkbox"
                    disabled={managed && (busy || version === null)}
                    checked={!!checked[item.key]}
                    onChange={(e) =>
                      setChecked((v) => ({
                        ...v,
                        [item.key]: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </span>
                </label>
              ))}
              {section.key === "pvWeatherDiscussed" && (
                <a
                  className="pre-visit-weather"
                  href={lovettsvilleForecast}
                  target="_blank"
                  rel="noreferrer"
                >
                  National Weather Service: Lovettsville forecast{" "}
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="pre-visit-footer">
        ENVET confirms suitable activities, access arrangements, equipment fit
        and visit details with you. This checklist does not provide medical
        advice or promise clinical results.{" "}
        <Link href="/contact">Ask the team</Link> before traveling.
      </p>
    </section>
  );
}
