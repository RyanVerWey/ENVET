---
updated: "2026-09-06T03:03:35Z"
---
## Runtime architecture

Next.js 16.3 App Router, React 19, TypeScript. Public pages are statically rendered. src/lib/site.ts centralizes verified organization/contact links and indexability gates. src/lib/blog.ts validates Markdown frontmatter, excludes drafts and future dates, renders sanitized HTML, and drives article/category routes, RSS and sitemap. Images are local files served through next/image, with provenance in docs/media-manifest.json.

CorvaUI 0.2.1 provides mint-light/mint-dark theme tokens and the theme button. Header is the small interactive client boundary; most content is server rendered. Theme storage is local display preference only. No DB, intake, accounts, trackers, live embeds, or card-data processing.

next.config.ts rejects unapproved production builds and uncleared launch media. vercel.json disables Git deployments. Owner review is local loopback; noindex is not access control. M5 needs owner approval; M6 needs funding and workflow/security decisions. See docs/launch-runbook.md and docs/data-workflow.md.
