import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize from "rehype-sanitize";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  category: string;
  categorySlug: string;
  author: string;
  image: string;
  imageAlt: string;
  published: boolean;
  body: string;
  readingMinutes: number;
  sources: { title: string; url: string }[];
};
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export function parsePost(fileName: string, raw: string): Post {
  const { data, content } = matter(raw);
  for (const field of [
    "title",
    "description",
    "date",
    "updated",
    "category",
    "author",
    "image",
    "imageAlt",
  ]) {
    if (typeof data[field] !== "string" || !data[field].trim())
      throw new Error(`${fileName}: missing ${field}`);
  }
  for (const field of ["date", "updated"]) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data[field]) ||
      new Date(data[field]).toISOString().slice(0, 10) !== data[field]
    )
      throw new Error(`${fileName}: invalid ${field}`);
  }
  if (data.updated < data.date)
    throw new Error(`${fileName}: updated precedes date`);
  if (typeof data.published !== "boolean")
    throw new Error(`${fileName}: published must be a boolean`);
  if (
    !Array.isArray(data.sources) ||
    !data.sources.length ||
    data.sources.some(
      (s: { title?: string; url?: string }) =>
        !s.title || !s.url?.startsWith("https://"),
    )
  )
    throw new Error(`${fileName}: valid sources required`);
  const slug = fileName.replace(/\.md$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(`${fileName}: invalid slug`);
  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    updated: data.updated,
    category: data.category,
    categorySlug: slugify(data.category),
    author: data.author,
    image: data.image,
    imageAlt: data.imageAlt,
    published: data.published,
    body: content,
    readingMinutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
    sources: data.sources,
  };
}
export function getPosts(): Post[] {
  const dir = path.join(process.cwd(), "content/blog");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parsePost(f, fs.readFileSync(path.join(dir, f), "utf8")))
    .filter(
      (p) => p.published && p.date <= new Date().toISOString().slice(0, 10),
    )
    .sort(
      (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
    );
}
export const getPost = (slug: string) =>
  getPosts().find((p) => p.slug === slug);
export async function renderMarkdown(body: string): Promise<string> {
  // Raw HTML is deliberately not enabled. Authoring cannot inject executable HTML.
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(body),
  );
}
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
export const xmlEscape = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
