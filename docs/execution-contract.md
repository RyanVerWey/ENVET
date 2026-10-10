---
title: ENVET owner-review execution contract
updated: "2026-09-06T02:56:59Z"
---
# ENVET owner-review execution contract

Canonical scope: GitHub spec #27, with supporting #9–#44 across the six existing milestones. User authorized milestone implementation on September 5, 2026 and added a first-release blog with SEO, AEO, and GEO. Owner design/content acceptance remains outstanding; implementation is a review candidate, not a claim of approval.

## Scope amendment

M2 includes blog taxonomy, editorial policy, helpful answer-first articles, and factual source references. M4 includes the blog, feeds, generated metadata, structured data, sitemap, and preview index protection. Blog is no longer in the parking lot. Implement a single cohesive review candidate now and collect owner design feedback in M5. This supersedes the earlier planning-only/probe-before-implementation sequencing, not the production approval gate.

## Acceptance

- Next.js App Router and TypeScript application replaces the legacy Vite application.
- CorvaUI mint light/dark themes work on mobile and desktop with persistent preference.
- Home, About, Visit, Donate, Gallery, Contact, Blog, article, category, Privacy, and editorial-policy pages have complete useful content.
- Local imagery comes from the official Facebook source; no Facebook embeds, trackers, or expiring CDN dependencies.
- Phone, email, Facebook, Messenger, WhatsApp, and PayPal point to the verified organization channels.
- Blog supports Markdown content, categories, source attribution, author, dates, drafts excluded, Article/Breadcrumb structured data, RSS, and sitemap.
- Preview is noindex. Production requires an approved canonical origin, explicit launch switch, and cleared content/media gates. No production domain or Vercel project is connected during this iteration.
- No sensitive data collection, database provisioning, payment processing, fabricated clinical claims, or invented impact metrics.
- Lint, typecheck, unit/integration checks, production build, and browser accessibility/responsive checks have recorded results.

## Execution slices

1. Verified organization and media source inventory; content contracts and publication risks.
2. Application foundation, design system and core visitor journeys.
3. Blog content engine and SEO/AEO/GEO technical foundations.
4. Accessibility, responsive behavior, privacy and launch-gate verification.
5. Owner-review artifact, evidence-backed GitHub updates, launch and funded-data handoff.

## Plan CLI limitation

Plan is configured for GitHub specs. `plan spec show` and `plan spec execute` currently attempt nonexistent local `.plan/specs/` files for promoted GitHub-only specs. GitHub #27 remains canonical; this document is an explicitly identified execution mirror, not a competing spec. No duplicate issues or milestones are created to work around the CLI limitation.

## Remaining gates

Owner must accept exact copy, contact details, service/family eligibility, donation destination, all photography rights, and visual design. DB implementation requires funding and approved workflow/security decisions. Never close those approval issues based on automated tests.
