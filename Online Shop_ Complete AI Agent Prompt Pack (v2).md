# Online Shop: Complete Prompt Pack for AI Coding Agents (v2)

**Stack:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Convex (database, backend, auth, file storage, cron) + Paystack (payments) + Resend (email) + Vercel (hosting).

**Store:** computer accessories, hardware, office chairs and tables, more. Supports **delivery** and **in-store pickup**.

**Design decisions baked into this pack** (so the agent never has to guess):

- Money is stored as integers in the smallest unit (pesewas). Currency is configurable, default GHS.
- Stock is **reserved** when an order is created and **deducted** when payment is confirmed. Unpaid orders expire automatically and release their reservation.
- Prices, totals, delivery fees and stock are always computed on the server.
- Public catalog pages render dynamically from Convex (no stale cache), so admin edits appear immediately and pages are still SEO-friendly.
- Catalog filtering for the store is done in the backend over indexed category queries, which is fine for catalogs up to a few thousand products.
- Online payment only (Paystack: cards and mobile money). Pay-on-pickup is an optional add-on at the end.

---

## How to use this pack

1. **Start every session with this opening line**, then paste the step prompt:

```
Read AGENTS.md, docs/DECISIONS.md and docs/PROGRESS.md first. Check the current official documentation for any library you use instead of relying on memory. Then do the task below, following the end-of-task protocol in AGENTS.md.
```

2. One step per session. After each step: run the app, work through the "Verify" checklist, then commit.
3. If the agent breaks something, use the **Fix prompt** in the Utility Prompts section.
4. Never paste real secret keys into prompts. Keys go in `.env.local` (Next.js) or Convex env vars (`npx convex env set NAME value`).
5. Read the diffs for the high-risk steps: **3 (auth), 16 (payments), 19 (orders), 25 (security)**.
6. Fill in `docs/DECISIONS.md` (created in Step 0) before Step 10.

### Step map

| Phase | Steps |
| --- | --- |
| Foundation | 0 Rules and decisions, 1 Scaffold, 2 Schema and domain logic |
| Auth and admin shell | 3 Auth, 4 Roles and admin shell, 5 Seed data |
| Catalog admin | 6 Images, 7 Categories, 8 Products, 9 CSV import/export, 10 Delivery, pickup, settings |
| Storefront | 11 Shell and home, 12 Category and search, 13 Product page, 14 Cart |
| Orders and payments | 15 Checkout, 16 Paystack, 17 Expiry and stock integrity, 18 Customer account, 19 Admin orders |
| Communication and content | 20 Emails, 21 Password reset and verification, 22 Users and inventory, 23 Pages and contact |
| Launch quality | 24 SEO and performance, 25 Security, 26 Tests and CI, 27 Deploy, 28 Operations |

---

# PHASE 1: FOUNDATION

## Step 0: Accounts, rules and decisions

**Manual first:** create accounts for GitHub, Convex, Vercel, Paystack (start in test mode), Resend, and Google Cloud (for Google sign-in). Create an empty GitHub repo. Install Node.js LTS, Git, and your agent tool.

**Prompt:**

```
Create four files in the repo root. Do not build any features yet.

1) AGENTS.md (also save an identical copy as CLAUDE.md) with exactly these sections:

PROJECT: Online shop selling computer accessories, hardware, office chairs and tables. Supports delivery and in-store pickup. Online payment via Paystack.

STACK: Next.js App Router, TypeScript (strict), Tailwind CSS, shadcn/ui, Convex (database, functions, auth, file storage, crons), Paystack, Resend (via plain fetch, no SDK), deployed on Vercel.

ARCHITECTURE RULES:
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

CODE STYLE: TypeScript strict, no any without a justifying comment, small files, descriptive names, no dead code, comments only where intent is not obvious. Reusable UI goes in components/, domain logic in lib/ or convex/lib/.

END-OF-TASK PROTOCOL (do this after every task):
1. Run typecheck, lint and build and fix every error.
2. Run tests if any exist.
3. Update docs/PROGRESS.md with: what was done, files added/changed, new env vars, new Convex functions (name, public/internal/admin), known limitations.
4. Reply with: a short summary, exact manual steps I must do (env vars, dashboard settings), and a numbered checklist to test the feature by hand.
5. Do not touch unrelated files. If you find a bug in earlier work, report it instead of silently rewriting.

2) docs/PROGRESS.md: a header and an empty "Log" section plus a "Convex function inventory" table (name | type | access | purpose).

3) docs/DECISIONS.md: a form with these fields left blank for me to fill in (use [FILL IN] placeholders): shop name; tagline; currency code (default GHS); default phone country code; support email; support phone; WhatsApp number; physical address; delivery zones (name, fee, estimated time); pickup locations (name, address, phone, opening hours); free delivery threshold (optional); unpaid order expiry minutes (default 30); low-stock threshold (default 3); max quantity per cart line (default 10); returns and warranty policy summary; whether prices include tax; production domain; email sender address; brand colors; logo status. Also include a "Decisions already made" section copying the design decisions listed at the top of the prompt pack (money as integers, reservation model, dynamic rendering, online payment only).

4) docs/SCHEMA.md: a placeholder heading to be filled in Step 2.

Commit nothing else.
```

**Verify:** four files exist; `AGENTS.md` and `CLAUDE.md` match. Fill in `docs/DECISIONS.md` as soon as you can.

---

## Step 1: Scaffold the project

```
Set up the project foundation.

1. Create a Next.js app in this repo: App Router, TypeScript, Tailwind, ESLint, `src/` directory NOT used (use app/ at root), import alias @/*.
2. Install and initialize Convex (`npx convex dev`) and wire ConvexProvider into the root layout in a client Providers component. Do not set up auth yet.
3. Initialize shadcn/ui and add: button, input, textarea, select, card, badge, dialog, sheet, table, tabs, dropdown-menu, form, label, checkbox, radio-group, switch, skeleton, sonner, separator, popover, command, alert, pagination, tooltip, scroll-area, accordion, breadcrumb.
4. Install react-hook-form, zod, @hookform/resolvers, lucide-react, papaparse (+ types), react-markdown.
5. Create this folder structure and put a short README.md comment in each folder explaining its purpose:
   - app/(store)/ for public pages
   - app/(auth)/ for sign-in, sign-up, forgot/reset password
   - app/admin/ for the admin area
   - app/account/ for customer pages
   - components/ui (shadcn), components/store, components/admin, components/shared
   - lib/ for client and shared helpers
   - convex/lib/ for backend helpers
   - docs/
6. Create lib/money.ts with: toMinor(major: number | string): number (rounds correctly, no floating-point errors), fromMinor(minor: number): number, formatMoney(minor: number, currency: string, locale?: string): string using Intl.NumberFormat. Create lib/slug.ts with slugify(text). Create lib/constants.ts with shared constants (default currency, max cart quantity default, image limits: max 8 images per product, max 5 MB each, allowed types jpeg/png/webp). Create lib/phone.ts with normalizePhone(input, defaultCountryCode) that accepts local formats like 024xxxxxxx and +233xxxxxxxxx and returns E.164, or null if invalid.
7. Design tokens: define a neutral, professional palette in globals.css with a single brand color CSS variable (default a deep blue) so I can rebrand by editing one variable. Use the Inter font via next/font. Add light mode only for now.
8. next.config: allow next/image remote patterns for Convex storage (*.convex.cloud over https).
9. Add scripts to package.json: typecheck (tsc --noEmit), lint, test (placeholder), format (prettier). Add Prettier config and a .editorconfig.
10. Add .env.example listing: NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_SITE_URL, and a commented section "Convex env vars (set with npx convex env set)": SITE_URL, PAYSTACK_SECRET_KEY, RESEND_API_KEY, EMAIL_FROM, ADMIN_ALERT_EMAIL, ALLOW_SEED, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, JWT_PRIVATE_KEY, JWKS.
11. Make sure .gitignore covers .env.local and other secrets.
12. Create a placeholder home page ("Shop coming soon"), a global not-found.tsx and error.tsx.

Both `npm run dev` and `npx convex dev` must run with zero errors. List the exact commands I must run in two terminals.
```

**Verify:** home page loads; Convex dashboard shows the project; `npm run typecheck && npm run lint && npm run build` pass.

---

## Step 2: Schema and domain logic

