# MB Ventures GH – Convex Database Schema

This document details the database schema for the **MB Ventures GH** online shop. All persistent application data lives in Convex. Prices, fees, and money amounts are stored as integers in the smallest currency unit (**pesewas**; 100 pesewas = 1 GHS).

---

## Tables Overview

The schema also spreads `authTables` from `@convex-dev/auth`, which provides the built-in auth tables (`sessions`, `accounts`, `verifications`). They are not listed below.

| Table | Purpose | Primary Indexes |
| --- | --- | --- |
| `users` | Customer & admin user profiles | `by_email`, `by_role` |
| `categories` | Product categories (up to 2 levels) | `by_slug`, `by_parent_and_sort` |
| `products` | Catalog items, specs, pricing, and stock | `by_slug`, `by_category_active`, `by_active_created`, `by_featured_active`, `by_sku`, `by_brand`, search: `search_text` |
| `carts` | Persistent shopping carts for authenticated users | `by_user` |
| `addresses` | Saved customer delivery addresses | `by_user` |
| `orders` | Customer purchases, fulfillment info, and payments | `by_order_number`, `by_user_created`, `by_status_created`, `by_payment_status`, `by_payment_method`, `by_checkout_key`, `by_email`, `by_expires_at`, `by_needs_attention` |
| `orderEvents` | Immutable chronological event log for orders | `by_order_created` |
| `deliveryZones` | Dispatch geographical zones & shipping fees | `by_active_and_sort` |
| `pickupLocations` | Physical store pickup points & opening hours | `by_active_and_sort` |
| `siteSettings` | Global shop branding, announcement, hero & policies | Singleton |
| `pages` | Markdown content pages (About, Terms, Warranty, etc.) | `by_slug` |
| `contactMessages` | Customer inquiries submitted via contact form | `by_created` |
| `stockAdjustments` | Comprehensive audit trail for physical & reserved inventory | `by_product_created` |
| `counters` | Atomic sequence counters (e.g. for order number generation) | `by_name` |
| `auditLogs` | Administrative action audit trail | `by_created`, `by_entity` |
| `emailLogs` | Audit log of transactional emails sent via Resend | `by_created` |

---

## Detailed Table Specifications

### 1. `users`
Stores user profile information. Integrates with `@convex-dev/auth`.
- **Fields:**
  - `name`: `string` (optional) – Customer's display name.
  - `email`: `string` (optional) – Email address.
  - `phone`: `string` (optional) – Normalized E.164 phone number.
  - `role`: `"customer" | "admin"` – Role for RBAC authorization. Defaults to `"customer"`.
  - `createdAt`: `number` – Timestamp when the profile was created.
- **Indexes:**
  - `by_email` (`email`): Quick lookup during auth, profile updates, and admin user search.
  - `by_role` (`role`): Fast filtering of admin users and role verification.

---

### 2. `categories`
Hierarchical product categories supporting up to two levels (e.g. "Chairs" -> "Ergonomic Chairs").
- **Fields:**
  - `name`: `string` – Category display name.
  - `slug`: `string` – URL slug (e.g. `office-chairs`).
  - `parentId`: `id("categories")` (optional) – ID of parent category for sub-categories.
  - `description`: `string` (optional) – Category SEO description and header text.
  - `imageId`: `id("_storage")` (optional) – Uploaded category hero image.
  - `sortOrder`: `number` – Display sort priority in navigation menus.
  - `isActive`: `boolean` – Flag controlling whether category appears on the storefront.
  - `specTemplate`: `array of string` (optional) – Common spec labels (e.g. `["Material", "Warranty", "Max Weight"]`) to prefill product creation.
- **Indexes:**
  - `by_slug` (`slug`): Direct lookup by category URL slug.
  - `by_parent_and_sort` (`parentId`, `sortOrder`): Efficient nested navigation rendering ordered by sort priority.

---

### 3. `products`
The core catalog item table containing product details, stock levels, specs, and search text.
- **Fields:**
  - `name`: `string` – Product title.
  - `slug`: `string` – Unique URL-safe slug.
  - `description`: `string` – Product details formatted in Markdown.
  - `categoryId`: `id("categories")` – Reference to category.
  - `brand`: `string` (optional) – Manufacturer or brand name.
  - `sku`: `string` (optional) – Stock keeping unit identifier.
  - `price`: `number` – Regular selling price in pesewas.
  - `salePrice`: `number` (optional) – Discounted promo price in pesewas.
  - `stock`: `number` – Physical units currently on hand in the warehouse/store.
  - `reservedStock`: `number` – Units held by orders awaiting payment (`available = stock - reservedStock`).
  - `imageIds`: `array of id("_storage")` – Stored product photos.
  - `specs`: `array of { group?: string, label: string, value: string }` – Technical specifications table (`group` buckets rows under a heading).
  - `isActive`: `boolean` – Storefront visibility flag.
  - `isFeatured`: `boolean` – Flag for homepage spotlight and recommended carousel.
  - `searchText`: `string` – Lowercased combination of `name + brand + sku + category` maintained on write for fast search.
  - `createdAt`: `number` – Creation timestamp.
  - `updatedAt`: `number` – Last edit timestamp.
