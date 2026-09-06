---
title: M6 minimum-data workflow, funding gated
updated: "2026-09-06T03:03:36Z"
---
# M6: minimum-data workflow, funding gated

This is a proposed operational scope for owner review, not a provisioned service or an approved retention policy. No database, auth account, paid service, email provider, or donor CRM has been created.

## Jobs before infrastructure

1. A veteran or family member asks about a visit.
2. An authorized ENVET coordinator follows up through the visitor's chosen channel.
3. The coordinator records only whether contact is pending, in progress, scheduled, or closed.
4. A separate owner-approved process handles any necessary eligibility check; the website must not store document scans.
5. Owner can publish approved content through a simple editorial workflow. The initial Markdown workflow already works without a CMS.

## Proposed minimum request record

Random identifier, preferred name, one contact method/address, contact permission timestamp, general request type (visit, volunteer, partner), status, created/updated timestamps, assigned coordinator identifier, and optional short non-sensitive coordination note. Avoid date of birth, SSN, DD214, military ID uploads, diagnoses, medical history, crisis narratives, payment-card data, or free-form health questionnaires.

Owner must decide whether notes are needed at all. Do not add fields merely because a database can hold them. No minors' direct accounts or intake without a separately approved guardian and privacy design.

## Security contract to approve after funding

- Owner-controlled vendor account, actual monthly budget, region, backup/restore capability, and export/exit plan.
- Individual coordinator accounts with MFA, least privilege, server-side authorization on every operation, and no public table access.
- Separate preview and production data. Use synthetic records for development; never copy real intake into a preview.
- Encryption in transit/at rest, secret management, non-sensitive audit events, rate limits, validation, and abuse handling.
- Owner-approved retention period, deletion/export procedure, backup retention, incident contact, and access review. No guessed retention policy silently becomes binding.
- Tests for unauthorized access, cross-user reads/writes, input validation, audit events, and deletion. A successful restore exercise before collecting real data.

## Donation and content boundaries

Keep donations on the existing PayPal destination. No custom checkout or donor table unless the owner defines a concrete need. Reconcile through the payment provider instead of duplicating sensitive records. Any future impact reporting should be aggregated and privacy-safe; no diagnosis-level segmentation or identifiable beneficiary stories without consent.

For a CMS, first ask who publishes, how often, and whether Git-based authoring is sufficient. Add draft/review/publish roles and media release tracking only if justified. Keep public article URLs stable.

## Execution order

GitHub #39 maps these jobs; #40 selects funded architecture; #41 implements schema/authorization/retention; #42 adds minimal follow-up; #43 considers owner content management; #44 adds only approved aggregate measurement. #40–#44 remain blocked by funding and owner decisions. This milestone must not delay the database-free website review.