```
Create the full Convex schema (convex/schema.ts) and shared domain logic. No UI in this step.

TABLES (use proper validators; add every index listed):

users: extend Convex Auth's users table (leave auth tables to the library, which we wire in Step 3) with name, email, phone (optional), role ("customer" | "admin"), createdAt. Index: by_email, by_role.

categories: name, slug, parentId (optional, max two levels), description (optional, for SEO), imageId (optional storage id), sortOrder (number), isActive (boolean), specTemplate (optional array of strings: spec labels that prefill the product form). Indexes: by_slug, by_parent_and_sort (parentId, sortOrder).

products: name, slug, description (markdown string), categoryId, brand (optional), sku (optional), price (int), salePrice (optional int), stock (int), reservedStock (int, default 0), imageIds (array of storage ids), specs (array of {label, value}), isActive, isFeatured, searchText (string maintained by code: name + brand + sku + category name, lowercase), createdAt, updatedAt. Indexes: by_slug, by_category_active (categoryId, isActive), by_active_created (isActive, createdAt), by_featured_active (isFeatured, isActive), by_sku, by_brand. Search index: search_text on searchText with filterFields isActive and categoryId.

carts: userId, items (array of {productId, quantity}), updatedAt. Index: by_user.

addresses: userId, label, recipientName, phone, line1, line2 (optional), city, region, notes (optional), isDefault. Index: by_user.

orders: orderNumber (string, e.g. "ORD-000123"), userId (optional), guestToken (optional random string), checkoutKey (string, for idempotency), customer {name, email, phone}, fulfillment ("delivery" | "pickup"), deliveryAddress (optional {line1, line2, city, region, notes}), deliveryZoneId (optional), deliveryZoneName (optional snapshot), pickupLocationId (optional), pickupSnapshot (optional {name, address, openingHours}), items (array of snapshots {productId, name, sku, unitPrice, quantity, imageId}), subtotal, deliveryFee, total, currency, status, paymentStatus, paymentReferences (array of strings), paidAt (optional), cancelReason (optional), needsAttention (boolean), attentionReason (optional), customerNote (optional), internalNote (optional), expiresAt (optional, for unpaid orders), createdAt, updatedAt. Indexes: by_order_number, by_user_created, by_status_created, by_payment_status, by_checkout_key, by_email, by_expires_at (status, expiresAt), by_needs_attention.

orderEvents: orderId, type ("status" | "payment" | "note" | "email" | "system"), fromStatus (optional), toStatus (optional), message, actorId (optional), createdAt. Index: by_order_created.

deliveryZones: name, fee (int), estimatedDays (string), isActive, sortOrder.
pickupLocations: name, address, phone, openingHours (string), isActive, sortOrder.

siteSettings (singleton): shopName, tagline, currency, defaultCountryCode, contactEmail, contactPhone, whatsappNumber, address, announcement {enabled, text, link}, hero {title, subtitle, buttonText, buttonLink, imageId}, promoTiles (array of up to 3 {title, subtitle, link, imageId}), freeDeliveryThreshold (optional int), orderExpiryMinutes, lowStockThreshold, maxCartQuantity, pricesIncludeTaxNote (string), socialLinks {facebook, instagram, x, tiktok, youtube} all optional.

pages: slug, title, body (markdown), isPublished, showInFooter, sortOrder, updatedAt. Index: by_slug.
contactMessages: name, email, phone (optional), message, isRead, createdAt. Index: by_created.
paymentEvents: eventKey (unique string like reference + event type), reference, eventType, receivedAt, processedAt (optional), outcome (string). Index: by_event_key, by_reference.
stockAdjustments: productId, delta (int, signed), reason ("sale" | "reservation_release" | "manual" | "restock" | "cancel_restock" | "import" | "correction"), orderId (optional), actorId (optional), note (optional), createdAt. Index: by_product_created.
counters: name, value. Index: by_name.
auditLogs: actorId, action, entityType, entityId, summary, createdAt. Index: by_created, by_entity.
emailLogs: to, template, status ("sent" | "failed"), error (optional), orderId (optional), createdAt. Index: by_created.

SHARED DOMAIN FILES (importable by both client and backend; put them where both can import, e.g. convex/lib/ and re-export for the client):
- constants.ts: ORDER_STATUSES (pending_payment, paid, processing, ready_for_pickup, out_for_delivery, completed, cancelled), PAYMENT_STATUSES (unpaid, paid, failed, refund_pending, refunded), FULFILLMENT_TYPES, and human-readable labels and badge colors for each.
- orderStatus.ts: a state machine with function allowedNextStatuses(order) and canTransition(from, to, fulfillment). Rules: pending_payment -> paid | cancelled; paid -> processing | cancelled; processing -> ready_for_pickup (pickup only) | out_for_delivery (delivery only) | cancelled; ready_for_pickup -> completed | cancelled; out_for_delivery -> completed | cancelled; completed and cancelled are final.
- availability.ts: availableStock(product) = max(0, stock - reservedStock); stockLabel(product, lowThreshold) returning "in_stock" | "low_stock" | "out_of_stock"; effectivePrice(product) = salePrice if set and lower than price, else price.
- searchText.ts: buildSearchText(product, categoryName).
- validators.ts: reusable v.* validators for addresses, specs, order items, etc.

Also create docs/SCHEMA.md documenting every table, its purpose and its indexes in plain language.

Deliver: a deployed schema with no errors and unit-test-ready pure functions (don't write the tests yet).
```

**Verify:** `npx convex dev` accepts the schema; `docs/SCHEMA.md` reads clearly.

---

# PHASE 2: AUTH AND ADMIN SHELL

## Step 3: Authentication

**Manual first:** in Google Cloud Console create an OAuth client (Web). The agent will tell you the exact authorized redirect URI for your dev deployment (it ends with `/api/auth/callback/google` on your `.convex.site` domain).

```
Add authentication with Convex Auth for Next.js. Follow the CURRENT official Convex Auth docs for the Next.js setup (package names, middleware, providers, key generation) rather than memory.

Requirements:
1. Providers: Password (email + password) and Google.
2. Run the Convex Auth setup so the JWT keys and SITE_URL are configured on the dev deployment. Tell me the exact commands and any env vars I need to set (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET).
3. Wire the Next.js server and client providers and the middleware (convexAuthNextjsMiddleware). Protected route matchers: /account/**, /admin/**. /checkout and /cart stay open to guests.
4. Pages: /sign-in and /sign-up in app/(auth)/. Clean centered card UI, react-hook-form + zod, show/hide password toggle, "Continue with Google" button, links between the two pages, loading and error states with human-readable messages (wrong password, email already registered, weak password).
5. Password rules: minimum 8 characters, at least one letter and one number. Validate on client AND in the Convex Auth profile/password validation.
6. Support a `redirectTo` query param for post-login redirects. Validate it: it must be a relative path starting with "/" and not "//", otherwise ignore it (prevents open-redirect attacks).
7. On account creation, set role to "customer", store name and email, set createdAt. Role must never be settable from the client.
8. Header user menu (temporary simple version is fine): shows Sign in / Sign up when signed out, or the user name with Account and Sign out when signed in. Sign out must clear any client-side cart state (placeholder hook for now).
9. Expose a public query `users.me` returning {id, name, email, role} or null.

Explain how I verify: (a) sign up with email, (b) sign in with Google, (c) visiting /account while signed out redirects to /sign-in?redirectTo=/account, (d) after signing in I land back on /account.
```

**Verify:** all four checks in the prompt pass. Try `redirectTo=https://evil.com` and confirm it is ignored.

---

## Step 4: Roles and admin shell

```
Build role-based authorization and the admin shell.

BACKEND (convex/lib/auth.ts):
- getCurrentUser(ctx), requireUser(ctx), requireAdmin(ctx). requireAdmin throws a clear "Forbidden" error if the caller is not signed in or role !== "admin". Use these helpers in every function from now on.
- internalMutation `users.makeAdmin({ email })` that sets role "admin". It must NOT be callable from clients; I will run it from the Convex dashboard once. Also `users.makeCustomer({ email })` internal.

FRONTEND:
1. app/admin/layout.tsx: a SERVER-side guard. Fetch the current user with fetchQuery using the auth token (convexAuthNextjsToken). If not signed in redirect to /sign-in?redirectTo=/admin. If signed in but not admin, show a friendly 403 page (not a redirect loop). Mark all admin pages `noindex` via metadata.
2. Admin shell: left sidebar on desktop with links Dashboard, Orders, Products, Categories, Inventory, Delivery & Pickup, Pages, Messages, Users, Settings (pages for later steps can show a "Coming in a later step" placeholder). On mobile the sidebar becomes a Sheet opened from a top bar with a menu button. Highlight the active link. Show the signed-in admin's name and a "View shop" link and Sign out.
3. Create reusable admin components now so later steps stay consistent: PageHeader (title, description, actions), DataTable wrapper (responsive, empty state, loading skeleton), ConfirmDialog (for destructive actions), StatCard, EmptyState, StatusBadge.
4. Create a toast-based `useAdminAction` helper that wraps a Convex mutation call with loading state and success/error toasts.

Explain how to promote my account (the exact dashboard steps to run users.makeAdmin) and how to confirm that a second customer account sees the 403 page and that calling an admin function from the browser console as that customer fails.
```

**Verify:** your account is admin and sees the shell; a customer account gets 403 on `/admin`.

---

## Step 5: Seed data

```
Create development seed data.

1. internalMutation `seed.run` (guarded: it only runs if the Convex env var ALLOW_SEED equals "true", otherwise it throws). It must be safe to run twice (skip if categories already exist).
2. Insert: 
   - 6 top-level categories: Computer Accessories, Computer Hardware, Office Chairs, Office Tables, Networking, Printers & Ink; 2 to 4 subcategories under Accessories and Hardware (e.g. Keyboards, Mice, Headsets, RAM, SSDs, Graphics Cards). Give categories specTemplate arrays (e.g. Keyboards: Switch type, Layout, Connectivity; Office Chairs: Max weight, Material, Adjustability).
   - 36 realistic products with believable brands, descriptions in markdown, prices in GHS in pesewas, a mix of: in stock, low stock (stock <= 3), out of stock, on sale (salePrice set), featured (about 8), and 2 inactive products. Fill specs. Compute searchText for each. No images (imageIds empty): the UI will use a placeholder.
   - 3 delivery zones (e.g. Within Accra, Greater Accra outskirts, Other regions) with different fees and estimated times.
   - 2 pickup locations with opening hours.
   - The siteSettings singleton with sensible defaults and a draft hero and 3 promo tiles.
   - Draft pages: about, delivery-returns, warranty, terms, privacy, faq (placeholder text with [BRACKETS]; real text is written in Step 23).
   - counters row for order numbers starting at 1000.
3. Also create internalMutation `seed.clear` (same env guard) that removes seeded data for resets during development.
4. Document the commands to run and set ALLOW_SEED in docs/PROGRESS.md. State clearly in the docs that ALLOW_SEED must NEVER be set on the production deployment.
```

**Verify:** run `seed.run` from the Convex dashboard; tables fill up; running it again does nothing.

---

# PHASE 3: CATALOG ADMIN

## Step 6: Image upload infrastructure

