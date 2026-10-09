---
title: Owner review, Vercel launch, and rollback
updated: "2026-10-09T23:38:37Z"
---
## Latest release: independent emergency-contact autofill

October 9, 2026: manual exact-SHA 510d84cb2a924e689c13f6eb272e1ce5ddb272b9 production deployment dpl_BcJWCRBZKwXhX8begtapQbBUi8rH Ready in 23s; https://envet.info assigned. Immutable https://envet-gqjl2fka2-ryanverweys-projects.vercel.app. Both exact-source GitHub checks passed; Node 22.x/Standard Protection unchanged. 72 unit tests and browser field/state regressions passed; full production probe passed. Signer autofill hints grouped, non-signer fields off. Native saved-profile and extension autofill unverified. No live collection, legal, authentication, schema, permission or DNS changes. Prior healthy dpl_3dbwKM4HkejjE57Rv32eYYJoC7QR/source 8041d13d9304e4bd2e20456505e3796a3f36ca62 is rollback candidate; not exercised. Proof: C:/Users/verwe/.codex/artifacts/envet-deployment/envet-autofill-release.png.

## Latest release: full-page copy and accessibility polish

October9,2026: manual exact-SHA8041d13d9304e4bd2e20456505e3796a3f36ca62 production deployment dpl_3dbwKM4HkejjE57Rv32eYYJoC7QR Ready in32s. https://envet.info assigned; immutable https://envet-i3a7fxj4x-ryanverweys-projects.vercel.app. Both GitHub checks success for exact source; Node22.x/Standard Protection unchanged. Expanded production smoke verifies clean public copy, H1/main/skip target, labeled SVG social anchors, natural tab order, 15public+9private routes, no-store/noindex boundaries, canonical/discovery/media/HTTPS redirects. Actual live editorial cleanup, read-only forms and keyboard-focused social footer verified. No collection/auth/encryption/schema/permissions/DNS changes. Rollback candidate is prior healthy dpl_BVWKQe7gj2AVLrLL52naKkCphuf5/source d7e1e0ef532ada1894382fb75b7824b7296c5aa5. Restore it through Vercel's authorized rollback workflow only if needed; rollback not exercised.
# Owner review, Vercel launch, and rollback

## Current state

Public website is live at https://envet.info under explicit October 9 user authorization and media clearance. Current immutable release and verification are recorded below. Historical preparation notes are retained for provenance. `vercel.json` disables Git-triggered deployments using the documented `git.deploymentEnabled: false` setting. [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration).

## Review without a live URL

Run `npm ci`, `npm run build`, and `npm start` locally. Open `http://127.0.0.1:3000`. Bind only to loopback. Walk through home, story, visit, donate, contact, gallery, journal, article/category, and privacy/editorial pages in both themes. Preview noindex remains enabled; the visual owner-review banner was removed by explicit October 9 copy-cleanup request. Share a local walkthrough or screenshots, not a public deployment.

Do not send a message, place a donation, or book a visit as a test. Check destination addresses without submitting transactions. A phone/mail/messaging app may open if an owner intentionally chooses a link.

## Required owner decisions

- Exact organization name, mission, address, phone, current email, and contact preference.
- Eligibility, family participation, appointment arrangements, accessibility, and scope of services. No medical credentials or outcome claims have been invented.
- PayPal recipient and donation documentation process.
- Every photograph and logo: copyright permission, identifiable-person releases, ages, crop acceptance. Record source, reviewer, date, and clearance in the media manifest, not just a global assurance.
- All pages and initial articles, source citations, dates and corrections policy.
- Mobile/desktop design, CorvaUI mint light/dark, navigation, and typography.
- Production domain, Vercel account/project ownership, access controls, hosting/log retention, final privacy text, and monitoring responsibility.

Record explicit approval in GitHub #35, with build commit, date, approver, and any restrictions. #12 and #21 remain review gates until the appropriate owner decisions are actually made. An automated test pass is not approval.

## Launch sequence, only after approval

