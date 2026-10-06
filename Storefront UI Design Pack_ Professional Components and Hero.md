# Storefront UI Design Pack: Professional Components, Hero, Effects and Interaction Feedback

A companion to the build pack. Run these prompts **after** the shop works (Steps 0 to 19 of the build pack at minimum), or any time you want to restyle it. Every prompt modifies the existing code and must keep behavior and tests passing.

**Goal:** a store that looks like it was designed by a retail design team with real photography and real content, not generated from a template.

"Reactions" in this pack means **interaction feedback**: how the interface responds when someone adds to cart, changes a quantity, saves a form, or when stock changes live. (Like/helpful-vote reactions on reviews are in the optional section.)

---

## 1. The anti-AI-tells rulebook

Most "AI-made" looks come from a small set of repeated patterns. This list is copied into the design spec in UI-0 so the agent treats it as a hard constraint.

**Visual tells (banned)**

- Purple, indigo, violet or pink-blue gradients. Gradient text. Mesh, aurora or blob backgrounds. Glow shadows. Neon borders.
- Glassmorphism (frosted blur cards) used as decoration.
- Sparkle icons, rocket icons, emoji used as icons or in headings.
- A small pill badge above the hero headline ("New", "Now live").
- Rows of three identical cards, each with an icon in a tinted rounded square, a bold title and two lines of text.
- Everything centered and symmetric. Every card the same radius, shadow and padding.
- Large radii (`rounded-2xl`, `rounded-3xl`) and pill buttons everywhere.
- Hover effects that lift every card (`translateY(-4px)` plus a big shadow) or zoom images to 110%.
- Looping float, pulse, shimmer or glow animations. Entrance animation on every element. Parallax. Cursor effects.
- Unmodified shadcn defaults (zinc theme, default radius, default look of every component).
- Generic stock photos, AI-generated images, mockup images with warped text or objects.
- Wavy SVG dividers, dashed borders, gradient borders, gradient dividers.
- Placeholder content left in: "Product Name", "$99.99", lorem ipsum, "Your text here".

**Trust tells (banned)**

- Invented statistics ("10,000+ happy customers"), testimonials with stock avatars, fake star ratings, "as seen in" logos, "trusted by" logo clouds of brands that are not customers.
- Fake urgency: countdown timers, "12 people are viewing this", "only 2 left" that is not tied to real stock.
- Popups on load: newsletter, discount wheel, chat bubbles other than a WhatsApp link.

**Copy tells (banned)**

- Words and phrases: seamless, elevate, unlock, unleash, supercharge, revolutionize, cutting-edge, state-of-the-art, next-level, game-changer, premium experience, curated, discover, journey, effortless, tailored, "whether you're a ... or a ...", "in today's fast-paced world", "welcome to".
- Em dashes in UI copy. Triplet taglines ("Fast. Reliable. Secure."). Exclamation marks (allowed once on the order-success page at most).
- Vague headings ("Find your perfect setup"). Use plain facts ("Office chairs", "Standing desks from GH₵ 2,400").
- Generic CTAs: "Get started", "Learn more", "Explore now", "Click here".

**What to do instead**

- Real product photography on a consistent neutral background, shot or supplied by the brand.
- One restrained palette: near-black ink, light neutral surfaces, one accent used only for offers. Hairline borders instead of shadows.
- Small, consistent radii (4 to 8 px). Tight, confident typography with tabular numerals for prices.
- Information density that shoppers want: price, key specs, stock, delivery and pickup facts.
- Motion that confirms an action and then gets out of the way.
- Asymmetric, editorial layouts where it helps, plain grids where products need comparing.

---

## 2. Before you start: assets (manual, this decides 60% of the result)

The UI can only look professional if the content is real. Prepare these first.