```
Build reusable image handling used by categories, products, hero and promo tiles.

BACKEND (convex/files.ts):
- `files.generateUploadUrl` (admin only mutation) returns an upload URL.
- `files.getUrl(storageId)` helper used server-side to attach URLs in queries (never return raw ids to the public pages without URLs).
- `files.deleteIfUnused(storageId)` internal helper that deletes a storage file.
- A validation helper `assertValidImage(ctx, storageId)` that uses ctx.storage.getMetadata to enforce: content type in (image/jpeg, image/png, image/webp) and size <= 5 MB; if invalid it DELETES the file and throws. Every save mutation that accepts storage ids must call it for newly added ids.

FRONTEND:
1. lib/image.ts: client-side processing before upload: validate type and size, resize so the longest edge is at most 1600px, convert to WebP at about 0.85 quality using canvas, return a File. Reject files that can't be decoded.
2. components/admin/ImageUploader.tsx: supports `single` and `multiple` (max count prop). Features: click or drag-and-drop, multiple file selection, per-file upload progress and error, thumbnail previews, remove, and reorder with move-left/move-right buttons (drag-and-drop optional). First image is labeled "Main". Returns an ordered array of storage ids to the parent form via onChange. Accessible (keyboard operable, aria labels).
3. components/shared/StoreImage.tsx: wrapper over next/image that takes a URL or null; shows a tasteful neutral placeholder (icon on a gray background) when there is no image; handles sizes/priority props and object-fit.
4. A tiny test page at /admin/dev/upload (only when NODE_ENV !== "production") to try the uploader.

Orphan handling: when a form is saved with some previously stored ids removed, the mutation must delete the removed storage files. When a form is abandoned, newly uploaded but unsaved files remain; add an internal cron-friendly function `files.cleanOrphans` that is documented but not scheduled yet (we schedule it in Step 17 if needed). 
```

**Verify:** upload a 6 MB photo (it gets compressed), a PDF (rejected), reorder and remove images.

---

## Step 7: Category management

```
Build /admin/categories.

LIST: a tree view showing parents with indented children, columns: image thumbnail, name, slug, product count (active/total), sort order, active switch, actions (edit, move up, move down, delete). Search box filters by name. Empty state with a "Create your first category" button.

CREATE/EDIT (dialog or dedicated page, your choice but consistent): name, slug (auto-generated from name until manually edited; must be unique; show inline error), parent category (only top-level categories can be parents: enforce max two levels; prevent a category from being its own parent or moving a parent with children under another category), description (for SEO, 160 chars guidance), image (single uploader), sort order, active switch, and a "Spec template" editor: a list of label strings (add/remove/reorder) that will prefill the product form's specs.

RULES:
- Deleting is blocked with a clear message if the category has products or subcategories. Offer "Deactivate instead".
- Deactivating a parent hides it and its children from the public site.
- Move up/down swaps sortOrder with the neighbor within the same parent.
- Slug changes should warn "This changes the URL of the category page."

BACKEND:
- admin: categories.list, categories.get, categories.create, categories.update, categories.delete, categories.reorder, categories.setActive. All call requireAdmin, validate inputs, check slug uniqueness via by_slug, maintain image storage cleanup, and call assertValidImage for new image ids.
- public: `categories.tree` returns active categories with children, image URLs, and product counts of active products. `categories.getBySlug` returns the category, its breadcrumb path and children (only if active).
- When a category name changes, recompute searchText for its products (do it in batches via a scheduled internal mutation so large categories don't time out).
- Leave TODO(audit) comments in mutations.

Include empty, loading and error states and confirmation dialogs.
```

**Verify:** create, nest, reorder, deactivate and delete rules all behave.

---

## Step 8: Product management

```
Build /admin/products (list) and /admin/products/new and /admin/products/[id] (edit).

LIST PAGE:
- Table: thumbnail, name, category, brand, SKU, price (with sale price shown), stock, reserved, available, active badge, featured badge.
- Search (name, SKU, brand), filters: category (including subcategories), active/inactive, featured, stock state (all, in stock, low stock, out of stock), on sale. Sort by newest, name, price, stock. Server-side pagination (20 per page) with total count.
- Row actions: edit, duplicate, activate/deactivate, feature/unfeature, quick stock edit (popover with "set to" and "+/- adjust" and a reason note), delete.
- Bulk actions on selected rows: activate, deactivate, feature, unfeature, change category, delete. Bulk delete requires confirmation listing the count.

FORM:
- Fields: name, slug (auto from name until edited; unique; warn on change), category (select showing the tree), brand (free text with suggestions from existing brands), SKU (unique if provided), description (textarea supporting markdown with a live preview tab, rendered with react-markdown WITHOUT raw HTML), price, sale price (must be lower than price, with a clear error), stock, active switch, featured switch, images (multiple uploader, max 8, first is main), specs editor (rows of label + value with add/remove/reorder; when the category has a specTemplate and the specs list is empty, prefill the labels).
- Price inputs take normal currency units like 149.99 and convert to pesewas with toMinor on save; show them converted back with fromMinor on edit.
- Unsaved-changes warning when leaving the form. Save and "Save and add another" buttons. Disable buttons while saving.

BACKEND:
- admin: products.list (with filters/pagination/total), products.get, products.create, products.update, products.duplicate (copies fields, appends "(copy)", creates unique slug, inactive by default, stock 0, no images shared by reference: copy storage files or leave images empty and say so), products.setActive, products.setFeatured, products.adjustStock, products.bulkUpdate, products.delete.
- Every create/update recomputes searchText, validates slug/SKU uniqueness, validates salePrice < price, validates stock is a non-negative integer, calls assertValidImage for new ids and deletes removed ones.
- adjustStock writes a stockAdjustments row (reason "manual" or "restock" or "correction", with admin id and note). Stock can never go below reservedStock; reject such edits with a clear message.
- delete: if the product appears in ANY past order (search orders items), do NOT hard delete; deactivate it and tell the admin why. Otherwise hard delete and remove its storage files.
- public (for later steps, create now): products.getBySlug (active only, returns image URLs, availability, effective price), products.listByIds.

Add loading, empty and error states, toasts, and confirmation dialogs. Leave TODO(audit) comments.
```

**Verify:** create a product with 3 images and 4 specs; quick-adjust stock and check the adjustment history table in the dashboard; try setting a sale price above the price.

---

## Step 9: CSV import and export

```
Add bulk tools to /admin/products (a toolbar with Import, Export, Template buttons).

TEMPLATE CSV headers (exactly): name, slug, category_slug, brand, sku, description, price, sale_price, stock, is_active, is_featured, specs, image_urls. specs format: "Label:Value|Label:Value". price and sale_price are in normal currency units (e.g. 149.99). is_active/is_featured accept true/false/yes/no/1/0. image_urls is a pipe-separated list of https URLs (optional).

IMPORT FLOW (/admin/products/import page):
1. Upload a .csv (max 5 MB, 2,000 rows). Parse in the browser with papaparse (handle quotes, commas inside quotes, UTF-8 BOM, Windows line endings).
2. Show a preview table with a status per row: "Will create", "Will update", "Error: reason", "Warning: reason". Validation: required name and price, numeric fields, salePrice < price, category_slug exists, slug auto-generated if blank and made unique, stock is a non-negative integer, duplicate slugs/SKUs within the file flagged, images URLs must be https. Matching rule: if sku is present and matches an existing product, update it; else if slug matches, update it; else create.
3. A summary bar: N create, N update, N errors. Buttons: "Import valid rows" (errors skipped) and "Download error report CSV".
4. Run the import through an admin-only mutation in batches of 50 rows with a progress bar. Stock changes through import write stockAdjustments rows with reason "import". It must be safe to retry (idempotent by slug/sku).
5. For image_urls: after the batch, schedule an internal ACTION per product that downloads each URL (https only, 10 second timeout, content-type must be an image, max 5 MB), stores it in Convex storage, and appends the id to the product. Failures are recorded as warnings in a visible "Import results" panel; they must not fail the whole import.

EXPORT: "Export CSV" downloads all products (or the current filtered list) in the same format, including an `id` column that the importer ignores.

Add tests later in Step 26; for now include a sample CSV file in docs/sample-products.csv with 8 rows covering create, update, error and warning cases.
```

**Verify:** import the sample CSV; confirm errors are reported, valid rows import, and re-importing updates instead of duplicating.

---

## Step 10: Delivery, pickup and site settings

> Fill in `docs/DECISIONS.md` before this step.

```
Build the admin screens for delivery, pickup and site settings, plus the backend for them.

/admin/delivery with two tabs:
- Delivery zones: table (name, fee, estimated time, active switch, sort controls), create/edit dialog, delete with confirmation (zones used by past orders are deactivated instead of deleted).
- Pickup locations: table (name, address, phone, opening hours, active, sort), create/edit dialog, same delete rule.
Public queries: deliveryZones.listActive, pickupLocations.listActive (only active, sorted).

/admin/settings with tabs (each tab saves independently with its own Save button and unsaved-changes warning):
- Shop info: shop name, tagline, contact email, contact phone, WhatsApp number (validate with normalizePhone), address, social links, currency (select from a short list including GHS, NGN, USD, GBP, EUR), default country code.
- Homepage: announcement bar (enabled, text, optional link), hero (title, subtitle, button text, button link, image), up to 3 promo tiles (title, subtitle, link, image) with a live preview of the homepage hero.
- Orders and stock: free delivery threshold (optional; show in normal currency), unpaid order expiry minutes (min 10, max 1440), low-stock threshold, max quantity per cart line, a "prices include tax" note shown at checkout.

BACKEND:
- admin: siteSettings.getAdmin, siteSettings.update (partial per tab, validated). If the singleton is missing, create it with defaults.
- public: siteSettings.getPublic returns ONLY public-safe fields with image URLs (no internal fields).
- Validate links: internal links must start with "/" or be https URLs.
- Clean up replaced images in storage.

Document where each setting is used (to be wired in later steps) in docs/PROGRESS.md.
```

**Verify:** edit each tab, reload, values persist; `siteSettings.getPublic` contains no admin-only fields.