- **Indexes:**
  - `by_slug` (`slug`): Fast lookup for product detail pages (`/product/[slug]`).
  - `by_category_active` (`categoryId`, `isActive`): Category page listing of active products.
  - `by_active_created` (`isActive`, `createdAt`): New arrivals feed.
  - `by_featured_active` (`isFeatured`, `isActive`): Featured products carousel on homepage.
  - `by_sku` (`sku`): Quick SKU lookup in inventory and CSV imports.
  - `by_brand` (`brand`): Brand filtering.
  - **Search Index** `search_text`: Full-text search on `searchText` filtered by `isActive` and `categoryId`.

---

### 4. `carts`
Persistent shopping cart for signed-in users (guest carts live in client localStorage and merge upon sign-in).
- **Fields:**
  - `userId`: `id("users")` – User owning the cart.
  - `items`: `array of { productId: id("products"), quantity: number }` – Selected items.
  - `updatedAt`: `number` – Timestamp of last cart update.
- **Indexes:**
  - `by_user` (`userId`): Direct cart retrieval upon login or checkout.

---

### 5. `addresses`
Customer address book for shipping and delivery.
- **Fields:**
  - `userId`: `id("users")` – Address owner.
  - `label`: `string` – Friendly label (e.g. "Home", "Office").
  - `recipientName`: `string` – Person receiving the delivery.
  - `phone`: `string` – Normalized contact phone number.
  - `line1`: `string` – Street address, house/building number, or landmark.
  - `line2`: `string` (optional) – Apartment, suite, or additional instructions.
  - `city`: `string` – City or town.
  - `region`: `string` – Region (e.g. Greater Accra, Ashanti, Western).
  - `notes`: `string` (optional) – Delivery directions or landmarks.
  - `isDefault`: `boolean` – Flag if this is the default shipping destination.
- **Indexes:**
  - `by_user` (`userId`): Fast list query for checkout address selection and account page.

---

### 6. `orders`
The master order record. Captures frozen snapshots of purchased items, prices, addresses, and state.
- **Fields:**
  - `orderNumber`: `string` – Human-friendly unique identifier (e.g. `ORD-000123`).
  - `userId`: `id("users")` (optional) – Linked user account, or empty for guest orders.
  - `guestToken`: `string` (optional) – Secret random token for guest order tracking.
  - `checkoutKey`: `string` – Idempotency key preventing double-charge or duplicate submissions.
  - `customer`: `{ name: string, email: string, phone: string }` – Customer contact details.
  - `fulfillment`: `"delivery" | "pickup"` – Chosen fulfillment route.
  - `deliveryAddress`: `{ line1, line2?, city, region, notes? }` (optional) – Delivery destination.
  - `deliveryZoneId`: `id("deliveryZones")` (optional) – Zone selected for fee calculation.
  - `deliveryZoneName`: `string` (optional) – Snapshot of zone name at order time.
  - `pickupLocationId`: `id("pickupLocations")` (optional) – Selected pickup location.
  - `pickupSnapshot`: `{ name, address, openingHours }` (optional) – Frozen snapshot of pickup point.
  - `items`: `array of { productId, name, sku?, unitPrice, quantity, imageId? }` – Immutable snapshots of items purchased.
  - `subtotal`: `number` – Items subtotal in pesewas.
  - `deliveryFee`: `number` – Delivery shipping fee in pesewas.
  - `total`: `number` – Total payable in pesewas (`subtotal + deliveryFee`).
  - `currency`: `string` – Currency code (e.g. `"GHS"`).
  - `status`: Order status string (`pending`, `awaiting_momo`, `pending_verification`, `processing`, `ready_for_pickup`, `out_for_delivery`, `completed`, `cancelled`).
  - `paymentMethod`: `"momo" | "cash_on_delivery" | "pay_in_store"` – How the customer will pay. No payment gateway.
  - `paymentStatus`: Payment status string (`unpaid`, `pending_verification`, `paid`, `refunded`).
  - `momoNetwork`: `"MTN" | "Telecel" | "AirtelTigo"` (optional) – Network the customer transferred from. Empty for COD / pay-in-store.
  - `momoPhone`: `string` (optional) – MoMo number the transfer was sent from.
  - `momoReference`: `string` (optional) – Transaction reference the customer submitted; admin confirms it against the shop's MoMo account.
  - `paidAt`: `number` (optional) – Timestamp when payment was verified.
  - `cancelReason`: `string` (optional) – Reason if cancelled.
  - `needsAttention`: `boolean` – Flag signaling manual staff review (e.g. overpayment, stock discrepancy).
  - `attentionReason`: `string` (optional) – Reason staff attention is required.
  - `customerNote`: `string` (optional) – Order instructions provided by customer.
  - `internalNote`: `string` (optional) – Admin staff internal notes.
  - `expiresAt`: `number` (optional) – Deadline for payment before unpaid stock reservation is released.
  - `createdAt`: `number` – Creation timestamp.
  - `updatedAt`: `number` – Last modification timestamp.
