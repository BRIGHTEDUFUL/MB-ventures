# Store Decisions & Configurations

Please fill in the `[FILL IN]` fields before Step 10.

---

## Decisions already made
- **Money representation**: Money is stored as integers in the smallest unit (pesewas). Currency is configurable, default `GHS`.
- **Stock & Reservation model**: Stock is **reserved** when an order is created and **deducted** when payment is confirmed. Unpaid orders expire automatically and release their reservation.
- **Server computation**: Prices, totals, delivery fees and stock are always computed on the server.
- **Dynamic rendering**: Public catalog pages render dynamically from Convex (no stale cache), so admin edits appear immediately and pages are still SEO-friendly (`export const dynamic = "force-dynamic"`).
- **Backend catalog filtering**: Catalog filtering for the store is done in the backend over indexed category queries.
- **Online payment first**: Online payment only via Paystack (cards and mobile money). Pay-on-pickup is an optional add-on post-launch.
- **Storefront Design System (UI Design Pack)**: Adopted `docs/DESIGN.md` specification. Plain-spoken specialist retailer aesthetic; strict anti-AI-tells rulebook; restrained neutral palette with ink `#14181F`, canvas `#F4F5F6`, hairline borders `#E3E5E8`, single accent `#D9480F` for offers; typography Archivo + Public Sans + IBM Plex Mono; 8px max radius; hair-line borders; tabular-nums pricing; no gradients or fake urgency. Follows companion workflow UI-0 to UI-19.

---

## Store Configuration Form

### 1. General & Branding
- **Shop Name**: MB Ventures GH
- **Tagline**: Premium Computer Accessories, Hardware & Ergonomic Office Furniture
- **Brand Colors**: Primary Vibrant Blue (`#0284c7` / `#2563eb`), Accent Vibrant Orange/Amber (`#ea580c` / `#f97316`), Dark Slate Neutral (`#0f172a`)
- **Logo Status**: Ready ([Logo.jpeg](file:///c:/Users/NHANA_K_OTTO/Desktop/Online%20Shop/Logo.jpeg))
- **Production Domain**: [FILL IN]

### 2. Contact Information
- **Support Email**: [FILL IN]
- **Email Sender Address** (e.g. `Shop Name <orders@yourdomain.com>`): [FILL IN]
- **Support Phone**: [FILL IN]
- **WhatsApp Number** (for customer support & share buttons): [FILL IN]
- **Default Phone Country Code** (e.g. `+233` for Ghana): [FILL IN - default: +233]
- **Physical Address**: [FILL IN]

### 3. Currency & Pricing
- **Currency Code**: [FILL IN - default: GHS]
- **Whether Prices Include Tax**: [FILL IN - e.g. Yes, all prices inclusive of VAT/NHIL]

### 4. Delivery & Pickup
- **Delivery Zones** (Name, Fee in currency, Estimated time):
  1. [FILL IN - Zone 1, Fee, Estimated Delivery Time]
  2. [FILL IN - Zone 2, Fee, Estimated Delivery Time]
  3. [FILL IN - Zone 3, Fee, Estimated Delivery Time]
- **Pickup Locations** (Name, Address, Phone, Opening Hours):
  1. [FILL IN - Location 1 Name, Address, Phone, Hours]
  2. [FILL IN - Location 2 Name, Address, Phone, Hours]
- **Free Delivery Threshold** (Optional minor/major amount): [FILL IN - e.g. GHS 500 or None]

### 5. Order & Inventory Settings
- **Unpaid Order Expiry Minutes**: [FILL IN - default: 30]
- **Low-Stock Threshold**: [FILL IN - default: 3]
- **Max Quantity Per Cart Line**: [FILL IN - default: 10]

### 6. Policies & Legal Summaries
- **Returns Policy Summary**: [FILL IN]
- **Warranty Policy Summary**: [FILL IN]
