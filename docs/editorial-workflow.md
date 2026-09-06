---
title: ENVET editorial and discovery workflow
updated: "2026-09-06T03:03:36Z"
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
