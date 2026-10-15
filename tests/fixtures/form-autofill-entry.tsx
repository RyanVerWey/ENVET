import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "../../src/app/globals.css";
import "../../src/app/forms.css";
import { FormField } from "../../src/components/forms/signing-room";
import { fieldSections } from "../../src/lib/forms/definition";

function AutofillFixture() {
  const [fields, setFields] = useState<Record<string, string>>({});
  return (
    <section className="wrap">
      <h1>Contact information</h1>
      <p>Synthetic local test. No submission or saved personal data.</p>
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="sign-field-grid">
          {fieldSections.liability[0].fields.map((field) => (
            <FormField
              key={field.key}
              field={field}
              value={fields[field.key] ?? ""}
              onChange={(value) =>
                setFields((previous) => ({ ...previous, [field.key]: value }))
              }
            />
          ))}
        </div>
        <button type="submit" className="action">
          Check fields
        </button>
      </form>
    </section>
  );
}
createRoot(document.getElementById("root")!).render(<AutofillFixture />);
