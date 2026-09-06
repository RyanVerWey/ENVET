---
created_at: "2026-09-06T02:13:54Z"
project: ENVET
slug: envet-fresh-start
status: active
title: ENVET fresh start
type: brainstorm
updated_at: "2026-09-06T02:22:14Z"
---

# Brainstorm: ENVET fresh start

Started: 2026-09-06T02:13:54Z

## Focus Question

Build and launch a trustworthy, beautiful, accessible nonprofit website that helps veterans and families request services and inspires donations before database funding arrives.
## Desired Outcome

A production-ready, responsive, WCAG 2.2 AA marketing site deployed on Vercel, with clear paths to request services, donate, volunteer, and follow ENVET. Database-dependent intake, CMS, and payment integrations remain explicitly staged until funding is available.
## Vision

ENVET's new site should feel like the digital front gate to a working horse farm: calm, credible, personal, and easy to act on. Veterans and their families should quickly understand who ENVET serves, that eligible veterans receive free access to rescued or donated horses, and how to make contact. Donors should see real horses, real community activity, and a direct path to support the work.

## Supporting Material

- Repository: https://github.com/RyanVerWey/ENVET
- Official Facebook page: https://www.facebook.com/profile.php?id=100068209587248
- CorvaUI: https://github.com/RyanVerWey/CorvaUI
- Facebook photo library: https://www.facebook.com/profile.php?id=100068209587248&sk=photos
- Facebook donation destination: https://www.paypal.com/donate/?hosted_button_id=EK4AXP2E2WA5J

## Constraints

- No funded database until next weekend. Use CorvaUI mint light and mint dark themes. Preserve verified public contact/social information. Do not imply clinical credentials, outcomes, tax deductibility, privacy guarantees, or donation processing that ENVET has not verified.
## Open Questions

- Confirm final donation destination, authorized service-intake workflow, preferred public street versus PO box address, approved photography/logo rights, and whether services include family members at no cost.
## Ideas

- Preserve verified Facebook, email, phone, EIN, and Lovettsville contact details from legacy sources.
- Use Next.js App Router, TypeScript, Vercel, and CorvaUI mint light/dark tokens.
- Launch database-free with static content and safe external or mail-based service and donation calls to action; add persisted intake/donations in a later milestone.
- Treat veteran privacy, trauma-informed language, accessibility, and donor trust as release requirements.
## Raw Notes

Verified leads from public sources: Facebook page 119150736611486; EaglesNestVeteranEquineTherapy@gmail.com; 540-504-8401; EIN 88-0998372; PO Box 53, Lovettsville, VA 20180; one directory lists 37958 Long Ln. Treat address and hours as unverified until owner confirmation.
## Refinement

### Problem

ENVET lacks a trustworthy owned web presence that clearly explains its veteran-focused equine services, turns interest into contact, and turns goodwill into donations. Existing information and imagery live mainly on Facebook and need structured review before reuse.

### User / Value

- Veterans and eligible partner-nation veterans: understand eligibility, feel welcomed, and contact ENVET without navigating a complex intake system.
- Veteran families and caregivers: understand available support and find a human contact path.
- Donors, volunteers, and community partners: see credible evidence of activity and support ENVET through verified channels.
- ENVET owner: review a private preview before any production URL is connected.

### Appetite

End-to-end launch program split into six outcome milestones. First release stays database-free. Database, CRM, CMS, and richer intake work starts only after funding and owner approval.

### Remaining Open Questions

- Which Facebook images have documented permission for website reuse, especially images showing children or identifiable visitors?
- Which testimonials may be quoted outside Facebook?
- Should published eligibility language require a DD-214 or military ID, and how should sensitive documents be handled without a database?
- Which hours and visit-by-appointment rules are current?

### Candidate Approaches

1. Recommended: content-first static Next.js site using curated, permission-cleared Facebook media; direct phone, email, WhatsApp, Messenger, and PayPal links; private Vercel preview until owner sign-off.
2. Smaller: single-page brochure with social and donation links. Faster, but too little depth for trust, services, accessibility, and search.
3. Larger: database-backed intake, donor CRM, CMS, and event management immediately. Rejected until funding and operating processes exist.

### Decision Snapshot

Plan recommended approach. Treat Facebook as source material, not a live runtime dependency. Store approved copies and source provenance in repository. Use CorvaUI mint light/dark. Gate production URL connection on explicit owner acceptance.

## Challenge

### Rabbit Holes

- Building custom donation processing instead of linking verified PayPal.
- Automating unrestricted Facebook scraping or runtime embeds.
- Building a CMS/blog before core service and donation paths prove useful.
- Adding clinical claims or outcome statistics without approved evidence.

### No-Gos

- No live production URL before owner review and satisfaction.
- No database-dependent features in initial release.
- No child, client, or visitor photography without explicit reuse approval.
- No collection of DD-214 documents, medical details, or sensitive intake data in initial release.
- No invented testimonials, program outcomes, staff credentials, or impact numbers.

### Assumptions

- Official Facebook page is authoritative for current public contact information and donation link.
- ENVET may use page-owned horse, farm, and event photos after an owner completes a rights/privacy review.
- Phone, email, WhatsApp, Messenger, and PayPal can support the pre-database release.
- Both mint light and mint dark themes are required.

### Likely Overengineering

Custom authentication, scheduling, donor accounts, payment processing, automated social ingestion, and a general CMS would add risk without improving the first owner review.

### Simpler Alternative

Ship a static, content-rich site with curated local media, accessible outbound contact/donation actions, analytics-ready event hooks, and owner-review preview. Add database workflows as a later milestone.

## Specs

- Facebook content, media rights, and source-of-truth inventory
- Information architecture, messaging, and conversion plan
- CorvaUI mint visual system and accessible site experience
- Static website implementation and social/donation integration
- Private preview, owner acceptance, and launch readiness
- Funded data platform and operational workflows
