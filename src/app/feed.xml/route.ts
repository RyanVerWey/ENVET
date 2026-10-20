import { getPosts, xmlEscape as escape } from "@/lib/blog";
import { absoluteUrl, launchEnabled, organization } from "@/lib/site";
export const dynamic = "force-static";
export function GET() {
  const items = launchEnabled
    ? getPosts()
        .map(
          (p) =>
            `<item><title>${escape(p.title)}</title><link>${escape(absoluteUrl(`/blog/${p.slug}`))}</link><guid isPermaLink="true">${escape(absoluteUrl(`/blog/${p.slug}`))}</guid><description>${escape(p.description)}</description><pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate><category>${escape(p.category)}</category></item>`,
        )
        .join("")
    : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>ENVET Journal</title><link>${escape(absoluteUrl("/blog"))}</link><description>${escape(organization.description)}</description><language>en-us</language>${items}</channel></rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
