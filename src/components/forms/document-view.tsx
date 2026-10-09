import { formSource, type FormKind } from "@/lib/forms/definition";
export type DocumentSource = ReturnType<typeof formSource>;
export function DocumentView({
  source,
  showProvenance = true,
}: {
  source: DocumentSource;
  showProvenance?: boolean;
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
          {p}
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
export function SourceDisclosure({ kind }: { kind: FormKind }) {
  return (
    <details className="document-disclosure" name="envet-accordion">
      <summary>Read the full document</summary>
      <DocumentView source={formSource(kind)} showProvenance={false} />
    </details>
  );
}
