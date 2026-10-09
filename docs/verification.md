---
title: ENVET owner-review verification
updated: "2026-10-09T21:10:41Z"
---
# ENVET owner-review verification

Date: September 6, 2026. This report describes a local review candidate, not an approved or deployed website.

## Automated checks

- ESLint: pass.
- TypeScript: pass.
- Prettier: pass.
- Vitest: 10 tests pass, covering frontmatter validation, invalid dates/slugs, draft isolation, sanitized Markdown, structured-data/XML escaping, exact outbound destinations, preview/production discovery behavior, and production media-clearance rejection.
- Next.js optimized build: pass; 22 generated route artifacts. Nine core pages, three articles, and three category archives, plus metadata/system routes.
- HTTP smoke test: pass against development and built production-style local servers. All 15 content routes, 16 internal targets, real draft/unknown 404s, three permanent legacy redirects, images, social image, noindex headers/meta, absence of fake canonicals, robots disallow, and empty preview sitemap/RSS verified.
- Dependency audit: zero reported production vulnerabilities at verification time. Not a guarantee against undiscovered vulnerabilities.
- Plan check: zero findings. Brain workspace valid; retrieval index refreshed during closeout.

## Browser matrix

104 axe-core checks: 13 routes × 4 CSS viewport widths (320, 390, 768, 1440) × 2 themes. Zero detected WCAG A/AA violations across the selected WCAG 2.0/2.1/2.2 tags. No horizontal overflow against the document client width. Actual client widths were recorded, not merely requested emulation widths.

Routes: home, about, visit, donate, contact, gallery, journal index, all three articles, getting-started category template, privacy, and editorial policy. The other two category routes share the tested template and pass the HTTP checks.

Browser correction found and fixed: article cover aspect ratio plus minimum height could widen a narrow mobile page. Explicit full-width/min-width constraints now keep every article inside a 320px viewport. The test compares scrollWidth to clientWidth, not the mobile-expanded innerWidth that could hide this defect.

Tests use Chromium viewport emulation, not physical phones or a complete cross-browser certification. Desktop pointer browsing was also reviewed at the browser's native window size. Manual assistive-technology review, Safari/Firefox, and physical-device owner testing remain recommended before production approval. Automated accessibility scans are not a WCAG conformance certification.

## Performance budget

- Local original photos: 571,284 / 645,240 / 713,748 bytes. Official logo: 41,593 bytes.
- Hero through Next.js image optimization at 1080px, AVIF quality 75: 82,303 bytes, HTTP 200. Target ceiling: 250 KB for this optimized hero variant.
- Static server-rendered content; self-hosted fonts, local media, lazy below-fold images, and no Facebook embed/advertising/analytics runtime.
- Target at launch: LCP <=2.5s, CLS <=0.1, INP <=200ms at the 75th percentile. These are targets, not measured field results. Real field metrics require owner-approved production traffic; no Lighthouse or field-score claim is made here.

## Human review still required

Owner factual/legal/privacy review, precise service/family eligibility and accessibility arrangements, donation recipient confirmation, all media rights/consent, and visual acceptance. No donations or messages were submitted during testing. No Vercel deployment or database provisioning was performed.

## Reproduce

Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm run typecheck`, and `npm run format:check`. Start the built site with `npm start`, then `npm run test:preview`. Use `PREVIEW_ORIGIN=http://127.0.0.1:3001` if the local built server uses port 3001. Smoke-test origin is deliberately restricted to loopback.

For browser audits, inject the installed development dependency `axe-core/axe.min.js` only into the local review tab through the supported browser developer tooling, run the WCAG tags above, and compare document scrollWidth/clientWidth at each width. Reload afterward to remove audit instrumentation and clear device emulation before handing the tab back. Never run this audit against the donation checkout or send test messages.

## Final handoff

Ready code-review PR: https://github.com/RyanVerWey/ENVET/pull/45. GitHub CI passed. Nineteen implementation tasks and the M4 initiative are complete; M4 milestone is closed. M1/M2/M3 owner acceptance, M5 launch, and M6 funded implementation remain open. Theme state/persistence, mobile menu expansion and close-on-navigation, and native FAQ keyboard disclosure were manually verified. Next.js smooth-scroll route-transition metadata was added after the development warning; reduced-motion rules remain intact.

## Owner-requested professional visual revision, September 6, 2026

Initial visuals were rejected. This revision replaces typography, layout, photo crops and shared templates; adds requested bounded glass materials and accented CSS motion. DESIGN.md records the superseding direction. It is not an owner-approved design.