1. Resolve remaining owner feedback in #33. Update approval text that currently says owner-review version, and review publication dates before release.
2. Clear every deployed media entry (`publicApproved: true` plus reviewer/date evidence) and verify final content.
3. Import the approved GitHub repository into the owner-controlled Vercel account with Next.js preset and Node 22. Keep preview deployments protected; noindex is not a password.
4. Configure the actual domain as `SITE_URL` (HTTPS origin, no subpath). Set `SITE_APPROVED_FOR_LAUNCH=true` and `CONTENT_AND_MEDIA_APPROVED=true` only in the approved production environment. Never store secrets in the repo. Preview environments remain noindex even when flags are inherited.
5. Enable Git deployments only for the approved production branch after the above decisions. Remove or narrowly amend the current disabled setting in a reviewed commit. No automatic URL connection before acceptance.
6. Build and deploy. Check HTTP status, HTTPS/domain redirects, canonical URLs, robots indexability, populated sitemap/feed, valid structured data, social previews, optimized images, keyboard/mobile/theme behavior, and official outbound links.
7. Verify the domain in Search Console and submit the sitemap. Indexing and AI citations are not guaranteed. Avoid multiple indexable preview domains.

## Operations

Owner checks phone/email/social/PayPal links monthly and after any account change. Review source-grounded program content at least quarterly. Review dependencies and CI failures before updates. New content follows `docs/editorial-workflow.md`; no automated Facebook scraper runs.

No marketing analytics is installed. Define a minimal, consent-aware measurement plan before enabling one. Do not log medical descriptions or military records. Hosting operational logging policy requires owner acceptance.

## Rollback

Before launch, retain the approved commit and previous Vercel deployment identifier. For a faulty release, promote the known-good deployment through the owner account, then revert the faulty code in a normal reviewed commit. Re-run critical route, metadata, and link checks. For accidentally exposed material, restrict/unpublish the deployment immediately through the owner account and investigate; merely adding robots.txt does not revoke access or remove indexed copies. Do not erase git history as routine rollback.

## Database gate

M6 begins implementation only after funding and approval of the minimum-data workflow in `docs/data-workflow.md`. The static site does not depend on that work.

## envet.info DNS setup, October 9, 2026

User explicitly authorized DNS configuration through Margaret Lamm's delegated GoDaddy account. Delegated browser access was verified and the editable envet.info zone inspected. This supersedes the earlier restriction on preparing/connecting DNS for this task; it does not supply a hosting destination or approve unrelated content changes.

Current zone before changes:
- A @: GoDaddy Parked, TTL 600 seconds. Public A answers: 15.197.148.33 and 3.33.130.190.
- CNAME www: envet.info., TTL 1 hour.
- NS @: ns07.domaincontrol.com. and ns08.domaincontrol.com., TTL 1 hour.
- CNAME _domainconnect: _domainconnect.gd.domaincontrol.com., TTL 1 hour.
- SOA: primary ns07.domaincontrol.com.
- TXT _dmarc: GoDaddy default quarantine policy; preserve.
- No MX records listed.

Vercel account ryanverweys-projects was accessible. Its project search for envet returned no results; no .vercel/project.json link or Vercel CLI was present in this checkout. The target project was requested from the user. No DNS records have been changed. Obtain the actual project and its domain-specific A/CNAME/verification requirements before replacing the parked A and www CNAME. Retain GoDaddy nameservers and unrelated records. Verify saved records through the UI and authoritative/public DNS, then verify Vercel domain status and HTTPS when a deployment exists.

User also reported an available database; provider/project details have not been verified. Database integration is outside this DNS request.

## Vercel project and DNS completed, October 9, 2026

User explicitly requested creation of a new Vercel project after authorizing DNS setup. Created an empty project, renamed it envet, in ryanverweys-projects (Hobby). Dashboard: https://vercel.com/ryanverweys-projects/envet. Project ID: prj_u8D5ZLTqdeImPMdw8r375HQ57VB6. No Git repository was connected and no production or preview deployment was created. This preserves the owner-review publication gate and existing vercel.json/next.config.ts guards.

