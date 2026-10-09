import "server-only";
import { getPosts } from "@/lib/blog";

const fixed = new Set([
  "/",
  "/about",
  "/visit",
  "/contact",
  "/blog",
  "/gallery",
  "/donate",
  "/privacy",
  "/editorial-policy",
]);

export function isCountablePath(path: string) {
  if (path.includes("?") || path.includes("#") || path.length > 200)
    return false;
  if (fixed.has(path)) return true;
  const posts = getPosts();
  if (posts.some((post) => path === `/blog/${post.slug}`)) return true;
  return posts.some((post) => path === `/blog/category/${post.categorySlug}`);
}
