---
title: ENVET owner-review verification
updated: "2026-09-06T03:18:56Z"
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
