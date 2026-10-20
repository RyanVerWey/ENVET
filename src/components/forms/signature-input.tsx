"use client";
import { useId, useRef, useState, type PointerEvent } from "react";
import type { Point, Signature } from "@/lib/forms/validation";

export function SignatureDrawing({
  strokes,
  label,
}: {
  strokes: Point[][];
  label: string;
}) {
  return (
    <svg
      viewBox="0 0 600 160"
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className="signature-preview"
    >
      <title>{label}</title>
      {strokes.map((stroke, i) => (
        <polyline
          key={i}
          points={stroke.map(([x, y]) => `${x * 600},${y * 160}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
export function SignatureInput({
  label,
  value,
  onChange,
  purpose = "signature",
}: {
  label: string;
  value: Signature;
  onChange: (signature: Signature) => void;
  purpose?: "signature" | "initials";
}) {
  const id = useId();
  const drawing = useRef(false);
  const pointer = useRef<number | null>(null);
  const [limit, setLimit] = useState(false);
  const initials = purpose === "initials";
  function point(event: PointerEvent<SVGSVGElement>): Point {
    const box = event.currentTarget.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)),
      Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)),
    ];
  }
  function start(event: PointerEvent<SVGSVGElement>) {
    if (
      value.method !== "drawn" ||
      !event.isPrimary ||
      event.button !== 0 ||
      value.strokes.length >= (initials ? 20 : 100)
    )
      return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = event.pointerId;
    drawing.current = true;
    onChange({ ...value, strokes: [...value.strokes, [point(event)]] });
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    if (
      !drawing.current ||
      pointer.current !== event.pointerId ||
      value.method !== "drawn"
    )
      return;
    if (
      value.strokes.reduce((n, s) => n + s.length, 0) >= (initials ? 200 : 2000)
    ) {
      drawing.current = false;
      setLimit(true);
      return;
    }
    const strokes = value.strokes.map((s) => [...s]);
    strokes.at(-1)!.push(point(event));
    onChange({ ...value, strokes });
  }
  function stop() {
    drawing.current = false;
    pointer.current = null;
    if (value.method === "drawn")
      onChange({
        ...value,
        strokes: value.strokes.filter((s) => s.length >= 2),
      });
  }
  return (
    <fieldset className="signature-field">
      <legend>{label}</legend>
      <div className="sign-mode">
        <button
          type="button"
          aria-pressed={value.method === "typed"}
          onClick={() => {
            onChange({ method: "typed", name: value.name });
            setLimit(false);
          }}
        >
          {initials ? "Type initials" : "Type signature"}
        </button>
        <button
          type="button"
          aria-pressed={value.method === "drawn"}
          onClick={() => {
            onChange({ method: "drawn", name: value.name, strokes: [] });
            setLimit(false);
          }}
        >
          {initials ? "Draw initials" : "Draw signature"}
        </button>
      </div>
      {(!initials || value.method === "typed") && (
        <>
          <label htmlFor={`${id}-name`}>
            {initials ? "Typed initials" : "Full printed name"}{" "}
            <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${id}-name`}
            maxLength={initials ? 12 : 100}
            value={value.name}
            autoComplete="off"
            onChange={(event) =>
              onChange({ ...value, name: event.target.value })
            }
            aria-describedby={`${id}-help`}
          />
        </>
      )}
      <p id={`${id}-help`} className="field-hint">
        {initials
          ? "Create your own initials. Apply them separately to each acknowledgement after reading it. "
          : "Use the same printed name entered for this signer. "}
        {value.method === "drawn"
          ? `Draw with a mouse, finger or stylus. Keyboard users can type ${initials ? "initials" : "a signature"} instead.`
          : initials
            ? "Changing these initials does not change acknowledgements already initialled."
            : "Your typed name is the signature; its display style does not verify identity."}
      </p>
      {value.method === "typed" ? (
        <div
          className="typed-signature"
          aria-label={
            initials ? "Typed initials preview" : "Typed signature preview"
          }
        >
          {value.name || (initials ? "Your initials" : "Your signature")}
        </div>
      ) : (
        <svg
          className="signature-pad"
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${label}: drawing area`}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
          onLostPointerCapture={stop}
        >
          <title>
            {initials
              ? "Draw initials here, or choose Type initials"
              : "Draw signature here, or choose Type signature"}
          </title>
          {value.strokes.map((s, i) => (
            <polyline
              key={i}
              points={s.map(([x, y]) => `${x * 600},${y * 160}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      )}
      {value.method === "drawn" && (
        <button
          type="button"
          className="quiet-button"
          onClick={() => {
            onChange({ ...value, strokes: [] });
            setLimit(false);
          }}
        >
          Clear drawing
        </button>
      )}
      {limit && (
        <p role="status">
          Drawing limit reached. Clear and draw again, or use the typed option.
        </p>
      )}
    </fieldset>
  );
}
