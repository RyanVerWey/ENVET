---
title: ENVET Google sign-in activation
updated: "2026-10-10T00:59:49Z"
---
## Chrome activation and verified owner login (October 9, 2026)

Owner opened working Chrome tabs and completed Google consent/client creation and direct Supabase credential entry. Verified hosted Auth external.google=true, then verified actual production Google login: ENVET account renders You’re signed in and Supabase records one owner-designated user with confirmed email, Google identity, matching provider email and email_verified=true. Operator bootstrapped only that verified UUID into private.staff_members and independently checked membership. The second designated account has not signed in; no fabricated or email-only grant. Do not record personal account identifiers or secrets in public notes.

Supabase Site URL https://envet.info and three exact allowed callbacks are saved: https://envet.info/auth/callback, http://localhost:3001/auth/callback, http://127.0.0.1:3001/auth/callback. No wildcards. Saved Google Web client verified with production and both local port3001 origins, and only https://rpkxpsnqlhcepyxclgau.supabase.co/auth/v1/callback as Google redirect; owner created/saved credentials themselves. Standard OpenID/email/profile declarations saved, no sensitive/restricted Google scopes. ENVET homepage/privacy links supplied; Owner explicitly approved identity-only publication; Google Audience now visibly confirms In production. No sensitive/restricted scopes or automatic staff grants.

Saved Vercel Production NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and AUTH_REDIRECT_ORIGIN=https://envet.info. Redeployed already-verified source fdab66b to dpl_4uud8bim6m2ax71FuGfSUbE42SdC, Ready42s, envet.info assigned, immutable envet-5txg84s3r-ryanverweys-projects.vercel.app. Actual owner callback succeeded on this release. No server secret/rate pepper/encryption settings or collection enablement yet; admin membership exists but team UI needs server-only data configuration.

Created ignored .env.development.local with public auth settings, loopback origin port3001 and collection OFF; no privileged secrets. NextRequest normalizes even request.url from 127.0.0.1 to localhost. OAuth start and finish now preserve the actual local Host only after URL/config validation and strict same-port loopback checks; production ignores Host for redirects. No forwarded-header trust. Regression tests reject wrong ports, outside domains, path/userinfo Host spoofing and unapproved production origins. Actual localhost and 127.0.0.1 port3001 HTTP start probes both return307 to Supabase, preserve their exact callbacks and set PKCE cookies. Full90tests/lint/build/types/format pass. Local-origin fixes released from exact passing source1fcfc2319b8bdb856573bdb960dd4473d54fc10a after both CI verify checks succeeded (runs38011047595 and38011051866). Deployment dpl_CTjrRYLwbTidkdt4G6Ljukea1BfA Ready28s, envet.info assigned, immutable envet-k1xyyxfnn-ryanverweys-projects.vercel.app. Production15-public/9-private smoke, redirects/discovery/media pass; signed-in owner session survives release. Staff link is still absent pending server-only data settings; no live blog writes or signed intake claimed.

Proof: C:/Users/verwe/.codex/artifacts/envet-deployment/envet-auth-prod-local-redirects-saved.png, envet-vercel-auth-vars-saved.png, envet-auth-first-production-release.png, envet-google-owner-login-verified.png, envet-google-published.png and envet-auth-local-fix-production.png. Never equate successful member sign-in with working staff operations, public Google app publication or protected signed-form collection.
## Activation session and Google project (October 9, 2026)

Owner explicitly requests Google auth activation and selected their already-signed-in personal Google account for project ownership. Created isolated Google Cloud project ENVET, ID envet-511200; Google notification confirms Create Project: ENVET finished. No billing link, paid services, OAuth credential, added scopes, provider activation or staff grants performed. First project-create attempt had unloaded form/resource errors; after recovery verified no ENVET project before the successful second attempt. Do not create another project.

Connected to the owner's authenticated Supabase dashboard after recovering their newly opened tab. Live public Auth settings still show external.google=false. URL configuration currently defaults to http://localhost:3000 with no redirects. Prepared Site URL https://envet.info and sole redirect https://envet.info/auth/callback; saving is pending explicit action-time confirmation. These prepared values are not yet applied. Keep FORM_COLLECTION_ENABLED=false and signed storage recovery gate intact.

Google Auth Platform overview and Branding screens for envet-511200 fail or stall in the controlled browser, including retry and fresh-tab recovery; project creation itself succeeded. Owner confirmed their regular browser shows Get started. On owner handoff, click Get started and configure app name ENVET, External audience, and a support contact Google allows; owner reviews and accepts any User Data Policy agreement themselves. Stop before OAuth credential creation until exact client configuration and credential handoff are confirmed. Basic identity scopes only: openid, userinfo.email, userinfo.profile. Web client origin https://envet.info; Google redirect https://rpkxpsnqlhcepyxclgau.supabase.co/auth/v1/callback. Client secret belongs directly in Supabase provider configuration, never chat/source/Brain; no website GOOGLE_CLIENT_SECRET needed. Owner must retain credential safely when Google shows it once. Supabase still needs provider configuration; Vercel still needs public project URL/key/auth origin and private operational settings. Do not claim live callback or team access until actual owner login and verified UUID grant.

Seven existing auth/contract route tests and Plan check pass. Build/test mocks are not live OAuth evidence. Browser proof of pending exact callback: C:/Users/verwe/.codex/artifacts/envet-deployment/envet-auth-redirect-approval.png. Current prepared signing UI release remains fdab66b / dpl_G9RJuDGNEJwiaewwx74xnVVJv3CM; this session does not deploy code or enable intake.

