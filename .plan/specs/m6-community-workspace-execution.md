---
canonical: https://github.com/RyanVerWey/ENVET/issues/41
status: approved
title: M6 community and team workspace execution mirror
updated: "2026-10-09T20:57:14Z"
---
# M6 community and team workspace

Execution mirror for existing GitHub M6 #38, #41–#44. This does not create a new milestone or supersede GitHub ownership. User authorized implementation and settled requirements October 9, 2026. Plan adoption updated #41 then failed on its existing parent relation; do not repeat an uncertain promotion.

## Problem

ENVET needs member participation and private follow-up tools without exposing applicant data or bypassing owner launch approval.

## Goals

Integrate the funded Supabase project into the owner-review site: Google member participation, private ENVET content/follow-up workspace, and anonymous aggregate page counts. Preserve static journal content and owner publication gates.

## Non-Goals

No public deployment, medical intake, payment handling, automated admin promotion, or Markdown blog CMS replacement.

## Constraints

Supabase rpkxpsnqlhcepyxclgau, empty public schema. No production deployment, credential creation, new paid service, medical/military records, payments, real-person seed data, automatic email admin promotion or blog authoring CMS. Google credentials are absent: prepare setup and fail closed, never claim working login without a real callback. Initial admins are two operator-designated accounts, manually bootstrapped to actual Google-confirmed auth UUIDs after login. Inquiries persist until manually deleted. Backup expiry is separate and must be documented.

## Acceptance Criteria

- AC1: Request-scoped Supabase SSR Google PKCE sign-in/callback/sign-out. Unsafe return paths rejected; missing config yields usable unavailable states. Account and team routes noindex; no secrets in public bundles. No authenticated cached responses.
- AC2: Migration includes explicit grants/RLS, constrained member likes/plain-text immediately published comments/reporting, published-only horse/service reads, private staff membership/inquiries/aggregate analytics, durable write rate limits. Anonymous/member cannot read private records, self-promote or edit another user's interaction/content. Bootstrap manual and verifies Google identity, not editable metadata.
- AC3: Existing published journal slugs gain likes, native/copy sharing, immediate comments, own removal and reporting; staff moderation. Error/loading/empty states and accessible controls. No email/avatar leak in public comments. User-authored text remains text.
- AC4: Private staff workspace manages horses/services create/edit/archive, inquiry follow-up status/manual deletion, comment hiding, aggregate page counts (not unique visitors). Public surfaces display only published horse/services. No invented profiles, metrics or service eligibility. Existing static content remains useful before DB/config availability.
- AC5: Inquiry form collects name, email or phone, service interest, optional short non-sensitive note and contact consent. Validation, same-origin protection and durable spam limits; no direct public inquiry reads. Clear interest → human follow-up expectation. No automatic inquiry expiry.
- AC6: Aggregate first-party page counting excludes query strings, identifiers and operational/account routes. Store daily totals by validated public path, not visitor identity. Privacy wording states actual data, immediate comments and manual inquiry retention; unconfigured collection disabled.
- AC7: Preserve owner/content/media release guards, journal SEO/structured data and current design tokens. Corva mint light/dark, useful responsive staff UI, keyboard and reduced-motion behavior. No public deployment.
- AC8: Lint, tests, build, types and formatting pass. Add negative auth/validation/RLS checks and document actual browser state checks. Live Google callback/cloud RLS/real-user workflows remain named activation checks until executed, not inferred from mocks.

## Contract v1

Markdown journal remains canonical; stable published slugs validated on every write. Auth session uses SSR cookies and getUser server-side. Staff authority checks current private membership at every request; service key stays server-only if an operation requires it. Anonymous page counts and interest writes use narrowly scoped RPCs/server routes with minimum data, rate control and fixed search_path. No client chooses author or staff status. Public comments display a non-email label; likes unique per user/post. Member may remove own comment; staff may hide; reports not publicly enumerable.

States: visitor → Google redirect → callback → member; unavailable/error returns clear retry path. Member is not staff unless operator bootstrap grants membership. Team rejects visitor/member/revoked membership. Content draft/published/archived; inquiry new/contacted/booked/closed, delete permanent active-record removal. Comment published/hidden/deleted, immediate published on valid creation. Durable throttling rejects excessive writes with retry feedback, not silent moderation.

## Verification

Use synthetic fixtures only. Test malicious redirects, spoofed roles/authors, text/XSS validation, consent/contact checks, duplicate likes, missing config and access denied. Migration review and negative SQL checks precede real collection. Real Google OAuth requires owner-created Google client and Supabase provider activation. Owner review, final privacy/media acceptance, tested backup recovery, production environment and live auth/browser checks precede production collection.
