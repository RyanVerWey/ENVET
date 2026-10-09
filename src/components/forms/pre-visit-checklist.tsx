"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ClipboardCheck, Printer } from "lucide-react";
import { lovettsvilleForecast, preVisitSections } from "@/lib/forms/pre-visit";

export function PreVisitChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const items = preVisitSections.flatMap((s) => [...s.items]);
  const count = items.filter((i) => checked[i.key]).length;
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
          disabled={!count}
          onClick={() => setChecked({})}
        >
          Reset checks
        </button>
      </div>
      <p className="field-hint">
        Use this as your personal preparation list. Checkmarks reset when you
        reload and are not sent to ENVET. Arrange your visit with the team.
      </p>
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
