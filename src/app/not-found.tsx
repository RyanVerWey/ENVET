import { Action } from "@/components/ui";
export default function NotFound() {
  return (
    <section className="wrap not-found">
      <p className="eyebrow">404 · A WRONG TURN, THAT’S ALL</p>
      <h1>
        LET’S GET YOU
        <br />
        BACK TO THE GATE.
      </h1>
      <p>This page isn’t here. You can head home or contact ENVET for help.</p>
      <div className="actions">
        <Action href="/">Back to ENVET</Action>
        <Action href="/contact" secondary>
          Contact the team
        </Action>
      </div>
    </section>
  );
}
