---
title: ENVET owner-review verification
updated: "2026-10-09T23:59:45Z"
---
## Veteran capitalization released (October 9, 2026)

Owner requires Veteran, Veterans and their singular/plural possessives capitalized everywhere in ENVET-authored website copy. Corrected public headings/body, header/footer, blog titles/descriptions/articles, metadata, privacy, community prompts and dashboard/signing guidance. Original legal templates already capitalized these terms and remain unchanged; internal veteran enum, URLs and visitor-authored content unchanged. Persistent rule in standards.md; source-copy regression plus rendered preview/production assertions prevent recurrence. Impeccable consistency pass retained Corva layout and controls.

Source068c9933352e3a08f027c6b1542f6becb84df8b8; CI38006856008/38006854387 successful including browser regression checks. 78 tests, lint/build/types/format, Plan and24-route preview pass. Vercel dpl_3Mozu5R1yxyG4XwMv5hxEQHqs466 Ready31s and envet.info assigned; immutable envet-iwzgcojgd-ryanverweys-projects.vercel.app. Live15-public/9-private route/discovery/media/redirect checks pass, now including capitalization. Browser confirms capitalized home/title/header/body/journal/footer. Proof: C:/Users/verwe/.codex/artifacts/envet-deployment/envet-veteran-capitalization.png. Prior healthy sourcec160f45/dpl_5AXMXtYQa4BFA33gj9nJgn1zv6AD is rollback candidate, not exercised. No activation, security, schema, consent or signature-version change; collection remains disabled. Only agent-owned3002 preview server stopped; user-owned3001 preserved.

## October 9: partner-nation participation correction

Owner-confirmed scope added across shared public/staff pre-visit guidance, homepage, About, organization search/schema description and all three published articles. Regression tests cover United States/partner nations, Active Duty and families, private ENVET confirmation, no unrelated civilian recreation, and no military identity/medical uploads. No country list, new affiliation codes, signed-document changes or collection activation. Impeccable clarified existing Corva copy.

77 tests, lint/build/types/formatting, browser regressions, Plan check and 24-route built preview smoke pass. Exact source c160f45ee27f0d4917937776cb9703ec22c7fb33 passed CI38006408059/38006404483. Manual Vercel dpl_5AXMXtYQa4BFA33gj9nJgn1zv6AD Ready in 28s and assigned envet.info. 15-public/9-private production probes and discovery/media/redirect tests pass. Actual live checklist visible with corrected scope and intact private-confirmation/document warning. FORM_COLLECTION_ENABLED remains false; guardian certification remains pending owner/legal review. Proof: C:/Users/verwe/.codex/artifacts/envet-deployment/envet-partner-nation-eligibility.png. Previous healthy dpl_BcJWCRBZKwXhX8begtapQbBUi8rH/source510d84c retained as rollback candidate, not exercised.

## October 9: named minor and guardian certification

Prepared child-name/age/guardian flow, separate signatures and required versioned guardian certification. See docs/forms-workflow.md for semantics, exact-wording review gate and source references. 75 unit/API/PGlite tests pass; actual SigningRoom browser path verifies required checkbox, keyboard Space, preserved separate names/signatures, review and edit invalidation. 8 certification viewport/theme combinations have no overflow. Original DOCX hashes/body/headers unchanged. Lint/build/types/format pass. No real data, hosted schema changes, identity activation or collection. The added legal wording is proposed, not approved; Google identity cannot prove parental authority. Impeccable clarification keeps existing Corva controls and precise labels. Synthetic preview proof: C:/Users/verwe/.codex/artifacts/envet-deployment/envet-child-guardian-preview.png.

## October 9: emergency contact autofill fix

Shared FormField had no explicit autofill hints. Added stable names, section-signer contact hints and autocomplete off for emergency contact, guardian and horse fields. Independent React state and manual editing preserved; legal text, consent, form version and collection gates unchanged. Impeccable hardening kept existing controls and labels. 72 unit tests, browser field/state regressions, lint, build, types, formatting pass. Browser tests assert blank emergency phone after signer entry and preserve a separate emergency number after signer changes. Native-profile Autofill.trigger unsupported through browser tool; forced native-profile fill and extension behavior unverified. Synthetic data only, no submissions. Guidance: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete. Proof: C:/Users/verwe/.codex/artifacts/envet-deployment/envet-emergency-autofill-test.png.

## October 9, 2026: full-page copy and accessibility polish

Owner explicitly requested an audit and fixes, not diagnostics only. Impeccable guided design-system-first polish: existing Corva mint tokens, genuine approved photos, humanist typography and restrained glass retained. Brain session 1791587483141652000; Plan M3 brainstorm records the scope; canonical implementation remains GitHub #27/PR45. Owner visual acceptance is not presumed.

Fixed findings: P2 public AI-assistance/owner-review/setup commentary; P2 privacy text describing inactive features; P2 offline signing pages exposing unusable editable previews; P2 skipped journal headings and unfocusable skip destination; P3 text-only social links/undersized footer targets; P2 delayed text opacity during entrance animation. No source legal wording, signature consent contract, auth rules, schema, permissions or collection flags changed.

