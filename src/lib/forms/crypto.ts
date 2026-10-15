import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
export type Envelope = {
  keyId: string;
  iv: string;
  tag: string;
  ciphertext: string;
};
export function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map(
      (k) =>
        `${JSON.stringify(k)}:${stableJson((value as Record<string, unknown>)[k])}`,
    )
    .join(",")}}`;
}
export function digest(value: unknown) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}
function keys() {
  try {
    const value: unknown = JSON.parse(
      process.env.FORM_ENCRYPTION_KEYS ?? "null",
    );
    if (!value || typeof value !== "object" || Array.isArray(value))
      return null;
    const result: Record<string, Buffer> = Object.create(null);
    for (const [id, key] of Object.entries(value)) {
      if (
        !/^[a-z0-9-]{1,40}$/.test(id) ||
        typeof key !== "string" ||
        !/^[A-Za-z0-9+/]{43}=$/.test(key)
      )
        return null;
      const bytes = Buffer.from(key, "base64");
      if (bytes.length !== 32 || bytes.toString("base64") !== key) return null;
      result[id] = bytes;
    }
    return result;
  } catch {
    return null;
  }
}
export function encryptionReady() {
  const ring = keys();
  return !!ring && Buffer.isBuffer(ring[process.env.FORM_ACTIVE_KEY_ID ?? ""]);
}
export function encrypt(value: unknown, context: string): Envelope {
  const ring = keys();
  const keyId = process.env.FORM_ACTIVE_KEY_ID ?? "";
  const key = ring?.[keyId];
  if (!key) throw new Error("Form protection unavailable");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([
    cipher.update(stableJson(value), "utf8"),
    cipher.final(),
  ]);
  return {
    keyId,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}
export function decrypt<T>(box: Envelope, context: string): T {
  const key = keys()?.[box.keyId];
  if (!key) throw new Error("Form protection unavailable");
  if (!box.ciphertext || box.ciphertext.length > 300000)
    throw new Error("Invalid record");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(box.iv, "base64"),
  );
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(box.tag, "base64"));
  return JSON.parse(
    Buffer.concat([
      decipher.update(Buffer.from(box.ciphertext, "base64")),
      decipher.final(),
    ]).toString("utf8"),
  ) as T;
}
