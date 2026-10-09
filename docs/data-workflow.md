---
title: M6 funded community and follow-up workflow
updated: "2026-10-09T21:10:42Z"
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
