// Names supplied by ENVET. Links identify organizations, not a payment destination,
// an accreditation badge, or evidence of any specific financial contribution.
// Import provenance only. Public pages read the database, never this snapshot.
export const initialContributingOrganizations = [
  {
    name: "EQUUS Foundation",
    href: "https://www.equusfoundation.org/guardians/guardians.php",
  },
  { name: "PATH Int’l", href: "https://pathintl.org/" },
  {
    name: "West Virginia University (WVU)",
    href: "https://www.davis.wvu.edu/future-students/majors",
  },
  {
    name: "Healing Through Horses",
    href: "https://www.healingthroughhorses.com/coaching/",
  },
  {
    name: "Global Federation of Animal Sanctuaries (GFAS)",
    href: "https://sanctuaryfederation.org/accreditation/standards/",
  },
  {
    name: "SAFE: Save a Forgotten Equine",
    href: "https://www.safehorses.org/",
  },
  { name: "Equine Rescue League", href: "https://www.equinerescueleague.org/" },
  { name: "Corro", href: "https://corroshop.com/" },
] as const;
export const organizationImport = initialContributingOrganizations.map(
  (entry, index) => ({
    slug: [
      "equus-foundation",
      "path-international",
      "west-virginia-university",
      "healing-through-horses",
      "gfas",
      "safe",
      "equine-rescue-league",
      "corro",
    ][index],
    ...entry,
    description: "",
    sort_order: (index + 1) * 10,
    state: "published" as const,
  }),
);
