import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { absoluteUrl, jsonLd } from "@/lib/site";
import type { Post } from "@/lib/blog";

export function Action({
  href,
  children,
  secondary = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  external?: boolean;
}) {
  const className = `action${secondary ? " action-secondary" : ""}`;
  const content = (
    <>
      {children}
      {external ? (
        <ArrowUpRight size={19} aria-hidden="true" />
      ) : (
        <ArrowRight size={19} aria-hidden="true" />
      )}
    </>
  );
  return external ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
export function Photo({
  src = "/images/horse.jpg",
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 760px) 100vw, 50vw",
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`photo ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </div>
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {all.map((item, i) => (
            <li key={item.href}>
              {i === all.length - 1 ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: all.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.label,
              item: absoluteUrl(item.href),
            })),
          }),
        }}
      />
    </>
  );
}
export function PageIntro({
  eyebrow,
  title,
  intro,
  path,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  path: string;
}) {
  return (
    <section className="page-intro wrap">
      <Breadcrumbs items={[{ label: eyebrow, href: path }]} />
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{intro}</p>
    </section>
  );
}
export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="post-list">
      {posts.map((post) => (
        <article className="post-card" key={post.slug}>
          <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
            <Photo
              src={post.image}
              alt=""
              sizes="(max-width: 760px) 100vw, 33vw"
            />
          </Link>
          <p className="eyebrow">
            {post.category} <span>· {post.readingMinutes} min read</span>
          </p>
          <h3>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>
          <p>{post.description}</p>
          <Link className="text-link" href={`/blog/${post.slug}`}>
            Read the guide <ArrowRight size={17} aria-hidden="true" />
            <span className="sr-only">: {post.title}</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
export function FAQ({
  items,
}: {
  items: { question: string; answer: ReactNode }[];
}) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.question}>
          <summary>
            {item.question}
            <span aria-hidden="true">+</span>
          </summary>
          <div>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
