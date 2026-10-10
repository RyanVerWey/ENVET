import { notFound } from "next/navigation";
import { authors } from "@/lib/authors";
import { getPosts } from "@/lib/blog";
import { PageIntro, PostList } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, jsonLd } from "@/lib/site";
type Props = { params: Promise<{ author: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return authors.map((author) => ({ author: author.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { author: slug } = await params;
  const author = authors.find((profile) => profile.slug === slug);
  if (!author) notFound();
  return pageMetadata(author.name, author.bio, `/blog/authors/${slug}`);
}
export default async function AuthorPage({ params }: Props) {
  const { author: slug } = await params;
  const author = authors.find((profile) => profile.slug === slug);
  if (!author) notFound();
  return (
    <>
      <PageIntro
        eyebrow="Behind the journal"
        title={author.name}
        intro={author.role}
        path={`/blog/authors/${slug}`}
      />
      <section className="wrap author-profile">
        <h2>About {author.name}</h2>
        <p className="lead">{author.bio}</p>
        <p>
          General program information, not medical advice. ENVET confirms
          participation and visit arrangements directly.
        </p>
      </section>
      <section className="wrap reading-section">
        <h2>From {author.name}</h2>
        <PostList
          posts={getPosts().filter((post) => post.author === author.name)}
        />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": author.type,
              "@id": absoluteUrl(`/blog/authors/${slug}#author`),
              name: author.name,
              description: author.bio,
              url: absoluteUrl(`/blog/authors/${slug}`),
            },
          }),
        }}
      />
    </>
  );
}