---

# PHASE 4: STOREFRONT

## Step 11: Storefront shell and home page

```
Build the public storefront shell and the home page. Use server components with fetchQuery (dynamic rendering) for data and small client components only for interactivity. The design must look professional, trustworthy and modern: generous whitespace, consistent spacing, clear hierarchy, and excellent mobile layout.

LAYOUT (app/(store)/layout.tsx):
- Announcement bar (from settings, dismissible for the session).
- Header: logo/shop name, a search input with debounced suggestions dropdown (top 5 products, uses the search index through a public query `products.suggest`; Enter goes to /search?q=), category navigation (desktop: top-level categories with a mega-menu showing subcategories; mobile: a slide-out menu with an accordion), account menu (Sign in/Sign up or user menu with Account, Orders, Sign out), cart icon with a live item count badge (placeholder count until Step 14). Sticky on scroll with a subtle shadow.
- Footer: shop name and tagline, contact details, social links (only those set), footer pages (from the pages table where showInFooter and isPublished), payment/security note, copyright with the current year.
- Floating WhatsApp button (hidden if no number set) that opens wa.me with a prefilled greeting.
- Skip-to-content link and landmarks (header, nav, main, footer).

HOME PAGE sections (all driven by data, each hidden if empty):
1. Hero (from settings; fall back to a tasteful default).
2. Trust strip: Delivery and in-store pickup, Secure online payment, Warranty support, Customer support. (Static text, icons via lucide.)
3. Shop by category grid (top-level categories with images or placeholder).
4. Promo tiles (from settings).
5. Featured products (isFeatured, active, newest first, up to 8).
6. New arrivals (active, newest, up to 8).
7. "Why shop with us" short block and a final call-to-action banner.

SHARED COMPONENTS to create and reuse everywhere:
- ProductCard (image or placeholder, brand, name linked to the product page, price with strike-through original and a "-X%" badge when on sale, stock badge (Low stock / Out of stock), quick "Add to cart" button that is disabled when out of stock; the add action is a no-op toast placeholder until Step 14).
- Price component (uses formatMoney with the settings currency), StockBadge, Breadcrumbs (also emits JSON-LD in later steps), SectionHeading, ProductGrid with skeleton variant.
- Queries needed: products.listFeatured, products.listNewest, products.suggest.

Add loading.tsx skeletons for the home page and handle empty catalog gracefully ("No products yet").
```

**Verify:** home looks good at 360px and 1440px widths; change the hero in admin and refresh to see it update.

---

## Step 12: Category pages, filters and search

```
Build browsing: /category/[...slug] (supports parent/child like /category/accessories/keyboards), and /search.

CATEGORY PAGE:
- Header with the category name, description, breadcrumbs, subcategory chips with product counts, product count text.
- A product grid (ProductGrid) with page-number pagination (24 per page). Pages that exceed the last page redirect to the last page.
- Include products from child categories when viewing a parent category.
- Filters (desktop sidebar, mobile bottom sheet with an "Apply" button and a "Clear all"): price range (min/max inputs, bounded by the actual min/max in the category), brand (checkbox list with counts built from the category's products), availability (in stock only), on sale only.
- Sort: Newest, Price low to high, Price high to low, Name A-Z, Best discount.
- ALL state lives in the URL query string (page, sort, minPrice, maxPrice, brand (repeatable), inStock, onSale, q) so pages are shareable and the back button works. Changing a filter resets page to 1.
- Show active filter chips that can be removed individually.
- Empty state: "No products match your filters" with a clear-filters button.
- generateMetadata: title "{Category} | {Shop name}", description from category description or a generated sentence, canonical URL without filter params, `robots: noindex` when filters other than page are active.

SEARCH PAGE (/search?q=):
- Use the Convex search index on products.searchText (filtered to active) to find matches; support the same filters and sort as the category page (apply sort "Relevance" as default for search).
- Show "N results for 'q'", handle empty query, handle no results with suggestions (popular categories and featured products).
- Strip and limit the query (max 100 chars) and never reflect it unescaped.

BACKEND:
- public query `products.browse({ categorySlug?, q?, filters, sort, page, pageSize })` returning { items (with image URL, effective price, availability), total, totalPages, facets: { brands with counts, minPrice, maxPrice } }. Implement by reading active products through the by_category_active index (for search use the search index), then filtering, sorting and slicing in the function. Cap the work (e.g. read at most 2,000 products) and document this limit in docs/PROGRESS.md.
- Only active products and active categories are ever returned.

Add loading skeletons and keep layout shift minimal.
```

**Verify:** combine filters and sorts, copy the URL into a new tab, confirm the same results; search for a brand name and a partial product name.

---

## Step 13: Product detail page

```
Build /product/[slug].

LAYOUT:
- Breadcrumbs (Home > Category > Subcategory > Product).
- Image gallery: large main image with thumbnails, keyboard navigation, swipe on mobile, click to open a full-screen lightbox with zoom; placeholder when there are no images.
- Info column: brand, name, SKU, price with sale price and savings badge, stock status text ("In stock", "Only N left", "Out of stock") based on available stock (stock - reservedStock) and the low-stock threshold, quantity selector (min 1, max min(available, maxCartQuantity)), Add to cart and Buy now buttons (disabled when out of stock; the actions are wired in Step 14), a delivery and pickup info box (text from settings), a warranty line, and share buttons (copy link, WhatsApp share).
- "Ask about this product on WhatsApp" button with a prefilled message including the product name and URL (hidden if no WhatsApp number).
- Tabs or sections: Description (markdown rendered safely with react-markdown, no raw HTML), Specifications (clean two-column table), Delivery and returns (summary from settings/pages).
- Related products: up to 4 active products from the same category excluding this one.
- Recently viewed products (stored in localStorage, up to 6, shown below related; hide the section if none).

SEO:
- generateMetadata: title, description (first 155 chars of the description without markdown), canonical URL, Open Graph image (first product image).
- JSON-LD: Product with name, image(s), description, sku, brand, and offers (price in MAJOR units as a decimal string, priceCurrency from settings, availability InStock/OutOfStock mapped from availability, url). Also BreadcrumbList JSON-LD.
- 404 via notFound() if the product is missing or inactive. If the slug changed, there is no redirect now; note this as a known limitation in docs/PROGRESS.md.

Include a loading skeleton and an error boundary.
```

**Verify:** view a product in stock, low stock and out of stock; check JSON-LD with a structured data validator; test the gallery with the keyboard.

---

## Step 14: Cart

```
Implement the shopping cart end to end.

DATA MODEL:
- Guests: cart stored in localStorage under a versioned key, as an array of {productId, quantity}.
- Signed-in users: cart stored in the Convex carts table.
- Provide a single `useCart()` hook (React context + reducer, no extra state library) exposing: items (hydrated with live product data), itemCount, subtotal, addItem(productId, qty), setQuantity, removeItem, clear, isLoading, issues. It hides whether the cart is local or remote.
- When a guest signs in, MERGE the local cart into the account cart (sum quantities, cap at available stock and maxCartQuantity) and then clear the local cart. When the user signs out, clear the cart state (the account cart stays saved in Convex).

BACKEND:
- `cart.get` (user), `cart.setItems`/`cart.addItem`/`cart.setQuantity`/`cart.removeItem`/`cart.clear` (user, validated; productId must exist).
- Public query `cart.hydrate({ items })` for guests: takes productId+quantity pairs and returns live data for each: name, slug, image URL, current effective price, available stock, isActive, plus computed `issues` per line: "unavailable" (inactive or missing), "out_of_stock", "reduced_stock" (quantity > available; include the max available), "price_changed" (compared to a priceAtAdd value if provided), and the clamped quantity. Never trust client-provided prices.

UI:
1. Header cart icon opens a cart drawer (Sheet): list of lines with image, name, unit price, quantity stepper, line total, remove button; subtotal; a note about delivery fees calculated at checkout; "View cart" and "Checkout" buttons; empty state with a link to categories.
2. /cart page: a fuller version with the same data plus a "Continue shopping" link and an order summary card, and the free-delivery progress bar if a threshold is set ("Spend X more for free delivery").
3. Wire ProductCard and the product page Add to cart / Buy now buttons: show a toast with a "View cart" action, update the badge instantly (optimistic), respect available stock (show "Max available" message), and "Buy now" goes directly to /checkout.
4. Issues UI: lines with problems show a red inline message and automatically clamp quantity where possible; checkout buttons are disabled with an explanatory message if any line is unavailable or out of stock.
5. Performance: debounce quantity changes to the server (300 ms), keep the UI responsive.

Edge cases to handle explicitly: double-click on Add to cart, product deactivated while in cart, quantity typed manually as 0 or negative or non-numeric, localStorage unavailable or corrupted JSON, two tabs open at once.
```

**Verify:** add items as a guest, refresh, sign in and confirm the merge; set a product to inactive in admin and watch the cart flag it.

---

# PHASE 5: ORDERS AND PAYMENTS

## Step 15: Checkout

