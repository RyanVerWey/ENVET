import { preVisitSections, preVisitVersion } from "@/lib/forms/pre-visit";
export type Preparation = {
  checked: string[];
  checklistVersion: string;
  version: number;
  updatedAt: string | null;
};
export const preparationKeys: string[] = preVisitSections.flatMap((section) =>
  section.items.map((item) => item.key),
);
export function preparationInput(value: Record<string, unknown> | null) {
  if (
    !value ||
    value.checklistVersion !== preVisitVersion ||
    !Number.isSafeInteger(value.version) ||
    (value.version as number) < 0 ||
    !Array.isArray(value.checked) ||
    value.checked.length > preparationKeys.length ||
    new Set(value.checked).size !== value.checked.length ||
    value.checked.some(
      (key) => typeof key !== "string" || !preparationKeys.includes(key),
    )
  )
    return null;
  const checked = value.checked as string[];
  return {
    checked: preparationKeys.filter((key) => checked.includes(key)),
    checklistVersion: preVisitVersion,
    version: value.version as number,
  };
}
