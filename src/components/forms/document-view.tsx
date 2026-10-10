import { formSource, type FormKind } from "@/lib/forms/definition";
import type { InitialMark } from "@/lib/forms/validation";
import { InitialMarkView } from "./initial-mark";
export type DocumentSource = ReturnType<typeof formSource>;
export function DocumentView({
  source,
  showProvenance = true,
  initials,
  minor = false,
  fields,
}: {
  source: DocumentSource;
  showProvenance?: boolean;
  initials?: Record<string, InitialMark>;
  minor?: boolean;
  fields?: Record<string, string>;
}) {
  return (
    <div className="source-document">
      {source.extraParts
        .filter((p) => p.part.includes("header"))
        .flatMap((p) => p.paragraphs)
        .map((p, i) => (
          <p className="source-header" key={`header-${i}`}>
            {p}
          </p>
        ))}
      {source.paragraphs.map((p, i) => (
        <p key={i} data-source-paragraph={i}>
          {initials ? (
            <InitialledParagraph
              text={fields ? filledLiabilityFields(p, i, fields, minor) : p}
              index={i}
              initials={initials}
              minor={minor}
            />
          ) : (
            p
          )}
        </p>
      ))}
      {showProvenance && (
        <p className="document-provenance">
          Source SHA-256: <code>{source.sourceSha256}</code>. Supplied wording
          preserved; page layout adapted for web reading.
        </p>
      )}
    </div>
  );
}
// Fill known field slots in the release presentation only. The stored source
// snapshot is never rewritten; submitted fields/signatures remain separate.
function filledLiabilityFields(
  text: string,
  index: number,
  fields: Record<string, string>,
  minor: boolean,
) {
  const values: Record<number, string[]> = {
    0: [fields.signedDate, fields.guestName],
    17: [fields.guestName],
    22: [fields.signedDate],
    23: [fields.guestName, fields.signedDate],
    26: [
      "See guest signature above",
      minor ? fields.minorAge : "Not applicable (adult guest)",
    ],
    27: [minor ? fields.guardianName : "Not applicable (adult guest)"],
    30: [
      minor
        ? "See separate guardian signature above"
        : "Not applicable (adult guest)",
    ],
    31: [fields.address],
    32: ["—"],
    33: [fields.phone],
    34: [fields.email],
  };
  if (index === 36)
    return `${text}: ${fields.emergencyName} · ${fields.emergencyPhone}`;
  let slot = 0;
  return text.replace(/_{2,}/g, (blank) => values[index]?.[slot++] ?? blank);
}
function InitialledParagraph({
  text,
  index,
  initials,
  minor,
}: {
  text: string;
  index: number;
  initials: Record<string, InitialMark>;
  minor: boolean;
}) {
  const guest = initials[`p${index}`];
  if (!guest) return text;
  // Opening paragraph has two distinct signers; other clauses have one marker.
  const parts =
    index === 1 ? text.split(/(_{2,})/) : text.split(/(_{2,}(?=\s*Initials))/);
  let slot = 0;
  return parts.map((part, n) => {
    if (!/^_{2,}$/.test(part)) return part;
    const isParent = index === 1 && slot++ === 1;
    const mark = isParent ? initials.parent : guest;
    if (isParent && !minor)
      return <span key={n}>Not applicable (adult guest)</span>;
    return mark ? (
      <InitialMarkView
        key={n}
        mark={mark}
        label={
          isParent
            ? "Parent / guardian initials"
            : `Guest initials, paragraph ${index}`
        }
      />
    ) : (
      part
    );
  });
}
export function SourceDisclosure({ kind }: { kind: FormKind }) {
  return (
    <details className="document-disclosure" name="envet-accordion">
      <summary>Read the full document</summary>
      <DocumentView source={formSource(kind)} showProvenance={false} />
    </details>
  );
}
