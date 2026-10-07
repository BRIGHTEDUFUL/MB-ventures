# Project Progress Log

## Current status

**Completed and pushed to `origin/main` on 2026-10-07.** The latest task (Step 9, the "Slate & Cobalt" UI redesign) is finished and verified.

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 warnings, 0 errors |
| `npm run build` | passes — all 24 routes + middleware |
| `npm test` | placeholder only (`Step 26 will configure tests`); no test files exist |
| Lighthouse on `/` | accessibility 100, best-practices 100, SEO 100, 0 failures |
| Horizontal overflow | none on `/`, `/catalog` or `/product/[slug]` at the tested viewport |
| Banned lists in `docs/DESIGN.md` | 0 matches (visual and copy sweeps) |

Known gaps carried forward (reported, not silently rewritten):

- `docs/PROGRESS.md` does not yet log Steps 4–8 (cart, checkout, orders, account, admin catalogue). That code is committed, but the log is behind it.
- Step 3 of this log says middleware redirects to `/auth/sign-in` and that a forgot-password link exists. Actual behaviour: redirect to `/sign-in`, and no forgot-password link is rendered.
- Seeded `siteSettings.defaultCountryCode` is `"GH"` while `lib/phone.ts` expects a `+233`-style prefix.
- Seeded contact, WhatsApp, pickup and MoMo wallet numbers are placeholders (flagged in `docs/DECISIONS.md`).
- `tailwindcss-animate` is used by `dialog`/`sheet` but is not on the allowed-extras list in `AGENTS.md`.
- `tailwind.config.ts` extends the spacing scale to 8px units while much of the code was written against Tailwind's default 4px scale. Step 9 corrected the visible consequences (12-column grid gutters, control heights); icon classes such as `w-4 h-4` still render at 32px instead of 16px and need a design decision before being changed repo-wide.

---

### Step 0: Accounts, rules and decisions
- **Date**: 2026-10-06
- **What was done**: Created initial project documentation and decision files (`AGENTS.md`, `CLAUDE.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/SCHEMA.md`). Recorded store branding **MB Ventures GH**, brand palette (Electric Blue & Amber/Orange), and linked `Logo.jpeg`.
- **Files added/changed**:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `Logo.jpeg` (provided by user)
  - `docs/PROGRESS.md`
  - `docs/DECISIONS.md`
  - `docs/SCHEMA.md`
- **New env vars**: None.
- **New Convex functions**: None.
- **Known limitations**: No application code or features implemented yet.

---

