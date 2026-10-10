---
title: M6 funded community and follow-up workflow
updated: "2026-10-10T03:43:55Z"
---
# M6: funded community and follow-up workflow

October 9, 2026 owner decisions replace the former funding gate and proposed retention policy. Existing Supabase project rpkxpsnqlhcepyxclgau is healthy in us-east-1. Google OAuth credentials do not yet exist; provider activation and real account tests remain outstanding. Implementation is a private review increment, not public collection or deployment approval.

## Approved jobs

Visitors read/share existing journal posts. Google members like and comment; valid comments publish immediately, with owner removal, reporting and staff moderation. Staff privately manage horse profiles, services, inquiries and aggregate traffic. Blog article authoring stays in the existing Markdown workflow for now.

A visitor submits interest, ENVET follows up by phone/contact or books a visit. Inquiry fields: name, email or phone, service of interest, optional short non-sensitive note, contact consent and consent timestamp. Status tracks new, contacted, booked or closed. Records persist until authorized staff manually deletes them: NO automatic 90-day cleanup and NO expiry on closure. Backup/log expiry is a separate provider policy to verify before collection.

No medical/military records, diagnoses, DD214/ID uploads, SSN, payment cards, crisis intake or detailed health questionnaires. Explain that the form expresses interest, not a confirmed booking or emergency support. No minor direct-account/intake design added.

## Access and privacy

Public visitors see published content and visible comments only. Members act only as themselves. Staff authority uses private UUID membership, checked server-side and at the database boundary, never editable profile metadata. Initial staff grants follow actual Google-confirmed login and operator verification. Account/team surfaces are noindex, but robots directives are not access control.

Private inquiries and reports are not publicly enumerable. Aggregate daily public-page counts are page views, not unique visitors; no visitor identifiers, emails, query strings or operational routes. No fabricated metrics. Rate controls collect the minimum short-lived abuse data; document any hashed network signal separately from analytics.

Use request-scoped auth, no shared authenticated caches, explicit grants/RLS, server input validation, same-origin checks, durable rate limits and server-only privileged credentials if strictly needed. Test visitor/member/other-member/staff/revoked-staff negatives. Use synthetic development records; do not copy real inquiries into previews.

## Remaining activation gates

Google owner setup (docs/google-auth-setup.md), real-account hosted negative access tests, staff bootstrap, final privacy/content/media acceptance, tested backup recovery, production secrets and authorized launch. Current implementation and evidence live in the existing M6 issues #40–#44 and the explicit execution mirror .plan/specs/m6-community-workspace-execution.md. Keep six milestones; do not create duplicates to work around Plan adoption/parent-link limitations.

Donations stay on verified PayPal; no donor CRM, payment processing, scheduling integration or automatic Facebook ingestion added.


Hosted schema and foreign-key indexes are applied; local migration versions match remote history. RLS/grants/catalog and anonymous PostgREST checks pass. No staff users, inquiry records or published seed profiles were created. See docs/verification.md for exact evidence and remaining real-account/backup/owner gates.


## Animal roster management (October 9, 2026 additive owner scope)

Live auth/signing supersedes the historical setup gates above. Animal types are exactly horse/Horse Heroes, dog/Dogs and cat/Cats. /staff reads published, nontrashed public.animals; /visit uses published horse animals rather than the legacy horse editor. Existing legacy horses are preserved as unpublished animal drafts, not silently published. Services retain their separate editor.

/team/animals requires current verified private staff membership. Bios include portrait/accessible description, nickname, playful real-world job, introduction, story, personality, favorites and approved meeting tips. Create/edit/state changes use expected versions; stale edits fail409. Deletion moves a profile to recoverable trash, hides its card and restore returns draft. Publishing requires actual portrait, story and visit tips. No fabricated animals, treatment guarantees or availability promises. Staff actions are audited.

Uploads require photo rights/identifiable-person consent confirmation, bounded JPEG/PNG/WebP, actual decoding,1600px maximum WebP and stripped camera/location metadata. Private bucket animal-portraits; private manifest records verified actor and permission-confirmation time. Server image route authorizes current published use or fresh manager and returns no-store bytes; no signed public URL or Next optimizer cache. Unpublishing/trashing blocks future unauthenticated requests, but cannot revoke previously downloaded public copies. Removing an attachment does not permanently delete media; failed/discarded uploads can leave private orphans. No automated purge. Future cleanup requires reference checks and authorized recoverability.

Management link is only displayed after fresh staff_access using verified account UUID, never user-editable role/email metadata. Initial designated second account still must log in through Google before operator UUID bootstrap. No new grants occurred in this increment.

Migration20261010034008 matches hosted history. Hosted rollback verification leaves no synthetic records; isolated API/database/browser tests cover authorization/conflicts/privacy and UX. Owner must add first real bios/portraits and confirm live publication. Security advisor's existing password-protection warning remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Intentional private no-policy RLS denies nonservice access; do not weaken it to silence INFO notices.
