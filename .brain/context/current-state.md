---
updated: "2026-10-09T21:11:36Z"
---
## Current owner-review revision

Branch codex/envet-owner-preview, PR #45. Owner rejected the initial design as unprofessional and requested accented animation, tasteful glassmorphism and a premium complete feel. Revised the full visual system: Source Sans 3 sentence-case typography, complete organization wordmark, wide authentic photography, mission/visit/donation composition, inner-page copy, featured blog layout, limited glass navigation/photo caption, CSS entrance/scroll/interaction motion and reduced-motion fallbacks. See DESIGN.md.

CorvaUI mint-light/mint-dark remains the component/token foundation. Production build, lint, 10 tests, typecheck, formatting and HTTP preview checks pass. Revised template matrix passed 104 dark/light responsive audits (13 routes x 4 viewport widths x 2 themes). Owner visual acceptance remains open; technical checks do not imply approval.

Implementation traps found and fixed: intrinsic photo dimensions expanded featured blog columns at tablet width, resolved by minmax(0, ...) and min-width:0; scroll-linked opacity reduced text contrast, replaced with translation only; explicit WebKit backdrop-filter after standard property caused CSS minification to discard the standard property. Keep standard-only source and let the compiler prefix it. Browser inspection must verify actual computed blur, not just stylesheet source.

Owner content/media rights, final eligibility/legal approval and launch acceptance remain gated. No production deployment. The server is loopback-only at port 3001.

## Funded infrastructure and community workspace (October 9, 2026)

Vercel project envet exists without deployment; envet.info and www.envet.info DNS are verified. Owner public-launch approval remains pending. Supabase project rpkxpsnqlhcepyxclgau is healthy in us-east-1, Postgres 17.11; public schema/migrations were empty at inspection. Google provider is disabled, OAuth credentials absent. Owner selected Google accounts, likes/sharing and immediately published comments. Initial two staff identities are known to the operator; grant actual verified Google UUIDs manually, never auto-promote from editable metadata.

Inquiries capture name, email or phone, service interest, optional short non-sensitive note and contact consent; lead to phone follow-up/booking. Retain until manually deleted, explicitly replacing suggested 90-day expiry. Team scope: horses, services, private inquiries, comment moderation and aggregate anonymous page counts. Blog authoring remains Markdown. See docs/data-workflow.md and docs/google-auth-setup.md. No clinical/military-document intake or custom payment processing.

Prepared community/team code passed independent GPT-6 Astra local review against existing M6 issues, with execution mirror .plan/specs/m6-community-workspace-execution.md. Current checks: 25 tests, lint, Next.js 16.3.8 build, types, formatting and HTTP smoke pass. Report-target pagination and false Saved after refresh failure were caught independently, corrected and browser/SQL rechecked; refresh hides stale records and never replays confirmed writes. Plan adoption updated #41 then failed on its existing sub-issue relation; do not retry blindly or create a seventh milestone. Live OAuth, cloud negative access, privacy finalization, backup recovery and owner approval remain activation gates.

Hosted additive migrations 20261009210844 community_workspace and 20261009210926 community_foreign_key_indexes are applied; local filenames match remote history. All 10 tables have RLS, catalog security audit passes, zero application RPCs permit anonymous/member execution. Anonymous REST published reads200, direct comments401/private inquiry404/staff RPC401. Staff, inquiries, comments and profile tables remain empty. INFO no-policy notices are intentional service-only denial; unused indexes reflect empty schema; Auth connection allocation is a production-sizing follow-up. No secrets/provider activation/staff grants or collection/deployment occurred.

Retrospective: missing-config tests hid an OAuth loopback-origin bug; configured callback regression now tests localhost/127 normalization. Build-only readiness missed moderation paging and refresh recovery; carry those exact-component and 101-record regression tests into CI. Final hosted integration evidence and remaining activation gates are in docs/verification.md. M6 issues remain open until live/owner gates pass.
