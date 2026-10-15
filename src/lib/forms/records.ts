import "server-only";
import { decrypt, digest, type Envelope } from "./crypto";
import type { Submission } from "./validation";
export type InitialAcknowledgement = {
  key: string;
  paragraphIndex: number;
  text: string;
  mark: Submission["initials"][string];
  signerRole: "guest" | "guardian";
  recordedAt: string;
};
export type SignedRecord = Submission & {
  id: string;
  receivedAt: string;
  source: unknown;
  electronicConsent: { version: string; text: string };
  guardianCertification?: { version: string; text: string; certified: true };
  signer: { id: string; email: string; role: "guest" | "guardian" | "owner" };
  attribution: string;
  initialAcknowledgements?: InitialAcknowledgement[];
};
export type StoredForm = {
  id: string;
  kind: Submission["kind"];
  created_at: string;
  record_digest: string;
  protected_record: Envelope;
  status: string;
  version: number;
  participant_id: string | null;
  evaluation: { id: string; protected_evaluation: Envelope } | null;
  visits: {
    id: string;
    day: string;
    session: string;
    service: string;
    state: "completed" | "void";
  }[];
};
export function openForm(stored: StoredForm) {
  const record = decrypt<SignedRecord>(
    stored.protected_record,
    `${stored.kind}:${stored.id}:signed:v1`,
  );
  if (
    digest(record) !== stored.record_digest ||
    record.id !== stored.id ||
    record.kind !== stored.kind
  )
    throw new Error("Record integrity failed");
  const evaluation = stored.evaluation
    ? decrypt<Record<string, string>>(
        stored.evaluation.protected_evaluation,
        `${stored.id}:${stored.evaluation.id}:review:v1`,
      )
    : null;
  return {
    id: stored.id,
    kind: stored.kind,
    created_at: stored.created_at,
    record_digest: stored.record_digest,
    status: stored.status,
    version: stored.version,
    record,
    evaluation,
    participant_id: stored.participant_id,
    visits: stored.visits,
  };
}
