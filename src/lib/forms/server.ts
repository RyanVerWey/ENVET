import "server-only";
import { dataConfig } from "../community/config";
import { encryptionReady } from "./crypto";
import { formVersion, type FormKind } from "./definition";
export function collectionEnabled(kind: FormKind) {
  return (
    !!dataConfig() &&
    encryptionReady() &&
    process.env.FORM_COLLECTION_ENABLED === "true" &&
    process.env.FORM_APPROVED_DONATION_VERSION === formVersion("donation") &&
    (kind !== "liability" ||
      process.env.FORM_APPROVED_LIABILITY_VERSION === formVersion("liability"))
  );
}
