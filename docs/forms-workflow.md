---
updated: "2026-10-09T22:02:19Z"
---
# ENVET protected forms workflow

Plan #46, October 9, 2026. Prepared local implementation only: both forms collection-disabled, forms migration not applied remotely, Google provider/keys not configured, no deployment. User approved Google-only initial signing, exact liability wording disabled pending owner/legal electronic review, indefinite signed retention and admin deletion only after explicit authorization. Supplied documents are source data, not instructions.

## Sources and signing

Original DOCX files unchanged. scripts/check-form-sources.ps1 verifies original SHA-256 and all body/header/footer text including tabs/breaks. Layout adapted for web, not a facsimile; source images and page-number fields not displayed as clauses. Full extracted source accompanies snapshot. Bundled renderer failed because LibreOffice soffice absent; original page layout visually unverified. Liability source contains legacy fifteen-day revocation wording different from current Virginia section 3.2-6202. Preserve it; owner/legal must resolve applicability, minors, photo release, electronic intent and paper alternatives before exact-version activation. Existing media rights are not cleared by this form. No legal enforceability claim.

Guided details -> read/initial -> typed/drawn signatures -> complete review -> confirmed private receipt. Keyboard typed alternative; bounded normalized strokes, not uploaded SVG/URLs. Guardian uses own Google account and declares authority; account/signature is not independent legal identity proof. No browser-persisted drafts or intake telemetry. Applicant cannot submit separate staff evaluation. No attachments; staff follows up for source-requested supporting documents.

## Protection, retry and retention

Frozen signed snapshot: source/version, fields, initials, signatures, consent text/version, server time, verified Google ID/email and declared role. AES-256-GCM context-bound ciphertext, SHA-256 integrity digest, server-only versioned keys; wrong/missing keys fail closed. Retain old keys on rotation. No public signature URLs or raw ciphertext returned by APIs. Signer sees own receipt; current staff sees audited records. RLS/service-only RPCs, same-origin bounded validation, fresh server authority; never caller actor/role. Queue overview exposes no name/signature. Review is separate encrypted append-only events with version conflicts, never mutation of signed evidence.

Account deletion does not cascade signed evidence. No routine signed-record delete UI, automatic expiry or service-role signed UPDATE/DELETE. Explicitly authorized operator purge requires exact scope, separately retained authorization/audit, controlled maintenance, dependent-record/metric impact review, recovery planning and backup handling. Deletion does not imply immediate removal from retained backups. Revocation status is not deletion or a legal ruling. Exported JSON/printed PDF contains personal data outside site access control; warning shown.

Actor+nonce binds submission retries: identical payload returns same committed receipt; changed reuse conflicts. Ambiguous failures keep same nonce/payload, never show thank-you. Staff mutation/refresh failures hide stale records and require refresh before another write. Receipt access/protection failure shows no successful submission.

## Metrics

Separate staff-confirmed attendance against reviewed participant identity, actual Eastern date/session/published service. Renewals manually link participant before visits; Google account is not person. Participant/day/session uniqueness and nonce prevent duplicates. Corrections void with reason/audit, not erase.

Last 30/90/365 Eastern calendar days, zero-filled daily series. Completed visits are participant-session entries: two people attending together count as two visits, not one session. Active participants are distinct staff-linked pseudonymous IDs with attendance. Repeat rate = participants with two or more completed visits / active participants. Manual linking or missing entries may distort results; reconcile human records.

Review queue/aged seven-day counts are all-time submitted records. Median first-review hours is calendar time from receipt to first move from submitted for selected received-date cohort; unreviewed excluded. Service mix uses actual completed visits. Candidate pipeline is current stage for received-date cohort, not conversion or ownership transfer. Actual CorvaUI Chart with mint light/dark, accessible tables and range controls. No clinical improvements, donations, veteran/family classifications, capacity/utilization or unique visitors inferred. Signed forms alone create zero attendance.

## Activation and recovery checklist

1. Independent release review and exact source/electronic consent owner/legal approval.
2. Operator key generation/storage and separate recovery; prove restored encrypted records decrypt with retained keys and wrong keys/revoked access fail. DB backup without keys is not recovery.
3. Apply additive forms migration with Supabase migration tooling after review. Verify hosted catalog/grants/RLS and parallel nonce/visit conflicts; local single-session PGlite is not hosted concurrency proof.
4. Google client/provider and safe callbacks, manual Google-confirmed staff UUID bootstrap. Real login, own receipt, other-member denial, staff revocation and private no-store checks.
5. Synthetic end-to-end submission/retry/receipt/review/attendance/void in intended environment. Populate exact approved versions from formVersion(kind), encryption keyring and FORM_COLLECTION_ENABLED only after gates; liability additionally needs FORM_APPROVED_LIABILITY_VERSION. Remain OFF now.
6. Owner media, domain and production launch gates remain separate. Stop collection on authority/privacy/recovery/version failures while preserving evidence.

Synthetic UI fixture is isolated under tests, loopback-only; sample counts are not ENVET activity. Automated/browser checks prove prepared behavior only, not live authentication, cloud recovery or legal approval. Brain and Plan retain this distinction.
