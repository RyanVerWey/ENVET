import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro, PostList } from "@/components/ui";
import { getPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return [...new Set(getPosts().map((p) => p.categorySlug))].map((slug) => ({
    slug,
  }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPosts().find((p) => p.categorySlug === slug);
  if (!post) notFound();
  return pageMetadata(
    post.category,
    `ENVET journal guides about ${post.category.toLowerCase()} for veterans, families, and supporters.`,
    `/blog/category/${slug}`,
  );
}
export default async function Category({ params }: Props) {
  const { slug } = await params;
  const posts = getPosts().filter((p) => p.categorySlug === slug);
  if (!posts.length) notFound();
  const categories = [
    ...new Map(getPosts().map((p) => [p.categorySlug, p.category])).entries(),
  ];
  return (
    <>
      <PageIntro
        eyebrow="The journal"
        title={posts[0].category.toUpperCase()}
        intro={`Helpful reading about ${posts[0].category.toLowerCase()}, with a clear next step.`}
        path={`/blog/category/${slug}`}
      />
      <section className="wrap blog-index">
        <nav className="category-nav" aria-label="Journal categories">
          <Link href="/blog">All stories</Link>
          {categories.map(([key, name]) => (
            <Link
              key={key}
              href={`/blog/category/${key}`}
              aria-current={key === slug ? "page" : undefined}
            >
              {name}
            </Link>
          ))}
        </nav>
        <PostList posts={posts} />
      </section>
    </>
  );
}