```
Build /checkout and the order creation backend. Do NOT integrate Paystack yet (that is Step 16); end this step with an order in status pending_payment and a placeholder "Pay now" button that is wired in Step 16.

BACKEND: mutation `orders.createPending` (public, works for guests and signed-in users)
Input: checkoutKey (a UUID generated by the client once per checkout attempt), customer {name, email, phone}, fulfillment, deliveryZoneId?, deliveryAddress?, pickupLocationId?, customerNote?, items [{productId, quantity}], acceptedTerms (boolean, must be true).
It must, inside one transaction:
1. IDEMPOTENCY: if an order with this checkoutKey already exists, return it instead of creating a second one.
2. Validate input: name (2 to 80 chars), email format, phone via normalizePhone using the settings default country code (store the normalized E.164 value), items non-empty (max 50 lines), quantities positive integers <= maxCartQuantity.
3. Fulfillment rules: delivery requires an ACTIVE deliveryZone and a complete address (line1, city, region); pickup requires an ACTIVE pickupLocation. Snapshot the zone name or pickup name/address/hours onto the order.
4. Re-read every product from the database: must be active; use effective price (salePrice if lower); compute availability as stock - reservedStock; reject the whole order with a clear per-item error if any quantity exceeds availability.
5. Compute subtotal; deliveryFee from the zone (0 for pickup; 0 for delivery if the subtotal >= freeDeliveryThreshold); total.
6. RESERVE STOCK: increment reservedStock on each product by the ordered quantity and write stockAdjustments rows (delta 0 on stock, but record the reservation in the note, or add a reservation reason as defined in Step 2; keep an audit trail either way).
7. Generate orderNumber from the counters table ("ORD-" + zero-padded counter) atomically.
8. If the user is signed in, set userId; otherwise generate a random guestToken (at least 32 chars of randomness).
9. Set status "pending_payment", paymentStatus "unpaid", expiresAt = now + orderExpiryMinutes, needsAttention false, and write an orderEvents row ("Order created").
10. Return { orderId, orderNumber, guestToken? }.

FRONTEND /checkout:
- If the cart is empty, show a friendly empty state.
- Layout: left column steps, right column sticky order summary (lines, subtotal, delivery fee, total, tax note from settings).
- Section 1 Contact: name, email, phone. Prefill from the signed-in profile; offer "Sign in for faster checkout" link; guest checkout is allowed.
- Section 2 Fulfillment: radio cards "Delivery" or "Pick up in store". Delivery shows: for signed-in users a list of saved addresses to choose from (with "Use a new address"), the address form (line1, line2, city, region, notes), a zone select with fees and estimated times, and a checkbox "Save this address" (signed-in only). Pickup shows the active pickup locations as selectable cards with address, phone and hours.
- Section 3 Notes: optional order note (max 300 chars).
- Terms checkbox linking to /terms and /delivery-returns.
- Validation with react-hook-form + zod mirroring server rules; scroll to and focus the first error.
- Pressing the submit button calls createPending once (disable and show a spinner; reuse the same checkoutKey on retry so double-clicks never create two orders). On success, store the result and route to /checkout/pay/[orderNumber]?token=... (a page you create now showing the order summary and a disabled "Pay now (coming in Step 16)" button).
- Surface server-side stock errors clearly and send the user back to the cart with the affected lines highlighted.
- Order summary recalculates when fulfillment or zone changes (display only; the server is the source of truth).
```

**Verify:** place a pickup order and a delivery order; check totals, delivery fee, free-delivery threshold, reserved stock in the products table and the order events; double-click Submit and confirm only one order exists.

---

## Step 16: Paystack payments and webhook

**Manual first:** in the Paystack dashboard (test mode) copy the **test secret key**. Run `npx convex env set PAYSTACK_SECRET_KEY sk_test_...` and `npx convex env set SITE_URL http://localhost:3000`. After the agent builds the webhook, register its URL in Paystack Dashboard > Settings > API Keys & Webhooks (use the `.convex.site` URL, not `.convex.cloud`).

```
Integrate Paystack securely. Follow the current Paystack API docs for Initialize Transaction, Verify Transaction and Webhooks.

1. ACTION `payments.initialize({ orderNumber, guestToken? })` (public action; verify ownership: signed-in owner or matching guestToken):
   - Load the order through an internal query; only orders with status pending_payment and paymentStatus unpaid or failed can be paid; reject expired/cancelled orders with a clear message.
   - Generate a unique reference like `${orderNumber}-${timestamp}-${random}` and append it to order.paymentReferences via an internal mutation.
   - Call POST https://api.paystack.co/transaction/initialize with Authorization Bearer PAYSTACK_SECRET_KEY, body: email, amount (order total in the smallest unit), currency (from settings), reference, callback_url (`${SITE_URL}/order/${orderNumber}/confirmation` plus the guest token query param if any), metadata { orderId, orderNumber }. Do not restrict channels (so cards and mobile money are available).
   - Return only the authorization_url to the client, then redirect the browser to it. Never expose the secret key or full Paystack responses to the client.
   - Extend the expiresAt of the order by a few minutes so a customer in the middle of paying isn't expired.

2. HTTP ACTION POST /paystack/webhook in convex/http.ts (keep Convex Auth's routes too):
   - Read the RAW request body text. Verify header x-paystack-signature equals the HMAC-SHA512 (hex) of the raw body using PAYSTACK_SECRET_KEY (use Web Crypto, constant-time comparison). Invalid signature: respond 401 and log nothing sensitive.
   - Parse JSON. Handle "charge.success" and "charge.failed" (ignore others with 200).
   - Idempotency: build eventKey = reference + ":" + event; if a paymentEvents row with that key already has processedAt, return 200 immediately.
   - For charge.success: DO NOT trust the payload alone. Call the Verify Transaction API with the reference and require status "success", matching amount, matching currency, and that the reference exists in order.paymentReferences. If any check fails, record outcome "mismatch", set order.needsAttention=true with attentionReason, and respond 200.
   - Apply payment in ONE internal mutation `payments.applySuccess`:
       a. If order.paymentStatus is already paid: record outcome "duplicate" and stop.
       b. If the order status is pending_payment: set paymentStatus "paid", status "paid", paidAt now; convert each reservation into a deduction (stock -= qty, reservedStock -= qty, never below 0) and write stockAdjustments rows (reason "sale", orderId).
       c. If the order was already cancelled/expired (late payment): try to deduct stock directly if available; if not enough stock, STILL mark paymentStatus "paid" but set needsAttention=true with attentionReason "Paid after expiry, insufficient stock: refund or restock" and write an orderEvents row. Do not leave the customer's money unaccounted for.
       d. Write orderEvents rows ("Payment received", reference, channel if available) and a paymentEvents row with processedAt and outcome.
       e. Schedule the confirmation emails (Step 20 adds the templates; for now schedule a no-op internal action `emails.sendOrderConfirmation` that just logs).
   - For charge.failed: set paymentStatus "failed" (the order stays payable until it expires) and log an orderEvents row.
   - Always respond 200 quickly after processing; use 5xx only for unexpected exceptions so Paystack retries.

3. CONFIRMATION PAGE /order/[orderNumber]/confirmation:
   - Access: the owning signed-in user, or a guest with the matching token query param. Others get a generic not-found.
   - If a `reference` or `trxref` query param is present and the order is still unpaid, run an ACTION `payments.verifyReference` that performs the same verification + applySuccess as the webhook (shared code, idempotent). NEVER mark an order paid merely because the browser returned to this page.
   - Show states: Paid (order number, summary, fulfillment details, "what happens next" for delivery or pickup), Processing payment (auto-poll every 3 seconds for up to 60 seconds using the reactive query), Failed/Cancelled (retry payment button), Expired.
   - Clear the cart once the order is paid.

4. Replace the Step 15 placeholder on /checkout/pay/[orderNumber] with a working "Pay now" button that calls payments.initialize and redirects. Also allow "Retry payment" from the order page for unpaid orders that are not expired (new reference each time).

5. Document in docs/PROGRESS.md: the exact webhook URL format, how to register it in Paystack, how to test with test cards and test mobile money numbers, and how to replay a webhook from the Paystack dashboard to prove idempotency.
```

**Verify:** pay with a Paystack test card; order becomes paid, stock decreases once, reservation clears. Replay the webhook from the Paystack dashboard and confirm nothing doubles. Close the payment tab midway, return, and confirm the order is still payable.

---

## Step 17: Order expiry and stock integrity

```
Make stock and unpaid orders self-healing.

1. Convex cron (convex/crons.ts) running every 10 minutes: internal mutation `orders.expireUnpaid` that finds orders with status pending_payment and expiresAt < now (use by_expires_at), processes them in batches of 50, and for each: set status "cancelled", cancelReason "Payment not completed in time", release reservations (reservedStock -= qty, never below 0) with stockAdjustments rows, write an orderEvents row. If more remain, schedule itself again. It must be idempotent and skip orders that became paid.
2. Before cancelling, the job must check with Paystack: schedule an internal action for orders that have paymentReferences to verify whether any reference actually succeeded (a payment may have been completed but the webhook delayed). If a reference succeeded, apply the payment instead of cancelling. Keep this to a bounded number of API calls per run.
3. Admin tool at /admin/inventory/tools (admin only): "Recompute reserved stock" action that recalculates each product's reservedStock from all orders in status pending_payment, shows a diff table (product, current, recalculated) and lets the admin apply fixes. Document when to use it.
4. A "Needs attention" list at /admin/orders?attention=1 backed by the by_needs_attention index, with the reason and quick actions (open order, mark resolved with a note).
5. Schedule the `files.cleanOrphans` job from Step 6 weekly if it is safe: it must only delete storage files that are older than 24 hours and not referenced by any product, category or settings document.
6. Add a customer-visible message on the checkout/order page: "Your order is held for N minutes."

Add logging (console.log with order numbers only, no personal data) so I can see cron runs in the Convex logs.
```

**Verify:** set expiry to 10 minutes in settings, create an unpaid order, wait for the cron, confirm it cancels and releases reserved stock.

---

## Step 18: Customer account and order tracking

