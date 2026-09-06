---
created_at: "2026-09-06T02:22:59Z"
project: ENVET
slug: m6-funded-data-and-growth-platform
status: active
title: M6 Funded data and growth platform
type: brainstorm
updated_at: "2026-09-06T02:24:24Z"
---

# Brainstorm: M6 Funded data and growth platform

Started: 2026-09-06T02:22:59Z

## Focus Question

After database funding, add privacy-safe intake, content operations, and measurement without destabilizing launched site.
## Desired Outcome

Funded, privacy-safe operational platform for intake, content, and measurement, added only where validated needs justify it.

## Vision

ENVET staff can manage requests and stories without exposing veteran data or creating an administrative burden.

## Supporting Material

- Production learnings and analytics from M5
- Owner-approved operating workflows

## Constraints

- Starts only after database funding and owner workflow approval.
- Minimize sensitive data; define retention and access before collection.
- Preserve static-site reliability where dynamic features add no value.

## Open Questions

- Database vendor, staff roles, intake fields, retention policy, integrations, and budget.

## Ideas

- Design data model, retention policy, authorization, and admin workflows.
- Evaluate CMS, scheduling, CRM, and donor integrations based on proven needs.
## Raw Notes

## Refinement

### Problem

Static links do not support structured follow-up, content operations, or reliable program measurement at scale.

### User / Value

Staff gain controlled workflows; veterans receive clearer follow-up; donors see approved impact reporting.

### Appetite

Incremental platform work after discovery, threat modeling, and schema approval.

### Remaining Open Questions

Compliance posture, data controller, breach process, CRM choice, payment reporting, and backup ownership.

### Candidate Approaches

Managed Postgres with least-privilege access, minimal intake records, admin workflow, and selective integrations.

### Decision Snapshot

Do not select or build platform before funding. Begin with workflow mapping and data minimization, then ship vertical slices.

## Challenge

### Rabbit Holes

Full CRM replacement, social network, custom payment processor, and speculative automation.

### No-Gos

No medical records, raw DD-214 uploads, broad admin access, indefinite retention, or unencrypted secrets.

### Assumptions

Operational demand and owner capacity will determine final feature order.

### Likely Overengineering

Modeling every future program before first structured intake workflow is proven.

### Simpler Alternative

One minimal intake/follow-up slice, then CMS and measurement only if needed.

## Specs

- Map operational workflows and minimize collected data
- Select funded database and approve security architecture
- Implement schema, migrations, authorization, and retention
- Build minimal service-request follow-up workflow
- Add owner-managed content workflow where justified
- Add privacy-safe donor and impact measurement