# ENVET Google sign-in activation

Google identity sign-in is active and published; see the latest verified activation section above. Hosted schema migrations are applied and the catalog/anonymous permissions audit passes; this does not prove live login or member/staff workflows. Keep secrets out of chat, issues, source control, screenshots and Brain.

## Owner setup

1. Use an ENVET-controlled Google Cloud project. Configure Google Auth Platform branding and support contact; use External audience for personal Google accounts. Identity-only app publication is owner-approved; do not add sensitive scopes or automatic staff promotion.
2. Scopes: `openid`, `userinfo.email`, `userinfo.profile` only. No Gmail, Drive or calendar access.
3. Create a Web application OAuth client. Authorized origins must match the actual local development hostname/port and, at approved launch, `https://envet.info`.
4. Google's redirect URI is exactly `https://rpkxpsnqlhcepyxclgau.supabase.co/auth/v1/callback`—not the website callback.
5. Enter client ID/secret directly in Supabase Authentication → Sign In / Providers → Google, then enable Google. Keep nonce checks enabled and users-without-email disabled. Do not unnecessarily change other providers.
6. Supabase URL Configuration allows ENVET's `/auth/callback` on the exact development origin. Before approved production, Site URL is `https://envet.info`, callback `https://envet.info/auth/callback`. Avoid arbitrary production wildcards.

Official setup and redirect guidance: [Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), checked October 9, 2026.

## Two callbacks

Google returns to Supabase `/auth/v1/callback`. Supabase returns to ENVET `/auth/callback`, where the server exchanges the PKCE code for a cookie session. These destinations are different.

## Application configuration

URL and publishable key identify the public Supabase client; neither grants privileged access. A secret/service-role key must never use a `NEXT_PUBLIC_` variable. If needed by the implementation, server-only credentials belong in untracked local environment/Vercel encrypted settings. Match auth origin to the local review server (currently `http://127.0.0.1:3001`); use `localhost` consistently if required for Google's development origin. Production connection is now owner-approved and verified.

## Staff bootstrap and proof

Both intended initial admins sign in through Google first. An operator verifies confirmed email and Google identity, then grants private membership to actual `auth.users` UUIDs. Never auto-promote from editable metadata or an email-only runtime rule. Revoking membership must deny the next staff operation.

Before collection, verify successful/cancelled login, callback, sign-out, expired code, malicious return URLs, member and revoked-staff denial, inquiry isolation, duplicate likes, immediate comments, own removal, reporting/moderation, abuse limits, published-only content, manual inquiry deletion, and backup recovery. Builds/mocks are not live proof.

Inquiries persist until staff manually deletes them. Active-table deletion does not immediately purge provider backups/logs; confirm those expiry policies before production collection.

Owner completed credential entry and one verified UUID received an operator staff grant; see current activation evidence above. Hosted migration versions are 20261009210844 (community_workspace) and 20261009210926 (community_foreign_key_indexes), matching local migration filenames. Do not reapply them. Live-account verification status must be updated from actual test evidence, never inferred.

## Operator-only bootstrap template

Run only after migration review/application and successful Google sign-in. Replace the placeholder with one owner-designated admin address, verify the selected account yourself, and repeat for the second account. Do not run this for arbitrary applicants. Use Supabase SQL Editor/operator credentials, never a website endpoint.

```sql
begin;
-- Read first; exactly one confirmed user with matching verified Google identity.
select u.id, u.email, u.email_confirmed_at, i.provider,
       i.identity_data->>'email' as provider_email,
       i.identity_data->>'email_verified' as provider_email_verified
from auth.users u
join auth.identities i on i.user_id = u.id
where lower(u.email) = lower('OWNER_DESIGNATED_EMAIL')
  and u.email_confirmed_at is not null
  and i.provider = 'google'
  and lower(i.identity_data->>'email') = lower(u.email)
  and i.identity_data->>'email_verified' = 'true';
-- After verifying the result, grant the actual returned UUID explicitly.
-- insert into private.staff_members(user_id) values ('VERIFIED_UUID');
rollback;
```

The template rolls back and the grant line is intentionally commented. Do not bypass a missing/ambiguous identity match. To grant, make an intentional operator transaction using the verified UUID and commit. Record only the operation/UUID privately, not personal records in public GitHub. To revoke, remove that UUID membership and verify the next staff request denies access. Google account two-step verification is recommended; application AAL2 enforcement is not claimed unless separately implemented and tested.

## Environment handoff

Use the names in .env.example: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, AUTH_REDIRECT_ORIGIN, SUPABASE_SECRET_KEY and RATE_LIMIT_PEPPER. Only the first two are public. The Google client secret belongs in Supabase's provider settings, not these website variables. Obtain the server secret directly from the owner-controlled Supabase API-key settings and enter it only into untracked local environment or encrypted Vercel environment settings. RATE_LIMIT_PEPPER must be independently random, at least 32 characters; generate it locally with a cryptographic random generator. Do not reuse the Google secret or a password as the pepper.

Keep SITE_APPROVED_FOR_LAUNCH and CONTENT_AND_MEDIA_APPROVED false throughout private testing. Do not attach a public deployment or use real visitor records merely because environment values are present. Live login/private workflows, backup recovery, owner privacy/media approval and residual dependency-risk review must pass before production collection.
