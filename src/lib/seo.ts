import type { Metadata } from "next";
import { absoluteUrl, launchEnabled, organization } from "./site";
export const socialImageSize = { width: 1200, height: 630 };
export const defaultSocialImage = {
  url: "/opengraph-image?v=2",
  alt: "ENVET — free equine-assisted programs for Veterans and families, with a photograph from Eagle’s Nest in Lovettsville, Virginia.",
};
export function brandedTitle(title: string) {
  return /\bENVET\b/.test(title) ? title : `${title} | ENVET`;
}
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image = defaultSocialImage,
): Metadata {
  const socialTitle = brandedTitle(title);
  const socialImage = {
    ...image,
    url: absoluteUrl(image.url),
    ...socialImageSize,
    type: "image/png",
  };
  return {
    title: { absolute: socialTitle },
    description,
    alternates: launchEnabled ? { canonical: absoluteUrl(path) } : undefined,
    openGraph: {
      title: socialTitle,
      description,
      type: "website",
      siteName: organization.name,
      locale: "en_US",
      images: [socialImage],
      ...(launchEnabled ? { url: absoluteUrl(path) } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}
