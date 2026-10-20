import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { absoluteUrl, launchEnabled } from "@/lib/site";
import { getAuthor } from "@/lib/authors";
import { policyUpdated } from "@/lib/page-schema";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!launchEnabled) return [];
  const posts = getPosts();
  const newestUpdate = (items: typeof posts) =>
    items
      .map((post) => post.updated)
      .sort()
      .at(-1);
  return [
    ...[
      "/",
      "/about",
      "/visit",
      "/staff",
      "/programs",
      "/donate",
      "/contact",
      "/gallery",
      "/blog",
      "/privacy",
      "/editorial-policy",
    ].map((path) => ({
      url: absoluteUrl(path),
      ...(path === "/privacy" || path === "/editorial-policy"
        ? { lastModified: policyUpdated }
        : {}),
      ...(path === "/blog" && posts.length
        ? { lastModified: newestUpdate(posts) }
        : {}),
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updated,
    })),
    ...[...new Set(posts.map((p) => p.categorySlug))].map((slug) => ({
      url: absoluteUrl(`/blog/category/${slug}`),
      lastModified: newestUpdate(
        posts.filter((post) => post.categorySlug === slug),
      ),
    })),
    ...[
      ...new Set(
        posts.map((post) => getAuthor(post.author)?.slug).filter(Boolean),
      ),
    ].map((slug) => ({
      url: absoluteUrl(`/blog/authors/${slug}`),
    })),
  ];
}
