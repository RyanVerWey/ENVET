---
created_at: "2026-10-09T20:18:04Z"
project: ENVET
slug: m6-supabase-community-and-team-workspace
status: active
title: M6 Funded data and growth platform
type: brainstorm
updated_at: "2026-10-10T00:31:39Z"
---

# Brainstorm: M6 Funded data and growth platform

Started: 2026-10-09T20:18:04Z

## Focus Question

How can visitors participate in ENVET's journal while authorized staff manage horses, services, and follow-up without exposing private inquiries?

## Desired Outcome

Google-authenticated blog participation and a private, accessible ENVET team workspace backed by the existing funded Supabase project.

## Vision

Visitors can like, share, and comment immediately. Two named initial admins manage horse profiles, service availability, inquiries that lead to bookings/phone calls, and aggregate web traffic in CorvaUI mint light/dark. Public content remains separate from operational data.

## Supporting Material

- User decisions October 9, 2026: existing Supabase, two admin emails, immediate comments, likes/sharing, manual inquiry deletion.
- Supabase project rpkxpsnqlhcepyxclgau, healthy Postgres 17 in us-east-1; public schema and migrations empty.
- GitHub M6 issues #39–#44; docs/data-workflow.md and docs/launch-runbook.md.

## Constraints

- No public deployment before owner/content/media acceptance. Infrastructure and development are authorized now.
- Google Cloud/OAuth client is absent; prepare exact setup, but never fabricate credentials or claim working Google login before a real callback test.
- Only the two owner-designated initial Google identities may be bootstrapped as admins. Google-verified identity, not editable profile metadata, determines eligibility for privileged bootstrap. Keep account addresses out of public planning artifacts.
- Inquiry data: name, email or phone, service interest, optional short non-sensitive note, contact consent; retained until manual deletion per explicit user choice.
- Role checks at server and database boundaries; RLS for all exposed tables, explicit grants, no secret/service-role key in client bundles.

## Open Questions

- External dependency: Google OAuth client ID/secret and consent setup still needed.
- Any further staff members, detailed booking/calendar integration, analytics identity tracking, and blog CMS authoring are deferred, not silently added.

## Ideas

- User authorized Supabase project rpkxpsnqlhcepyxclgau, Google OAuth, blog likes/sharing/immediate comments, and private team workspace. Two initial admin identities provided privately. Team manages horse profiles and services; views aggregate web traffic and basic interest inquiries that lead to phone contact/booking. Inquiry fields: name, email/phone, service of interest, optional short non-sensitive note, contact consent. Retain until manually deleted, per explicit user choice. Google Cloud/OAuth client does not exist: prepare configuration, no invented credentials. Preserve owner-review publication gate. Access: public sees published horses/services/comments only; members may like/comment as self; admins may manage content/moderate/view inquiries. No self-assigned admin metadata, medical/military documents, payments, real participant seed data, or public launch. Exact API/RLS tests required, no claims of live auth until real Google callback is exercised.

- Owner now explicitly requests Google auth activation, with ENVET Google project under Ryan's already-signed-in account. Sequence: Google app/client basic identity scopes; Supabase Google provider and exact envet.info callback allowlist; website URL/publishable key/auth origin; redeploy and real owner callback; verify Google-confirmed UUIDs before designated admin grants. Do not enable signed-form collection, grant from email-only claims, create paid services, or paste secrets in chat. Credential creation/security changes require action-time confirmation or owner handoff.
## Raw Notes

## Refinement

### Problem

The static review website cannot persist blog participation or give ENVET staff a controlled content/follow-up workspace.

### User / Value

Readers participate in the journal; staff update horse and service information and follow up on expressed interest from one private workspace.

### Appetite

One secure foundation and one integrated local-review increment. Google provider activation and real end-to-end account verification are named external dependencies.

### Remaining Open Questions

Google credentials are missing. No production publishing authorization. These hold external activation, not independent implementation.

### Candidate Approaches

Next.js server-rendered public content plus request-scoped Supabase SSR auth. Least-privilege RLS, private staff membership and operational records, no client-side privileged key. Keep current sourced Markdown journal URLs/content; add participation by stable post slug. Use current CorvaUI typography/tokens for a restrained, responsive staff workspace.

### Decision Snapshot

User selected Google OAuth, immediate comments, likes/sharing, two initial admins, minimal interest forms and manual retention. Preserve publication guards. Anonymous visitors may read/share; Google members act only as themselves; only authorized team members manage operational data. Prove negative access and validation paths before external activation.

## Acceptance Criteria

- AC1: Request-scoped Google PKCE sign-in/callback/sign-out reject unsafe redirects and missing configuration; no session caching or leaked privileged keys.
- AC2: Explicit database grants/RLS prevent visitors or ordinary members from reading inquiries, editing staff roles, changing others' interactions or changing horses/services.
- AC3: Published blog slugs support one like per account, plain-text immediate comments, owner removal, staff hiding, reports and durable abuse limits.
- AC4: Private staff workspace supports horse/service create/edit/archive and published-only public views; unpublished content stays private.
- AC5: Basic interest forms validate contact consent/data, resist spam, and appear only in authorized staff follow-up views with manual deletion.
- AC6: Staff sees aggregate anonymous page counts, never inquiry content, emails, auth tokens, or query strings in analytics.
- AC7: Existing public content/search metadata and owner-release gates remain intact. New account/team routes are noindex and authorization-protected where required.
- AC8: Local build/lint/types/tests, negative RLS checks, relevant responsive/keyboard/error-state browser checks documented. Google live callback remains explicitly unverified until owner supplies credentials.

## Challenge

### Rabbit Holes

### No-Gos

No medical/military documents, private inquiry exposure, fabricated metrics, self-appointed staff, payments, account/password changes, paid infrastructure creation, or launch-gate bypass. No raw HTML in comments and no remote code/content injection.

### Assumptions

### Likely Overengineering

### Simpler Alternative

## Specs

- Implement schema, migrations, authorization, and retention
- Add owner-managed content workflow where justified