```
Build the customer area under /account (requires sign-in) and guest order lookup.

PAGES:
- /account: overview with welcome, recent orders (3), default address, quick links.
- /account/profile: edit name and phone (normalized), show email (read-only), change password (current password + new password using Convex Auth's supported flow; if the library cannot do this, provide a "Send me a reset link" button that uses the reset flow added in Step 21 and note the dependency).
- /account/addresses: list, add, edit, delete, set default (exactly one default). Max 10 addresses.
- /account/orders: paginated list (10 per page) with order number, date, total, fulfillment type, status badge, payment status, and "View".
- /account/orders/[orderNumber]: full detail: items with images, totals, fulfillment info (delivery address or pickup location with hours and a "Get directions" link), payment status, a status TIMELINE built from orderEvents and adapted to the fulfillment type (Delivery: Placed, Paid, Processing, Out for delivery, Completed. Pickup: Placed, Paid, Processing, Ready for pickup, Completed), actions: "Pay now" (if unpaid and not expired), "Cancel order" (customers may cancel ONLY unpaid orders; this releases reservations), "Reorder" (adds available items to the cart and reports which were unavailable), "Download invoice" (print-friendly page).
- /track (public): form with order number and email; on match show a limited read-only status view (status, timeline, items, fulfillment). Rate-limit attempts (Step 25 adds the global limiter; add a simple per-IP-less limiter now by counting failed attempts per email+orderNumber per hour in a table or using the rate limiter component if installed) and ALWAYS return the same generic message for "not found" and "email mismatch" so order numbers can't be probed.

BACKEND:
- addresses.* (list, create, update, delete, setDefault) with ownership checks and validation.
- orders.listMine (paginated), orders.getMine(orderNumber) (ownership enforced), orders.cancelMine, orders.trackLookup({orderNumber, email}), orders.getForConfirmation({orderNumber, token?}).
- Public order queries must NEVER return internalNote or other admin-only fields; build a `toCustomerOrderView` mapper and use it everywhere.
- Checkout (Step 15) should now use saved addresses and the "Save this address" option end to end; verify it works.

Account area is `noindex`. Include empty, loading and error states.
```

