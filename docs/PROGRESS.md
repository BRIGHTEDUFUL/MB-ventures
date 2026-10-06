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
- **Next up**: Can apply UI-1 (tokens, fonts, base components restyling) or continue building core capabilities in Step 3 (Authentication).

---

## Convex function inventory

| Name | Type | Access | Purpose |
| --- | --- | --- | --- |
| *(None yet)* | - | - | - |