- **Indexes:**
  - `by_order_number` (`orderNumber`): Fast lookup by human order code.
  - `by_user_created` (`userId`, `createdAt`): Customer order history list.
  - `by_status_created` (`status`, `createdAt`): Admin order queue filtering by status.
  - `by_payment_status` (`paymentStatus`): Admin finance and reconciliation filtering.
  - `by_payment_method` (`paymentMethod`): Filter orders by MoMo, cash on delivery, or pay in store.
  - `by_checkout_key` (`checkoutKey`): Idempotency check during checkout creation.
  - `by_email` (`customer.email`): Public guest tracking lookup and customer lookup.
  - `by_expires_at` (`status`, `expiresAt`): Scheduled cron query for releasing unpaid expired orders.
  - `by_needs_attention` (`needsAttention`): Admin dashboard attention inbox.

**Status flow** (enforced by `convex/lib/orderStatus.ts`):
- MoMo: `pending → awaiting_momo → pending_verification → processing → out_for_delivery | ready_for_pickup → completed`
- COD / pay in store: `pending → processing → out_for_delivery | ready_for_pickup → completed`
- `cancelled` is reachable from any non-terminal state and releases the stock reservation.

---

### 7. `orderEvents`
Chronological event stream documenting all status transitions, notifications, and notes on an order.
- **Fields:**
  - `orderId`: `id("orders")` – Parent order.
  - `type`: `"status" | "payment" | "note" | "email" | "system"` – Event category.
  - `fromStatus`: `string` (optional) – Starting status for transitions.
  - `toStatus`: `string` (optional) – Destination status.
  - `message`: `string` – Human-readable description of what occurred.
  - `actorId`: `string` (optional) – User ID, admin ID, or `"system"`.
  - `createdAt`: `number` – Timestamp of event.
- **Indexes:**
  - `by_order_created` (`orderId`, `createdAt`): Chronological order history timeline.

---

### 8. `deliveryZones`
Configurable shipping rates and delivery estimates by territory.
- **Fields:**
  - `name`: `string` – Zone name (e.g. "Accra Central", "Tema & Outer Accra", "Kumasi").
  - `fee`: `number` – Shipping cost in pesewas.
  - `estimatedDays`: `string` – Estimated delivery timeframe (e.g. "1-2 business days").
  - `isActive`: `boolean` – Active toggle.
  - `sortOrder`: `number` – Presentation ordering.
- **Indexes:**
  - `by_active_and_sort` (`isActive`, `sortOrder`): Active zone listing at checkout.

---

### 9. `pickupLocations`
Store and depot locations available for customer collection.
- **Fields:**
  - `name`: `string` – Location name (e.g. "MB Ventures Main Showroom - Accra").
  - `address`: `string` – Physical street address.
  - `phone`: `string` – Branch telephone number.
  - `openingHours`: `string` – Hours of operation (e.g. "Mon - Sat: 8:30 AM - 6:00 PM").
  - `isActive`: `boolean` – Active toggle.
  - `sortOrder`: `number` – Presentation order.
- **Indexes:**
  - `by_active_and_sort` (`isActive`, `sortOrder`): Active pickup point listing.

---