**Verify:** users only ever see their own orders (try another user's order URL); guest tracking returns the generic message on wrong email.

---

## Step 19: Admin orders and dashboard

```
Build /admin/orders, /admin/orders/[orderNumber] and the /admin dashboard.

ORDERS LIST:
- Table: order number, date/time, customer name, items count, total, fulfillment (badge), payment status (badge), status (badge), attention flag.
- Filters: status, fulfillment type, payment status, date range, needs attention. Search by order number, customer name, email or phone. Sort by newest/oldest/total. Server-side pagination (25 per page) with total.
- "Export CSV" of the current filtered result (order number, date, customer, email, phone, fulfillment, address or pickup location, items summary, subtotal, delivery fee, total, status, payment status).
- Unpaid pending orders hidden by default behind a "Show unpaid" toggle (they are not real sales yet).

ORDER DETAIL:
- Header: order number, created time, status and payment badges, needs-attention banner with the reason and a "Mark resolved" action (requires a note).
- Customer: name, email (mailto), phone (tel and WhatsApp links), customer note.
- Fulfillment: delivery address (with copy button) or pickup location with hours; delivery zone and fee.
- Items table with images, SKU, unit price, quantity, line total; totals.
- Payment: status, paidAt, all paymentReferences, and a "Verify with Paystack" button (admin action that re-verifies the latest reference using the shared verification code).
- STATUS CHANGE control: a dropdown/buttons showing ONLY allowed next statuses from the state machine for this order's fulfillment type, with an optional note, and a confirmation dialog. Cancelling a PAID order requires a reason, restocks the items (stock += qty with stockAdjustments reason "cancel_restock"), sets paymentStatus "refund_pending" and flags it for refund; cancelling an unpaid order just releases reservations. A "Mark refunded" action (after the admin refunded in the Paystack dashboard) sets paymentStatus "refunded" with a note.
- Internal notes (admin only, appendable, timestamped, never shown to customers).
- Activity timeline from orderEvents (status changes, payments, notes, emails).
- Actions: Print packing slip (print-friendly page, includes pickup/delivery info and a checklist), Print invoice/receipt, Resend confirmation email (wired in Step 20).

BACKEND (all admin only, validated, with TODO(audit)):
- orders.adminList, orders.adminGet, orders.updateStatus (uses canTransition and writes orderEvents; schedules the right customer email via an internal action stub that Step 20 completes), orders.cancel, orders.markRefunded, orders.addInternalNote, orders.resolveAttention, orders.adminExportRows.

DASHBOARD (/admin):
- Stat cards: orders today, revenue today and last 7 days (PAID orders only), orders awaiting action (paid or processing), ready-for-pickup count, needs-attention count, low-stock products count, out-of-stock count.
- A 7-day sales bar list built with plain divs (no chart library).
- Tables: latest 8 paid orders, 8 lowest-stock active products with links.
- Keep queries efficient (use indexes and bounded reads) and handle empty states.
```

**Verify:** run an order through the full pickup and delivery paths; try to jump to an invalid status (should be impossible); cancel a paid order and check restock and the refund flag.

---

# PHASE 6: COMMUNICATION AND CONTENT

## Step 20: Transactional emails

**Manual first:** in Resend, add and verify your sending domain (DNS records), create an API key, then run `npx convex env set RESEND_API_KEY ...`, `npx convex env set EMAIL_FROM "Shop Name <orders@yourdomain.com>"`, and `npx convex env set ADMIN_ALERT_EMAIL you@example.com`. Until your domain is verified, test with Resend's sandbox sender.

```
Implement transactional email using the Resend REST API via fetch from Convex actions (no SDK).

INFRASTRUCTURE:
- internalAction `emails.send({ to, subject, html, text, replyTo?, orderId?, template })`: validates addresses, calls Resend, retries once on a transient failure, writes an emailLogs row (sent or failed with a short error, never the API key). Failures must never break orders or payments (always called via ctx.scheduler.runAfter(0, ...)).
- A small template system in convex/emails/: a base layout (shop name/logo text, brand color, responsive, 600px max width, plain-text fallback), helpers for money formatting and escaping HTML. Escape every user-provided value.

TEMPLATES (each has HTML + text versions):
1. Order confirmation (to customer, after payment): order number, items table, totals, then either delivery address + estimated delivery time or pickup location + hours + "bring your order number and ID", and a link to track the order (guest links include the token).
2. Ready for pickup (pickup orders).
3. Out for delivery (delivery orders).
4. Order completed ("Thank you" with a link to the shop).
5. Order cancelled (with reason, and refund note if paid).
6. Refund processed.
7. New order alert (to ADMIN_ALERT_EMAIL): order number, customer, total, fulfillment, link to the admin order.
8. Needs-attention alert (to admin) when an order is flagged.
9. Daily low-stock digest (to admin) via a Convex cron at 07:00 shop time listing products at or below the threshold; send nothing if the list is empty.
10. Contact form message (to the shop contact email, reply-to the sender; used in Step 23).

WIRING:
- Replace the earlier stubs: payments.applySuccess schedules templates 1 and 7; orders.updateStatus schedules templates 2, 3, 4; cancel schedules 5; markRefunded schedules 6; needsAttention sets schedule 8.
- Admin "Resend confirmation email" action on the order page.
- /admin/emails (simple page): the last 100 emailLogs with status and error text so I can debug delivery.
- Provide a dev-only internalAction `emails.sendTest({to})` to preview each template.
```

**Verify:** send test emails of each template to yourself, open them on a phone, and check they render in Gmail.

---

## Step 21: Password reset and email verification

```
Complete the authentication lifecycle using Convex Auth's supported email flows with Resend (follow the CURRENT Convex Auth docs for "Password reset" and "Email verification").

1. EMAIL VERIFICATION on sign-up: send a one-time code (8 digits, expires in 15 minutes) via the email infrastructure from Step 20; add a verification code step to /sign-up; allow "Resend code" with a 60 second cooldown. Accounts are not usable until verified. Google sign-in accounts count as verified.
2. PASSWORD RESET: /forgot-password (enter email, always show the same neutral message whether or not the account exists), email with a one-time code or link (15 minutes), /reset-password to enter the code and a new password (same password rules), then sign the user in or send them to /sign-in with a success message.
3. Rate-limit code requests (max 5 per email per hour) and attempts (max 5 wrong codes then invalidate).
4. Security emails: "Your password was changed" notification.
5. Update the sign-in page with a "Forgot password?" link, and the account profile page's change-password feature to match.
6. Make sure existing seeded/admin accounts can still sign in and that account enumeration is not possible through error messages on sign-in, sign-up and reset.

Document the full flow and how to test it in docs/PROGRESS.md.
```

**Verify:** sign up with a new email and verify, reset a password, request a reset for a non-existent email and confirm the response looks identical.

---

## Step 22: Users and inventory admin

```
Build /admin/users and /admin/inventory.

USERS (/admin/users):
- Table: name, email, role badge, orders count, total spent (paid orders), joined date. Search by name/email. Pagination.
- Detail page: profile, addresses, orders list with links.
- Role change (customer <-> admin) with a confirmation dialog. Safeguards: an admin cannot demote themselves, and the last remaining admin cannot be demoted. Write an audit TODO.
- No hard delete in the UI; add a documented internal mutation for GDPR-style anonymization (`users.anonymize`: removes name/email/phone/addresses and unlinks orders but keeps order financial records) that only I can run from the dashboard.

INVENTORY (/admin/inventory):
- Table of all products: image, name, SKU, stock, reserved, available, low-stock flag; filters (low stock, out of stock, category), search, sort by available ascending.
- Inline "adjust stock" popover (set or +/-, reason: restock, correction, damage/loss, note) that writes stockAdjustments.
- Per-product history drawer showing stockAdjustments (date, delta, reason, order link, admin, note).
- A global "Recent stock movements" tab with pagination and filters (reason, date).
- "Export inventory CSV".
- A link to the tools page from Step 17.

Backend: all admin only and validated. Stock can never be set below reservedStock.
```

**Verify:** try demoting yourself (blocked); adjust stock and see the history entry.

---

## Step 23: Pages, contact and content

```
Build the content management for static pages and the contact flow.

1. PUBLIC PAGES: dynamic route app/(store)/[slug]/page.tsx that renders a published page from the `pages` table (title, markdown body rendered safely, last updated) with proper metadata; reserved slugs (cart, checkout, search, category, product, account, admin, track, contact, sign-in, sign-up, forgot-password, reset-password, order) must be rejected when creating pages. Unpublished or missing pages return 404.
2. ADMIN /admin/pages: list (title, slug, published, in footer, updated), create/edit page with fields: title, slug, markdown body with a Write/Preview toggle and a small formatting help, published switch, show-in-footer switch, sort order. Delete with confirmation. The footer renders links from this data.
3. WRITE REAL DRAFT CONTENT for these seeded pages, in clear friendly professional English, using [BRACKETS] for anything I must fill in, and add a visible note in the admin editor that these are drafts and not legal advice: About us, Delivery and returns (delivery zones/timeframes, pickup instructions, return window, conditions, refund process), Warranty, Terms and conditions, Privacy policy (what data is collected: account, orders, delivery details; Paystack processes payments and we do not store card details; Resend for email; Convex/Vercel hosting; cookies used for sign-in and cart; how to request deletion or correction; contact), FAQ (at least 10 questions about orders, payment, delivery, pickup, returns, warranty).
4. CONTACT: /contact page with the shop's details (address, phone, email, WhatsApp, opening hours from pickup locations) and a form (name, email, phone optional, message 10 to 2000 chars). Anti-spam: hidden honeypot field plus the rate limiter (max 3 messages per email per hour; Step 25 adds a global limiter, use the component now if installed). On submit: save to contactMessages and schedule email template 10 to the shop.
5. ADMIN /admin/messages: inbox list with unread bold, detail view, mark read/unread, delete, "Reply" opening a mailto with the subject prefilled.
6. Update the footer and the sitemap source list to include published pages.
```

**Verify:** edit the About page and see it live; submit the contact form twice quickly to see the rate limit.

---

# PHASE 7: LAUNCH QUALITY

## Step 24: SEO, performance, accessibility, analytics

```
Polish the storefront for search engines, speed and accessibility.

SEO:
1. app/sitemap.ts generating URLs for: home, all active categories, all active products (with lastModified), published pages. app/robots.ts allowing the public site and disallowing /admin, /account, /checkout, /cart, /track, /api, and search result pages with query strings; reference the sitemap.
2. Per-page metadata everywhere (title templates "%s | Shop name", descriptions, canonical URLs using NEXT_PUBLIC_SITE_URL, Open Graph and Twitter cards). Create a default OG image generator route (next/og) with the shop name and brand color.
3. JSON-LD: Organization and WebSite (with SearchAction pointing to /search?q={query}) on the home page; Product and BreadcrumbList already exist on product pages; add BreadcrumbList to category pages.
4. Make sure every private area (admin, account, checkout, cart, track, order confirmation) has noindex metadata.

PERFORMANCE:
5. Use next/image everywhere with correct `sizes`, priority only on the LCP image, lazy loading elsewhere, and explicit dimensions or aspect ratios to prevent layout shift.
6. Fonts via next/font with display swap; no render-blocking third-party scripts.
7. Add loading.tsx, error.tsx and not-found.tsx where missing (store, admin, account).
8. Audit and remove unused dependencies and large client bundles (convert components to server components when possible); report bundle size of the main routes.
9. Add @vercel/analytics and @vercel/speed-insights to the root layout (production only).

ACCESSIBILITY:
10. Check and fix: color contrast (WCAG AA), visible focus states, labels for all inputs, alt text from product names, aria-live for toasts and cart updates, keyboard navigation for menus, drawers, dialogs and the gallery, semantic headings (one h1 per page), reduced-motion support.
11. Add a PWA-style web manifest with the shop name, theme color and icons, and a favicon set.

Run Lighthouse (mobile) on home, category, product and checkout pages and report scores with the fixes applied. Target: Performance 85+, Accessibility 95+, Best Practices 95+, SEO 95+. List anything that could not be fixed and why.
```

**Verify:** sitemap and robots load; Lighthouse mobile scores meet the targets.

---

## Step 25: Security hardening and audit logging

```
Perform a full security hardening pass and add admin audit logging.

1. FUNCTION AUDIT: list EVERY Convex function in a table in docs/SECURITY.md with columns: file, name, type (query/mutation/action, public/internal), who can call it, what it returns, and the checks it performs. Fix anything that is public but should be admin-only or internal. Confirm no public function returns internal notes, other users' data, emails, phones, addresses or storage ids that grant more than intended.
2. AUTHORIZATION TESTS: for every admin function verify it calls requireAdmin; for every user-scoped function verify ownership checks. Add comments marking the guard line.
3. AUDIT LOGGING: implement `logAudit(ctx, {action, entityType, entityId, summary})` and call it in every admin mutation (products, categories, orders, settings, pages, users, delivery/pickup, stock adjustments, imports). Replace every TODO(audit). Build /admin/audit: filterable log (actor, entity type, date) with pagination. Never put secrets or full personal data in summaries.
4. RATE LIMITING: install @convex-dev/rate-limiter and apply limits: sign-in/sign-up/reset attempts (in addition to library defaults), contact form (3/hour/email), order lookup /track (10/hour per email+order), createPending (10/hour per email, 30/hour global per client fingerprint when available), payments.initialize (10/hour per order), search suggestions (a generous cap). Return friendly "please try again later" messages.
5. INPUT HARDENING: enforce maximum lengths on every string field in every public/admin mutation; strip control characters; markdown rendered with react-markdown must not allow raw HTML or javascript: links (add a link sanitizer: only http, https, mailto, tel, relative).
6. UPLOAD HARDENING: confirm admin-only upload URLs, type/size validation after upload, and that storage URLs of deleted files are removed.
7. WEBHOOK HARDENING: confirm signature verification uses constant-time comparison, that the endpoint rejects bodies over 1 MB, and replay safety via paymentEvents.
8. HTTP SECURITY HEADERS in next.config: Content-Security-Policy (allow self, Convex origins (https and wss), Paystack checkout domains only if embedded, Vercel analytics, data: images, and fonts from next/font), Strict-Transport-Security, X-Content-Type-Options nosniff, X-Frame-Options DENY (or frame-ancestors none), Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy denying camera/microphone/geolocation. Test every page in the browser console for CSP violations and fix them.
9. SECRETS AND DEPENDENCIES: grep the repo and client bundle for any secret or key names; ensure only NEXT_PUBLIC_ vars reach the client; run `npm audit` and fix or document high/critical findings; pin versions.
10. OPEN REDIRECTS, XSS, IDOR, CSRF REVIEW: check every redirect parameter, every place user content is rendered (names, notes, messages, product text), every id-in-URL access, and every state-changing call. Write the findings (severity, location, fix, status) in docs/SECURITY.md.
11. PRIVACY: confirm we never store card data, personal data isn't written to logs, and add a data-retention note to the privacy page draft.

Finish with a short "Security status" summary: fixed, accepted risks, and remaining recommendations.
```

**Verify:** read `docs/SECURITY.md`; test hitting limits manually (contact form, track page); check the browser console for CSP errors on every page type.

---

## Step 26: Tests and CI

```
Add automated tests and a CI pipeline.

UNIT TESTS (vitest): money (toMinor/fromMinor/formatMoney edge cases like 0.1+0.2, 19.995, large values), slugify, normalizePhone (many Ghana and international formats, invalid input), searchText builder, availability and effectivePrice, order state machine (every allowed and forbidden transition for both fulfillment types), CSV parser/validator (quotes, BOM, bad numbers, duplicate slugs, specs parsing), redirectTo validator.

CONVEX FUNCTION TESTS (convex-test with vitest) covering at minimum:
- orders.createPending: recomputes price from DB ignoring client prices, rejects inactive products, rejects quantity above availability, reserves stock, computes delivery fee, free-delivery threshold, pickup has zero fee, idempotency by checkoutKey, guest token generated, order number increments, terms required.
- payments: applySuccess deducts stock and clears reservation exactly once (call twice), handles late payment after expiry (with and without stock), amount mismatch flags attention, webhook signature validation (valid, invalid, missing), verify-with-Paystack mocked.
- orders.expireUnpaid releases reservations and skips paid orders.
- orders.updateStatus enforces the state machine and writes events; cancelling a paid order restocks and flags refund.
- Authorization: customer cannot call any admin function; customer cannot read another user's order; guest token required for guest order views; public queries never return inactive products or internal notes.
- products: slug/SKU uniqueness, salePrice < price, stock cannot go below reserved, delete rule for products in past orders.
- cart: merge guest cart into account cart with stock caps.

END-TO-END (Playwright, with Paystack stubbed so no real payments are attempted): browse -> category filter -> product -> add to cart -> checkout as guest with pickup -> reaches the pay page; admin signs in -> creates a product -> it appears on the storefront; customer cannot open /admin.

CI: GitHub Actions workflow running install, typecheck, lint, unit and Convex tests, and build on every push and pull request. E2E runs on pull requests only (or manually) to keep CI fast.

Add npm scripts (test, test:convex, test:e2e) and a TESTING.md explaining how to run everything. Report coverage on the money/order/payment modules and fix any bugs the tests reveal.
```

**Verify:** all tests pass locally and in GitHub Actions.

---

## Step 27: Deploy to production

**Manual checklist before the prompt:**

1. Paystack: complete business verification so live keys are enabled.
2. Domain: have your domain ready and access to its DNS.
3. Resend: sending domain verified.
4. Google Cloud: you will add the production redirect URI the agent gives you.

```
Prepare production deployment and write the documentation. Do not change features.

1. Write DEPLOY.md with exact, ordered steps I can follow:
   a. Create the Convex PRODUCTION deployment and deploy (`npx convex deploy`). 
   b. Set ALL production Convex env vars with `npx convex env set --prod ...` (or the dashboard): SITE_URL (production URL), PAYSTACK_SECRET_KEY (LIVE key), RESEND_API_KEY, EMAIL_FROM, ADMIN_ALERT_EMAIL, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, and Convex Auth's production JWT_PRIVATE_KEY and JWKS (explain how to generate them for production per the current Convex Auth docs). ALLOW_SEED must NOT be set in production.
   c. Vercel: import the GitHub repo; set the build command to `npx convex deploy --cmd 'npm run build'`; add environment variables CONVEX_DEPLOY_KEY (production deploy key from Convex), NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_SITE_URL; set the production branch.
   d. Domain: add the custom domain in Vercel and the exact DNS records; wait for SSL; update SITE_URL/NEXT_PUBLIC_SITE_URL; redeploy.
   e. Google OAuth: add the production authorized redirect URI (the production .convex.site callback URL) and the production origin.
   f. Paystack: switch to LIVE keys; register the production webhook URL (production .convex.site /paystack/webhook); confirm the callback URLs use the live domain; enable the payment channels wanted (card, mobile money).
   g. Resend: confirm DNS (SPF, DKIM) passes and the production sender works.
   h. Create the first admin: sign up on production, then run users.makeAdmin from the PRODUCTION Convex dashboard.
   i. Initial content: create categories, delivery zones, pickup locations, settings, pages. DO NOT run seed in production.
   j. Smoke tests (a checklist): sign up/in, add to cart, guest checkout pickup, delivery checkout, pay with a REAL small amount, webhook received, order paid, emails received, admin sees the order, status updates send emails, refund the test payment in Paystack and mark it refunded, sitemap/robots load, Lighthouse run, mobile test on a real phone with mobile money.
   k. Rollback plan: how to redeploy the previous Vercel build and the previous Convex deployment state, and how to disable checkout quickly (add a setting `checkoutEnabled` to siteSettings that the checkout page and createPending respect; implement it now and show an "ordering temporarily unavailable" banner when off).
2. Write README.md for a new developer (setup, scripts, env vars, architecture overview, folder structure, how Convex functions are organized).
3. Add a production-safety check: a script or startup assertion that throws if ALLOW_SEED is "true" while SITE_URL is the production domain.
4. Make sure no test keys or dev URLs are hard-coded anywhere (grep and report).
```

**Verify:** follow `DEPLOY.md` top to bottom; complete the smoke tests with a real small payment and refund it.

---

## Step 28: Operations manual and launch

```
Write docs/OPERATIONS.md: a plain-language manual for running the shop day to day, for a non-developer shop owner/staff. Include step-by-step instructions with the exact admin pages and buttons for:
- Adding a single product (with photos and specs), editing price, setting a sale, hiding a product, marking out of stock, featuring a product.
- Bulk adding or updating products with the CSV template (including image URLs) and how to read error reports.
- Managing categories and the homepage (hero, promo tiles, announcement bar).
- Processing an order from payment to completion for DELIVERY and for PICKUP, including which status to choose at each point and what emails the customer receives.
- Handling problems: customer says they paid but the order shows unpaid (verify with Paystack), an order flagged "needs attention", a late payment after expiry, cancelling and refunding a paid order (including how to refund in the Paystack dashboard and then mark it refunded), out-of-stock after payment, wrong address, a customer wanting to change an order.
- Stock management: adjusting stock, low-stock alerts, reading the stock history, the recompute-reserved-stock tool.
- Editing delivery zones, fees, pickup locations and opening hours; changing the free-delivery threshold and expiry time.
- Editing pages (About, Delivery and returns, Terms, Privacy) and answering contact messages.
- Temporarily disabling checkout.
- Adding a new admin or staff account safely and removing admin access.
- Backups: how to export data from the Convex dashboard (and with `npx convex export`), recommended weekly schedule, where to store backups, and how to restore.
- Monitoring: where to look at Convex logs, Vercel logs, email logs (/admin/emails), and the audit log (/admin/audit); weekly and monthly routines.
- Key rotation: how to rotate Paystack, Resend and Google keys without downtime.
- A glossary of order statuses and payment statuses.
Add a one-page "Daily checklist" and "Weekly checklist" at the top.
```

**Launch checklist (manual):**

- [ ] Real products added with consistent, clean photos
- [ ] All pages customized and legal texts reviewed by a professional
- [ ] Delivery fees and pickup hours verified
- [ ] Real small payment tested end to end and refunded
- [ ] Tested on a real phone with mobile money
- [ ] Admin alert email works and is monitored
- [ ] First backup exported and stored safely
- [ ] Google Search Console set up with the sitemap submitted
- [ ] Business social profiles linked in settings

---

# UTILITY PROMPTS

### Fix prompt (when something breaks)

```
Something is broken. Do NOT rewrite unrelated code.
What I did: [steps]
What I expected: [expected]
What happened: [actual behavior]
Error text / logs: [paste exactly]
Find the root cause first and explain it in two sentences, then apply the smallest correct fix, add or update a test that would have caught it, and follow the end-of-task protocol.
```

### Review prompt (run after each phase and before deploying)

```
Review everything changed since [commit or step] as a strict senior reviewer. Check: correctness, authorization on every Convex function, validation, error handling, stock and money logic, race conditions, accessibility, mobile layout, performance, naming and duplication. Do not edit anything yet. Give me a prioritized list (critical, important, minor) with file and line references and a recommended fix for each.
```

### Gap audit prompt (run before Step 27)

```
Audit the whole codebase against docs/DECISIONS.md and the feature list below. For each item report: Done / Partial / Missing, with the file or function that implements it and any bug you notice. Do not fix anything yet.
Feature list: guest and account checkout; delivery and pickup; delivery zones and fees; free delivery threshold; stock reservation, deduction, expiry and release; Paystack initialize, webhook, verify, retry, late-payment handling; order state machine and timeline; customer cancellation of unpaid orders; refunds flow; emails (all templates); password reset and email verification; admin products, categories, inventory, orders, users, pages, messages, settings, audit log; CSV import/export; image upload and cleanup; search and filters; SEO (sitemap, robots, JSON-LD, metadata); security (rate limits, headers, authorization); tests and CI; deployment docs; operations manual; checkout kill switch.
```

### Context handoff prompt (when a session gets long or you switch agents)

```
Summarize the current state for a fresh session: what is built, what step I am on, open bugs, decisions made, env vars set, and the next task. Append it to docs/PROGRESS.md under "Handoff" and keep it under 300 words.
```

---

# OPTIONAL ADD-ONS (after launch)

### Add-on A: Pay on pickup / cash on delivery

```
Add an optional payment method "Pay on pickup" (pickup orders) and "Pay on delivery" (delivery orders), controlled by two switches in siteSettings (default off).
- Checkout shows a payment method choice only for enabled options; online payment stays the default.
- Orders paid offline are created with status "paid"-equivalent flow: add paymentMethod ("online" | "cash_on_pickup" | "cash_on_delivery") and paymentStatus "unpaid" until the admin marks it paid. Stock is DEDUCTED at order creation for offline orders (no reservation expiry), with the stockAdjustments reason "sale".
- Admin can mark an offline order as paid on completion; the state machine and emails must be extended accordingly.
- Add abuse limits: maximum offline order value (setting), required phone verification note, and rate limiting per phone and email.
- Update emails, the order timeline, dashboard revenue rules (count revenue only when paid) and tests.
```

### Add-on B: Discount codes

```
Add discount codes: a discountCodes table (code, type percent|fixed, value, minSubtotal, maxUses, usedCount, perCustomerLimit, startsAt, endsAt, isActive). Admin CRUD page. Checkout field to apply a code with server-side validation inside createPending (never trust the client). Store the discount snapshot on the order, reduce the total accordingly, and ensure the Paystack amount equals the discounted total. Increment usedCount only when the order is paid; handle expiry/cancel correctly. Update emails, invoices, exports and tests.
```

### Add-on C: Product reviews

```
Add verified-buyer reviews: customers can review products they have bought (completed orders). Rating 1 to 5, title, body. Admin moderation queue (approve/reject/delete). Show average rating and review list on product pages, add aggregateRating to the Product JSON-LD only for approved reviews, rate-limit submissions, escape all text, and add tests.
```

### Add-on D: Wishlist, product variants, order-status SMS/WhatsApp notifications

Request each as its own prompt, using the Review prompt first to confirm the current codebase is clean.

---

# COVERAGE MAP (no gaps check)

| Capability | Step |
| --- | --- |
| Rules, decisions, progress tracking | 0 |
| Money, slug, phone, shared utilities | 1 |
| Full data model, state machine, stock model | 2 |
| Sign up, sign in, Google, safe redirects | 3 |
| Roles, admin guard, admin UI kit | 4 |
| Dev seed data | 5 |
| Image upload, validation, cleanup | 6 |
| Categories (tree, spec templates) | 7 |
| Products (CRUD, bulk actions, stock log, duplicate, safe delete) | 8 |
| CSV import/export with image URLs | 9 |
| Delivery zones, pickup locations, site settings, homepage content | 10 |
| Header, footer, home, WhatsApp, shared components | 11 |
| Category pages, filters, sort, search | 12 |
| Product page, gallery, SEO schema, related, recently viewed | 13 |
| Cart (guest + account + merge + live validation) | 14 |
| Checkout with delivery/pickup, idempotency, reservation, guest tokens | 15 |
| Paystack init, webhook, verify, retry, late payments | 16 |
| Order expiry, reconciliation, needs-attention queue | 17 |
| Customer account, addresses, orders, tracking, cancel, reorder | 18 |
| Admin orders, refunds flow, notes, invoices, dashboard | 19 |
| Emails (customer + admin + digest) | 20 |
| Email verification, password reset | 21 |
| Admin users, inventory, stock history | 22 |
| Static pages, contact form, inbox | 23 |
| SEO, performance, accessibility, analytics | 24 |
| Security hardening, rate limits, audit log | 25 |
| Tests and CI | 26 |
| Production deployment, kill switch, rollback | 27 |
| Operations manual, backups, monitoring | 28 |