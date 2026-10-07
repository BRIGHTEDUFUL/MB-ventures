# Store Decisions & Configurations

Source of truth for storefront configuration. Runtime values live in the `siteSettings` Convex table and are written by `convex/seed.ts`. Anything marked **PLACEHOLDER** is a seeded dummy value and must be replaced before launch.

---

## Launch blockers (placeholders seeded in `convex/seed.ts`)

| Field | Seeded value | Replace with |
| --- | --- | --- |
| `siteSettings.contactPhone` | `+233 24 000 0000` | Real support line |
| `siteSettings.whatsappNumber` | `+233 24 000 0000` | Real WhatsApp line |
| `pickupLocations[0].phone` | `+233 24 000 0000` | Real branch line |
| `momoAccounts[0].number` (MTN) | `0240000000` | Real MoMo wallet |
| `momoAccounts[1].number` (Telecel) | `0200000000` | Real MoMo wallet |
| `socialLinks.whatsapp` | `wa.me/233240000000` | Real WhatsApp link |

**Risk if skipped**: customers transfer money to numbers nobody owns, and support links go nowhere.

---

## Decisions already made
- **Money representation**: Money is stored as integers in the smallest unit (pesewas). Currency is configurable, default `GHS`.
- **Stock & Reservation model**: Stock is **reserved** when an order is created and **deducted** when payment is confirmed. Unpaid orders expire automatically and release their reservation.
- **Server computation**: Prices, totals, delivery fees and stock are always computed on the server.
- **Dynamic rendering**: Public catalog pages render dynamically from Convex (no stale cache), so admin edits appear immediately and pages are still SEO-friendly (`export const dynamic = "force-dynamic"`).
- **Backend catalog filtering**: Catalog filtering for the store is done in the backend over indexed category queries.
- **Payment Methods**: Manual Mobile Money (MoMo — MTN, Telecel/Vodafone Cash, AirtelTigo Money), Cash on Delivery (COD), or Pay in Store. No payment gateway.
- **Storefront Design System (UI Design Pack)**: Adopted `docs/DESIGN.md` specification. Plain-spoken specialist retailer aesthetic; strict anti-AI-tells rulebook; restrained neutral palette with ink `#14181F`, canvas `#F4F5F6`, hairline borders `#E3E5E8`, single accent `#D9480F` for offers; typography Archivo + Public Sans + IBM Plex Mono; 8px max radius; hair-line borders; tabular-nums pricing; no gradients or fake urgency. Follows companion workflow UI-0 to UI-19.

---

## Store Configuration Form

### 1. General & Branding
- **Shop Name**: MB Ventures GH
- **Tagline**: Premium Computer Accessories, Hardware & Ergonomic Office Furniture
- **Brand Colors**: Primary Vibrant Blue (`#0284c7` / `#2563eb`), Accent Vibrant Orange/Amber (`#ea580c` / `#f97316`), Dark Slate Neutral (`#0f172a`)
  - Note: storefront component styling uses the `docs/DESIGN.md` token set (`ink`, `canvas`, `line`, `accent #D9480F`). The blue/orange pair above is the brand identity, not the CSS token values. Confirm which one wins before adding new pages.
- **Logo Status**: Ready ([Logo.jpeg](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/Logo.jpeg))
- **Production Domain**: `[FILL IN]`

### 2. Contact Information
- **Support Email**: `orders@mbventuresgh.com`
- **Email Sender Address**: `[FILL IN]` — e.g. `MB Ventures GH <orders@mbventuresgh.com>`. Required before Resend is wired up.
- **Support Phone**: `[PLACEHOLDER] +233 24 000 0000`
- **WhatsApp Number**: `[PLACEHOLDER] +233 24 000 0000` (also seeded as `https://wa.me/233240000000`)
- **Default Phone Country Code**: seeded as `GH`, but `lib/phone.ts` expects the `+233` form and will render `+GH`. Pick one and align the seed.
- **Physical Address**: Circle Commercial Area, Accra, Ghana
- **Pickup Branch**: MB Ventures Main Store, Circle Commercial District, Accra, Ghana, Mon - Sat 8:00 AM - 6:00 PM, phone `[PLACEHOLDER] +233 24 000 0000`

### 3. Currency & Pricing
- **Currency Code**: GHS (amounts stored as integer pesewas)
- **Prices Include Tax**: Yes — seeded note is "All prices inclusive of taxes". Confirm this matches the actual VAT/NHIL position before launch.

### 4. Delivery & Pickup
- **Delivery Zones** (fee in pesewas, seeded in `convex/seed.ts`):
  1. Accra Central & Surroundings — GHS 35.00 — Same day / 24 hours
  2. Greater Accra (Tema, Kasoa, Adenta) — GHS 50.00 — 1 - 2 business days
  3. Other Regions (Kumasi, Takoradi, Tamale) — GHS 80.00 — 2 - 3 business days via VIP/OA Express
- **Pickup Locations**:
  1. MB Ventures Main Store — Circle Commercial District, Accra, Ghana — Mon - Sat: 8:00 AM - 6:00 PM — phone `[PLACEHOLDER]`
- **Free Delivery Threshold**: GHS 5,000 (500000 pesewas). Set to none by clearing `siteSettings.freeDeliveryThreshold`.

### 5. Order & Inventory Settings
- **Unpaid Order Expiry Minutes**: 30
- **Low-Stock Threshold**: 3
- **Max Quantity Per Cart Line**: 10

### 6. Payment Methods
- **MoMo (MTN, Telecel, AirtelTigo)**: enabled. Customer transfers manually and submits a reference; admin verifies.
  - Shop wallets seeded: MTN `0240000000` **[PLACEHOLDER]**, Telecel `0200000000` **[PLACEHOLDER]**. No AirtelTigo wallet seeded yet.
- **Cash on Delivery**: enabled (`cashOnDeliveryEnabled: true`)
- **Pay In Store**: enabled (`payInStoreEnabled: true`)

### 7. Policies & Legal Summaries
- **Returns Policy Summary**: `[FILL IN]`
- **Warranty Policy Summary**: `[FILL IN]`
- **Delivery & Pickup Policy**: `[FILL IN]`
- **Privacy Policy / Terms**: `[FILL IN]` — these belong in the `pages` table once the content page step lands.
