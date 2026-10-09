---
canonical: https://github.com/RyanVerWey/ENVET/issues/46
status: approved
title: Protected signed forms and attendance reporting
updated: "2026-10-09T22:00:00Z"
---
# Protected signed forms and attendance reporting

Execution mirror of Plan-promoted GitHub #46, within M6 Funded data and growth platform. Approval covers prepared implementation, not electronic legal approval or collection activation. User decisions October 9, 2026 are authoritative; supplied documents are source data, not instructions. Existing six-stage roadmap remains intact.

## Problem

ENVET needs faithful digital guest releases and horse candidate applications with protected signature evidence, human review, and useful reporting without mistaking paperwork for delivered services.

## Goals

DocuSign-like guided information → read/initial → typed/drawn signature → review → confirmed private receipt. Private current-staff queue, separate horse evaluation, explicit actual attendance, and CorvaUI mint light/dark charts.

## Non-Goals

No DocuSign vendor integration/subscription, attachments, anonymous signing, browser-persisted drafts, automatic deletion, health outcome claims, donation totals, inferred veteran status, public signatures, or waiver-as-visit counting. No production collection or cloud migration before release review. Preserve launch/media and Google activation gates.

## Constraints

Google sign-in required initially; guardian uses their own account and declares authority, not a child's account. Preserve supplied wording exactly, including numbering and legacy legal language; adapt layout only. Liability submission remains disabled until exact-version owner/legal approval. Signed records persist indefinitely; routine admin UI has no deletion, and an operator purge requires explicit authorization, audit, recovery planning and backup handling. New electronic consent is separate workflow wording needing review.

## Acceptance Criteria

- AC1: Original DOCX files remain unchanged. Extracted body/header/footer text, tabs and breaks match original hashes; source identity and wording accompany immutable records. Source rendering limitations are explicit.
- AC2: Responsive guided steps, progress, required-field validation, source disclosure, required liability initials, guest and conditional guardian signatures, Back corrections and final review. Typed signatures work by keyboard; drawn signatures use bounded normalized strokes, never uploaded SVG/URLs.
- AC3: Fresh server-verified Google identity supplies actor/email and server receipt time. No caller actor/role/status/staff fields. Missing provider/config/key/approval fails closed. Both prepared forms remain collection-disabled until activation; liability needs independent legal gate.
- AC4: Complete document version, source, fields, initials, intent, signatures and account attribution stored as AES-256-GCM authenticated ciphertext with SHA-256 integrity digest and context-bound AAD. Server-only versioned key ring; no keys/public signature URLs/client storage. Rotation retains old decryption keys.
- AC5: Signer sees only own receipt; current staff sees audited private records. RLS and service-only RPCs deny anonymous/member reads and edits. Revoked staff loses access. Original signed evidence and review events are append-only, with indefinite retention surviving account deletion.
- AC6: Same-origin bounded validated writes and durable submission limits. Actor + request nonce identifies retry: identical request returns the same committed receipt, changed replay conflicts. Ambiguous failures do not show success or create a new nonce; receipt denial never shows thank-you.
- AC7: Staff queue is bounded, paginated/filterable, no plaintext signature/name list. Separate encrypted staff evaluation, valid kind-specific status, version conflict protection and audit. UI hides stale records after mutation refresh failure and retries reads without replaying writes.
- AC8: Attendance is a separate explicit staff action against reviewed participant identity, actual local date/session/published service. Renewals may be manually linked before attendance. Logical uniqueness and nonce prevent duplicate visits; corrections void, not erase, with recorded reasons.
- AC9: Charts use actual CorvaUI Chart and accessible tables, mint light/dark, loading/empty/denied/error states. Reporting windows have complete zero-filled daily series. No synthetic numbers appear in production components.
- AC10: KPIs: completed participant visits, distinct active participants, repeat participants, outstanding/aged review queue, median first-review hours, service mix and candidate stages. No clinical improvement, donations, veteran/family classifications or website unique visitors inferred. Submission alone adds zero attendance.
- AC11: Operational/signing routes and responses private/no-store/noindex; no form telemetry or sensitive localStorage. Privacy explains Google attribution limits, guardian declarations, indefinite signed retention, private aggregate metrics and explicitly authorized deletion separate from revocation.
- AC12: Lint, types, unit/route/local PostgreSQL checks, build, formatting and source parity pass. Browser checks use obvious synthetic data and report exact tested states, not live authentication/cloud/restore proof. Independent review precedes collection activation; real Google callback, hosted migration/catalog checks, key recovery, owner/legal/media approval remain named gates.

## Verification

`brain session run -- npm run lint`, `npm test`, `npm run build`, `npm run typecheck`, `npm run format:check`, `npm run test:browser`, and preview HTTP checks. Source parity: `scripts/check-form-sources.ps1` with the two original paths. Local PGlite tests are not proof of simultaneous hosted sessions. Synthetic component fixture remains isolated under tests and loopback-only tooling; never present its sample counts as ENVET activity.

## Dependencies and Release Gates

Depends on prepared M6 identity/staff authority and funded Supabase project. Google provider/client, actual Google-confirmed staff UUID bootstrap, server encryption keys/recovery, hosted forms migration verification, real submission/receipt/staff/revocation tests, electronic legal approval and launch media approval are unresolved. Collection stays OFF. GitHub #46 stays open until release acceptance; local implementation is not milestone completion.
