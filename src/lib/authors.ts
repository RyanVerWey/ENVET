export const authors = [
  {
    slug: "m-lamm",
    name: "M. Lamm",
    type: "Person" as const,
    role: "ENVET owner · Army Veteran",
    bio: "M. Lamm is the owner of Eagle’s Nest Veterans’ Equine Therapy and an Army Veteran. ENVET brings Veterans, Active Duty service members and their families together through connection with horses in Lovettsville, Virginia.",
  },
  {
    slug: "envet-editorial",
    name: "ENVET editorial",
    type: "Organization" as const,
    role: "Eagle’s Nest Veterans’ Equine Therapy",
    bio: "Program guides from ENVET, a nonprofit supporting Veterans, Active Duty service members and their families through connection with horses.",
  },
];
export function getAuthor(name: string) {
  return authors.find((author) => author.name === name);
}
