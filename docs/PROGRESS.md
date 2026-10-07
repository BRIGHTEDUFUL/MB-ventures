# Project Progress Log

## Log

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
  - Cart drawer and full checkout flow are in subsequent steps (Step 5 / UI-11).
  - Individual Category and Product detail pages are ready for dedicated page routes in Step 5.

---

## Convex function inventory

| Name | Type | Access | Purpose |
| --- | --- | --- | --- |
| `users.currentUser` | query | public | Return signed-in user's profile or null |
| `users.updateProfile` | mutation | user-scoped | Update own name/phone |
| `users.createUser` | internalMutation | internal | Called by Convex Auth on signup to set role + timestamps |
| `categories.list` | query | public | List active categories or subcategories |
| `categories.getBySlug` | query | public | Get category by slug with subcategories |
| `products.listFeatured` | query | public | List featured active products with pricing & stock info |
| `products.listLatest` | query | public | List latest active products |
| `products.listByCategory` | query | public | List products in a category |
| `products.getBySlug` | query | public | Get single product by slug |
| `products.search` | query | public | Full-text search products by query |
| `siteSettings.getPublicSettings` | query | public | Return store branding, contact, MoMo accounts, and zones |
| `seed.seedDemoData` | mutation | public | Seed initial demo catalog and store configuration |
