import Link from "next/link";
import { notFound } from "next/navigation";
import { Action, Breadcrumbs, Photo, PostList } from "@/components/ui";
import { formatDate, getPost, getPosts, renderMarkdown } from "@/lib/blog";
import { absoluteUrl, jsonLd, organization } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const base = pageMetadata(post.title, post.description, `/blog/${slug}`);
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author],
      images: [{ url: post.image, alt: post.imageAlt }],
    },
  };
}
export default async function Article({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const html = await renderMarkdown(post.body);
  return (
    <>
      <article>
        <header className="wrap article-header">
          <Breadcrumbs
            items={[
              { label: "The journal", href: "/blog" },
              { label: post.title, href: `/blog/${slug}` },
            ]}
          />
          <Link
            className="eyebrow"
            href={`/blog/category/${post.categorySlug}`}
          >
            {post.category}
          </Link>
          <h1>{post.title}</h1>
          <p className="lead">{post.description}</p>
          <div className="article-meta">
            <Link href="/editorial-policy">By {post.author}</Link>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>{post.readingMinutes} min read</span>
            {post.updated !== post.date && (
              <span>
                Updated{" "}
                <time dateTime={post.updated}>{formatDate(post.updated)}</time>
              </span>
            )}
          </div>
          <Photo
            className="article-cover"
            src={post.image}
            alt={post.imageAlt}
            priority
            sizes="100vw"
          />
        </header>
        <div className="wrap article-layout">
          <aside className="article-aside">
            <p className="eyebrow">YOUR NEXT STEP</p>
            <h2>
              Ask us
              <br />
              anything.
            </h2>
            <p>
              Questions about ENVET? Reach a person who can explain the program
              and current arrangements.
            </p>
            <Action href="/contact">Contact the team</Action>
            <hr />
            <p>
              General program information, not medical advice. Current visit
              details are confirmed directly by ENVET.
            </p>
            <Link className="text-link" href="/editorial-policy">
              How we write our guides
            </Link>
          </aside>
          <div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
            <section className="source-list">
              <h2>Sources & further reading</h2>
              <ul>
                {post.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url}>{source.title}</a>
                  </li>
                ))}
              </ul>
              <p className="small">
                Source details checked September 6, 2026. For changes or
                corrections, contact{" "}
                <a href={`mailto:${organization.email}`}>
                  {organization.email}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </article>
      <section className="wrap reading-section">
        <h2>Keep exploring</h2>
        <PostList
          posts={getPosts()
            .filter((p) => p.slug !== slug)
            .slice(0, 3)}
        />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": absoluteUrl(`/blog/${slug}#article`),
            headline: post.title,
            description: post.description,
            image: absoluteUrl(post.image),
            datePublished: `${post.date}T12:00:00Z`,
            dateModified: `${post.updated}T12:00:00Z`,
            author: {
              "@type": "Organization",
              name: post.author,
              url: absoluteUrl("/editorial-policy"),
            },
            publisher: { "@id": absoluteUrl("/#organization") },
            mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
            inLanguage: "en-US",
            articleSection: post.category,
            citation: post.sources.map((s) => s.url),
          }),
        }}
      />
    </>
  );
}
