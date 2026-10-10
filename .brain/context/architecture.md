---
updated: "2026-10-09T21:11:04Z"
---
## Runtime architecture

Next.js 16.3.8 App Router, React 19, TypeScript. Public editorial pages remain static; /visit is dynamic to read published horse/service content. Account, team, auth and API routes are dynamic, with private/auth responses uncached. src/lib/site.ts centralizes verified organization/contact links and indexability gates. src/lib/blog.ts validates Markdown frontmatter, excludes drafts and future dates, renders sanitized HTML, and drives article/category routes, RSS and sitemap. Images are local files served through next/image, with provenance in docs/media-manifest.json.

CorvaUI 0.2.1 provides mint-light/mint-dark theme tokens and the theme button. Header is the small interactive client boundary; most content is server rendered. Theme storage is local display preference only. The original static review build had no DB or accounts. Funded community/team integration is accepted as a prepared local increment; no live embeds or card-data processing are added.

next.config.ts rejects unapproved production builds and uncleared launch media. vercel.json disables Git deployments. Owner review is local loopback; noindex is not access control. M5 still needs owner approval. M6 funding and core workflow decisions are now supplied; Google OAuth activation, verification and final privacy/security release checks remain gated. See docs/launch-runbook.md and docs/data-workflow.md.

## M6 integration contract (October 9, 2026)

Existing Supabase rpkxpsnqlhcepyxclgau, Postgres 17 in us-east-1. Request-scoped Google PKCE cookie auth; public Markdown journal stays canonical, interactions key to stable published slugs. Separate private UUID staff membership and inquiry/analytics records from public published horse/service/comment content. Explicit RLS/grants, server checks and durable abuse limits. Inquiries retain until manual deletion; no automatic closed-record expiry. Aggregate page counts are not unique visitors. Accepted local implementation and applied hosted migration evidence are recorded in docs/verification.md; real-account activation remains outstanding. See docs/data-workflow.md and docs/google-auth-setup.md.
