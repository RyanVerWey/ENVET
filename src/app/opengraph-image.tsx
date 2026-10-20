import { createSocialImage } from "@/lib/social-image";
export const alt =
  "ENVET — equine therapy for Veterans and families, with a rider and horse at Eagle’s Nest in Lovettsville, Virginia.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return createSocialImage({ title: "Horses. Hope.\nA place to belong." });
}
