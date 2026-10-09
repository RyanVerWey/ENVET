---
title: Owner review, Vercel launch, and rollback
updated: "2026-10-09T21:11:37Z"
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
