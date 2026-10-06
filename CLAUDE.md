# PROJECT
Online shop selling computer accessories, hardware, office chairs and tables. Supports delivery and in-store pickup. Online payment via Paystack.

# STACK
Next.js App Router, TypeScript (strict), Tailwind CSS, shadcn/ui, Convex (database, functions, auth, file storage, crons), Paystack, Resend (via plain fetch, no SDK), deployed on Vercel.

# ARCHITECTURE RULES
- Keep the stack simple. Do not add a library unless necessary; allowed extras: react-hook-form, zod, @hookform/resolvers, papaparse, react-markdown, @convex-dev/auth, @convex-dev/rate-limiter, convex-test, vitest, playwright, @vercel/analytics, @vercel/speed-insights, lucide-react, sonner. Ask before adding anything else.
- All data lives in Convex. No other database.
- Money is stored as integers in the smallest currency unit (pesewas). Convert only at the UI edge using lib/money.ts.
- Public catalog pages are server components that use fetchQuery from convex/nextjs and are rendered dynamically (export const dynamic = "force-dynamic"). Interactive parts are small client components.
- Every Convex function declares argument validators (v.*) and return validators where practical.
- Authorization: public functions return only public-safe fields. Admin functions call requireAdmin(ctx). User-scoped functions call requireUser(ctx) and verify ownership. Anything not meant for clients must be an internalQuery/internalMutation/internalAction.
- Never trust the client for prices, totals, delivery fees or stock. Recompute on the server.
- Stock model: product.stock is physical units on hand; product.reservedStock is units held by unpaid orders; available = stock - reservedStock. Every stock change writes a row to stockAdjustments.
- Order status changes only through the state machine in convex/lib/orderStatus.ts and always write an orderEvents row.
- Admin mutations write an auditLogs row (after Step 25 exists; before that, leave a clear TODO(audit) comment).
- Secrets only in environment variables. Never log secrets or full payment payloads containing card data.
- Accessibility and mobile-first design are requirements, not extras.

# CODE STYLE
TypeScript strict, no any without a justifying comment, small files, descriptive names, no dead code, comments only where intent is not obvious. Reusable UI goes in components/, domain logic in lib/ or convex/lib/.

# END-OF-TASK PROTOCOL
(do this after every task):
1. Run typecheck, lint and build and fix every error.
2. Run tests if any exist.
3. Update docs/PROGRESS.md with: what was done, files added/changed, new env vars, new Convex functions (name, public/internal/admin), known limitations.
4. Reply with: a short summary, exact manual steps I must do (env vars, dashboard settings), and a numbered checklist to test the feature by hand.
5. Do not touch unrelated files. If you find a bug in earlier work, report it instead of silently rewriting.
