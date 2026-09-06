# ENVET design contract

## Identity and context

Brand surface: an approachable digital front gate for veterans, families, and supporters. Physical reference: the clear lettering of a farm entrance sign and the open green space in ENVET’s actual photographs. Mint is an explicit user requirement, not a healthcare-category color inference. Owner design acceptance remains pending.

Three voice words: grounded, open, steadfast. Reflex fonts Inter, Playfair Display, and Space Grotesk were rejected. Barlow Condensed and Manrope were selected from the Google Fonts catalog: sign-like condensed headings paired with readable human-scale body text. Fonts are self-hosted by Next.js at build time, not fetched from Google by site visitors.

## Themes

Actual `@corvaui/tokens` 0.2.1 themes `mint-light` and `mint-dark`, with `@corvaui/react` Button used for the theme control. `data-corva-theme` lives on the root element. Default follows system preference; a user's explicit choice persists locally. Script executes before paint to avoid a theme flash.

Physical scene: a veteran reading on a phone in daylight benefits from mint light; a family member browsing in a quiet, dim room gets mint dark. Both receive the same content and controls.

Strategy: committed mint/green identity through natural photos, a mint-tinted feature surface, and a deep-green support section. Base colors use CorvaUI semantics. Additional brand surfaces use OKLCH; original black/white logo is preserved, not recolored.

## Typography and layout

- Display: Barlow Condensed 500/600/700; body: Manrope variable.
- Fluid headings and readable prose capped at 70ch.
- 1320px content maximum; 48px desktop and 20px mobile outer space.
- Asymmetric image-led hero, open story section, sequential visit guidance, full-bleed support section, useful journal, native FAQ.
- Official logo accompanies a readable wordmark. No invented replacement logo.
- Responsive transitions at 1150, 900, 760, and 380px. Mobile navigation uses an inline expanding region, not an overlay.

## Behavior

- CorvaUI theme control, native disclosure FAQ, semantic links, no fake donation amount selectors or booking forms.
- Visible focus, skip link, single h1 per page, meaningful landmarks, touch targets, and reduced-motion support.
- Small hover translations and image scale only; no autoplay, scroll hijacking, entrance delays, or layout animation.
- Phone/email/social/payment actions remain recognizable links. PayPal is clearly an external checkout.

## Photography

Only locally bundled photos observed on ENVET’s official Facebook page. Use `next/image` responsive sizes and AVIF/WebP optimization; hero image is prioritized. Review crops in desktop/mobile layouts so the horse and human interaction remain understandable. Never infer a person's veteran status, diagnosis, name, or testimonial from an image. Identifiable children are excluded from this build. Every public photo needs owner rights/consent clearance.

## Acceptance status

This is the implemented review direction, not an owner-approved final brand guide. See `docs/verification.md` for measured checks and `docs/launch-runbook.md` for the remaining acceptance gate.