Added envet.info to Production and www.envet.info as a 308 permanent redirect to envet.info. Vercel's actual required apex A record was 216.198.79.1. Through Margaret Lamm's delegated GoDaddy zone, replaced A @ Parked with 216.198.79.1, retaining the 600-second TTL. Existing CNAME www -> envet.info. was retained: Vercel explicitly confirmed it is properly configured, so no additional CNAME change was needed. GoDaddy NS, SOA, _domainconnect and _dmarc were untouched; no MX was present.

Verified apex A on both authoritative GoDaddy nameservers and Cloudflare (1.1.1.1); verified www through Google (8.8.8.8), plus authoritative CNAME and preserved nameservers. Both Vercel domain panels now say the domain is properly configured but has no production deployment. Do not represent this as a live website or completed launch: no HTTPS deployment/route smoke tests can pass before an approved deployment exists. SSL serving status was not separately verified.

Next launch work: obtain documented owner/content/media acceptance, connect the approved repository and branch, configure Next.js/Node and approved environment values, deploy, then check HTTPS, canonical/308 redirects, routes, search metadata and rollback. Do not set approval flags merely because DNS is ready. No database changes or purchases occurred.

## Community/data activation gate (October 9, 2026)

Existing Supabase project is verified: rpkxpsnqlhcepyxclgau, us-east-1, Postgres17, healthy. Google auth/community/team implementation is now authorized under M6. Owner selected immediate comments, likes/sharing, private horse/service and inquiry management, anonymous page counts, and inquiry retention until manual deletion. Historical funding-gated/no-database language above describes the earlier static review phase, not a continuing funding blocker.

Before activation, follow docs/google-auth-setup.md; confirm the already-applied migration history, test real-account negative permissions and real Google callback, grant verified UUID staff membership manually, configure server-only keys, verify backups/recovery and expiry, and accept final privacy text. Google client secrets stay in Supabase; no privileged secrets enter public variables. Keep real data out of previews. No public deployment is authorized by database availability; all existing owner/media/content gates still apply. Review dependency advisories before release, not only build success.


Hosted M6 migrations are applied (20261009210844 and 20261009210926); grants/RLS/catalog and anonymous REST negatives pass. No Google provider credentials, initial staff grants, real inquiry collection or deployment were activated. The local increment passed independent review; its live-user, backup, privacy/media and launch gates remain open. See docs/verification.md and docs/google-auth-setup.md.

## Explicit deployment authority, October 9, 2026