- Production build, lint, 10 unit tests, typecheck, formatting and loopback HTTP smoke suite passed.
- 104 revised template audits: 13 representative routes at 320, 390, 768 and 1440px viewports in mint light/dark. No axe WCAG 2/2.1/2.2 A/AA violations or horizontal overflow after fixes. The in-app browser reserves 15px for the scrollbar; actual document widths were 305, 375, 753 and 1425px, with requested innerWidth verified.
- After the final CSS prefix fix, eight additional homepage audits passed in both themes at all four widths, with computed header blur(16px) saturate(1.35) and caption blur(16px) saturate(1.25) confirmed on the built artifact.
- Keyboard: mobile menu opens with Enter; Escape closes and restores trigger focus. First visit FAQ opens with Enter.
- Reduced-motion emulation: heading/image animation-name none; scroll-behavior auto. Emulation and temporary viewport were reset after checks.
- Full homepage and mobile visit screenshots inspected; original photography and glass layers render. No real-device frame-rate certification is claimed. Browser checks do not replace owner acceptance or assistive-technology user testing.

Regression fixes: featured blog intrinsic-size tablet overflow; low contrast from offscreen scroll fades (now translation-only); compiler dropped standard backdrop-filter when followed by an explicit WebKit duplicate (use standard source and automatic prefixing).

Review remains loopback-only at http://127.0.0.1:3001/. M3 visual approval #21, M5 owner feedback #33 and launch approval #35 stay open.

## Funded community and team increment, October 9, 2026

Prepared on codex/envet-owner-preview / PR #45; not activated or deployed. Owner chose Google auth, likes/sharing, immediate comments and manual inquiry retention. Request-scoped auth, server-only privileged access, service-only RPCs with explicit grants/RLS, durable abuse controls, private staff membership, horses/services management, inquiry follow-up, comment moderation and aggregate daily page views are implemented locally. No real inquiries, admin grants, Google credentials or production environment changes were made. The independently accepted additive schema was subsequently applied to the existing hosted project, without user or content seed data.

Parent recorded full lint/test/build/type checks and the loopback HTTP smoke suite through Brain. Initial independent GPT-6 Astra review reproduced 24 passing tests, lint, formatting, service-RPC anonymous/member denial, actual unavailable account/team/contact states, copy sharing and article reflow at 320/768/1440/2560px. This does not establish complete WCAG conformance or configured/live-user behavior.

Independent review reproduced two medium workflow defects: report paging omitted older comment targets, and a successful staff mutation followed by failed refresh falsely showed Saved with stale records. Review was explicitly rejected/released; both corrections passed new independent local review. The 25-test suite, lint, build, types, formatting and HTTP smoke checks pass. Synthetic exact-component browser regressions cover normal save, status/delete/hide followed by refresh503/403, hidden stale records and refresh-only retry without replay, plus older reported-target moderation at 320px dark with keyboard/reduced motion. Independent native deletion-modal transport required a synthetic confirmation stub; this is not proof of a real-user deletion-confirmation flow. Build success did not override those behavioral failures.

Next.js and matching ESLint config are pinned to 16.3.8. Dependency audit has nine findings (four moderate, five high, zero critical): development lint-pattern dependencies and the repository-controlled Markdown parser chain. No reachable untrusted runtime exploit was established in reviewed routes; no universal safety claim is made. Review compatible dependency updates before public release rather than apply audit-suggested breaking downgrades blindly.

Live activation still requires owner-created Google credentials, Supabase provider settings, server secret and random pepper, real-account hosted authorization checks, verified-Google UUID staff bootstrap, real callback/cookie/sign-out and member/staff/revocation workflows, hosted negative access checks and backup recovery/expiry verification. Owner content/media/privacy approval and explicit launch approval remain required. Inquiries persist until manually deleted; closing them causes no expiry. Provider backup/log expiry is separate.

### Hosted schema integration

Applied community_workspace (20261009210844) and additive community_foreign_key_indexes (20261009210926) through Supabase migrations after fresh empty-schema/history inspection. Local filenames match actual remote history; accepted main SQL bytes were unchanged by alignment. All ten tables have RLS. Read-only catalog/security audit passes; zero public/private application functions permit anon/authenticated EXECUTE. Staff/inquiries/comments/horses/services counts are all zero.

Actual anonymous PostgREST checks with the public publishable key: horses/services SELECT200, direct comments SELECT401, private inquiries route404, staff_dashboard RPC401. No privileged secret or authenticated user token was used. This does not prove authenticated member, revoked staff or successful live writes.

Three uncovered user foreign-key indexes were added; the follow-up performance advisor no longer reports them. Remaining notices are INFO: [eight intentional deny-by-default no-policy tables](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [unused indexes on an empty new schema](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), and [Auth fixed connection allocation](https://supabase.com/docs/guides/deployment/going-into-prod). Do not weaken grants/RLS or remove needed indexes merely to silence notices. Review Auth allocation when sizing production. No security ERROR/WARN was returned at this inspection.

GitHub CI now runs isolated browser regressions in addition to the existing tests/build/types/HTTP smoke. CI results for the new push must be reported separately; local passes do not prove a remote run. Echo final integration review covers exact migration/history alignment, additive indexes, CI step and this handoff boundary.
