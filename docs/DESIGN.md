# Design specification

## Direction
A confident, plain-spoken technology and office retailer. Reference feeling: a well-run specialist store, not a startup landing page. Products and facts lead; decoration follows only when it helps. Light theme only at launch.

## Color tokens (single source of truth: app/globals.css CSS variables, mapped into Tailwind theme)
Direction: **Slate & Cobalt**. Structure is blue-tinted slate, interaction is brand cobalt, offers are brand orange.

Neutrals
- ink: #0F172A (text, dark buttons, logo mark)
- ink-muted: #475569
- ink-subtle: #596575
- surface: #FFFFFF
- canvas: #F1F5F9 (product photo background, alternate sections)
- canvas-strong: #E2E8F0
- line: #E2E8F0 (hairline dividers), line-strong: #7F8C9E (control and input borders, hover outline — 3.4:1 on surface, 3.1:1 on canvas, so every control boundary meets WCAG 1.4.11)

Brand (primary interactive colour: buttons, links, active nav, focus rings, selected states, count badges)
- brand: #2563EB, brand-hover: #1D4ED8, brand-active: #1E40AF, brand-soft: #EAF1FE
- link / focus: #1D4ED8

Accent (offers, sale price, discount badges only — never on primary navigation or standard CTAs)
- accent: #C2410C, accent-hover: #9A3412, accent-soft: #FFF1E6

Status
- success: #0E7C46, warning: #B45309, danger: #CE2222 / danger-hover: #B91C1C (each with a -soft background tint)

Rules: every text token has at least 4.5:1 against surface and canvas; control borders have at least 3:1. Verify with a contrast checker whenever a token value changes. The accent appears on sale prices, discount badges, and at most one promotional element per screen. Brand cobalt carries interaction; it is not decorative, so never use it as a large background wash. No gradients anywhere except a plain solid-color scrim over photos when text sits on an image. No pure black or pure white text on tinted backgrounds. Brand color changes happen by editing the token values only.

## Typography
- Headings: Archivo (variable, via next/font), weights 600 and 700, letter-spacing -0.02em on display sizes, line-height 1.05 to 1.15.
- Body and UI: Public Sans (variable) for body, 16px base, line-height 1.6.
- Mono (SKU, model numbers, spec codes): IBM Plex Mono at 13px.
- Scale: display clamp(2.5rem, 5vw, 4.25rem); h1 clamp(2rem, 3.5vw, 3rem); h2 clamp(1.5rem, 2.4vw, 2rem); h3 1.25rem; body 1rem; small 0.875rem; micro 0.75rem.
- Prices: font-variant-numeric: tabular-nums, weight 600. On cards and lists drop ".00" for whole amounts; always show two decimals in cart, checkout, invoices and emails.
- Sentence case everywhere. No all-caps except micro labels at 0.75rem with 0.06em tracking, used sparingly.

## Layout
- Container max-width 1280px; gutters 16px mobile, 24px tablet, 32px desktop. 4px spacing scale; section rhythm in 8px multiples.
- Section vertical rhythm: 96px desktop, 72px tablet, 48px mobile; vary density (not every section the same).
- Product grids: 2 columns mobile, 3 tablet, 4 desktop (5 only on wide listing pages with filters collapsed).
- Prefer asymmetric two-column compositions for editorial blocks and strict grids for products.

## Shape and depth
- Radius: 4px (images, badges), 6px (buttons, inputs), 8px (cards, panels, dialogs). Nothing larger. No pill buttons (tiny count dots excepted).
- Borders: 1px solid line. Shadows only on floating layers (popover, dropdown, drawer, dialog, toast): Tailwind `shadow-layer` = 0 8px 24px rgba(15, 23, 42, 0.12); small overlays (tooltip, menu item) use `shadow-layer-sm`. No shadows on cards or panels at rest.
- Photo panels use the canvas color behind products. Images use object-fit contain for products, cover for lifestyle.

