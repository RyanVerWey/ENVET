---
updated: "2026-09-06T04:00:06Z"
---
## Current owner-review revision

Branch codex/envet-owner-preview, PR #45. Owner rejected the initial design as unprofessional and requested accented animation, tasteful glassmorphism and a premium complete feel. Revised the full visual system: Source Sans 3 sentence-case typography, complete organization wordmark, wide authentic photography, mission/visit/donation composition, inner-page copy, featured blog layout, limited glass navigation/photo caption, CSS entrance/scroll/interaction motion and reduced-motion fallbacks. See DESIGN.md.

CorvaUI mint-light/mint-dark remains the component/token foundation. Production build, lint, 10 tests, typecheck, formatting and HTTP preview checks pass. Revised template matrix passed 104 dark/light responsive audits (13 routes x 4 viewport widths x 2 themes). Owner visual acceptance remains open; technical checks do not imply approval.

Implementation traps found and fixed: intrinsic photo dimensions expanded featured blog columns at tablet width, resolved by minmax(0, ...) and min-width:0; scroll-linked opacity reduced text contrast, replaced with translation only; explicit WebKit backdrop-filter after standard property caused CSS minification to discard the standard property. Keep standard-only source and let the compiler prefix it. Browser inspection must verify actual computed blur, not just stylesheet source.

Owner content/media rights, final eligibility/legal approval and launch acceptance remain gated. No production URL, Vercel deployment or database provisioning. The server is loopback-only at port 3001.
