import type { InitialMark } from "@/lib/forms/validation";
import { SignatureDrawing } from "./signature-input";

export function InitialMarkView({
  mark,
  label,
}: {
  mark: InitialMark;
  label: string;
}) {
  return (
    <span className="applied-initials" data-applied-initials="true">
      {typeof mark === "string" || mark.method === "typed" ? (
        <span aria-label={label}>
          {typeof mark === "string" ? mark : mark.text}
        </span>
      ) : (
        <SignatureDrawing strokes={mark.strokes} label={label} />
      )}
    </span>
  );
}