## Motion
- Durations: 120ms (hover, press), 200ms (UI state changes), 320ms (drawers, dialogs). Easing: cubic-bezier(0.2, 0, 1).
- Allowed: color/opacity/border transitions, drawer and dialog slide, image crossfade on product cards, underline reveal on nav links, add-to-cart confirmation, price change flash, count badge bump, skeleton fade (static, no shimmer sweep), scroll reveal ONLY for below-the-fold sections as a 200ms opacity plus 8px translate, once.
- Not allowed: infinite animations, parallax, tilt, cursor effects, bounce or spring overshoot, animation on the hero or LCP elements, animation longer than 400ms.
- Respect prefers-reduced-motion: reduce to opacity-only changes or none.

## Components (rules)
- Buttons: primary = brand background (`bg-brand`, hover `brand-hover`, active `brand-active`), white text, 6px radius, 44px min height (52px large); secondary = 1px line-strong border on surface, ink text; dark = ink background for high-contrast emphasis (logo, footer CTA); tertiary = text link with a small arrow icon; accent button only for a single offer CTA per page. States: hover (next token in the ramp, never a raw hex), active (pressed — 1px translate down is NOT allowed; use the darker token), focus (2px focus ring with 2px offset on surface), disabled (muted, with an explanation nearby), loading (label replaced by short progress text, width unchanged).
- Inputs: 44px height, 6px radius, 1px line-strong border, visible labels above fields (never placeholder-only), helper text below, errors in danger color with text (not color alone).
- Cards (product): no shadow, no border at rest on listing grids (the canvas photo panel is the card), 1px border on hover.
- Badges: 4px radius, small, one badge per product card maximum (priority: Sale, Low stock, New). Never decorative.
- Icons: one set (lucide-react), stroke width 1.5, sizes 16/20/24 only, ink or ink-muted. Never inside tinted circles or squares as a repeated feature pattern. No emoji.
- Dividers: 1px line. No decorative dividers.
- Toasts: bottom-right on desktop, bottom-center on mobile, plain text with one optional action.

## Imagery
- Product images: consistent neutral background, contain fit, aspect ratio 1:1 on cards (4:5 allowed on category tiles), second image crossfade on hover.
- Lifestyle images: real photography only. No AI-generated imagery. No gradient overlays except a solid-color scrim when needed for text contrast.
- Every image has meaningful alt text (product name plus view, e.g. "Logitech MX Keys, side view").
- Placeholders: flat canvas color with a small neutral icon, never a gradient or fake photo.

## Copy rules
- Plain, specific, factual. Sentence case. No em dashes. No exclamation marks (except at most one on the order-success page). No triplet taglines.
- CTAs: verb plus object ("Add to cart", "Checkout", "Shop chairs", "View specifications"). Never "Get started", "Learn more", "Explore", "Discover".
- No invented numbers, testimonials, ratings, logos, or urgency. Every fact shown must come from the database or settings.
- Error messages: say what happened and what to do next in one sentence.
- Banned words and phrases: seamless, elevate, unlock, unleash, supercharge, revolutionize, cutting-edge, state-of-the-art, next-level, game-changer, premium experience, curated, discover, journey, effortless, tailored, "whether you're", "in today's", "welcome to".

## Banned list (visual)
Purple/indigo/violet/pink gradients; gradient text; mesh/aurora/blob backgrounds; glow shadows; neon borders; decorative glassmorphism or backdrop blur; sparkle/rocket icons and emoji; a pill badge above hero headlines; three identical icon-in-tinted-square feature cards; everything-centered layouts; radii above 8px; pill buttons; hover lift with large shadow on cards; image zoom above 1.04 on hover; looping animations; parallax; unmodified shadcn default styling; generic stock or AI-generated images; wavy or dashed or gradient dividers; placeholder text left in; fake statistics, testimonials, ratings, logos, countdowns, "people viewing" notices; load-time popups.

## Review checklist (run before finishing any UI task)
1. Squint test: is the hierarchy obvious with the page blurred? 
2. Grayscale test: does it still work without color?
3. Does anything on the Banned lists appear (visually or in copy)? 
4. Is all text real and specific? Any invented facts?
5. Are spacing, radii, borders and type sizes taken from the tokens only?
6. Does it work at 375, 768, 1280 and 1920 px? Keyboard only? With reduced motion?
7. Is every interactive element at least 44px on touch and visibly focusable?
