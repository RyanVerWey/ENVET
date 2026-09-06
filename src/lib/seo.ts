import type { Metadata } from "next";
import { absoluteUrl, launchEnabled, organization } from "./site";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: launchEnabled ? { canonical: absoluteUrl(path) } : undefined,
    openGraph: {
      title: `${title} | ENVET`,
      description,
      type: "website",
      siteName: organization.name,
      locale: "en_US",
      ...(launchEnabled ? { url: absoluteUrl(path) } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ENVET`,
      description,
    },
  };
}
