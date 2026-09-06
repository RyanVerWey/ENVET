---
created_at: "2026-09-06T02:22:59Z"
project: ENVET
slug: m4-static-build-and-private-owner-review
status: active
title: M4 Static build and private owner review
type: brainstorm
updated_at: "2026-09-06T02:24:24Z"
---

# Brainstorm: M4 Static build and private owner review

Started: 2026-09-06T02:22:59Z

## Focus Question

Build complete database-free site and place it in a private review state without connecting a production URL.
## Desired Outcome

Complete database-free website ready for private owner evaluation, with no production domain connected.

## Vision

Owner can review every page, interaction, image, claim, and outbound link in a controlled preview before public launch.

## Supporting Material

- Approved M1 content/media inventory
- Approved M2 content architecture
- Approved M3 design prototype

## Constraints

- Next.js App Router, TypeScript, CorvaUI, and Vercel-compatible build.
- No database.
- No public production URL or custom domain.

## Open Questions

- Owner's preferred private review method and reviewer list.

## Ideas

- Implement social, WhatsApp, Messenger, phone, email, and PayPal links.
- Run accessibility, responsive, content, and performance QA.
## Raw Notes

## Refinement

### Problem

Approved plans must become a fast, accessible, reliable site without prematurely publishing it.

### User / Value

Owner reviews production-quality behavior; future visitors get reliable social, contact, and donation paths.

### Appetite

Full static implementation, automated checks, and protected/local review artifact.

### Remaining Open Questions

Preview access method, analytics consent, final form behavior, and browser support floor.

### Candidate Approaches

Static Next.js output with local approved assets and direct official outbound links.

### Decision Snapshot

Implement complete site, test it, and present privately. Keep production alias and domain disconnected.

## Challenge

### Rabbit Holes

Database-backed forms, live Facebook embeds, custom payments, and CMS.

### No-Gos

No public production release, fake controls, placeholder copy, broken links, or unapproved media.

### Assumptions

Official Facebook, WhatsApp, Messenger, phone, email, and PayPal endpoints remain available.

### Likely Overengineering

Server infrastructure for flows that can use safe outbound links during first release.

### Simpler Alternative

Static content, native links, local images, and privacy-minimal analytics hooks.

## Specs

- Create fresh Next.js TypeScript application foundation
- Implement approved pages and content system
- Integrate Facebook, WhatsApp, Messenger, phone, email, and PayPal
- Build approved media pipeline and performance budget
- Complete automated and cross-device quality assurance
- Prepare private owner-review artifact without production URL
