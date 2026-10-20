import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/blog";
import { createSocialImage, socialPhotograph } from "@/lib/social-image";
export const alt =
  "An ENVET journal guide with its title, author and a photograph from Eagle’s Nest.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamicParams = false;
export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return createSocialImage({
    title: post.title,
    label: `The ENVET journal · ${post.category}`,
    detail: `By ${post.author} · ${post.readingMinutes} min read`,
    photograph: socialPhotograph(post.image),
  });
}
