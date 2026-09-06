# ENVET design contract

## Direction and acceptance

The first review candidate was rejected as unprofessional. This revision supersedes its condensed signage typography, decorative stars, slogans and severe photo crops. The user additionally requested accented animation, tasteful glassmorphism, and a premium complete feel, allowing visual freedom beyond Corva basics. This remains a review candidate, not owner acceptance.

Brand voice: grounded, welcoming, steadfast. Physical reference: a carefully produced conservation nonprofit field guide, combining readable visitor information with real place-based photography. No magazine-italic affectation, military kitsch, fabricated impact figures, or clinical promises.

## Typography

Three reflex fonts Inter, Playfair Display and Space Grotesk were rejected. Source Sans 3 was selected from the Google Fonts catalog (https://fonts.google.com/specimen/Source+Sans+3): humanist, legible, with the character of clear public-facing visitor information. One variable family with deliberate weight and size contrast, self-hosted by Next.js. Sentence-case headings, 17–18px body text, 65–70ch prose, 1240px content width.

## Corva foundation and material

Actual @corvaui/tokens 0.2.1 mint-light/mint-dark semantics and @corvaui/react Button remain. Theme defaults to system preference and persists explicit selection locally. The prepaint script prevents a theme flash.

A visitor on a sunny farm reads mint light; someone browsing quietly in a dim room gets mint dark. Both preserve content, contrast and actions. Brand canvas is a mint-tinted OKLCH neutral, with deeper forest-tinted dark surfaces and committed mint participation/giving sections.

Glass is limited to the sticky navigation and a caption anchored to authentic hero photography. Both have opaque fallbacks. Supported browsers receive bounded backdrop blur, a restrained edge highlight and 88% opaque theme-aware material; no nested glass cards or glass body-copy panels.

## Layout and photography

Mission-first headline and two clear actions precede a wide photograph. Image framing protects the visible human interaction; caption sits low over the image, not over faces. Mission, visitor guidance, giving, journal, FAQ and contact sections have distinct compositions and purposeful spacing.

Header uses the official logo with the full organization identity, accessible theme control, navigation and donation link. Visit imagery appears before detailed instructions on mobile. Blog index has one featured guide followed by supporting resources. Article pages use readable text, sources, related reading and a desktop contextual sidebar.

Only local official Facebook assets are used. Image optimization and provenance remain unchanged. Do not infer age, veteran status, diagnosis or testimonial from photographs. All people/photo rights require owner clearance before production.

## Motion contract

No animation dependency or extra client-side motion bundle. CSS entrance choreography uses 650–750ms deceleration with at most 140ms stagger; the hero photograph settles from 1.035 scale. Navigation underlines, action arrows, native FAQ opening, menu and theme icons provide short interaction feedback.

Progressive scroll-linked section motion uses translation only, maintaining text contrast throughout the viewport entry. Article reading progress uses a thin navigation-edge indicator when scroll timelines are supported. Unsupported browsers retain the full static experience.

Reduced motion disables every animation/transition and restores normal scrolling. Content and links never depend on animation completion. No looping ambient motion, bounce, autoplay video, cursor tricks or scroll hijacking.

## Verification and gates

Responsive breakpoints: 1150, 960, 760 and 400px. Mobile navigation remains an inline disclosure with Escape and route-close behavior. Static semantic pages retain one h1, skip link, visible focus, native FAQ and verified external links.

See docs/verification.md for measured revision checks. Prior QA was technical evidence, not design acceptance. Owner approval, content/media rights, public deployment and funded-data decisions remain separate gates.