### Step 1: Scaffold the project
- **Date**: 2026-10-06
- **What was done**: Full project scaffold created — Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui (27 components), Convex client provider, Inter font, MB Ventures GH brand tokens (Electric Blue #2563eb, Amber #f97316). Domain utilities implemented. Folder hierarchy established.
- **Files added/changed**:
  - `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`, `components.json`
  - `eslint.config.mjs`, `.prettierrc`, `.editorconfig`, `.gitignore`, `.env.example`
  - `app/globals.css` — brand CSS tokens
  - `app/layout.tsx` — Inter font + Providers
  - `app/(store)/page.tsx` — placeholder home page
  - `app/not-found.tsx`, `app/error.tsx` — global error boundaries
  - `components/shared/ConvexClientProvider.tsx`, `Providers.tsx`
  - `components/ui/` — 27 shadcn/ui components
  - `lib/money.ts`, `lib/slug.ts`, `lib/phone.ts`, `lib/constants.ts`, `lib/utils.ts`
  - `convex/schema.ts`, `convex/http.ts`, `convex/crons.ts`, `convex/users.ts` (placeholders)
  - `app/(store)/README.md`, `app/(auth)/README.md`, `app/admin/README.md`, `app/account/README.md`, `components/*/README.md`, `lib/README.md`, `convex/lib/README.md`
- **New env vars**: `NEXT_PUBLIC_CONVEX_URL` (set to `https://hardy-blackbird-20.convex.cloud` in `.env.local`), `NEXT_PUBLIC_SITE_URL` (set to `http://localhost:3000`).
- **Git & Remote**: Initialized Git repository, committed scaffold, added remote `origin` (`https://github.com/BRIGHTEDUFUL/MB-ventures.git`), and pushed branch `main`.
- **New Convex functions**: None (placeholders only — full schema in Step 2, auth in Step 3)
- **Known limitations**:
  - `npx convex dev` needs to run locally to bind the deployment and generate `convex/_generated` types for Step 2.
  - Convex placeholder files (`schema.ts`, `http.ts`, `crons.ts`, `users.ts`) are minimal stubs — implemented in Steps 2–3.

---

### Step 2: Schema and domain logic
- **Date**: 2026-10-06
- **What was done**:
  - Implemented the full Convex schema in `convex/schema.ts` with all 17 tables, validators, and indexes (including search index `search_text` on products).
  - Created shared domain logic in `convex/lib/`:
    - `constants.ts`: Order statuses, payment statuses, fulfillment types, labels, and UI badge stylings.
    - `orderStatus.ts`: Pure state machine with `canTransition` and `allowedNextStatuses`.
    - `availability.ts`: `availableStock`, `stockLabel`, `effectivePrice`, and `isOnSale`.
    - `searchText.ts`: `buildSearchText` for normalising product search index content.
    - `validators.ts`: Reusable `v.*` schema & argument validators for addresses, orders, items, specs, and settings.
  - Created `lib/domain.ts` re-exporting domain constants, logic, and types for Next.js frontend code.
  - Authored comprehensive documentation in `docs/SCHEMA.md` explaining all 17 tables, fields, and indexing rationale in plain language.
- **Files added/changed**:
  - `convex/schema.ts`
  - `convex/lib/constants.ts`
  - `convex/lib/orderStatus.ts`
  - `convex/lib/availability.ts`
  - `convex/lib/searchText.ts`
  - `convex/lib/validators.ts`
  - `lib/domain.ts`
  - `docs/SCHEMA.md`
  - `docs/PROGRESS.md`
- **New env vars**: None.
- **New Convex functions**: None (schema and pure domain logic only).
- **Convex Status**: Fully connected to `dev:aware-cobra-407` (`mb-ventures-gh`). Schema pushed successfully; TypeScript bindings generated in `convex/_generated`.
- **Known limitations**: None for Step 2. Ready for Phase 2 (Step 3: Authentication).

---

### UI-0: Design specification integration (Storefront UI Design Pack)
- **Date**: 2026-10-06
- **What was done**:
  - Integrated `Storefront UI Design Pack_ Professional Components and Hero.md`.
  - Created [`docs/DESIGN.md`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/docs/DESIGN.md) containing the full design specification, anti-AI-tells rulebook, color tokens (`ink`, `canvas`, `surface`, `line`, `accent`), typography standards (Archivo, Public Sans, IBM Plex Mono), component rules, motion limits, and review checklist.
  - Added strict `UI RULES` section to [`AGENTS.md`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/AGENTS.md) and [`CLAUDE.md`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/CLAUDE.md).
  - Updated [`docs/DECISIONS.md`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/docs/DECISIONS.md) with design system decisions.
- **Files added/changed**:
  - `docs/DESIGN.md` (created)
  - `AGENTS.md` (updated)
  - `CLAUDE.md` (updated)
  - `docs/DECISIONS.md` (updated)
  - `docs/PROGRESS.md` (updated)
- **Next up**: UI-1 completed. Next is Step 3 (Authentication with Convex Auth, Google OAuth & Email/Password).

---

### UI-1: Tokens, typography, and base components
- **Date**: 2026-10-06
- **What was done**:
  - Implemented exact color tokens in `app/globals.css` and mapped to Tailwind (`bg-surface`, `bg-canvas`, `text-ink`, `text-ink-muted`, `border-line`, `border-line-strong`, `text-accent`, `bg-accent-soft`, `ring-focus`, `bg-success`, `bg-warning`, `bg-danger`).
  - Added variable Google fonts via `next/font/google`: *Archivo* (headings 600/700), *Public Sans* (body), and *IBM Plex Mono* (code/specs/tabular prices).
  - Applied global typography scale (display, h1 to h4, sentence case, text-wrap balance/pretty).
  - Created `.price` tabular numeral utility and `components/shared/Price.tsx` component.
  - Restyled base components to `docs/DESIGN.md`:
    - `Button`: Primary, secondary, tertiary link, accent, destructive; sm (36px), md (44px), lg (52px); 6px radius; loading state prop.
    - `Card`: 8px radius (`rounded-lg`), hairline border (`border-line`), `bg-surface`, no shadows at rest.
    - `Badge`: 4px radius (`rounded-sm`), functional variants (sale, warning, success, secondary, destructive, outline).
    - `Input` & `Textarea`: 44px min height, 6px radius, `border-line-strong`, `bg-surface`, visible focus ring.
    - `Skeleton`: Static subtle block (`bg-canvas-strong`), no shimmer sweep.
    - `Sonner`: Toasts configured at bottom-right on desktop with token styling.
  - Purged banned styles: removed `rounded-2xl`, `rounded-full` buttons, decorative pill badges, shadows, and neon colors from `app/(store)/page.tsx`, `app/not-found.tsx`, and `app/error.tsx`.
  - Created `/dev/design-system` preview page at [`app/dev/design-system/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/dev/design-system/page.tsx) (enabled in development only).
- **Files added/changed**:
  - `app/globals.css`
  - `tailwind.config.ts`
  - `app/layout.tsx`
  - `components/ui/button.tsx`
  - `components/ui/card.tsx`
  - `components/ui/badge.tsx`
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/skeleton.tsx`
  - `components/shared/Providers.tsx`
  - `components/shared/Price.tsx`
  - `app/(store)/page.tsx`
  - `app/not-found.tsx`
  - `app/error.tsx`
  - `app/dev/design-system/page.tsx`
  - `docs/PROGRESS.md`
- **New env vars**: None.
- **New Convex functions**: None.
- **Known limitations**: None. Ready for Phase 2 (Step 3: Authentication).

---

### UI-2: Mobile-first responsive foundations
- **Date**: 2026-10-06
- **What was done**:
  - Added `Viewport` export to `app/layout.tsx` with `width=device-width`, `initialScale=1`, `maximumScale=5` (accessibility-safe, never blocks user scaling), and `themeColor=#FFFFFF`.
  - Added `title.template` and `openGraph` metadata.
  - Added `overflow-x: hidden` + safe-area inset padding on `body` to prevent horizontal overflow on notched phones.
  - Introduced CSS custom property `--gutter` (16px mobile / 24px tablet / 32px desktop) that drives layout spacing across all breakpoints.
  - Updated all `clamp()` sizes on headings for better mobile readability (h1 from 26px → 48px, h2 from 20px → 32px).
  - Added `min-h-[100dvh]` to all full-page layouts (handles iOS Safari's dynamic viewport).
  - Added `img, video { max-width: 100%; height: auto; display: block; }` globally.
  - Added `.section-spacing`, `.pb-safe` utility classes.
  - Thin scrollbars now only apply on `pointer: fine` devices (hides on touch screens).
  - Created `components/shared/Container.tsx` — shared responsive container component with `default` (1280px), `narrow` (768px), and `wide` variants, all using `px-[var(--gutter)]`.
  - Added `xs: 375px` breakpoint to Tailwind config.
  - Updated `app/(store)/page.tsx`, `app/not-found.tsx`, `app/error.tsx` to use `Container`.
- **Files added/changed**:
  - `app/layout.tsx`
  - `app/globals.css`
  - `tailwind.config.ts`
  - `components/shared/Container.tsx` (new)
  - `app/(store)/page.tsx`
  - `app/not-found.tsx`
  - `app/error.tsx`
  - `docs/PROGRESS.md`
- **New env vars**: `NEXT_PUBLIC_SITE_URL` (already set).
- **New Convex functions**: None.
- **Known limitations**: None. TypeScript and ESLint both pass (exit 0). Ready for Step 3 (Authentication).

---

### Decision: Remove Paystack — manual MoMo + COD + Pay-in-Store
- **Date**: 2026-10-07
- **What was done**:
  - Removed Paystack from the project stack entirely. No payment gateway.
  - **New payment model** — three methods:
    - `momo`: Customer manually transfers via MTN MoMo / Telecel Cash / AirtelTigo Money, then submits a reference number. Admin verifies against the shop's account and marks as paid.
    - `cash_on_delivery`: Payment collected by rider on arrival. No upfront payment required.
    - `pay_in_store`: Payment collected at the pickup counter. No upfront payment required.
  - **New order status flow (MoMo)**: `pending → awaiting_momo → pending_verification → processing → out_for_delivery / ready_for_pickup → completed`
  - **New order status flow (COD / in-store)**: `pending → processing → out_for_delivery / ready_for_pickup → completed`
  - `paymentEvents` table (Paystack webhook idempotency log) removed from schema.
  - Added MoMo-specific order fields: `momoNetwork`, `momoPhone`, `momoReference`.
  - Added `momoAccounts` (array), `cashOnDeliveryEnabled`, `payInStoreEnabled` to `siteSettings`.
  - Added `by_payment_method` index to `orders`.
  - Updated badge colour styles to use design tokens (no raw colour strings).
  - State machine (`orderStatus.ts`) updated with `needsMomoVerification` and `isPaymentPending` helpers.
  - `AGENTS.md` updated with payment model rules.
- **Files changed**:
  - `AGENTS.md`
  - `convex/schema.ts`
  - `convex/lib/constants.ts`
  - `convex/lib/validators.ts`
  - `convex/lib/orderStatus.ts`
  - `docs/PROGRESS.md`
- **New env vars**: None.
- **New Convex functions**: None (schema and domain logic only).
- **Known limitations**: None. TypeScript and ESLint both pass. Ready for Step 3 (Authentication).

---

### Step 3: Authentication (Convex Auth — email + password)
- **Date**: 2026-10-07
- **What was done**:
  - Installed `@convex-dev/auth`.
  - Configured **email + password only** auth (no Google, no OTP — deliberately simple per user requirement).
  - Storefront is fully public — no auth needed to browse, search, or view products.
  - Auth is only required for `/account` and `/admin` routes.
  - Created `convex/auth.ts` — Convex Auth config with `Password` provider.
  - Created `convex/auth.config.ts` — JWT domain config.
  - Updated `convex/http.ts` — mounted auth HTTP handlers.
  - Updated `convex/schema.ts` — spread `authTables` (sessions, accounts, verifications).
  - Rewrote `convex/users.ts` — `currentUser` query, `updateProfile` mutation, `createUser` internal mutation, `requireUser` / `requireAdmin` server helpers (properly typed with `QueryCtx | MutationCtx`).
  - Updated `components/shared/Providers.tsx` — replaced `ConvexClientProvider` with `ConvexAuthNextjsProvider`.
  - Updated `app/layout.tsx` — wrapped in `ConvexAuthNextjsServerProvider` for server-side session reading.
  - Created `middleware.ts` — protects `/account` and `/admin` only; redirects to `/auth/sign-in?redirect=...`; storefront bypassed.
  - Created `app/(auth)/layout.tsx` — minimal auth shell (logo header + centred card + footer).
  - Created `app/(auth)/sign-in/page.tsx` — email + password sign-in form.
  - Created `app/(auth)/sign-up/page.tsx` — name + email + password sign-up form.
  - Created `lib/hooks/useCurrentUser.ts` — client hook wrapping `currentUser` query.
- **Files added/changed**:
  - `convex/auth.ts` (new)
  - `convex/auth.config.ts` (new)
  - `convex/http.ts`
  - `convex/schema.ts`
  - `convex/users.ts`
  - `middleware.ts` (new)
  - `components/shared/Providers.tsx`
  - `app/layout.tsx`
  - `app/(auth)/layout.tsx` (new)
  - `app/(auth)/sign-in/page.tsx` (new)
  - `app/(auth)/sign-up/page.tsx` (new)
  - `lib/hooks/useCurrentUser.ts` (new)
  - `docs/PROGRESS.md`
- **New env vars**:
  - `JWT_PRIVATE_KEY` — generated and set on Convex dev deployment via `@convex-dev/auth` CLI
  - `JWKS` — generated and set on Convex dev deployment via `@convex-dev/auth` CLI
  - `SITE_URL` — set in `.env.local` and on Convex dev deployment
- **New Convex functions**:
  - `users.currentUser` — public query
  - `users.updateProfile` — user-scoped mutation
  - `users.createUser` — internal mutation (called by auth on signup)
- **Known limitations**:
  - No forgot-password page yet — `/auth/forgot-password` link is present but page doesn't exist; planned for a future step.
  - Guest checkout (order without account) is planned for the checkout step.
- **Verification**: `npx tsc --noEmit` passed, `next lint` passed, `next build` compiled successfully (0 errors, 0 warnings).

---

### Step 4: Storefront Shell, Navigation, Search, and Catalog Backend
- **Date**: 2026-10-07
- **What was done**:
  - Implemented full Convex catalog queries in `convex/categories.ts` (`list`, `getBySlug`) and `convex/products.ts` (`listFeatured`, `listLatest`, `listByCategory`, `getBySlug`, `search` with full-text search indexing).
  - Implemented `convex/siteSettings.ts` returning store branding, contact info, MoMo accounts, delivery zones, pickup locations, and hero settings.
  - Implemented `convex/seed.ts` with `seedDemoData` populating realistic computer accessories, hardware, ergonomic chairs, standing desks, delivery zones, and settings.
  - Created `components/store/AnnouncementBar.tsx` — accessible dismissible announcement bar matching design tokens.
  - Created `components/store/Header.tsx` — responsive sticky header with brand logo, category links with hover underline reveal, search trigger (`⌘K`), user account dropdown, cart button, and mobile hamburger.
  - Created `components/store/MobileNavDrawer.tsx` — mobile drawer with smooth slide-in, category navigation, user account actions, and quick contact info.
  - Created `components/store/QuickSearchDialog.tsx` — full-text live search dialog with debounced query, product preview tiles with tabular prices, and keyboard shortcuts.
  - Created `components/store/ProductCard.tsx` — high quality product card strictly following `docs/DESIGN.md` (neutral canvas background, tabular pricing, sale/stock badges, quick add).
  - Created `components/store/Footer.tsx` — comprehensive specialist retailer footer with payment method badges (MTN MoMo, Telecel Cash, AirtelTigo, COD, In-store Pickup), physical address in Accra, contact hours, and policies.
  - Created `app/(store)/layout.tsx` — server layout with `fetchQuery` dynamic rendering.
  - Upgraded `app/(store)/page.tsx` — dynamic homepage with specialist hero, category grid, featured products, and payment/delivery trust highlights.
- **Files added/changed**:
  - `convex/categories.ts` (new)
  - `convex/products.ts` (new)
  - `convex/siteSettings.ts` (new)
  - `convex/seed.ts` (new)
  - `convex/lib/validators.ts`
  - `lib/hooks/useCurrentUser.ts`
  - `components/store/AnnouncementBar.tsx` (new)
  - `components/store/Header.tsx` (new)
  - `components/store/MobileNavDrawer.tsx` (new)
  - `components/store/QuickSearchDialog.tsx` (new)
  - `components/store/ProductCard.tsx` (new)
  - `components/store/Footer.tsx` (new)
  - `app/(store)/layout.tsx` (new)
  - `app/(store)/page.tsx`
  - `docs/PROGRESS.md`
- **New Convex functions**:
  - `categories.list` — public query
  - `categories.getBySlug` — public query
  - `products.listFeatured` — public query
  - `products.listLatest` — public query
  - `products.listByCategory` — public query
  - `products.getBySlug` — public query
  - `products.search` — public query (full-text search)
  - `siteSettings.getPublicSettings` — public query
  - `seed.seedDemoData` — public mutation (safe idempotent seeder)
- **Known limitations**:
  - Cart drawer and full checkout flow are in subsequent steps (Step 6 / UI-11).
  - Dedicated cart storage mutation will be wired in Step 6.

---

### Step 5: Catalog Listing, Category Pages, and Product Detail Pages
- **Date**: 2026-10-07
- **What was done**:
  - Implemented `products.listAll` (with sorting by latest, price low-to-high, price high-to-low, and category filtering) and `products.listRelated` in `convex/products.ts`.
  - Created [`app/(store)/catalog/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/(store)/catalog/page.tsx) — complete catalog browser with category filter tabs, sort dropdown, responsive product grid (2-col mobile, 3-col tablet, 4-col desktop), breadcrumbs, search integration, and empty state.
  - Created [`app/(store)/category/[slug]/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/(store)/category/[slug]/page.tsx) — dynamic category route with SEO metadata generation (`generateMetadata`), breadcrumbs, category banner, and product listing grid.
  - Created [`components/store/ProductGallery.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/components/store/ProductGallery.tsx) — product photo gallery with flat canvas container, sale/stock badges, thumbnail selectors, and priority image loading.
  - Created [`components/store/ProductActions.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/components/store/ProductActions.tsx) — quantity stepper (- / +), primary "Add to Cart" button (44px+ height, active state, Sonner toast notification), "Buy Now" direct checkout trigger, and WhatsApp inquiry button.
  - Created [`app/(store)/product/[slug]/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/(store)/product/[slug]/page.tsx) — complete Product Detail Page with dynamic SEO metadata, brand & SKU mono headers, tabular price formatting, stock availability badge, gallery, purchase actions, Accra delivery and Circle store pickup facts, product description, structured technical specifications table, and related products grid.
- **Files added/changed**:
  - `convex/products.ts`
  - `app/(store)/catalog/page.tsx` (new)
  - `app/(store)/category/[slug]/page.tsx` (new)
  - `components/store/ProductGallery.tsx` (new)
  - `components/store/ProductActions.tsx` (new)
  - `app/(store)/product/[slug]/page.tsx` (new)
  - `docs/PROGRESS.md`
- **New Convex functions**:
  - `products.listAll` — public query
  - `products.listRelated` — public query
- **Known limitations**:
  - Persistent cart state for authenticated users and local storage cart for guests are coming in Step 6 (Cart & Checkout).
- **Verification**: `npx tsc --noEmit` passed (0 errors), `next lint` passed (0 warnings), `next build` compiled all dynamic routes.

---

### Step 6: Shopping Cart, Drawer, Checkout & Order Status Tracking
- **Date**: 2026-10-07
- **What was done**:
  - Created global reactive Cart Context (`lib/cart/CartContext.tsx`) with localStorage persistence, item quantity adjustments, and stock availability clamping.
  - Built slide-out [`components/store/CartDrawer.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/components/store/CartDrawer.tsx) with item count badges, thumbnail previews, price formatting, stepper controls, subtotal, and checkout CTAs.
  - Connected `CartDrawer` into [`components/store/Header.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/components/store/Header.tsx), [`components/store/ProductActions.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/components/store/ProductActions.tsx), and [`components/store/ProductCard.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/components/store/ProductCard.tsx) quick-add.
  - Created full-featured [`app/(store)/cart/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/(store)/cart/page.tsx) with empty state, items table, and order summary.
  - Implemented backend fulfillment queries in `convex/fulfillment.ts` (`listDeliveryZones`, `listPickupLocations`).
  - Implemented complete server-side order processing in `convex/orders.ts`:
    - `orders.create`: Validates inputs, recomputes prices & delivery fees on the server, verifies and reserves stock in `products` & `stockAdjustments`, atomically generates sequential `ORD-000101` numbers via `counters`, determines initial statuses (`awaiting_momo`, `pending_verification`, `processing`), logs `orderEvents`, and returns order reference.
    - `orders.submitMomoReference`: Customer reference submission for manual MoMo verification.
    - `orders.getByOrderNumber`: Public order receipt & status query.
    - `orders.listMyOrders`: Signed-in user order history.
  - Created [`app/(store)/checkout/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/(store)/checkout/page.tsx) — multi-section checkout (Contact, Delivery vs In-Store Pickup, MoMo with official store numbers, Cash on Delivery, In-Store payment, and order review sidebar).
  - Created [`app/(store)/order/[orderNumber]/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/(store)/order/[orderNumber]/page.tsx) — order confirmation, copy-to-clipboard order number, live status badge, MoMo transfer instructions & reference submission form, fulfillment summary, purchased items breakdown, and WhatsApp support link.
- **Files added/changed**:
  - `convex/fulfillment.ts` (new)
  - `convex/orders.ts` (new)
  - `lib/cart/CartContext.tsx` (new)
  - `components/shared/Providers.tsx`
  - `components/store/CartDrawer.tsx` (new)
  - `components/store/Header.tsx`
  - `components/store/ProductActions.tsx`
  - `components/store/ProductCard.tsx`
  - `app/(store)/cart/page.tsx` (new)
  - `app/(store)/checkout/page.tsx` (new)
  - `app/(store)/order/[orderNumber]/page.tsx` (new)
  - `docs/PROGRESS.md`
- **New Convex functions**:
  - `fulfillment.listDeliveryZones` — public query
  - `fulfillment.listPickupLocations` — public query
  - `orders.create` — public mutation
  - `orders.submitMomoReference` — public mutation
  - `orders.getByOrderNumber` — public query
  - `orders.listMyOrders` — user-scoped query
- **Verification**:
  - `npx tsc --noEmit` passed (0 errors)
  - `npm run lint` passed (0 warnings, 0 errors)
  - `npm run build` compiled all routes successfully (exit 0)

---

### Step 7: Admin Shell, Dashboard & Orders Management (MoMo Verification)
- **Date**: 2026-10-07
- **What was done**:
  - Implemented role-based admin security in `convex/users.ts` (`requireAdmin`, `users.makeAdmin`, `users.makeCustomer`).
  - Created complete admin order backend in `convex/adminOrders.ts`:
    - `adminOrders.list`: Filterable order list by status, payment method, customer search, or MoMo verification queue.
    - `adminOrders.get`: Single order details with item storage URLs, full activity timeline, and allowed state transitions.
    - `adminOrders.verifyMomoPayment`: Admin action to confirm MoMo payment received, transitioning order to `processing` and marking `paid`.
    - `adminOrders.rejectMomoPayment`: Admin action to flag invalid MoMo references and request new details from customer.
    - `adminOrders.updateStatus`: State machine transition handler (handles physical stock deductions on `completed` and stock reservation release on `cancelled`).
    - `adminOrders.updateInternalNote`: Update internal staff notes on orders.
    - `adminOrders.getDashboardStats`: Real-time KPI queries for pending MoMo verifications, active orders, sales revenue, and low stock alerts.
  - Created reusable admin UI components in `components/admin/`:
    - `AdminHeader.tsx`: Clean header with title, description, breadcrumbs, and action buttons.
    - `AdminStatCard.tsx`: Metric summary card with warning, alert, success, and default variants.
    - `OrderStatusBadge.tsx`: Design token-compliant status badges.
    - `ConfirmDialog.tsx`: Modal confirmation dialog for destructive or state-changing operations.
  - Created [`app/admin/layout.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/admin/layout.tsx) — admin layout shell with role guard (403 forbidden screen for customers), desktop sidebar with live MoMo verification notification badge, mobile drawer, storefront link, and sign out button.
  - Created [`app/admin/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/admin/page.tsx) — operational overview dashboard with 4 KPI cards, live MoMo verification queue table, recent orders list, and quick management links.
  - Created [`app/admin/orders/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/admin/orders/page.tsx) — full orders table with status filter tabs, search by customer/phone/order/ref, payment method filter, and direct inspection links.
  - Created [`app/admin/orders/[id]/page.tsx`](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/app/admin/orders/%5Bid%5D/page.tsx) — single order inspection console with prominent MoMo verification panel (confirm payment / reject reference), state transition controls, purchased items snapshot, customer delivery info, internal note editor, and order event timeline.
- **Files added/changed**:
  - `convex/users.ts`
  - `convex/adminOrders.ts` (new)
  - `components/admin/AdminHeader.tsx` (new)
  - `components/admin/AdminStatCard.tsx` (new)
  - `components/admin/OrderStatusBadge.tsx` (new)
  - `components/admin/ConfirmDialog.tsx` (new)
  - `app/admin/layout.tsx` (new)
  - `app/admin/page.tsx` (new)
  - `app/admin/orders/page.tsx` (new)
  - `app/admin/orders/[id]/page.tsx` (new)
  - `docs/PROGRESS.md`
- **New Convex functions**:
  - `users.makeAdmin` — internal mutation
  - `users.makeCustomer` — internal mutation
  - `adminOrders.list` — admin query
  - `adminOrders.get` — admin query
  - `adminOrders.verifyMomoPayment` — admin mutation
  - `adminOrders.rejectMomoPayment` — admin mutation
  - `adminOrders.updateStatus` — admin mutation
  - `adminOrders.updateInternalNote` — admin mutation
  - `adminOrders.getDashboardStats` — admin query
- **Verification**:
  - `npx tsc --noEmit` passed (0 errors)
  - `npm run lint` passed (0 warnings, 0 errors)
  - `npm run build` compiled all routes successfully (exit 0)

---

### Step 8: Documentation sync (SCHEMA, DECISIONS) and account layout build fix
- **Date**: 2026-10-07
- **What was done**:
  - Rewrote `docs/SCHEMA.md` to match the live `convex/schema.ts` after the Paystack removal:
    - Dropped the `paymentEvents` table (section and overview row); sections renumbered 13-16.
    - `orders`: current status set (`pending`, `awaiting_momo`, `pending_verification`, `processing`, `ready_for_pickup`, `out_for_delivery`, `completed`, `cancelled`), current payment status set (`unpaid`, `pending_verification`, `paid`, `refunded`), new `paymentMethod` field, new `momoNetwork` / `momoPhone` / `momoReference` fields, removed the Paystack-era `paymentReferences`, added the `by_payment_method` index, and documented both order status flows.
    - `siteSettings`: added `momoAccounts`, `cashOnDeliveryEnabled`, `payInStoreEnabled`.
    - Added a note that `authTables` (sessions, accounts, verifications) are spread into the schema.
    - Corrected `products.specs` (optional `group`) and `siteSettings.socialLinks` (added `whatsapp`) to match `convex/lib/validators.ts`.
  - Prefilled `docs/DECISIONS.md` from `convex/seed.ts`: delivery zones, pickup location, currency, tax note, thresholds, free-delivery threshold, payment methods, support email, address. Added a **Launch blockers** table listing every seeded placeholder.
  - **Build fix** (pre-existing bug): `app/account/page.tsx` exported `metadata` while marked `"use client"`, which Next.js rejects.
    - Moved the client layout markup into new `app/account/AccountShell.tsx`.
    - `app/account/layout.tsx` is now a server component exporting `metadata: { robots: "noindex" }`, so the whole `/account` area stays out of search indexes.
    - Removed the illegal `metadata` export from `app/account/page.tsx`.
- **Files added/changed**:
  - `docs/SCHEMA.md`
  - `docs/DECISIONS.md`
  - `app/account/AccountShell.tsx` (new)
  - `app/account/layout.tsx`
  - `app/account/page.tsx`
  - `docs/PROGRESS.md`
- **New env vars**: None.
- **New Convex functions**: None.
- **Verification**: `npx tsc --noEmit` passed (0 errors), `npm run build` compiled and generated all routes (exit 0).
- **Known limitations / reported, not fixed**:
  - `npm run lint` reports 18 pre-existing warnings (unused imports and `no-explicit-any`) in `app/admin/categories/page.tsx`, `app/admin/products/page.tsx`, `components/admin/ImageUploader.tsx`, `components/admin/ProductForm.tsx`. These come from admin catalog work that has no PROGRESS entry yet.
  - `app/admin/products`, `app/admin/products/new`, `app/admin/products/[id]` and `app/admin/categories` routes exist and build, but PROGRESS.md only logged through Step 7. The log is behind the code.
  - `docs/PROGRESS.md` Step 3 says middleware redirects to `/auth/sign-in` and that a forgot-password link exists. Actual behaviour: `middleware.ts` redirects to `/sign-in`, and no forgot-password link is rendered anywhere (only a struck-through mention on `app/account/profile/page.tsx`).
  - Seeded `siteSettings.defaultCountryCode` is `"GH"` while `lib/phone.ts` expects a `+233`-style prefix; not wired up yet, so no visible break.
  - Seeded contact, WhatsApp, pickup phone and both MoMo wallet numbers are dummies.

---

### Step 9: UI redesign — "Slate & Cobalt" theme, component modernisation, DESIGN.md compliance
- **Date**: 2026-10-07
- **Status**: Completed.
- **What was done**:
  1. **New theme "Slate & Cobalt"** — `app/globals.css` rewritten as the single source of truth: blue-tinted slate structure (`ink`, `ink-muted`, `ink-subtle`, `surface`, `canvas`, `canvas-strong`, `line`, `line-strong`), brand cobalt `#2563EB` (`brand`, `brand-hover`, `brand-active`, `brand-soft`, `focus`, `link`) for every interactive control, and brand orange `#C2410C` (`accent`) reserved for offers and sale prices only. `tailwind.config.ts` now only maps tokens to class names — no raw hex in the config, `primary` maps to `var(--brand)`, and the shadcn compatibility aliases resolve to the new tokens.
  2. **Contrast audit** — three tokens corrected to reach WCAG AA: `ink-subtle` → `#596575`, `line-strong` → `#7F8C9E`, `danger` → `#CE2222`. Result: 27 text pairs ≥ 4.5:1, 4 UI pairs ≥ 3.0:1, 0 failures.
  3. **CTA colour** — primary buttons moved from ink to brand blue across 27 files. Ink is kept for logo marks, cart-count dots, neutral badges and `Default` tags; the `dark` variant stays available for high-contrast emphasis. Every active/selected state uses `bg-brand` / `border-brand` / `bg-brand-soft`.
  4. **Tokenisation sweep** across 74 `.tsx` files: `shadow-lg/xl/2xl` → `shadow-layer`, `shadow-md` → `shadow-layer-sm`, `bg-black/80` → `bg-ink/50`, `active:bg-black` → `active:bg-ink`, `text-muted-foreground` → `text-ink-muted`, `bg-muted` → `bg-canvas`, `*destructive` → `danger`, `border-input` → `line-strong`, `ring-ring` → `ring-focus`, and shadcn `bg-accent` menu hovers → `bg-canvas` (accent is offers-only now). Removed two decorative `backdrop-blur` uses and a no-op `shadow-xs`.
  5. **Selection states moved to brand** — 5 checkout/payment options, the order progress step, the default-address card, gallery thumbnails, image dropzone/thumb, tabs, active admin nav and the header cart count now use `border-brand bg-brand-soft` (or `shadow-layer-sm` for raised cards).
  6. **Touch targets normalised to DESIGN.md's 44px** — ~60 controls. Hand-rolled admin/store inputs and buttons rendered at `h-10` (80px) or `h-9` (72px) under the 8px spacing scale and were converted to `h-11`; also normalised quantity steppers, drawer close/pagination, `Button` `size="sm"`, announcement dismiss, header search/account/sign-in, card quick-add (`min-h-[38px]` → `min-h-[44px]`) and the checkout MoMo copy buttons (`min-h-[32px]` → `min-h-[44px]`). Decorative `w-10 h-10` boxes were deliberately left alone.
  7. **Oversized CTAs brought back to spec** (44px / 52px large) — `h-12` is 96px under this scale: product Add-to-Cart and its stepper, cart Checkout, checkout Place order, and the QuickSearch input.
  8. **Horizontal overflow fixed** — the homepage fulfilment and hero grids and the two product-page grids used `md:gap-10` / `lg:gap-12` (80px / 96px), needing 880–1056px of gutter alone and overflowing between 768px and 1215px. All 12-column grids now use `gap-6` (48px → 528px total), which fits at 375/768/1024/1280/1920. Verified `document.body.scrollWidth === document.documentElement.clientWidth` on `/`, `/catalog` and `/product/[slug]`.
  9. **Catalogue and homepage polish** — category filter chips now wrap instead of clipping beneath the sort control; homepage category cards retuned to `aspect-[4/3]` with a `bg-brand-soft` hover tint and a hover-revealed arrow; product-card price row wraps instead of overflowing, and the quick-add button was reduced to a compact text button.
  10. **Design-system preview page** — all 9 hex labels were stale (from an older palette) and `brand` had no swatch at all. Section 1 now lists all 24 colour tokens in DESIGN.md's four groups and resolves each value live from its CSS custom property via the new `components/dev/TokenValue.tsx`, so the labels can never drift again.
  11. **Banned-list sweeps** — 0 matches for gradients, gradient text, glassmorphism/backdrop blur, oversized radii, hover-lift shadows, image zoom, looping animation, raw hex colour classes, `dark:` variants and leftover shadcn token names. `rounded-full` appears only on dots/avatars/native controls. One banned CTA found and reworded (`Learn more` → `View details` in `AnnouncementBar`).
  12. **Accessibility fixes found during the Lighthouse pass** — the search trigger's accessible name did not contain its visible label or the `⌘K` hint (fixed by dropping the `aria-label`, making the label a real `sr-only sm:not-sr-only` span and moving the `⌘K` chip outside the button as a sibling), and `aria-label="Announcement"` on the announcement `<aside>` overrode name-from-content (removed). Search icon marked `aria-hidden`.
  13. **Checkout MoMo copy buttons** — restored the per-account copy action (`copiedMomoIndex` + `Check`/`Copy` icons, "Copied"/"Copy" labels) which had lost its rendering, clearing 4 new lint warnings.
- **Files added**:
  - `components/dev/TokenValue.tsx` — reads a CSS custom property at runtime so token previews cannot drift.
- **Files changed** (86 in total in this working tree, including the still-unlogged Steps 4–8 work):
  - Theme/tokens: `app/globals.css`, `tailwind.config.ts`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/command.tsx` + 24 other `components/ui/*` primitives
  - Store UI: `components/store/Header.tsx`, `AnnouncementBar.tsx`, `ProductCard.tsx`, `ProductActions.tsx`, `CartDrawer.tsx`, `ProductGallery.tsx`, `Footer.tsx`, `MobileNavDrawer.tsx`, `QuickSearchDialog.tsx`, `components/shared/Price.tsx`, `Providers.tsx`
  - Pages: `app/(store)/page.tsx`, `app/(store)/catalog/page.tsx`, `app/(store)/product/[slug]/page.tsx`, `app/(store)/checkout/page.tsx`, `app/(store)/cart/page.tsx`, `app/(store)/order/[orderNumber]/page.tsx`, `app/(store)/category/[slug]/page.tsx`, `app/dev/design-system/page.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/layout.tsx`, `app/(store)/layout.tsx`, `app/(auth)/*`
  - Docs: `docs/DESIGN.md` (palette, button sizes, elevation), `docs/PROGRESS.md`
- **New env vars**: None.
- **New Convex functions**: None.
- **Verification**:
  - `npx tsc --noEmit` → 0 errors
  - `npm run lint` → 0 warnings, 0 errors (fixed the 18 pre-existing warnings flagged in Step 8 as part of this pass)
  - `npm run build` → passes, all 24 routes + middleware (run with the dev server stopped; never run both against the same `.next`)
  - `npm test` → placeholder (`Step 26 will configure tests`), no test files exist
  - Lighthouse on `/` → accessibility 100, best-practices 100, SEO 100, `failures: []`
  - Banned-list grep sweeps → 0 visual matches, 1 copy match (fixed)
- **Known limitations / reported, not fixed**:
  - **Spacing-scale mismatch (systemic).** `tailwind.config.ts` extends spacing to 8px units while much of the code was written against Tailwind's default 4px scale, so `w-4 h-4` icons render at 32px (intended 16px), `p-4` at 32px and `h-12` at 96px. Step 9 corrected the grid gutters and control heights that actually broke (overflow, touch targets); normalising every icon repo-wide is a separate, high-risk change that needs a design decision first.
  - Steps 4–8 still have no PROGRESS entry — the log is behind the code (also noted in Step 8).
  - Lighthouse and the overflow audit were run at the available browser window (902 CSS px). 375/768/1280/1920 were verified by computing grid and control maths against the token values rather than by screenshot.
  - Two "premium" strings remain in the copy; only the phrase "premium experience" is on DESIGN.md's banned list, and this tagline is the shop's own (recorded in `docs/DECISIONS.md`).

---

## Convex function inventory

| Name | Type | Access | Purpose |
| --- | --- | --- | --- |
| `users.currentUser` | query | public | Return signed-in user's profile or null |
| `users.updateProfile` | mutation | user-scoped | Update own name/phone |
| `users.createUser` | internalMutation | internal | Called by Convex Auth on signup to set role + timestamps |
| `users.makeAdmin` | internalMutation | internal | Promote user to admin by email |
| `users.makeCustomer` | internalMutation | internal | Demote user to customer by email |
| `categories.list` | query | public | List active categories or subcategories |
| `categories.getBySlug` | query | public | Get category by slug with subcategories |
| `products.listAll` | query | public | List all active products with category & price sorting |
| `products.listFeatured` | query | public | List featured active products with pricing & stock info |
| `products.listLatest` | query | public | List latest active products |
| `products.listByCategory` | query | public | List products in a category |
| `products.listRelated` | query | public | List related products in the same category |
| `products.getBySlug` | query | public | Get single product by slug |
| `products.search` | query | public | Full-text search products by query |
| `siteSettings.getPublicSettings` | query | public | Return store branding, contact, MoMo accounts, and zones |
| `seed.seedDemoData` | mutation | public | Seed initial demo catalog and store configuration |
| `fulfillment.listDeliveryZones` | query | public | List active delivery zones and fee rates |
| `fulfillment.listPickupLocations` | query | public | List active in-store pickup branches and hours |
| `orders.create` | mutation | public | Place new customer order with server-side stock & price checks |
| `orders.submitMomoReference` | mutation | public | Submit/update customer Mobile Money transaction reference |
| `orders.getByOrderNumber` | query | public | Get order details, items, timeline and shop MoMo info |
| `orders.listMyOrders` | query | user-scoped | Return authenticated user's order history |
| `adminOrders.list` | query | admin | List and filter customer orders |
| `adminOrders.get` | query | admin | Get complete single order details for admin inspection |
| `adminOrders.verifyMomoPayment` | mutation | admin | Confirm receipt of MoMo transfer and advance to processing |
| `adminOrders.rejectMomoPayment` | mutation | admin | Flag invalid MoMo reference |
| `adminOrders.updateStatus` | mutation | admin | Advance order status in state machine with stock adjustments |
| `adminOrders.updateInternalNote` | mutation | admin | Save internal staff remarks on an order |
| `adminOrders.getDashboardStats` | query | admin | Real-time overview metrics and MoMo verification queue |

