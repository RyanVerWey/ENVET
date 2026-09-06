import Link from "next/link";
import { PageIntro, PostList } from "@/components/ui";
import { getPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "The journal",
  "Practical guides for veterans, families, and supporters: planning a visit to ENVET, understanding the program, and supporting the mission.",
  "/blog",
);
export default function Blog() {
  const posts = getPosts();
  const categories = [
    ...new Map(posts.map((p) => [p.categorySlug, p.category])).entries(),
  ];
  return (
    <>
      <PageIntro
        eyebrow="The journal"
        title="A GOOD PLACE TO START."
        intro="Practical answers for veterans, families, and the people who want to help. A little more clarity before your next step."
        path="/blog"
      />
      <section className="wrap blog-index">
        <nav className="category-nav" aria-label="Journal categories">
          <Link href="/blog" aria-current="page">
            All stories
          </Link>
          {categories.map(([slug, name]) => (
            <Link key={slug} href={`/blog/category/${slug}`}>
              {name}
            </Link>
          ))}
        </nav>
        <PostList posts={posts} />
      </section>
    </>
  );
}
