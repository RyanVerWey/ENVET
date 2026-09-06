import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { absoluteUrl, launchEnabled } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!launchEnabled) return [];
  const posts = getPosts();
  return [
    ...[
      "/",
      "/about",
      "/visit",
      "/donate",
      "/contact",
      "/gallery",
      "/blog",
      "/privacy",
      "/editorial-policy",
    ].map((path) => ({ url: absoluteUrl(path) })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updated,
    })),
    ...[...new Set(posts.map((p) => p.categorySlug))].map((slug) => ({
      url: absoluteUrl(`/blog/category/${slug}`),
    })),
  ];
}