1. **Product photography.**
   - Ask your distributors and brands for official product images and spec sheets (resellers are normally allowed to use them). Otherwise shoot your own.
   - Standard: white or very light gray background (#F4F5F6), product centered with consistent margins, 2000 px on the long edge minimum, 3 to 6 angles (front, side, detail, in use, in the box), the same lighting and crop across a category.
   - For chairs and tables: include one straight-on and one three-quarter angle.
2. **Hero and lifestyle photography.** Photograph real products from your own stock in a real or staged workspace: a desk with monitor, keyboard and chair; natural light; 2400 px wide minimum. This becomes the hero and the "Shop the setup" image. Do not use AI-generated images or generic stock.
3. **Logo.** A clean wordmark as SVG (dark version and light version) and a square mark for the favicon. If you do not have one, set the shop name in the heading font with tight tracking as a temporary wordmark.
4. **Brand logos you stock** (monochrome SVG or PNG), only for brands you really sell.
5. **Real facts for the service strip:** delivery areas and timeframes, pickup hours, warranty length per category, payment methods accepted.
6. **Copy basics:** a one-line description of what the shop sells and where, and 5 to 8 category names.

**Reference sites to study for structure and restraint (do not copy):** Herman Miller (office furniture), Logitech and Framework (accessories and hardware), Apple (restraint and product focus), B&H Photo (information density).

---

## 3. How to use

1. Start every session with:

```
Read AGENTS.md, docs/DESIGN.md, docs/DECISIONS.md and docs/PROGRESS.md first. Follow docs/DESIGN.md strictly: any pattern on its banned list must not appear. Check the current official documentation for any library you use. Modify the existing code without changing business logic unless the task says so, keep all existing tests passing, and follow the end-of-task protocol in AGENTS.md. After finishing, take screenshots at 375, 768, 1280 and 1920 px widths of every page you touched, look at them, and fix anything that violates DESIGN.md before reporting.
```

2. One step per session, commit after each.
3. Run the **Visual QA loop** (utility prompts) after UI-7, UI-10, UI-11 and at the end.

### Step map

| Phase | Steps |
| --- | --- |
| Direction and system | UI-0 Design spec, UI-1 Tokens and base components, UI-2 Data model for merchandising |
| Interaction layer | UI-3 Buttons and calls to action, UI-4 Motion and interaction feedback, UI-5 Imagery, icons, logo |
| Navigation | UI-6 Header, mega menu, search palette |
| Home | UI-7 Hero, UI-8 Homepage sections |
| Catalog and product | UI-9 Product cards and listings, UI-10 Product page |
| Purchase flow | UI-11 Cart, checkout, confirmation |
| Supporting UI | UI-12 Forms and validation, UI-13 Empty, loading, error states, UI-14 Footer and content pages |
| Quality | UI-15 Copywriting pass, UI-16 Admin polish and hero editor, UI-17 Responsive and performance, UI-18 Accessibility, UI-19 Anti-AI-tell audit and final polish |

---

# PHASE 1: DIRECTION AND SYSTEM

## UI-0: Design specification

```
Create docs/DESIGN.md with the exact content below, and add a "UI RULES" section to AGENTS.md (and CLAUDE.md) that says: "All UI work must follow docs/DESIGN.md. Anything on its Banned list must not appear in code, copy or images. When in doubt, choose the plainer option. Before finishing any UI task, run the checklist at the bottom of docs/DESIGN.md."

=== docs/DESIGN.md content ===

# Design specification

## Direction
A confident, plain-spoken technology and office retailer. Reference feeling: a well-run specialist store, not a startup landing page. Products and facts lead; decoration follows only when it helps. Light theme only at launch.

## Color tokens (single source of truth: app/globals.css CSS variables, mapped into Tailwind theme)
- ink: #14181F (text, primary buttons)
- ink-muted: #5B6470
- ink-subtle: #8A929C
- surface: #FFFFFF
- canvas: #F4F5F6 (product photo background, alternate sections)
- canvas-strong: #E9EBED
- line: #E3E5E8 (hairline borders), line-strong: #CDD1D6
- accent: #D9480F (offers, sale price, discount badges only)
- accent-soft: #FDEEE6
- link / focus: #0A5CC2
- success: #1B7F4B, warning: #A15C00, danger: #C62828 (each with a -soft background tint)
Rules: the accent appears on sale prices, discount badges, and at most one promotional element per screen. No gradients anywhere except a plain solid-color scrim over photos when text sits on an image. No pure black or pure white text on tinted backgrounds. Brand color changes happen by editing the token values only.

## Typography
- Headings: Archivo (variable, via next/font), weights 600 and 700, letter-spacing -0.02em on display sizes, line-height 1.05 to 1.15.
- Body and UI: Public Sans (variable), 16px base, line-height 1.6.
- Mono (SKU, model numbers, spec codes): IBM Plex Mono at 13px.
- Scale: display clamp(2.5rem, 5vw, 4.25rem); h1 clamp(2rem, 3.5vw, 3rem); h2 clamp(1.5rem, 2.4vw, 2rem); h3 1.25rem; body 1rem; small 0.875rem; micro 0.75rem.
- Prices: font-variant-numeric: tabular-nums, weight 600. On cards and lists drop ".00" for whole amounts; always show two decimals in cart, checkout, invoices and emails.
- Sentence case everywhere. No all-caps except micro labels at 0.75rem with 0.06em tracking, used sparingly.

## Layout
- Container max-width 1280px; gutters 16px mobile, 24px tablet, 32px desktop. 8px spacing scale.
- Section vertical rhythm: 96px desktop, 72px tablet, 48px mobile; vary density (not every section the same).
- Product grids: 2 columns mobile, 3 tablet, 4 desktop (5 only on wide listing pages with filters collapsed).
- Prefer asymmetric two-column compositions for editorial blocks and strict grids for products.

## Shape and depth
- Radius: 4px (images, badges), 6px (buttons, inputs), 8px (cards, panels, dialogs). Nothing larger. No pill buttons (tiny count dots excepted).
- Borders: 1px solid line. Shadows only on floating layers (popover, dropdown, drawer, dialog): 0 8px 24px rgba(20,24,31,0.12). No shadows on cards at rest.
- Photo panels use the canvas color behind products. Images use object-fit contain for products, cover for lifestyle.

## Motion
- Durations: 120ms (hover, press), 200ms (UI state changes), 320ms (drawers, dialogs). Easing: cubic-bezier(0.2, 0, 0, 1).
- Allowed: color/opacity/border transitions, drawer and dialog slide, image crossfade on product cards, underline reveal on nav links, add-to-cart confirmation, price change flash, count badge bump, skeleton fade (static, no shimmer sweep), scroll reveal ONLY for below-the-fold sections as a 200ms opacity plus 8px translate, once.
- Not allowed: infinite animations, parallax, tilt, cursor effects, bounce or spring overshoot, animation on the hero or LCP elements, animation longer than 400ms.
- Respect prefers-reduced-motion: reduce to opacity-only changes or none.

## Components (rules)
- Buttons: primary = ink background, white text, 6px radius, 44px min height (52px large); secondary = 1px line-strong border, ink text; tertiary = text link with a small arrow icon; accent button only for a single offer CTA per page. States: hover (slightly lighter ink), active (pressed, 1px translate down is NOT allowed; use darker ink), focus (2px link-colored ring with 2px offset), disabled (muted, with an explanation nearby), loading (label replaced by short progress text, width unchanged).
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
```

**Verify:** `docs/DESIGN.md` exists; `AGENTS.md` links to it.

---

## UI-1: Tokens, typography and base components

```
Implement docs/DESIGN.md in code and restyle every base component. Do not change behavior.

1. app/globals.css: define all color tokens as CSS variables exactly as in docs/DESIGN.md and map them into the Tailwind theme (semantic names such as bg-surface, bg-canvas, text-ink, text-ink-muted, border-line, text-accent, bg-accent-soft, ring-focus). Remove the default shadcn zinc palette entirely. Radius tokens: 4, 6, 8 only; remove larger radius utilities from the codebase (search and replace rounded-xl, rounded-2xl, rounded-3xl, rounded-full except for count dots and avatars).
2. Fonts via next/font/google: Archivo (variable; weights 600 and 700 for headings), Public Sans (variable) for body, IBM Plex Mono for mono. Set display: swap, subsets latin, and fallback stacks. Apply heading styles globally (h1 to h4) with the scale and tracking from the spec. Enable tabular numerals through a `.price` utility and use it in the Price component.
3. Restyle each shadcn component in components/ui to the spec: button (primary, secondary, tertiary link, accent, destructive; sizes sm 36, md 44, lg 52; focus ring; loading state prop that keeps width), input, textarea, select, checkbox, radio-group, switch, label, badge, card, dialog, sheet, popover, dropdown-menu, tabs, table, accordion, breadcrumb, pagination, tooltip, alert, skeleton (static, no shimmer), sonner toasts (position and style per spec).
4. Create a single `/dev/design-system` page (only when NODE_ENV !== "production") that renders every component and state (default, hover is documented, focus, disabled, loading, error) plus the type scale, color swatches and spacing scale, so I can review the whole system on one page.
5. Global polish: `::selection` color using accent-soft with ink text; custom thin scrollbar for overflow areas (subtle, line-strong thumb); `scroll-behavior: smooth` only when reduced motion is not requested; `scroll-padding-top` equal to the sticky header height; `text-wrap: balance` on headings and `pretty` on paragraphs; consistent focus-visible ring for all interactive elements; remove default tap highlight color on mobile.
6. Replace every hard-coded color and arbitrary Tailwind value in the app with tokens (report any exceptions).
```

**Verify:** open `/dev/design-system`; the whole system looks cohesive; no default shadcn look remains.

---

## UI-2: Data model for merchandising (so the design stays editable)

```
Extend the data model and admin so the new design is fully editable without code. Add migrations where needed and keep the old data working.

SCHEMA CHANGES
- heroes (replaces siteSettings.hero): name (internal), variant ("split" | "fullbleed" | "spotlight"), eyebrow (optional plain text), headline, subtitle, primaryCta {label, href}, secondaryCta (optional {label, href}), imageId, imageAlt, focalPoint {x, y} (0 to 100, default 50/50), textTheme ("light" | "dark"), scrimOpacity (0 to 0.6, for fullbleed), hotspots (array up to 3 of {x, y, productId}), spotlightProductId (optional, for variant spotlight), offerLabel (optional, plain text), isActive, startsAt (optional), endsAt (optional), createdAt, updatedAt. Index by_active.
  Migration: internal mutation that converts the existing siteSettings.hero into the first heroes row, then remove hero from siteSettings.
- homeSections: type ("categoryTiles" | "productRail" | "promoSplit" | "shopTheSetup" | "brandStrip" | "serviceStrip" | "richText"), title (optional), config (object validated per type), isActive, sortOrder. Config shapes: productRail {source: "featured" | "newest" | "onSale" | "category" | "manual", categoryId?, productIds?, limit (4 to 12), viewAllHref?}; categoryTiles {categoryIds (up to 6), layout: "grid" | "feature"}; promoSplit {panels: two of {eyebrow?, title, text?, ctaLabel, ctaHref, imageId, imageAlt, theme}}; shopTheSetup {imageId, imageAlt, title, hotspots (up to 5) {x, y, productId}}; brandStrip {brandIds}; serviceStrip {items: up to 4 of {icon (from a fixed list of 12 lucide icon names), title, text}}; richText {title, markdown, imageId?, imageAlt?, imagePosition: "left" | "right"}.
  Seed a default arrangement: serviceStrip, categoryTiles, productRail (featured), promoSplit, shopTheSetup, productRail (newest), brandStrip.
- brands: name, slug, logoId (optional), isActive, sortOrder. Products get an optional brandId (keep the free-text brand for compatibility; the importer and admin form offer to link to a brand).
- products: add inTheBox (optional string array), warrantyMonths (optional number), and specs items get an optional `highlight` boolean (admin ticks up to 3 specs per product to show on cards and the product page summary).
- categories: add cardImageId (optional) and bannerImageId (optional).
- siteSettings: add paymentMethodsText (plain text such as "Card and mobile money via Paystack"), pickupLeadTimeText (e.g. "Ready within 2 hours during opening hours").

ADMIN
- /admin/homepage: ordered list of sections with drag-free up/down controls, an active switch, an "Add section" menu (one entry per type), edit and delete. Each section type has its own editor form with validation and image uploads. A "Preview homepage" link opens the real home page.
- /admin/brands: CRUD with logo upload and sort order.
- Product form: "Highlight" checkbox next to each spec row (max 3), "In the box" list editor, warranty months field, brand select linked to brands.
- Category form: card image and banner image uploaders.
- (The hero editor is built in UI-16; for now /admin/heroes can be a simple list/form so the data is usable.)

BACKEND
- Public queries: heroes.getActive (respects isActive plus startsAt/endsAt; falls back to the most recent active hero; returns image URLs and hotspot product summaries), homeSections.listActive (hydrated: products, categories, brands with image URLs), brands.listActive.
- All admin mutations: requireAdmin, validated, image checks, audit logging (Step 25 of the build pack), and storage cleanup.
- Update docs/SCHEMA.md and docs/PROGRESS.md.
```

**Verify:** the old hero data is migrated; sections can be reordered and toggled in admin.

---

# PHASE 2: INTERACTION LAYER

## UI-3: Buttons and calls to action

```
Build a complete, consistent call-to-action system. Follow docs/DESIGN.md (no pill buttons, no gradients, no glow, copy rules).

1. Button component final API: variant (primary | secondary | tertiary | accent | destructive), size (sm | md | lg), `loading` (replaces the label with short progress text and keeps width), `asChild` for links, optional leading or trailing icon (arrow-right for tertiary links, 16px, moves 2px on hover over 120ms), `fullWidth`. Disabled buttons never rely on a tooltip alone: when disabled for a reason (out of stock, invalid form), render the reason as small text near the button.
2. AddToCartButton: a self-contained component with states idle -> adding -> added -> idle. Adding shows "Adding". Added shows a check icon and "Added" for 1.5 seconds, then returns to "Add to cart". It announces the result to screen readers with aria-live. While out of stock it renders a disabled "Out of stock" button plus a secondary "Ask about availability" link (WhatsApp). Prevent duplicate submits.
3. QuantityStepper: minus, numeric input, plus; 44px touch targets; clamps to min 1 and max available or max per line; shows "Max available" helper text when clamped; keyboard arrow support; no layout jump when digits change width.
4. StickyBuyBar (product page, mobile only): appears after the main buy box scrolls out of view; contains name (truncated), price and the AddToCartButton; hides when the cart drawer or keyboard is open; respects safe-area insets.
5. Link CTA component ("ArrowLink"): text link with underline offset, arrow icon, used for "Shop chairs", "View all", "View specifications". Underline is always visible on focus and on hover; at rest only under body-copy links.
6. Promo CTAs: define a PromoCTA pattern (text plus one button) used by banners and the announcement bar. The announcement bar is a single line with an optional ArrowLink, dismissible, and never animated.
7. Copy audit: replace every CTA in the app with specific verb plus object labels (list all replacements in docs/PROGRESS.md). Remove any "Get started", "Learn more", "Explore", "Discover", "Shop now" (use the category or product name instead).
8. Rules to enforce in code review: one primary button per view region; at most one accent button per page; no icon-only buttons without aria-label; hit area at least 44px.

Add these components to /dev/design-system with all states.
```

---

## UI-4: Motion and interaction feedback ("reactions")

```
Create a small motion system and wire interaction feedback across the store. Prefer CSS transitions and the View Transitions-free approach; you may add the `motion` library ONLY for the gallery and drawers if CSS cannot do it cleanly (state this choice in docs/PROGRESS.md). Follow the Motion rules in docs/DESIGN.md exactly.

1. Motion tokens in CSS variables (durations 120/200/320ms, easing cubic-bezier(0.2, 0, 0, 1)) and a `useReducedMotion` hook; under reduced motion, all transforms are removed and only instant or opacity changes remain.
2. Reveal component `Reveal` for below-the-fold sections only: 200ms opacity plus 8px translate, once, triggered by IntersectionObserver with a 10% threshold; never wrap the hero, header or anything in the first viewport.
3. INTERACTION FEEDBACK (implement each, no extras):
   a. Add to cart: the button state sequence from UI-3, the header cart count does a single 200ms scale bump (1 to 1.15 to 1), and the cart drawer opens ONLY if the user preference setting "Open cart after adding" is on (default: show a toast with a "View cart" action instead, which is less intrusive). Provide the preference in /account/profile and localStorage for guests.
   b. Quantity change: line total and subtotal update with a 120ms background flash (accent-soft for price decreases, canvas-strong for increases). No number-counting animations.
   c. Remove from cart: line collapses (height transition 200ms) with an "Undo" toast for 5 seconds that restores it.
   d. Live stock changes (Convex is reactive): if an item's availability changes while the user is viewing it, update the stock text in place with a brief highlight and a polite aria-live message ("Only 2 left"); if it sells out, the buy button transitions to the out-of-stock state without a layout jump.
   e. Price changes while viewing: flash the price and show a one-line note "Price updated".
   f. Form feedback: field-level validation on blur; the first invalid field receives focus on submit; success shows a check on the submit button for 1.5s; server errors appear in an inline alert above the button, not only as toasts.
   g. Copy-to-clipboard (order number, address): the label changes to "Copied" for 1.5 seconds.
   h. Navigation: link underline reveal (120ms), active nav item indicator as a 2px bottom border, page transitions none (instant), route-change top progress bar (2px, ink color, no spinner) using a minimal implementation.
   i. Product card hover (pointer devices only, `@media (hover: hover)`): crossfade to the second image over 200ms (if present), border appears, quick-add button fades in; no lift, no shadow, no scale above 1.02.
   j. Gallery: thumbnail click crossfades the main image (200ms); lightbox opens with a 200ms fade; swipe on touch with momentum from native scrolling (scroll-snap).
   k. Drawers and dialogs: slide or fade 320ms, focus is trapped and returned, background scroll locked, Escape closes.
   l. Skeletons: static canvas-colored blocks that fade to content (200ms); no shimmer sweeps.
4. Remove every other animation in the codebase (search for animate-, transition-, keyframes and justify or delete each one). Report what was removed.
5. Add a motion section to /dev/design-system demonstrating each interaction with a replay button, and a toggle to simulate reduced motion.
```

**Verify:** nothing moves unless the user did something; reduced-motion mode removes transforms.

---

## UI-5: Imagery, icons and logo

```
Create the visual asset layer.

1. Logo: add a Logo component that renders the SVG wordmark from /public/brand (logo-dark.svg, logo-light.svg, mark.svg). If the files do not exist yet, render the shop name in Archivo 700 with -0.03em tracking as a placeholder wordmark and add a TODO note in docs/PROGRESS.md. Generate favicon.ico, apple-touch-icon and web manifest icons from mark.svg (or a simple typographic monogram placeholder).
2. Icons: standardize on lucide-react with strokeWidth 1.5 and sizes 16, 20 and 24 via an Icon wrapper. Remove icon-in-tinted-circle patterns and any emoji from the UI. Create a fixed `iconMap` of the 12 icons allowed in admin-editable sections (truck, store, shield-check, credit-card, headset, package, wrench, clock, map-pin, phone, badge-check, rotate-ccw).
3. Image components:
   - ProductImage: contain fit on canvas background, 1:1 default, optional second image for hover crossfade, `sizes` prop, fade-in on load (200ms) over the canvas color to avoid flashes, alt text built from product name and view index.
   - EditorialImage: cover fit with focalPoint support (object-position from x/y percentages), fixed aspect ratio to prevent layout shift.
   - Placeholder: flat canvas color with a small neutral icon, no gradient.
4. Image delivery: configure next/image formats ["image/avif", "image/webp"], sensible device sizes, and `quality` 80. Make sure every image has explicit dimensions or a fixed aspect-ratio container (CLS must be 0).
5. Admin guidance in the ImageUploader: show recommended dimensions and background for each use (product 2000px, background light gray; hero 2400 x 1350; category card 1200 x 1500; promo panel 1600 x 1200) and a small checklist ("neutral background", "no text in the image", "product fills 80 percent of the frame").
6. Add a script `npm run check:images` that scans seeded and uploaded product images for missing alt data and reports products without at least two images.
```

---

# PHASE 3: NAVIGATION

## UI-6: Header, mega menu and search palette

```
Rebuild the header and navigation to a professional retail standard. Follow docs/DESIGN.md. Do not change search backend logic except adding fields to the suggest query as listed.

HEADER STRUCTURE (desktop):
- Utility bar (height 36px, canvas background, 13px text): left side shows real facts from settings (pickup lead time and delivery summary, one line); right side shows phone, WhatsApp link, "Track order" link. Hide on mobile (these facts move into the menu drawer).
- Main bar (height 72px, white, bottom hairline): logo left; wide search field in the center (44px, 6px radius, canvas background, placeholder "Search products, brands, SKUs", with a keyboard hint "/" at the right on desktop); right side: Account, Wishlist is NOT included, Cart (icon with count).
- Category bar (height 48px, bottom hairline): top-level categories as text links with a 2px underline reveal on hover and active; "All categories" first. Only the real categories; no invented links.
- Behavior on scroll: the utility bar scrolls away; the main bar and category bar stay and compress (main bar 72px to 60px) with a hairline, no shadow, no blur. Total sticky height is exposed as a CSS variable for scroll-padding.

MEGA MENU (desktop):
- Opens on hover with a 120ms intent delay and on keyboard focus/Enter; closes on Escape or pointer leave with a short delay.
- Panel (white, hairline border, shadow per spec) shows: left, the subcategory list in 2 or 3 columns with product counts in muted text; right, a feature block with the category card image, its name and an ArrowLink "Shop {category}"; under the subcategories, a row of up to 6 brand names that sell in that category (text links to a filtered listing, no logo clouds).
- Fully keyboard accessible with correct aria attributes (disclosure pattern), no focus traps.

SEARCH PALETTE:
- Clicking the search field or pressing "/" or Cmd/Ctrl+K opens an overlay command palette (dialog, top-aligned, 640px wide) with: recent searches (localStorage, up to 5, clearable), live suggestions grouped as Products (thumbnail, name, brand, price, stock state), Categories, and Brands; arrow-key navigation, Enter to open, Escape to close; "See all results for 'q'" row at the bottom.
- Debounce 150ms; show a plain text "No matches for 'q'" with the three most popular categories as links when empty.
- Extend products.suggest to return thumbnail URL, effective price, and availability; add categories and brands to the suggest response (small limits).

MOBILE:
- Header: menu button, logo, search icon button (opens the palette fullscreen), account icon, cart icon. 56px tall.
- Menu drawer: full-height sheet; top area has sign-in/account link; accordion of categories with subcategories; below, plain links (Track order, Delivery and returns, Contact) and the real contact facts (phone, WhatsApp, pickup hours). Close on route change.
- Bottom safe-area padding on iOS.

ACCESSIBILITY: skip link, landmarks (header, nav with aria-label), visible focus, 44px targets, reduced motion respected.
```

---

# PHASE 4: HOME

## UI-7: The hero section

```
Rebuild the home page hero. It must be the best-looking and best-performing part of the site, and it must contain no AI tells (see docs/DESIGN.md). Data comes from the `heroes` table (UI-2). Do NOT animate the hero (it contains the LCP element). Implement three variants selectable in admin: "split" (default), "fullbleed", "spotlight".

SHARED RULES
- Height on desktop: clamp between 520px and 680px, never taller than 100svh minus the sticky header, so the next section peeks above the fold at 1440x900.
- The hero must render fully on the server with no client JavaScript required for the main content. Hotspots are the only client-side interaction.
- Headline max 60 characters, subtitle max 140, CTA labels max 24 (enforced in admin and defensively truncated in the UI).
- Headline uses the display size and tracking from the spec, `text-wrap: balance`, max-width about 12 words but designed for 4 to 8. Subtitle is 18px, ink-muted, max-width 44ch.
- Primary CTA: large primary button (52px). Secondary CTA: ArrowLink (tertiary), not a second heavy button.
- Under the CTAs, one line of real facts (small, ink-muted) assembled from settings: pickup lead time and the delivery summary from active zones (for example "Pickup within 2 hours during opening hours. Delivery in 1 to 3 days."). Omit the line if the data is missing. No invented claims.
- Optional eyebrow: plain small-label text above the headline (no pill, no border, no background).
- Optional `offerLabel`: a plain rectangular label (4px radius, accent-soft background, accent text) placed at the bottom-left of the image, for example "Standing desks from GH₵ 2,400". The price must be computed from real data when the admin selects a category source; never hand-typed numbers in code.

VARIANT: SPLIT (default)
- 12-column grid inside the container. Text block spans columns 1 to 5, vertically centered. The image panel spans columns 6 to 12 and BLEEDS to the right edge of the viewport (cap its max width on screens wider than 1920px and center the whole composition).
- Image panel: canvas background, object-fit cover with the focal point from admin, 4px radius only on the left corners (or none when bleeding), fixed aspect ratio about 4:3 on desktop so there is no layout shift. The image is `priority`, `fetchPriority="high"`, `sizes="(min-width: 1024px) 58vw, 100vw"`, AVIF/WebP, quality 80, and fades in over the canvas color (200ms) only after load.
- HOTSPOTS (up to 3): 28px circular buttons with a plus icon (ink background, white icon, white 2px ring) positioned by percentage; on hover, focus or tap, open a compact popover card (thumbnail, name, price, ArrowLink "View product"). Fully keyboard operable, closes on Escape, one open at a time, aria-expanded and labels. Below 1024px, hotspots are replaced by a plain list under the image titled "In this setup" with thumbnail, name and price rows.
- Below 1024px: stack with text first, then CTAs, then facts, then the image (aspect 4:5 or 1:1). The primary CTA must be fully visible without scrolling on a 375x667 screen (compact headline at 36 to 40px, subtitle max 2 lines).

VARIANT: FULLBLEED
- Full-width cover image with the focal point. A SOLID scrim over the left side only, color ink at the admin-set opacity (0 to 0.6), no gradients or colored glows. Text uses `textTheme` (light text on dark scrim). The text block sits in the container, left aligned, max 5 columns.
- Admin preview shows a contrast warning if the computed contrast between text and the scrimmed image area samples falls below 4.5:1; code samples the region with a canvas on the client in admin only.
- Mobile: image on top at 4:5, text below on the surface color (do not place text over the photo on small screens).

VARIANT: SPOTLIGHT
- One product from `spotlightProductId`: left side shows brand (small label), product name as the headline, a highlighted spec line (first two highlight specs), price (with sale price treatment) and two actions: "Add to cart" (AddToCartButton) and ArrowLink "View specifications". Right side shows the product image on the canvas panel with generous padding, contain fit, second image shown as a small thumbnail below the main one. Out-of-stock products render the disabled state and a link to similar products in the same category.

NO-IMAGE FALLBACK
- If the hero has no image, compose a typographic hero on the canvas color with an asymmetric collage of up to 4 real featured product images (contain fit, different sizes, aligned to a grid, hairline borders). Never use a gradient or placeholder illustration.

DIRECTLY BELOW THE HERO
- Service strip: a single row of up to 4 items separated by hairline dividers (not cards): icon 20px, a short title (for example "Pickup in store") and one line of detail, all from the `serviceStrip` section settings. On mobile it becomes a 2x2 grid.

QUALITY GATES (verify and report numbers)
- Lighthouse mobile: LCP under 2.5s on a throttled 4G profile, CLS 0, no layout shift when the image loads, hero text visible before the image.
- Check at widths 360, 390, 768, 1024, 1280, 1536, 1920 and 2560, and at 200% browser zoom: no overlap, no cut-off text, CTA visible, image focal point preserved.
- Keyboard: tab order is headline CTA, secondary link, hotspots; focus rings visible. Screen reader: hero image alt is meaningful, hotspots have labels like "Product: Logitech MX Keys, GH₵ 899".
- Reduced motion has no effect because the hero has no motion; confirm.
- Take screenshots of all three variants at 375, 1280 and 1920 and look critically: if it resembles a generic SaaS landing page, redo the composition.
```

**Verify:** run the Visual QA loop on the home page; test all three variants with real photos.

---

## UI-8: Homepage sections

```
Build the section components rendered by `homeSections.listActive`, in the order set in admin. The home page becomes: Hero, then sections. Follow docs/DESIGN.md. Use `Reveal` only for sections below the first viewport. All data comes from the database; hide any section that has no data.

1. ServiceStrip: (already used under the hero) reusable; hairline-divided row; no cards, no tinted icon squares.
2. CategoryTiles: layout "grid" = 2 columns mobile, 3 desktop, equal tiles (4:5 image on canvas, name below, product count in muted text); layout "feature" = one large tile (spans two columns and two rows on desktop) plus smaller tiles, asymmetric and aligned to the grid. Hover: image scales to 1.02 over 200ms and the name gets an arrow icon; no overlays or gradients. Uses category cardImage, falling back to the first product image, then Placeholder.
3. ProductRail: horizontal scroll-snap rail on mobile and tablet (peek of the next card, no visible scrollbar), a grid of 4 on desktop when limit is 4 or a rail with arrow buttons (44px, disabled at ends) when the limit is more than 4. Header row: section title (h2) left, ArrowLink "View all" right. Sources: featured, newest, onSale, category, manual. Cards are the final ProductCard from UI-9.
4. PromoSplit: two panels side by side on desktop (stacked on mobile), each with a photo (cover with focal point), a solid-color text area or text over a solid scrim, an optional small-label eyebrow (plain text), title, one sentence, and one ArrowLink or secondary button. Panels differ in size or alignment (for example 7/5 columns and 5/7 on the next instance) to avoid a templated look. 8px radius at most.
5. ShopTheSetup: a large lifestyle photo (cover, focal point) with up to 5 hotspots using the same hotspot component as the hero, plus a title and a product list beside or below it (thumbnail, name, price, add button for each) so the whole setup can be added to the cart with one "Add all to cart" button (skips items that are out of stock and reports them). Mobile: photo then list.
6. BrandStrip: a single row of monochrome logos (grayscale, opacity 0.7 to 1 on hover) for brands marked active; falls back to plain text names in the heading font when a logo is missing. Each links to the brand listing (/brand/[slug], create this page: it reuses the category listing with a brand filter and brand header). Never include a brand that is not stocked.
7. RichText: image and markdown text side by side (alternating position), used for things like "Why buy office chairs from us", with real facts only. Max width 60ch for text.
8. Remove the old hard-coded home sections (trust strip with icon cards, "Why shop with us" block, generic CTA banner).
9. Vertical rhythm: sections alternate between surface and canvas backgrounds only where it helps, with 96px spacing on desktop, and no two consecutive sections share the same layout.
10. Empty catalog state: if there are no products yet, show a plain message for the admin ("Add products in the admin area") and a minimal storefront for visitors, not a broken page.
```

---

# PHASE 5: CATALOG AND PRODUCT

## UI-9: Product cards and listings

```
Redesign ProductCard and the listing pages (category, brand, search). Keep all existing query logic.

PRODUCT CARD
- Structure: image panel (1:1, canvas background, contain fit, 12px inner padding), then below: brand (small label), name (max 2 lines, 15px, weight 500, links to the product), highlight specs as one muted line (first two highlight specs joined with a middle dot, truncated), then price row: current price (weight 600, tabular numerals); when on sale show the original price struck through in muted color and "-X%" as a small accent text (not a heavy badge).
- Badge: at most one, top-left over the image: "Sale" (accent-soft/accent), "Low stock: 3 left" (warning-soft, only when 1 to the low-stock threshold, tied to real availability), or "New" (canvas-strong; products created in the last 14 days). Out of stock products show a muted "Out of stock" label instead of a badge and the image at 60% opacity.
- Hover (pointer devices): second image crossfade, 1px border, quick-add button fades in at the bottom of the image panel (AddToCartButton compact, full width of the panel). On touch devices the quick-add is a compact 44px icon button at the bottom-right of the image panel that is always visible.
- No shadows, no lift, no scale above 1.02. Entire card clickable via a stretched link pattern while keeping the quick-add focusable and separate.
- Skeleton variant matching the exact layout.

LISTING PAGES
- Header: category name (h1), a one-sentence real description from the category, breadcrumbs, and the product count. If the category has a banner image, show it as a slim banner (height 160 to 240px) with the title over a solid scrim, otherwise just typographic.
- Toolbar: left shows the result count and active filter chips (removable); right shows the sort select and a grid density toggle (3 or 4 columns on desktop). On mobile: two sticky buttons "Filter" and "Sort" at the top of the list opening bottom sheets.
- Filter panel: collapsible groups with counts (Price range with two inputs and a slider, Brand with a searchable checkbox list, Availability, On sale, plus category-specific spec filters for the top 3 highlight spec labels of the category if values are consistent, e.g. "Switch type"). Show "Clear all" and live result count on the Apply button in the mobile sheet. Keep the URL-state behavior.
- Pagination: numbered pagination with previous/next, "Showing 1 to 24 of 187 products", and scroll to the top of the grid on page change.
- Subcategory chips shown as simple outlined links (6px radius, not pills).
- Sort options and filter labels use plain language.
- Empty state: a plain explanation, the active filters listed, a "Clear filters" button, and links to two related categories.
- Loading: skeleton grid matching card layout; keep filter panel stable while loading (no layout jump).
- Performance: first row of images `priority` on the first 4 cards only, the rest lazy; correct `sizes`.
```

---

## UI-10: Product detail page

```
Redesign /product/[slug] to a professional retail standard. Keep existing data logic and JSON-LD.

LAYOUT (desktop): two columns, gallery left (about 58%), sticky buy box right (about 42%, sticky below the header with correct offset). Mobile: gallery full-width, then buy box, then content; StickyBuyBar from UI-3 appears after the buy box scrolls away.

GALLERY
- Vertical thumbnail rail on desktop (left of the main image, scrollable if more than 6), horizontal scroll-snap strip on mobile with dot-free pagination text "2 / 6".
- Main image: contain on canvas, aspect 1:1 (or 4:5 for chairs and tables via a category setting if present), hover zoom on desktop (2x magnifier lens inside the image, no overlay animation), click opens the lightbox (full-screen, arrow keys, swipe, pinch zoom on touch, close button, focus trap, counter).
- Image fades between views over 200ms; preload the next image; first image `priority`.

BUY BOX
- Order: breadcrumb (above the columns), brand (link to the brand page), name (h1, display-adjacent size), SKU and model in mono small text, highlight specs as a short bullet list (max 3, plain), price block (current price large and tabular; original struck through and "You save GH₵ X (Y%)" in accent text when on sale), availability line with a small colored dot (success, warning, danger) and text from real availability ("In stock", "Only 3 left", "Out of stock"), pickup availability line ("Ready for pickup today at {location}" ONLY if in stock and within opening hours; otherwise "Ready for pickup from {next opening}" using pickupLeadTimeText and opening hours from settings), quantity stepper, AddToCartButton (large) and a secondary "Buy now" button, then a compact DeliveryEstimator.
- DeliveryEstimator: a select of active delivery zones that shows the fee and the estimated time for the selected zone (remember the choice in localStorage and reuse it at checkout), plus a note about pickup. No fake dates.
- Warranty line from warrantyMonths if set ("12 months warranty"), plus a link to the Warranty page.
- Payment methods line from settings.paymentMethodsText.
- Secondary actions as text links with icons: "Ask on WhatsApp" (prefilled message), "Copy link", "Print specifications".

CONTENT BELOW (full width, anchored section nav that sticks under the header on desktop: Overview, Specifications, In the box, Delivery and returns)
- Overview: markdown description, max 70ch, with real headings only if the admin wrote them.
- Specifications: two-column table with hairline rows, grouped when labels have a "Group: Label" convention (split on the first colon in the label), mono font for values that look like codes, and a "Copy specifications" action.
- In the box: simple list from inTheBox (hidden when empty).
- Delivery and returns: short summary assembled from settings and linking to the full page.
- Related products: ProductRail (4 items) titled "More in {category}", then Recently viewed (if any).

STATES
- Out of stock: disabled buy button with the reason, a "Notify me" is NOT built (avoid fake promises); offer "Ask about availability" on WhatsApp and a rail of in-stock alternatives from the same category sorted by price proximity.
- Inactive or missing: 404 with search and category links.
- Live updates: price and stock changes update in place with the feedback rules from UI-4.

Keep JSON-LD, metadata and breadcrumbs. Verify the page at 375, 768, 1280 and 1920 widths.
```

---

# PHASE 6: PURCHASE FLOW

## UI-11: Cart, checkout and confirmation

```
Redesign the purchase flow for clarity and trust, with no fake trust signals. Keep all business logic.

CART DRAWER
- Slides in from the right (width 420px desktop, full width mobile), 320ms. Header "Cart (3)" and a close button. Each line: ProductImage thumbnail (64px), name, brand, key spec, quantity stepper, line total, remove ("Remove" text button, with the undo toast).
- Footer: subtotal, a line "Delivery or pickup is chosen at checkout", free delivery progress (a plain 4px bar in ink on line color with text "GH₵ 150 more for free delivery") only when a threshold exists, primary "Checkout" button (large) and a tertiary "View cart" link.
- Issues (out of stock, reduced stock, unavailable) appear as inline danger-soft rows with a plain explanation and the fix action ("Remove", "Reduce to 2").
- Empty state: one sentence, and links to the three top categories.

CART PAGE: two columns (lines left, order summary right, sticky). Same issue handling. Under the summary: payment methods text and a link to Delivery and returns.

CHECKOUT
- Single page, two columns. Left: numbered sections with clear headings (1 Contact, 2 Delivery or pickup, 3 Review) that collapse to a one-line summary with an "Edit" link when completed (progressive disclosure); on mobile the order summary is a collapsible bar at the top showing the total.
- Fulfillment choice: two large selectable panels (radio semantics, 8px radius, 1px border that becomes 2px ink when selected, with a check icon), "Delivery" showing the fee range and typical time, "Pickup in store" showing "Free" and the lead time text.
- Delivery zone select shows fees inline. Pickup locations are selectable panels with address, phone, hours, and a map link.
- Phone input has the country code prefix visible and accepts local formats; helper text explains why it is needed ("For delivery and pickup updates").
- Order summary (right): lines with thumbnails, quantities, subtotal, delivery fee (updates immediately), total (large, tabular), tax note from settings, a note that the order is held for N minutes after placing, and the primary button "Pay GH₵ 1,299.00" (amount in the label, updates live) with a short line below: "You will be redirected to Paystack to pay by card or mobile money." No lock-icon clouds or fake security badges; a single small lock icon beside the line is fine.
- Errors from the server (stock changes) appear as a single alert at the top of the form with links to the affected cart lines; the form data is preserved.
- Processing state: the button shows "Preparing payment", the page is non-interactive, with no spinner animation beyond the button state.

PAY AND CONFIRMATION PAGES
- Pay page: order summary, the amount, and a prominent "Pay now" button plus "Cancel order" tertiary link.
- Confirmation page (paid): a clear heading "Order {number} is confirmed" (no exclamation marks except none), a two-column summary (items, totals; fulfillment details), a plain "What happens next" ordered list with 3 to 4 steps specific to delivery or pickup (using real hours and zone times), buttons "Track order" and "Continue shopping", "Print receipt", a copy button for the order number, and the shop's phone and WhatsApp.
- Processing and failed states: plain explanation, retry button, and contact options.
- Everything printable: provide a print stylesheet for the receipt (no header/footer, black on white).

EMAILS
- Restyle the email templates from the build pack to match: white background, ink text, a single accent used for the order number or call to action link, Archivo-like system font fallback, hairline dividers, no images except the logo, no emojis, and copy following docs/DESIGN.md.
```

---

# PHASE 7: SUPPORTING UI

## UI-12: Forms and validation

```
Standardize every form (sign in, sign up, checkout, account, contact, admin forms) on one pattern.

1. FormField component: label above, optional hint, input, error text; consistent spacing (8px label gap, 4px hint gap, 24px between fields); required fields marked with a plain "Required" in the hint only when most fields are optional; otherwise optional fields marked "(optional)".
2. Validation timing: on blur for the first time, then on change after the first error; on submit focus the first invalid field and show a one-line summary above the form for forms longer than 5 fields.
3. Error copy: plain and specific ("Enter a valid email address", "Password needs at least 8 characters including a letter and a number"). No red-only signals: error text plus an icon.
4. Input details: autocomplete attributes (name, email, tel, street-address, address-level2, etc.), inputmode for phone and numbers, correct types, no autocapitalize on email, password show/hide button with a visible label for screen readers, caps-lock hint.
5. Submit buttons: loading text ("Saving", "Placing order"), disabled while pending, success check for 1.5s where it makes sense.
6. Phone field: PhoneInput with a fixed country-code prefix select (default from settings), formatting on blur, normalized value on submit.
7. Address fields: consistent order and labels across checkout, account and admin.
8. Select and combobox: keyboard friendly, 44px, with search for long lists (regions).
9. Auth pages redesign: two-column on desktop (left: the form; right: a real product or workspace photo on canvas with a short factual line about the shop, not a testimonial), single column on mobile; plain headings ("Sign in", "Create an account"), Google button with the official Google "G" mark styled per Google's branding guidelines, a hairline "or" divider.
10. Update /dev/design-system with every field state.
```

---

## UI-13: Empty, loading and error states

```
Design every non-happy-path state to the same standard as the happy path.

1. Empty states (cart, orders, addresses, search, category, admin tables): one-line explanation, one clear action, no illustrations or mascots; use a 24px muted icon at most. Write the copy specifically for each context.
2. Loading: skeletons that match the final layout exactly (card grid, product page, table rows, checkout summary), static canvas blocks, a 200ms fade into content, and minimum display time of 150ms to avoid flashes. Buttons show their own loading state. Route changes use the top progress bar from UI-4.
3. Error pages: 404 (search box, top categories, contact link), 500 (plain explanation, retry button, contact), offline notice (a slim bar at the top when navigator.onLine is false), and a checkout-specific error page with the order number (if available) and WhatsApp/phone contact.
4. Inline error boundaries per section so one failing section (for example a product rail) hides itself instead of breaking the page, with the error logged.
5. Maintenance mode: when checkout is disabled (kill switch from the build pack), show a slim bar sitewide and a clear message on cart and checkout with the reopening info from settings.
6. Image failure: broken images fall back to the Placeholder without layout shift.
7. Toasts: only for confirmations and recoverable errors; never for validation errors on forms (those are inline).
```

---

## UI-14: Footer and content pages

```
Redesign the footer and static pages.

FOOTER
- Top band (canvas background): left, the logo and the one-sentence description of the shop; center-right, real contact details (address, phone, WhatsApp, email, pickup opening hours from settings). No newsletter signup, no "join our community".
- Link columns (maximum 3, different lengths are fine): Shop (top categories), Help (Delivery and returns, Warranty, FAQ, Track order, Contact), Company (About, Terms, Privacy). Links come from categories and published pages.
- Bottom bar: copyright with the legal business name from settings, payment methods text (plain text or official brand marks for the methods actually accepted, only if licensed assets are available), and social links as simple icons only for the profiles set in settings.
- Hairline top border, no gradients, no waves, no decorative shapes.

CONTENT PAGES (/about, /delivery-returns, /warranty, /faq, /terms, /privacy, /contact)
- Reading layout: 720px max line length, comfortable typography (18px, line-height 1.7), h2 with 48px top spacing, a sticky mini table of contents on desktop for long pages (terms, privacy, FAQ).
- FAQ: accordion grouped by topic with anchored links and `FAQPage` JSON-LD.
- About page: an editorial layout with a real photo of the store or team (from the RichText section pattern) and facts (location, years in business if provided), never invented claims.
- Contact page: two columns, form left, details right (address, hours, phone, WhatsApp, map link). Add a static map image or just a directions link (no third-party embeds that need cookies).
- Markdown renderer styling: headings, lists, tables, blockquotes, links, all following the tokens; code-free.
```

---

# PHASE 8: QUALITY

## UI-15: Copywriting pass

```
Rewrite all user-facing copy in the application to follow the Copy rules in docs/DESIGN.md.

1. Inventory every string in the storefront, auth, account, checkout, emails, error states, admin hints and seed data (search JSX text, toast messages, validation messages, email templates, seeded page content, metadata titles and descriptions). Produce docs/COPY.md listing: location, old text, new text.
2. Apply these rules: sentence case; plain, specific and factual; no em dashes; no exclamation marks; no banned words (see list); no triplet taglines; verbs plus objects for CTAs; headings that say what the section contains; errors that say what happened and what to do.
3. Metadata: titles in the form "{Page} | {Shop}", descriptions of 120 to 155 characters that state real facts about the page; no keyword stuffing.
4. Seed and default content: rewrite seed product descriptions to read like real manufacturer-neutral product copy (what it is, key specs, who it suits, what is in the box) with no hype. Rewrite the draft About, Delivery and returns, Warranty and FAQ pages in a calm, direct tone (keep [BRACKETS] for items I must fill in).
5. Run a script `npm run check:copy` that scans the repo (source, emails, seed data) for banned words, em dashes and exclamation marks and fails with file and line numbers. Add it to CI.
6. Local tone: clear English suited to Ghanaian shoppers, with Ghana cedi formatting and local place names in examples where examples are needed; avoid idioms.
```

---

## UI-16: Admin polish and the hero editor

```
Polish the admin so editing the design is fast, and build the full hero editor.

HERO EDITOR (/admin/heroes and /admin/heroes/[id])
- List of heroes (name, variant, status: active now, scheduled, expired, inactive, and the date range) with Duplicate and Set active actions. Only one hero is live at a time; scheduling uses startsAt and endsAt (show timezone).
- Editor with a two-pane layout: form on the left, LIVE PREVIEW on the right rendering the real Hero component with the draft values, with viewport toggles (Mobile 390, Tablet 768, Desktop 1280, Wide 1920) and a "Show safe areas" toggle.
- Form fields: variant, eyebrow, headline (counter 0/60), subtitle (0/140), primary CTA (label, link picker that can search categories, products, pages or accept a URL), secondary CTA, image (uploader with dimension guidance and a check that the image is at least 2000px wide), alt text (required, with an example), focal point picker (click on the image to set the point; preview updates), text theme and scrim opacity (fullbleed only) with a live contrast warning, hotspots editor (click the image to place up to 3 dots, then choose a product for each; drag to move; delete), offer label with an option "Use lowest price in category X" that stores the category and computes the number at render time, spotlight product picker.
- Validation: required fields per variant, character limits, link validity, publish checklist (alt text present, image large enough, contrast OK).
- Autosave drafts to localStorage and warn on leaving with unsaved changes.

ADMIN POLISH
- Tables: sticky header, row hover, keyboard row focus, column visibility menu, density toggle, selected rows bar with bulk actions.
- Forms: a sticky bottom action bar (Save, Discard) showing an "Unsaved changes" label when dirty; keyboard shortcut Cmd/Ctrl+S to save; Escape closes dialogs.
- Global admin command palette (Cmd/Ctrl+K): jump to any admin page, search products and orders by name or number, create product, create hero.
- Consistent page headers, breadcrumb, and success toasts that name what was saved ("Product saved").
- The admin look follows the same tokens but denser: 14px body, 36px controls (sm size), neutral canvas background.
- Add inline help text to every merchandising setting that says where the value appears on the storefront, with a small "View on site" link.
```

---

## UI-17: Responsive behavior and performance

```
Audit and fix responsive behavior and front-end performance.

1. Test and fix every storefront page at 360, 390, 430, 768, 834, 1024, 1280, 1440, 1536, 1920 and 2560 px, in portrait and landscape on mobile. Fix overflow, cramped touch targets (44px minimum), text over 75 characters per line, orphaned headings, broken grids, horizontal scrolling, and sticky elements overlapping content. Use container queries for components that appear in different widths (cards in rails vs grids).
2. Safe areas: apply env(safe-area-inset-*) to fixed bars (sticky buy bar, cookie/cart bars, drawers).
3. Performance budgets: LCP under 2.5s, INP under 200ms, CLS under 0.05 on mobile with 4x CPU slowdown and Fast 4G. Measure home, category, product, cart, checkout. Fix findings: proper `sizes`, priority only on LCP images, no unused JavaScript on the home page (convert client components to server components when possible, dynamic import for the lightbox, palette, mega menu panel contents, and cart drawer), preconnect to the Convex storage domain, font preloading limited to the weights actually used (Archivo 600/700, Public Sans 400/500/600), no layout shifts from fonts (size-adjust fallbacks via next/font).
4. Bundle report: show the JS size per route before and after; remove or replace any heavy library that is only used in one place.
5. Image budgets: no image larger than needed (check rendered sizes), AVIF/WebP, lazy below the fold, product images under 120 KB at card sizes.
6. Test on slow network and with JavaScript disabled for the home page (the content and hero must still render server-side).
7. Report before/after numbers in docs/PROGRESS.md.
```

---

## UI-18: Accessibility pass

```
Run a full accessibility pass to WCAG 2.2 AA on every storefront and account page.

1. Automated: add @axe-core/playwright tests for home, category, product, cart, checkout, sign-in, account, contact; fail CI on serious or critical violations.
2. Manual checks to perform and fix: keyboard-only completion of the full purchase flow (including mega menu, search palette, filters, gallery, drawer, checkout, payment redirect return); visible focus on every control with at least 3:1 contrast; focus order matches visual order; focus is trapped in dialogs and returned afterward; skip link works; one h1 per page and logical heading order; landmarks and labels; form labels, errors linked with aria-describedby; aria-live for cart updates, stock changes and toasts (polite); link text that makes sense out of context; images with meaningful alt text; no keyboard traps in hotspots and galleries.
3. Color and contrast: verify every token pair meets 4.5:1 for text (3:1 for large text and UI borders); fix tokens if needed (for example adjust ink-subtle if it fails) and record the final values in docs/DESIGN.md.
4. Motion and sensory: confirm reduced-motion behavior everywhere; nothing flashes; content readable at 200% zoom and with text spacing overrides; no reliance on color alone; touch targets at least 24px (aim for 44px).
5. Screen reader test notes: test with VoiceOver or NVDA on the product page and checkout, and write the findings and fixes in docs/PROGRESS.md.
6. Add a short Accessibility statement page (published page, editable) with a contact route for issues.
```

---

## UI-19: Anti-AI-tell audit and final polish

```
Perform a final, strict design audit of the whole storefront against docs/DESIGN.md. Do not skip any page.

PART 1: AUTOMATED SCAN
1. Search the entire codebase and rendered output for: gradient utilities (bg-gradient, from-, via-, to-, gradient text with bg-clip-text), backdrop-blur, blur-3xl or blob shapes, shadow utilities on resting cards, rounded-2xl/3xl/full (except count dots/avatars), animate-pulse/spin/bounce/ping (except a minimal loading state if needed), hover:-translate, hover:scale above 1.02, emoji characters, sparkle/rocket/wand icons, "lorem", "Product Name", "$", and every banned word from the copy rules. Produce a table of violations with file, line and fix. Fix them all.
2. Check that every color in CSS and Tailwind classes resolves to a token; list and fix exceptions.

PART 2: VISUAL AUDIT
3. Using Playwright, capture full-page screenshots at 375, 768, 1280 and 1920 px of: home, a category page, a product page (in stock, on sale, out of stock), search results, cart (with items and empty), checkout (delivery and pickup), order confirmation, sign in, sign up, account orders, contact, a content page, 404. View every screenshot yourself and write a critique per page: hierarchy, spacing consistency, alignment to the grid, density, whether anything looks templated or generic, whether any text or number looks invented. Fix the issues you find and re-capture until each page passes.
4. Specifically check: no three identical feature cards in a row; headings are factual, not slogans; buttons are not pills; sections do not all share one layout; imagery is consistent; the hero reads as a specialist retailer, not a SaaS landing page.

PART 3: CONTENT TRUTH CHECK
5. List every number, claim, badge, rating and trust statement visible in the UI and where it comes from in the data. Remove any that are hard-coded or invented. Everything must come from the database or settings.

PART 4: FINAL POLISH CHECKLIST
6. Favicon and touch icons correct; OG image for home, categories and products looks designed (white canvas, product image, shop wordmark, price) via next/og; 404 and error pages styled; print styles for receipts and specs; selection color and focus rings consistent; scrollbars consistent; no console errors; no layout shifts; consistent date, time and currency formats everywhere.
7. Update docs/DESIGN.md with any decisions that changed, and write a short docs/UI-QA-REPORT.md summarizing the audit results, remaining issues, and recommendations.
```

---

# UTILITY PROMPTS

### Visual QA loop (run after UI-7, UI-10, UI-11 and at the end)

```
Run a visual QA loop on [page or flow]. Start the app with realistic data (seeded products with real-looking photos if available). Using Playwright, take screenshots at 375, 768, 1280 and 1920 px widths. Look at each image. For each, list concrete problems against docs/DESIGN.md: spacing inconsistencies, misalignments, weak hierarchy, text that is too small or too long, awkward crops, anything that looks templated or AI-generated, any invented content. Fix the problems, re-capture, and repeat until you cannot find any issue. Report the final screenshots' file paths and a list of what changed.
```

### Component consistency audit

```
Scan the repo for duplicated or inconsistent UI patterns: multiple button styles, different card paddings, different heading sizes for the same level, one-off spacing values, repeated markup that should be a component. Propose a consolidation plan (no edits yet), then apply it after listing which files change. Update /dev/design-system accordingly.
```

### Reference-driven refinement (use when a section still feels generic)

```
The [section] still feels generic. Without copying any site, analyze how specialist retailers structure this kind of section (hierarchy, density, imagery, copy tone, spacing). Propose two alternative compositions with a short rationale each, choose the better one for our content, implement it, and verify with screenshots. Keep to docs/DESIGN.md.
```

### Regression guard

```
Add Playwright visual regression tests for home, category, product, cart and checkout at 375 and 1280 px with seeded data and frozen time. Store baselines in the repo, run them in CI on pull requests, and document how to update baselines when a design change is intentional.
```

---

# HUMAN QA CHECKLIST (you do this, with a phone in hand)

1. **Five-second test:** show the home page to someone for 5 seconds. Can they say what the shop sells and where it is?
2. **Squint test:** blur your eyes. Is the hero headline, the primary button and the first products clearly the loudest things?
3. **Grayscale test:** screenshot the page in grayscale. Does the hierarchy hold?
4. **Real content test:** are all products photographed consistently, with correct names and specs? Bad content ruins good design.
5. **Template test:** could this page be for any shop with the logo swapped? If yes, add specifics (real photos, real facts, real brands).
6. **Phone test:** buy something with mobile money on your own phone, on mobile data, one-handed.
7. **Slow test:** switch the phone to a slow connection. Does the hero text appear immediately?
8. **Copy test:** read every heading aloud. Does any sound like a slogan or an advertisement from a software company? Rewrite it.
9. **Trust test:** is every number and claim on the site true today?
10. **Comparison test:** put your home page next to two competitors on a phone. What do they do better? Adjust.

---

# OPTIONAL ADD-ONS

### Dark mode (only after launch, if customers ask)

```
Add a considered dark theme using new token values (not inverted colors): background #0F1216, surface #161A20, canvas #1B2027, ink #ECEFF3, line #2A313A, accent adjusted for contrast. Product photos stay on a light canvas panel in dark mode so product colors remain accurate. Follow system preference with a manual toggle in the footer. Verify contrast and the full /dev/design-system page in both themes.
```

### Helpful reactions on reviews (needs the Reviews add-on from the build pack)

```
Add a "Helpful" vote on reviews: one vote per signed-in user per review, optimistic count update, plain text button "Helpful (12)" (no emoji, no animation beyond a 120ms color change), rate-limited, and reviews sorted by most helpful by default with a sort control.
```

### Product comparison

```
Add a compare feature: up to 4 products from listings can be added via a plain "Compare" checkbox on cards (visible on hover and on touch), a sticky compare bar at the bottom with thumbnails and a "Compare" button, and a /compare page with a clean specification table aligned by spec label, differences highlighted with a subtle background, remove buttons, and add-to-cart buttons in the header row. Persist the selection in localStorage.
```