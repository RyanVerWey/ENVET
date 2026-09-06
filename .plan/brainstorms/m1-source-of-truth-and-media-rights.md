---
created_at: "2026-09-06T02:22:59Z"
project: ENVET
slug: m1-source-of-truth-and-media-rights
status: active
title: M1 Source of truth and media rights
type: brainstorm
updated_at: "2026-09-06T02:24:24Z"
---

# Brainstorm: M1 Source of truth and media rights

Started: 2026-09-06T02:22:59Z

## Focus Question

Establish approved facts, social links, donation destination, and Facebook image inventory before writing site copy.
## Desired Outcome

Owner-approved content and media inventory that separates verified Facebook facts from claims, testimonials, and images needing consent.

## Vision

One trusted source file answers what ENVET is, who it serves, how to contact it, where donations go, and which real images may safely appear on the site.

## Supporting Material

- https://www.facebook.com/profile.php?id=100068209587248
- https://www.facebook.com/profile.php?id=100068209587248&sk=photos
- https://www.paypal.com/donate/?hosted_button_id=EK4AXP2E2WA5J

## Constraints

- Facebook is source material, not a runtime dependency.
- Preserve source URLs and capture dates.
- Treat identifiable adults, children, testimonials, and sensitive veteran context as approval-gated.

## Open Questions

- Which images and reviews have permission for reuse outside Facebook?
- Are current hours and appointment rules accurate?

## Ideas

- Crawl official Facebook About, Photos, and recent posts.
- Record source provenance, image subjects, consent risk, and owner approval state.
## Raw Notes

## Refinement

### Problem

Facts and authentic imagery exist, but are scattered across Facebook and include privacy, rights, freshness, and claim-verification risk.

### User / Value

Owner gets a reviewable evidence packet; later writers and designers get safe, approved source material.

### Appetite

Focused discovery milestone. No website implementation.

### Remaining Open Questions

Owner media permissions, approved eligibility wording, current hours, and testimonial consent.

### Candidate Approaches

Curated manual crawl with provenance and approval states; avoid automated live-feed dependency.

### Decision Snapshot

Inventory official Facebook About, Photos, and representative posts. Shortlist horses, farm, community, and activity images. Flag children and identifiable visitors for explicit consent.

## Challenge

### Rabbit Holes

Downloading every post, reproducing unrelated shared content, or building a permanent scraper.

### No-Gos

No unapproved face photography, testimonials, clinical claims, or sensitive veteran details.

### Assumptions

Page-owned About data is authoritative enough for owner review, not automatic publication.

### Likely Overengineering

Meta API integration and automated image classification.

### Simpler Alternative

Human-reviewed manifest of selected facts and 20 to 40 candidate images.

## Specs

- Document official organization facts and contact channels
- Inventory Facebook photos and posts with provenance
- Classify media privacy, consent, and copyright risk
- Obtain owner approval for content and media shortlist
