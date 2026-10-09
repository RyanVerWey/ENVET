import {
  conditionOptions,
  evaluationFields,
  fieldSections,
  formStatuses,
  formVersion,
  isFormKind,
  liabilityInitials,
  ridingOptions,
  type FormKind,
  type Field,
} from "./definition";
import { uuidPattern } from "../community/validation";
import { preVisitInput, preVisitKeys } from "./pre-visit";

export type Point = [number, number];
export type Signature =
  | { method: "typed"; name: string }
  | { method: "drawn"; name: string; strokes: Point[][] };
export type Submission = {
  kind: FormKind;
  version: string;
  requestId: string;
  fields: Record<string, string>;
  minor: boolean;
  riding: string[];
  conditions: string[];
  initials: Record<string, string>;
  guestSignature: Signature;
  guardianSignature: Signature | null;
  consent: true;
};
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}
function clean(value: unknown, max: number, required = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
  )
    return null;
  const text = value.trim().normalize("NFC");
  return required && !text ? null : text;
}
export function fieldInput(field: Field, value: unknown) {
  const text = clean(value, field.max ?? 254, field.required);
  if (text === null || (field.key.endsWith("Name") && text.length > 100))
    return null;
  if (
    field.type === "email" &&
    text &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
  )
    return null;
  if (field.type === "tel" && text && !/^[+() .0-9-]{7,30}$/.test(text))
    return null;
  if (field.type === "date" && text && !validDate(text)) return null;
  return text;
}
export function initialInput(value: unknown) {
  const text = clean(value, 12, true);
  return text && /^[\p{L}\p{M} .'-]+$/u.test(text) ? text : null;
}
export function signatureInput(
  value: unknown,
  expectedName: string,
): Signature | null {
  if (!record(value)) return null;
  const name = clean(value.name, 100, true);
  if (
    !name ||
    name.toLocaleLowerCase("en-US") !==
      expectedName.trim().normalize("NFC").toLocaleLowerCase("en-US")
  )
    return null;
  if (
    value.method === "typed" &&
    Object.keys(value).every((k) => ["method", "name"].includes(k))
  )
    return { method: "typed", name };
  if (
    value.method !== "drawn" ||
    !Object.keys(value).every((k) =>
      ["method", "name", "strokes"].includes(k),
    ) ||
    !Array.isArray(value.strokes) ||
    !value.strokes.length ||
    value.strokes.length > 100
  )
    return null;
  let count = 0;
  let distance = 0;
  const strokes: Point[][] = [];
  for (const stroke of value.strokes) {
    if (!Array.isArray(stroke) || stroke.length < 2) return null;
    const points: Point[] = [];
    for (const point of stroke) {
      if (
        ++count > 2000 ||
        !Array.isArray(point) ||
        point.length !== 2 ||
        !point.every(
          (x) =>
            typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 1,
        )
      )
        return null;
      const p: Point = [
        Number(point[0].toFixed(5)),
        Number(point[1].toFixed(5)),
      ];
      if (points.length)
        distance += Math.hypot(
          p[0] - points.at(-1)![0],
          p[1] - points.at(-1)![1],
        );
      points.push(p);
    }
    strokes.push(points);
  }
  return distance < 0.05 ? null : { method: "drawn", name, strokes };
}
function options(value: unknown, allowed: string[]) {
  return Array.isArray(value) &&
    value.length <= allowed.length &&
    new Set(value).size === value.length &&
    value.every((v) => typeof v === "string" && allowed.includes(v))
    ? ([...value].sort() as string[])
    : null;
}
export function submissionInput(value: unknown): Submission | null {
  if (
    !record(value) ||
    !isFormKind(value.kind) ||
    !Object.keys(value).every((k) =>
      [
        "kind",
        "version",
        "requestId",
        "fields",
        "minor",
        "riding",
        "conditions",
        "initials",
        "guestSignature",
        "guardianSignature",
        "consent",
      ].includes(k),
    ) ||
    typeof value.requestId !== "string" ||
    !uuidPattern.test(value.requestId) ||
    value.version !== formVersion(value.kind) ||
    value.consent !== true ||
    !record(value.fields) ||
    !record(value.initials) ||
    typeof value.minor !== "boolean"
  )
    return null;
  const kind = value.kind;
  const minor = kind === "liability" && value.minor;
  if (kind === "donation" && value.minor) return null;
  const schema = [
    ...fieldSections[kind].flatMap((s) => s.fields),
    ...(minor
      ? [
          { key: "minorAge", label: "Age", required: true, max: 2 },
          { key: "guardianName", label: "Guardian", required: true, max: 100 },
        ]
      : []),
  ];
  if (!Object.keys(value.fields).every((k) => schema.some((f) => f.key === k)))
    return null;
  const fields: Record<string, string> = {};
  for (const field of schema) {
    const text = clean(
      value.fields[field.key] ?? "",
      field.max ?? 254,
      field.required,
    );
    if (text === null || (field.key.endsWith("Name") && text.length > 100))
      return null;
    if (
      field.type === "email" &&
      text &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
    )
      return null;
    if (field.type === "tel" && text && !/^[+() .0-9-]{7,30}$/.test(text))
      return null;
    if (field.type === "date" && !validDate(text)) return null;
    fields[field.key] = text;
  }
  if (minor && !/^([0-9]|1[0-7])$/.test(fields.minorAge)) return null;
  const riding = options(
    value.riding,
    kind === "donation" ? ridingOptions : [],
  );
  const conditions = options(
    value.conditions,
    kind === "donation" ? conditionOptions : [],
  );
  if (!riding || !conditions) return null;
  const expected =
    kind === "liability"
      ? [...liabilityInitials.map((i) => `p${i}`), ...(minor ? ["parent"] : [])]
      : [];
  if (
    Object.keys(value.initials).length !== expected.length ||
    !Object.keys(value.initials).every((k) => expected.includes(k))
  )
    return null;
  const initials: Record<string, string> = {};
  for (const key of expected) {
    const text = initialInput(value.initials[key]);
    if (!text) return null;
    initials[key] = text;
  }
  const guestSignature = signatureInput(
    value.guestSignature,
    fields[kind === "liability" ? "guestName" : "ownerName"],
  );
  const guardianSignature = minor
    ? signatureInput(value.guardianSignature, fields.guardianName)
    : null;
  if (
    !guestSignature ||
    (minor && !guardianSignature) ||
    (!minor && value.guardianSignature !== null)
  )
    return null;
  return {
    kind,
    version: value.version as string,
    requestId: value.requestId,
    fields,
    minor,
    riding,
    conditions,
    initials,
    guestSignature,
    guardianSignature,
    consent: true,
  };
}
export function evaluationInput(value: unknown, kind: FormKind = "donation") {
  const fields =
    kind === "donation"
      ? evaluationFields
      : evaluationFields.filter((f) => f.key === "notes");
  if (
    !record(value) ||
    !Object.keys(value).every(
      (k) =>
        fields.some((f) => f.key === k) ||
        // Earlier guest reviews included blank horse-evaluation keys.
        (kind === "liability" &&
          value[k] === "" &&
          evaluationFields.some((f) => f.key === k)) ||
        (kind === "liability" && preVisitKeys.some((key) => key === k)),
    )
  )
    return null;
  const result: Record<string, string> = {};
  for (const field of fields) {
    const text = clean(value[field.key] ?? "", field.max ?? 254);
    if (text === null || (field.type === "date" && text && !validDate(text)))
      return null;
    result[field.key] = text;
  }
  if (kind === "liability") {
    const screening = preVisitInput(value);
    if (!screening) return null;
    Object.assign(result, screening);
  }
  return result;
}
export function validStatus(kind: FormKind, status: unknown): status is string {
  return typeof status === "string" && formStatuses(kind).includes(status);
}
