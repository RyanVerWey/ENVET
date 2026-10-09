---
title: Owner review, Vercel launch, and rollback
updated: "2026-10-09T22:31:48Z"
---
# Owner review, Vercel launch, and rollback

## Current state

Owner review remains local; no website deployment is live. Vercel project envet and envet.info/www.envet.info DNS are now prepared under explicit October 9 user authorization. `vercel.json` disables Git-triggered deployments using the documented `git.deploymentEnabled: false` setting. [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration).

## Review without a live URL

Run `npm ci`, `npm run build`, and `npm start` locally. Open `http://127.0.0.1:3000`. Bind only to loopback. Walk through home, story, visit, donate, contact, gallery, journal, article/category, and privacy/editorial pages in both themes. The owner-review banner and noindex remain enabled. Share a local walkthrough or screenshots, not a public deployment.

Do not send a message, place a donation, or book a visit as a test. Check destination addresses without submitting transactions. A phone/mail/messaging app may open if an owner intentionally chooses a link.

## Required owner decisions

- Exact organization name, mission, address, phone, current email, and contact preference.
- Eligibility, family participation, appointment arrangements, accessibility, and scope of services. No medical credentials or outcome claims have been invented.
- PayPal recipient and donation documentation process.
- Every photograph and logo: copyright permission, identifiable-person releases, ages, crop acceptance. Record source, reviewer, date, and clearance in the media manifest, not just a global assurance.
- All pages and initial articles, including editorial AI-assistance disclosure.
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


## Deployment preparation, October 9, 2026 (latest)

User again requested deployment/configuration on envet.info. Candidate 064897f25f7e15692522d03cdb9561454a4cc752 on codex/envet-owner-preview/PR45 has both GitHub Review checks successful. Public DNS still resolves apex A to 216.198.79.1 and www CNAME to envet.info; no DNS writes were needed.

Vercel in-app browser access worked after navigation. Connected existing RyanVerWey/ENVET GitHub repository to existing envet project; saved Next.js framework preset and Node 22.x. Production branch tracking now targets codex/envet-owner-preview, not the obsolete main implementation. Existing vercel.json still disables automatic Git deployments. No repository merge or deployment was initiated.

Saved four production-only Config variables: SITE_URL=https://envet.info; SITE_APPROVED_FOR_LAUNCH=true (explicit user authority); CONTENT_AND_MEDIA_APPROVED=false (pending per-asset rights/consent); FORM_COLLECTION_ENABLED=false (separate signed-form activation gate). No secrets, Google provider changes, database migrations, or purchases. Vercel confirmed successful configuration saves. These values require a new deployment before affecting a served artifact.

Remaining publication dependency: explicit clearance for all four existing Facebook-sourced assets (ENVET logo, horse/fence, farm/two people, rider/handler), including depicted-person/guardian consent as applicable, or user selection of a release that excludes uncleared assets. A question was presented; no clearance answer was received during preparation. Do not invent approval evidence or set the media flag true before resolving this. Protected form signing remains disabled independently.

No live website or completed HTTPS/routing verification is claimed. After clearance, update per-asset manifest evidence, deploy the exact reviewed revision, verify READY artifact/source, apex HTTPS, www redirect, public routes/canonical/robots/sitemap/RSS, and private form/team access denial. First deployment has no prior known-good artifact: retain its immutable commit/deployment ID; restrict/unpublish an unsafe first release rather than pretending instant rollback has a predecessor. Future .org remains unspecified and untouched.
