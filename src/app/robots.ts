import type { MetadataRoute } from "next";
import { absoluteUrl, launchEnabled } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return launchEnabled
    ? {
        rules: { userAgent: "*", allow: "/" },
        sitemap: absoluteUrl("/sitemap.xml"),
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
