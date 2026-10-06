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
- **New env vars**: `NEXT_PUBLIC_CONVEX_URL` (set to `https://aware-cobra-407.convex.cloud` in `.env.local`), `NEXT_PUBLIC_SITE_URL` (set to `http://localhost:3000`).
- **Git & Remote**: Initialized Git repository, committed scaffold, added remote `origin` (`https://github.com/BRIGHTEDUFUL/MB-ventures.git`), and pushed branch `main`.
- **New Convex functions**: None (placeholders only — full schema in Step 2, auth in Step 3)
- **Known limitations**:
  - `npx convex dev` needs to run locally to bind the deployment and generate `convex/_generated` types for Step 2.
  - Convex placeholder files (`schema.ts`, `http.ts`, `crons.ts`, `users.ts`) are minimal stubs — implemented in Steps 2–3.

---

## Convex function inventory

| Name | Type | Access | Purpose |
| --- | --- | --- | --- |
| *(None yet)* | - | - | - |
