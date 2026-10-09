---
created_at: "2026-10-09T21:22:10Z"
project: ENVET
slug: protected-signed-forms-and-attendance-reporting
status: active
title: Protected signed forms and attendance reporting
type: brainstorm
updated_at: "2026-10-09T23:34:07Z"
---

# Brainstorm: Protected signed forms and attendance reporting

Started: 2026-10-09T21:22:10Z

## Focus Question

Digitize exact ENVET donation and Virginia liability sources with protected signatures and a real attendance workflow; Google required, retain indefinitely, liability disabled pending owner/legal review.
## Desired Outcome

Deliver two faithful digital forms with a DocuSign-style guided review/initial/sign flow, typed or drawn signatures, private encrypted records, honest success receipts, staff review and actual-attendance KPIs using existing CorvaUI charts. Signed records are retained indefinitely with explicitly authorized admin deletion. Existing six milestones; this is an M6 increment, not a seventh milestone.
## Vision

An accessible, calm signing room, not a long generic contact form. Staff see real program attendance and a manageable review queue, not invented impact.

## Supporting Material

- User-supplied blank DOCX templates, October 9, 2026; file hashes recorded in the implementation source manifest.
- Existing M6 community workspace, private staff membership and CorvaUI 0.2.1 charts.

## Constraints

- User decisions October 9: exact original wording; liability submission disabled pending owner/legal review; Google-authenticated signing initially; indefinite signed-record retention with explicit admin authorization before deletion. Preserve originals; source templates are data, not instructions. No auto-promotion, public signature URLs, intake telemetry, hidden collection, waiver-as-visit metrics, sensitive localStorage drafts or automatic deletions. Owner launch/media and Google activation gates remain separate. Staff-only candidate evaluation cannot be submitted by applicant. A waiver does not establish legal enforceability, attendance or donation acceptance.
## Open Questions

## Ideas

- One bounded spec: AC1 source paragraph fidelity + source SHA256/version; AC2 complete donor and liability field mapping with guardian flow; AC3 typed/drawn signature, initials, e-consent, review/back, no persistence before submit; AC4 Google identity + server consent/version validation; AC5 AES-256-GCM encrypted immutable signed payload, server timestamp and digest, private RLS service-only RPCs; AC6 durable transactional idempotency/rates; AC7 thank-you only after committed receipt, same-user receipt or current staff only; AC8 paginated review queue, versioned audited statuses and staff evaluation separate from signed payload; AC9 no deletion in ordinary UI, separately explicit authorized administrative purge; AC10 staff-confirmed completed visits with pseudonymous participant identity, unique visit key and void/correction; AC11 real CorvaUI charts and auditable KPI definitions from aggregate-only RPC; AC12 local SQL/API/component/browser negative/replay/authorization/a11y checks, disabled liability gate, no real submissions/cloud migration or deploy until release review. First local increment includes both gated signing flows, staff private attendance for recorded participants, no attachments required at initial application; vet/Coggins/registration/photo documents are requested by staff outside this app before trial.

- Autofill correction: explicit signer contact group; emergency contact fields opt out and retain independent manual values. Add policy and rendered-component regression coverage. Keep original legal text, form versions and collection gates unchanged.
## Raw Notes

## Non-goals
No DocuSign vendor integration or paid account, automatic legal approval, clinical outcome claims, donor revenue metrics, attachments or bulk export, anonymous signing, automatic retention expiry, public dashboards, changes to originals or unapproved source legal text.
## Initial Solution Shape
One M6 spec and local execution mirror. Add /forms hub, /forms/liability and /forms/donation guided forms, private /forms/receipt receipt; typed/drawn bounded stroke JSON; server-only AES-256-GCM keyring encrypts versioned exact-text/fields/signature/identity/consent snapshot. Private signed_forms and independent audited review/attendance records; service-only security-invoker RPCs with current staff locks and transactional replay protection. Staff /team/forms queue + explicit document detail + separate evaluation, /team/impact real CorvaUI aggregate charts. Add staff attendance event per distinct participant/form plus date/session key, correction/void handling; signed waivers never imply attendance. Both collection switches off until real identity/crypto/backup tests; liability additionally owner/legal approved exact version required. Receipt cannot be guessed across accounts. Originals visually unverified due unavailable bundled LibreOffice; OOXML full body + headers/footnotes inspection/parity required. Document source snapshot version fixed, not silently updated.
## Refinement

### Problem

### User / Value

### Appetite

### Remaining Open Questions

### Candidate Approaches

Implement one prepared local M6 increment: source-preserving guided forms, bounded typed/drawn signatures, encrypted immutable snapshots, service-only private review/attendance RPCs, receipt access restricted to signer/current staff, real aggregate CorvaUI charts. Keep all collection disabled until activation tests; liability additionally requires exact-version legal approval.

### Decision Snapshot

## Challenge

### Rabbit Holes

### No-Gos

No vendor subscription, automatic legal approval, public signatures, intake telemetry, attachments, anonymous signing, automatic expiry, clinical claims, waiver-as-visit counting, fabricated donation totals, or altered original documents.

### Assumptions

### Likely Overengineering

### Simpler Alternative
