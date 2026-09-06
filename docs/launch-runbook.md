---
title: Owner review, Vercel launch, and rollback
updated: "2026-09-06T03:03:36Z"
---
# Owner review, Vercel launch, and rollback

## Current state

Local review only. No Vercel project or domain has been connected. `vercel.json` disables Git-triggered deployments using the documented `git.deploymentEnabled: false` setting. [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration).

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
