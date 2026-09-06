# ENVET

Eagle’s Nest Veterans’ Equine Therapy. A database-free, owner-review website for veterans, families, and supporters, built with Next.js App Router, TypeScript, and CorvaUI mint light/dark.

## Review locally

Node.js 22 or newer is required.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. The server binds to loopback only. No secrets, database, Vercel project, or public domain are required.

## Verify

```sh
npm run lint
npm test
npm run build
npm run typecheck
```

With the development or production server running, `npm run test:preview` checks the complete local site. For production-style local review: stop the development server, run `npm run build`, then `npm start`. Browser audit results and limitations are in [verification](docs/verification.md).

## Content and operations

- Organization/contact truth: `src/lib/site.ts`, verified against the official Facebook page.
- Blog: `content/blog/*.md`; see [editorial workflow](docs/editorial-workflow.md).
- Media provenance and approval: `docs/media-manifest.json`.
- Product/design rationale: `PRODUCT.md` and `DESIGN.md`.
- Launch, owner review, and rollback: [launch runbook](docs/launch-runbook.md).
- Funded next phase: [data workflow](docs/data-workflow.md).
- Planning: six GitHub milestones, with GitHub #27 as the current review-build contract. `.plan/` retains source brainstorms. Brain keeps durable repository context.

## Launch is deliberately blocked

`vercel.json` disables Git-triggered deployments. Local previews are noindex, emit no public sitemap URLs or RSS items, and have no canonical tag. A Vercel production build fails without the launch environment flags and an approved HTTPS origin. Every deployed image must also have owner clearance recorded in the media manifest. These are safeguards, not a substitute for explicit owner acceptance.

No production URL has been connected. Database-backed intake, accounts, CRM, and custom payments are not part of this release. Photos are official-page review candidates; rights/consent still need owner clearance for the public website. See [media manifest](docs/media-manifest.json) rather than inferring licensing from public availability.

The legacy Vite app, placeholder UI, and unattended Facebook-image scraper are replaced on this branch. Git history and the repository’s existing GPL-3.0 license are preserved. Third-party media and marks retain their respective rights; the code license does not grant rights to ENVET photography or branding.