Public form routes now show a polished read-only document and a team-contact path when collection is disabled. Original legal text remains complete and keyboard-expandable. Submission stays disabled pending the separately required review/security activation. Privacy describes actual enabled features rather than hypothetical ones. Receipt direct entry has a meaningful heading/contact path instead of an unnecessary unavailable API request.

Verification: 65 Vitest tests/11 files; lint, optimized build, TypeScript, Prettier, team-workspace browser regressions and 24-route preview smoke pass. Smoke probes now enforce semantic main/H1, keyboard skip target, labeled social SVGs, natural tab order and absence of public draft/editorial/setup copy. Eight new UI-contract regression cases preserve useful input hints and ignore serialized internal state.

Actual built-page DOM audit covers 25 views: all 15 public content routes, nine form/account/team unauthenticated routes, and a 404. One H1/main per view; no heading skips, duplicate IDs, dangling ARIA references, unlabeled visible controls, missing image alt attributes, positive tabindex values or targeted copy leaks. 150 route/viewport/theme combinations (25 x 320/768/1280 nominal widths x mint light/dark) pass these checks. Additional strict scrollWidth/clientWidth comparison passes all 25 routes at each width. Keyboard skip link focuses main; Enter opens mobile navigation; Escape closes it and returns focus. Social targets measure 44x44px.

Reduced-motion emulation confirms no heading animation or action transition. Computed solid-background text colors sampled across 25 views in both themes: 3,044 samples meet the tested 4.5:1 normal/3:1 large-text contrast thresholds using CSS Lab D50-to-sRGB conversion and alpha compositing. This is a scoped text-color diagnostic, not a complete automated axe scan; photo/backdrop layering needs visual review. No WCAG conformance certification is claimed. Screen readers, physical devices, Safari/Firefox, authenticated record screens and real form submissions remain untested in this pass. No sensitive records opened or test submissions sent.
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
## Protected forms / honest attendance increment, October 9, 2026

Plan #46 and docs/forms-workflow.md define scope. Both supplied DOCX originals unchanged; independent structural/hash/body/header/footer parity passes via scripts/check-form-sources.ps1. Digital layout adapted; original source visual rendering could not run because bundled LibreOffice absent. Preserve wording pending owner/legal approval, particularly legacy liability language/minors/photo release/electronic intent.

Parent Brain-recorded: 46 tests/8 files, lint, optimized build, types, format, existing team browser regressions, source parity and production-build HTTP smoke pass. HTTP covers18 ordinary routes/19internal targets and five private no-store/noindex pages. Dev server cache-control is Next's no-cache; production-build loopback3002 verifies no-store. No public deployment.

Actual signing UI: synthetic donation6steps to disabled final review; guest minor4steps,16guest+guardian opening initials, separate typed signatures, consent and complete review disabled final. Hand drawing retained a bounded stroke, clear removed it. Keyboard completion tested because native default-click transport was inconsistent; this is not a passed universal pointer/real-user test. Signing width320/390 measured no page overflow in dark theme. Synthetic exact-component queue confirmed-write/refresh503 hides rows/details, refresh retrieves without replay and clears old warning; receipt403 shows no thank-you; synthetic success renders source/fields/signatures and save/print controls. Real Corva charts render populated aggregates/tables and reviewers check320dark/reduced motion. No real signer or attendance in fixture.

Independent release review initially rejected participant-relink concurrency and unpublished-service attendance. Correction uses shared per-form guard before fresh invariants plus published service FOR SHARE lock, leaving matching prior nonce replay valid after archival. Local SQL regressions pass; concurrency fix established by lock/interleaving review, not actual hosted multi-session experiment. Missing committed UUID fails503, spoofed kind review400, duplicate/replay/conflict/wrong-key/access denial/account removal/void corrections tested. Exact v2 manifest44entries digest a0990d4f29916bceb5b6282cd44abe8af2aa47952ee0911dd412ac47013a1881; hash canonicalization sorted path:lowercase-sha256 lines joined LF with no trailing LF, UTF8 SHA256.

New forms migration local only. No keys, Google activation, hosted forms records or deployment. Gates: final independent verdict, owner/legal exact version/consent approval, key lifecycle and restore exercise, hosted migration/grants/RLS/concurrency, real Google account and staff bootstrap, own/other/revoked access, successful receipt/retry/review/visit/void, production/media/privacy acceptance. Indefinite signed retention has no routine deletion; explicit operator purge must include authorized scope, audit/recovery and backup implications. No legal validity or complete accessibility/security claim.
Independent GPT-6 Astra correction review accepts the prepared local increment only: all44file hashes and canonical aggregate digest match,21forms tests/source parity/production smoke/refresh recovery verified. Report C:/Users/verwe/.codex/envet-forms-correction-qc.json. No new blockers; live/legal/recovery/launch gates remain open. Technical acceptance does not permit collection activation.
