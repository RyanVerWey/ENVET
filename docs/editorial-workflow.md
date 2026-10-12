---
title: ENVET editorial and discovery workflow
updated: "2026-10-12T17:57:03Z"
---
# ENVET editorial and discovery workflow

## First release

Three practical guides are included for owner review: arranging a first visit, questions from families, and supporting the mission. They answer concrete questions from ENVET's actual visitor journeys. No medical advice, fabricated qualifications, testimonials, impact numbers, service guarantees, or tax-deductibility promises.

## Add or revise a guide

1. Create `content/blog/descriptive-slug.md` using the unpublished example as a template. Keep `published: false` until editorial review.
2. Fill all required fields: title, description, date, updated, category, author, image, imageAlt, published, and sources. Dates must be quoted ISO calendar dates. Slugs are lowercase words separated by hyphens.
3. Open with a direct answer to a real question. Add context, useful headings, the limits of the information, source links, and a relevant internal next step. Use the shared ENVET editorial byline unless a real author has agreed to be identified.
4. Verify facts against official sources and current owner guidance. A Facebook auto-generated image caption is not evidence of picture contents. Do not copy third-party posts or testimonials without a separate rights review.
5. Confirm image provenance and consent in `docs/media-manifest.json`. Publication in Facebook is not equivalent to a website release.
6. Owner approves final text and media. Set published true, keep the original publication date, and change updated only for substantive revisions.
7. Run lint, unit tests, build, typecheck, and local preview smoke tests. Review the article in both themes on mobile and desktop.
8. Merge/deploy only through the separately approved release workflow. New or scheduled content requires a rebuild; there is no runtime CMS or scheduler.

## Technical SEO

Static HTML includes unique titles/descriptions, one h1, semantic headings, visible FAQs, contextual internal links, and descriptive images. Article pages carry BlogPosting and BreadcrumbList JSON-LD; the shared layout defines NGO and WebSite identity. Canonical URLs are emitted only after the real HTTPS domain is approved. Sitemap includes published articles and category pages; modified dates reflect actual article revisions. RSS excludes drafts and future-dated articles. Unknown/draft routes are real 404s. Legacy service/legal/tax paths redirect.

Preview has robots disallow, noindex metadata and X-Robots-Tag, no canonical, and an empty sitemap/feed. These are indexing controls, not access control. Local loopback is the current private review method. Any future hosted review needs authentication/protection.

## AEO and GEO

Use answer-first sections, specific organizational facts, transparent authorship, genuine source references, consistent organization/contact information, and visible copy that matches structured data. Avoid fabricated FAQ or medical rich-result claims, keyword stuffing, doorway location pages, and hidden machine-only content. No ranking or AI citation outcome is guaranteed.

Google says its existing search fundamentals apply to AI features; it does not require a special AI schema or machine-only file. The site follows these fundamentals rather than adding speculative `llms.txt` or unsupported claims: [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features), [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

## After owner-approved launch

Verify the owned domain in Search Console, submit the sitemap, inspect the canonical/robots and representative article URLs, and monitor real query impressions before expanding content. Owner should confirm any business-profile information and service area. Analytics remains off until privacy and measurement choices are approved. Human review is needed for every new medical/legal/financial statement; this blog deliberately avoids that advice.

## Owner language and Contributing Organizations, October 12, 2026

Source: owner-supplied Pasted text.txt, attachment98679355-d362-4110-be40-a74f0f689a34; SHA2566d42e465f4ad2712f3e78e542fa1d3e82581a8382aefee83520f15dbf647b555. User requests their language where it fits. Direct follow-up confirms all five programs, professional teams and schedules are available, and requests generic Contributing Organizations for all eight names without specifying monetary contributions. This is owner-supplied content, not independent evidence of funding, certification or institutional endorsement.

Copy mapping: Home/About mission becomes calm/peaceful haven, Horse Heroes, free-of-charge donor-supported activities and therapies. Central audience preserves United States/partner-nation Veterans and adds Reserve Service Members, Families of Fallen Heroes, families/loved ones. /programs explains EFP, therapeutic horsemanship, pre/post deployment, family support during deployment and specialty workshops; community time/food is conditional on time permitting. Give page uses Thank you for standing with us, Horse Hero care, in-kind services/equipment/vehicles and contact-arranged tributes, not automated public tribute collection. All three journal guides updated2026-10-12 with current programs source/internal links and real original publication dates preserved.

Published five source-grounded service entries through existing versioned/audited staff_save_content after checking empty services and existing designated Google-confirmed staff. Atomic import refuses existing content; no overwrite, new schema/permissions/accounts or private record mutation. /programs reads only current published services, never falls back to the JSON import snapshot; managers can edit/archive and public pages respect it. content/programs.json is import provenance, not runtime fallback. Source clinical physiological/evidence-based claims are not adopted as outcome promises. EAGALA is described as a ground-based team model, not ENVET accreditation; professional-team availability is based on owner's direct confirmation. Primary model reference: https://www.eagala.org/about-us/what-is-the-eagala-model/ . No mounted EAGALA claim.

About has eight name/link entries under exact Contributing Organizations; Donate/footer link to the section. No fabricated grant amounts, contribution types, organizational biographies, logo rights, sponsorship tiers, accreditation badges or relationship structured data. Official destinations checked; WVU supplied degree-detail path unavailable, replaced by its official majors listing. GFAS uses working non-www standards URL; Corro uses official homepage rather than broken product search. SAFE official name is Save a Forgotten Equine, not the brief's Save a Forgotten Horse. Directory skill inspected but no vendor/provider selection, purchase or provisioning was performed; these are existing owner-supplied public reference links.

Preserved verified+1 540-504-8401, all social destinations, PayPal recipient, legal wording/versions and protected records. Do not replace phone with malformed501.54038401, use unverified DonorPerfect recipient, publish unverified EIN/tax-deductibility/registration claims, promise newsletters or assign the unnamed approved horse photo to Jellybean. Proposed arena fundraising, calendar, newsletter, board profiles/testimonials and retired/memorial profiles need separate source/workflow/rights detail; not silently built as placeholders. Existing staff-screening affiliation codes/version remain unchanged in this editorial scope; expanding Reserve-specific operational classifications is a separately versioned follow-up, not an inferred eligibility decision.

Corva/Source Sans identity preserved under Impeccable preflight; new numbered program rows/single-open disclosures and generous text-only contributor links, no generic sponsor-card grid. /programs included in nav/footer, sitemap and allowlisted page counts; visible ItemList follows current published services with no unsupported medical rich-result claims. Publication/deployment evidence recorded in verification/current-state notes.
## Managing acknowledgements

In the authorized Management dashboard, choose Contributing Organizations (/team/organizations). Add/edit the name, optional HTTPS website and factual plain-text description; set display order and Draft or Published, then Save organization. Only Published, nonremoved rows appear on Our story. Remove hides an entry with confirmation; Removed lists allow Restore as draft, followed by explicit review/publication. Entry IDs stay fixed and current versions prevent conflicting edits. Refresh and reopen the latest entry after any conflict or uncertain save; do not blindly repeat writes. Initial eight names/links are preserved as import provenance in src/lib/contributors.ts, not a runtime fallback. Do not add unsupported financial/credential/endorsement claims or unlicensed logos. See docs/data-workflow.md for authorization and retention boundaries.
