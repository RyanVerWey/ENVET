"use client";

import { useState } from "react";

export function InquiryForm({ enabled }: { enabled: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  if (!enabled)
    return (
      <p className="small">
        The online form is being prepared. Please call or email ENVET using the
        contact options above.
      </p>
    );
  return (
    <form
      className="inquiry-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (state === "sending") return;
        const form = event.currentTarget;
        const data = new FormData(form);
        setState("sending");
        setMessage("");
        try {
          const response = await fetch("/api/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.get("name"),
              email: data.get("email"),
              phone: data.get("phone"),
              serviceInterest: data.get("serviceInterest"),
              note: data.get("note"),
              consent: data.get("consent") === "on",
            }),
          });
          const result = await response.json();
          setMessage(
            response.ok ? result.message : result.error || "Please try again.",
          );
          setState(response.ok ? "sent" : "error");
          if (response.ok) form.reset();
        } catch {
          setState("error");
          setMessage(
            "Could not connect. Please try again or contact ENVET directly.",
          );
        }
      }}
    >
      <div className="form-grid">
        <label>
          Name{" "}
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label>
          Email{" "}
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
          />
        </label>
        <label>
          Phone{" "}
          <input name="phone" type="tel" autoComplete="tel" maxLength={30} />
        </label>
        <label>
          Service or activity of interest{" "}
          <input
            name="serviceInterest"
            required
            minLength={2}
            maxLength={100}
            placeholder="For example, a first visit"
          />
        </label>
      </div>
      <p className="small">
        Provide an email address or phone number so ENVET can respond.
      </p>
      <label>
        Short note (optional) <textarea name="note" rows={4} maxLength={500} />
      </label>
      <p className="small">
        Please do not include medical details, military documents, Social
        Security numbers, or payment information.
      </p>
      <label className="checkbox-label">
        <input name="consent" type="checkbox" required /> I agree that ENVET may
        contact me about this inquiry.
      </label>
      <button className="action" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send inquiry"}
      </button>
      {message && (
        <p
          className="form-message"
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