### 10. `siteSettings` (Singleton)
Global storefront configurations, branding metadata, announcements, and thresholds.
- **Fields:**
  - `shopName`: `string` – Name of shop ("MB Ventures GH").
  - `tagline`: `string` – Sub-headline.
  - `currency`: `string` – Primary currency ("GHS").
  - `defaultCountryCode`: `string` – Telephone prefix used for formatting phone numbers. Seeded as `GH`; `lib/phone.ts` expects the `+233` form.
  - `contactEmail`: `string` – Public contact email.
  - `contactPhone`: `string` – Public customer service phone.
  - `whatsappNumber`: `string` – Direct WhatsApp support line.
  - `address`: `string` – Physical showroom address.
  - `announcement`: `{ enabled: boolean, text: string, link?: string }` – Top promotional banner.
  - `hero`: `{ title, subtitle, buttonText, buttonLink, imageId? }` – Homepage hero configuration.
  - `promoTiles`: `array of { title, subtitle, link, imageId? }` – Up to 3 featured promo tiles.
  - `momoAccounts`: `array of { network, number, name }` – The shop's own MoMo numbers, displayed to the customer at checkout so they know where to send money and whose name to expect.
  - `cashOnDeliveryEnabled`: `boolean` – Toggles cash on delivery as an offered payment method.
  - `payInStoreEnabled`: `boolean` – Toggles pay at the pickup counter as an offered payment method.
  - `freeDeliveryThreshold`: `number` (optional) – Minimum order in pesewas for free shipping.
  - `orderExpiryMinutes`: `number` – Time limit for pending unpaid orders (e.g. 60 min).
  - `lowStockThreshold`: `number` – Threshold alerting low inventory (e.g. 5).
  - `maxCartQuantity`: `number` – Max allowable quantity per item in cart (e.g. 10).
  - `pricesIncludeTaxNote`: `string` – Legal disclaimer note on pricing and VAT.
  - `socialLinks`: `{ facebook?, instagram?, x?, tiktok?, youtube?, whatsapp? }` – Social profile URLs.

---

### 11. `pages`
Static policy and informational pages rendered from Markdown.
- **Fields:**
  - `slug`: `string` – Page URL slug (`about`, `delivery-returns`, `warranty`, `terms`, `privacy`, `faq`).
  - `title`: `string` – Page heading title.
  - `body`: `string` – Markdown document content.
  - `isPublished`: `boolean` – Published visibility flag.
  - `showInFooter`: `boolean` – Link inclusion in storefront footer.
  - `sortOrder`: `number` – Ordering index in navigation and footer.
  - `updatedAt`: `number` – Modification timestamp.
- **Indexes:**
  - `by_slug` (`slug`): Quick route lookup (`/p/[slug]`).

---

### 12. `contactMessages`
Customer messages sent through the `/contact` form.
- **Fields:**
  - `name`: `string` – Sender's name.
  - `email`: `string` – Sender's email address.
  - `phone`: `string` (optional) – Contact phone.
  - `message`: `string` – Inquired message text.
  - `isRead`: `boolean` – Read status for admin review.
  - `createdAt`: `number` – Submission timestamp.
- **Indexes:**
  - `by_created` (`createdAt`): Admin contact inbox sorted by date.

---

### 13. `stockAdjustments`
Strict double-entry style inventory journal recording all stock changes.
- **Fields:**
  - `productId`: `id("products")` – Product adjusted.
  - `delta`: `number` – Signed unit change (+ for additions/restocks, - for sales/write-offs).
  - `reason`: `"sale" | "reservation_release" | "manual" | "restock" | "cancel_restock" | "import" | "correction"` – Reason code.
  - `orderId`: `id("orders")` (optional) – Linked order ID if applicable.
  - `actorId`: `string` (optional) – User or admin making change.
  - `note`: `string` (optional) – Audit justification memo.
  - `createdAt`: `number` – Timestamp of adjustment.
- **Indexes:**
  - `by_product_created` (`productId`, `createdAt`): Historical stock ledger per product.

---

### 14. `counters`
Atomic sequence counters for generating sequential codes (e.g. `ORD-000001`).
- **Fields:**
  - `name`: `string` – Counter key name (e.g. `"order_number"`).
  - `value`: `number` – Current integer sequence value.
- **Indexes:**
  - `by_name` (`name`): Direct counter retrieval and increment.

---

### 15. `auditLogs`
Audit log recording every administrative mutation.
- **Fields:**
  - `actorId`: `string` (optional) – Admin ID who performed the action.
  - `action`: `string` – Mutation name (e.g. `"product.update"`, `"order.cancel"`).
  - `entityType`: `string` – Target entity type (`"product"`, `"order"`, `"settings"`).
  - `entityId`: `string` – Identifier of modified entity.
  - `summary`: `string` – Human-readable description of change.
  - `createdAt`: `number` – Timestamp of action.
- **Indexes:**
  - `by_created` (`createdAt`): Admin activity feed in reverse chronological order.
  - `by_entity` (`entityType`, `entityId`): Full change history of any individual record.

---

### 16. `emailLogs`
Transactional email dispatch log.
- **Fields:**
  - `to`: `string` – Recipient email address.
  - `template`: `string` – Template identifier (e.g. `"order_confirmation"`, `"order_shipped"`).
  - `status`: `"sent" | "failed"` – Delivery status.
  - `error`: `string` (optional) – Error message if dispatch failed.
  - `orderId`: `id("orders")` (optional) – Linked order ID.
  - `createdAt`: `number` – Timestamp of dispatch attempt.
- **Indexes:**
  - `by_created` (`createdAt`): Chronological email log for troubleshooting.
