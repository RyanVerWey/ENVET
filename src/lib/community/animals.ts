import { articleSlugPattern } from "./validation";

export const animalTypes = {
  horse: "Horse Heroes",
  dog: "Dogs",
  cat: "Cats",
} as const;
export type AnimalType = keyof typeof animalTypes;
export type AnimalBio = {
  slug: string;
  name: string;
  species: AnimalType;
  nickname: string;
  role: string;
  summary: string;
  story: string;
  personality: string;
  favorites: string;
  visitTips: string;
  photo: string;
  photoAlt: string;
  state: "draft" | "published" | "archived";
};
export type AnimalRecord = AnimalBio & {
  version: number;
  deleted_at: string | null;
  updated_at: string;
};
export const blankAnimal: AnimalBio = {
  slug: "",
  name: "",
  species: "horse",
  nickname: "",
  role: "",
  summary: "",
  story: "",
  personality: "",
  favorites: "",
  visitTips: "",
  photo: "",
  photoAlt: "",
  state: "draft",
};
export const photoPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/;
export const animalColumns =
  "slug,name,species,nickname,role,summary,story,personality,favorites,visitTips,photo,photoAlt,state,version,deleted_at,updated_at";
export function parseAnimal(value: Record<string, unknown>): AnimalBio | null {
  const result = {} as Record<string, string>;
  const limits = {
    slug: 100,
    name: 100,
    nickname: 100,
    role: 100,
    summary: 700,
    story: 4000,
    personality: 300,
    favorites: 300,
    visitTips: 700,
    photo: 100,
    photoAlt: 250,
  };
  for (const [key, max] of Object.entries(limits)) {
    if (typeof value[key] !== "string") return null;
    const text = (value[key] as string).trim();
    if (
      text.length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)
    )
      return null;
    result[key] = text;
  }
  if (
    !articleSlugPattern.test(result.slug) ||
    result.name.length < 2 ||
    result.summary.length < 10 ||
    !Object.hasOwn(animalTypes, String(value.species)) ||
    !["draft", "published", "archived"].includes(String(value.state)) ||
    (result.photo && !photoPattern.test(result.photo)) ||
    (result.photo && !result.photoAlt) ||
    (value.state === "published" &&
      (!result.photo || !result.story || !result.visitTips))
  )
    return null;
  return { ...result, species: value.species, state: value.state } as AnimalBio;
}
export function expectedAnimalVersion(value: unknown): value is number | null {
  return value === null || (Number.isSafeInteger(value) && Number(value) > 0);
}