User authorized connecting and deploying the current website to envet.info. This supersedes the earlier no-public-launch instruction for that domain. Candidate commit is 0975e6d on codex/envet-owner-preview (PR #45), with both GitHub checks passing. A future .org is reportedly transferring from Wix to GoDaddy; its exact hostname was not supplied. Do not modify or guess it; envet.info remains the requested launch domain.

Deployment authority is not a factual assertion of copyright ownership or pictured-person consent. All four current entries in docs/media-manifest.json still have publicApproved false: logo, horse, farm and connection images. Obtain explicit owner clearance for these entries before changing the media manifest or CONTENT_AND_MEDIA_APPROVED. No flags or hosting settings were changed in response to the authorization alone. Google login, inquiry collection and analytics remain unconfigured/disabled until their credential and real-account/backup activation checks pass; website publication does not require silently activating them.


## Deployment preparation, October 9, 2026 (before clearance)

User again requested deployment/configuration on envet.info. Candidate 064897f25f7e15692522d03cdb9561454a4cc752 on codex/envet-owner-preview/PR45 has both GitHub Review checks successful. Public DNS still resolves apex A to 216.198.79.1 and www CNAME to envet.info; no DNS writes were needed.

Vercel in-app browser access worked after navigation. Connected existing RyanVerWey/ENVET GitHub repository to existing envet project; saved Next.js framework preset and Node 22.x. Production branch tracking now targets codex/envet-owner-preview, not the obsolete main implementation. Existing vercel.json still disables automatic Git deployments. No repository merge or deployment was initiated.

Saved four production-only Config variables: SITE_URL=https://envet.info; SITE_APPROVED_FOR_LAUNCH=true (explicit user authority); CONTENT_AND_MEDIA_APPROVED=false (pending per-asset rights/consent); FORM_COLLECTION_ENABLED=false (separate signed-form activation gate). No secrets, Google provider changes, database migrations, or purchases. Vercel confirmed successful configuration saves. These values require a new deployment before affecting a served artifact.

Remaining publication dependency: explicit clearance for all four existing Facebook-sourced assets (ENVET logo, horse/fence, farm/two people, rider/handler), including depicted-person/guardian consent as applicable, or user selection of a release that excludes uncleared assets. A question was presented; no clearance answer was received during preparation. Do not invent approval evidence or set the media flag true before resolving this. Protected form signing remains disabled independently.

No live website or completed HTTPS/routing verification is claimed. After clearance, update per-asset manifest evidence, deploy the exact reviewed revision, verify READY artifact/source, apex HTTPS, www redirect, public routes/canonical/robots/sitemap/RSS, and private form/team access denial. First deployment has no prior known-good artifact: retain its immutable commit/deployment ID; restrict/unpublish an unsafe first release rather than pretending instant rollback has a predecessor. Future .org remains unspecified and untouched.

## Live production release, October 9, 2026

ENVET is live at https://envet.info. User explicitly authorized deployment and confirmed the existing logo and all three Facebook photos by replying 'use them, its fine' to the rights/pictured-person/guardian consent question. Each approved asset records source, reviewer, date and that evidence in docs/media-manifest.json; the excluded child image remains excluded.

Final deployed source: 1db4ceda7a0cf6e10f45b63ddd08310008ad119c, codex/envet-owner-preview/PR45. Vercel production deployment dpl_FKGUTk6yzwPtR3PNuhZFGUEEXYvQ, https://vercel.com/ryanverweys-projects/envet/FKGUTk6yzwPtR3PNuhZFGUEEXYvQ, is Ready; envet.info is assigned. Immutable deployment hostname: envet-chhejt7xf-ryanverweys-projects.vercel.app. Dashboard runtime is 22.x; framework Next.js; Standard Protection retained. package.json and lockfile pin 22.x because the former >=22 constraint caused Vercel to override the saved dashboard runtime with 24.x. Local runtime is24; hosted CI uses22. Both final GitHub Review checks passed, including browser regression, build/types and owner-preview smoke. 55 local tests and approved production build/lint/types/format pass.

Production configuration: SITE_URL=https://envet.info, SITE_APPROVED_FOR_LAUNCH=true, CONTENT_AND_MEDIA_APPROVED=true, FORM_COLLECTION_ENABLED=false. No Supabase/OAuth/encryption credentials were added; no migration, staff grant, customer submission, analytics activation or purchase. This launch is the public website, not activation of databased signing or Google interactions. Google/team/inquiry and signed-form legal/auth/recovery gates remain open. Forms visibly state signing is disabled. The future .org remains unspecified and untouched.

Read-only live probes (brain session run -- node scripts/check-production.mjs) pass on the final domain:15 public routes200, canonical envet.info URLs and parseable structured data;9 form/account/team routes no-store and noindex with no canonical;www/visit308 to apex/visit;HTTP upgrades to HTTPS;3 legacy redirects308;15 sitemap locations,3 RSS articles;4 approved original images, optimized image and OpenGraph image200;unknown/draft404. Team/account use HTML robots noindex even without database config; forms additionally carry X-Robots-Tag. The probe normalizes root URL slashes because Next renders the root canonical without a trailing slash. No fake metrics or sensitive test submissions.

Live browser evidence: desktop home and 390px home/visit have no horizontal overflow; theme toggles mint-light/mint-dark;mobile menu opens and visit navigation closes it;temporary pre-visit checks update2/10 via pointer and keyboard, then reset0/10. Default viewport and original light preference restored. Form hub shows disabled signing. This is targeted launch QA, not a complete WCAG or cross-browser certification. Proof images at C:/Users/verwe/.codex/artifacts/envet-deployment/envet-live.png and vercel-live-node22.png.

Previous verified healthy deployment: dpl_2UAKZx2zvr32oB13W1u1Rx7YWSFt from c3e5113969448aedd65d0e57baa9105ff7d1bb7b, immutable hostname envet-bfcfukn7i-ryanverweys-projects.vercel.app (Node24). It passed the public/private/redirect/SEO/image live checks before Node22 pinning. Both releases share the same content/schema/collection-disabled configuration; no data migration or irreversible writes occurred. For failed public routes, broken canonical/redirects, or exposed private content, pause releases and use the owner Vercel account to promote this known-good deployment; then rerun production probes. For an exposure, restrict/unpublish first and investigate rather than relying on noindex. Actual rollback was not exercised. Check deployment retention before relying on older releases (project currently shows30-day retention).

Git remains connected but automatic Git deployments are intentionally disabled in vercel.json. Manual release procedure:verify the exact pushed commit's CI checks, choose Create Deployment with its full SHA, confirm Production target, wait for Ready, verify source/runtime/domain, then run the production probe. Do not deploy the obsolete main branch. Real data stays disabled until its separate activation workflow is accepted. Search Console ownership/sitemap submission and long-term monitoring are not completed by this publication; no search ranking/indexing/AI citation guarantee is made.
## Accordion and donation-image production update, October 9, 2026

Owner requested all expandable sections behave as single-open accordions and an image beneath Know where you are giving. Native details name envet-accordion is shared by public FAQs and all document/staff disclosures; browser owns temporary open state without extra client JavaScript. [MDN details name documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details#name). Donation section reuses the explicitly approved farm.jpg, responsive 3:2 framing and descriptive alt text. Corva mint styles and existing motion stay unchanged.

Exact source d7e1e0ef532ada1894382fb75b7824b7296c5aa5, branch codex/envet-owner-preview/PR45. Both GitHub Review checks succeeded: runs38002849648 and38002846312. Local57 tests/10 files, lint, build, typecheck, formatting, team browser regression and 19-route built-preview smoke passed. The first preview invocation used an incorrect environment-variable name and targeted the inactive default port3000; rerun with PREVIEW_ORIGIN at3002 passed. Temporary owned3002 server stopped; user-owned3001 preserved.

Manual exact-SHA Vercel release dpl_BVWKQe7gj2AVLrLL52naKkCphuf5 is Ready with envet.info assigned; immutable hostname envet-6yi69etp5-ryanverweys-projects.vercel.app, runtime22.x and Standard Protection. Source/parameters/immutable deployment ID verified; Vercel rebuilt production from the checked source, not a CI build artifact, and no cryptographic build attestation is claimed. No pipeline/config/DNS/database/credential changes. Site/content/media flags staytrue; FORM_COLLECTION_ENABLED=false; Git auto-deploy stays disabled.

Actual built donation/visit pointer, Enter and Space checks confirm one open section; current section can close to zero, focus stays on summary. Donation reflow/image ratio pass eight nominal320/768/1280/2560 width and mint theme combinations. Live donation pointer/Enter mutual exclusion and image beneath heading verified. Full read-only production probe passes15 public/9 private routes, redirects, canonicals, robots, sitemap/RSS, image optimization/OG and404s. This is targeted browser coverage, not full WCAG/screen-reader/legacy-browser certification. Older browsers without native details name support may retain independent disclosures. Proof: C:/Users/verwe/.codex/artifacts/envet-deployment/envet-donate-accordion.png.

Previous healthy22.x production dpl_FKGUTk6yzwPtR3PNuhZFGUEEXYvQ/source1db4ced remains listed Ready and is rollback candidate. Same schema/config/collection-disabled behavior; no irreversible writes. If public routes/canonicals fail or private content is exposed, stop further releases and promote that known-good deployment through the owner account, rerun production probes, and restrict an exposure before investigation. Actual rollback not exercised; this narrow UI change has no measured SLO or traffic-performance claim. Google/signed-form activation remains separately gated.

