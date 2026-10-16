# Build your box — WordPress page (czeramaison.com)

Date: 2026-10-16 · Issue: #46 · Decision record: [AgDR-0005](../../agdr/AgDR-0005-wp-box-builder-plugin.md)

## 1. Purpose

Let a gift buyer assemble one CZERA box from individual pieces and send it to
the bag as a single product. The CZERA assembly team packs the box.

**Success:** the page shows a live total, blocks anything outside the rules
with a clear reason, and the box reaches the bag as one product with its
contents listed. Visually it follows the static showroom design
(`design.md`, `build-your-box.html`).

## 2. Rules (owner decisions, 2026-10-16)

| Rule | Value |
|---|---|
| Box colour / box size | **Not chosen by the customer.** The assembly team picks a box to fit the items. |
| Towels | Up to **6** in total, any mix of the six towel products below |
| Bathrobes | Up to **2** in total, any mix of white and black |
| Minimum | At least **2 items** in total (towels + bathrobes) |
| Colours | Mix freely (no "one colour per box" rule) |
| Price | Sum of the chosen items' prices; no box fee |
| Ribbon | Not offered |

Items (existing WooCommerce products, prices from the client's catalogue):

| Group | Product | ID | Price |
|---|---|---|---|
| Towels | Face Towel 30 × 30 cm | 57 | 50 EGP |
| Towels | Hand Towel 50 × 100 cm | 60 | 230 EGP |
| Towels | Bath Towel 70 × 140 cm | 63 | 470 EGP |
| Towels | Bath Sheet 90 × 160 cm | 66 | 650 EGP |
| Towels | Blue Stripe Beach Towel 100 × 200 cm | 69 | 850 EGP |
| Towels | Yellow Stripe Beach Towel 100 × 200 cm | 72 | 850 EGP |
| Bathrobes | White Bathrobe, 1200 GSM | 51 | 1,000 EGP |
| Bathrobes | Black Bathrobe, 1200 GSM | 54 | 1,000 EGP |

## 3. Implementation

### 3.1 Plugin
**WPC Composite Products for WooCommerce** (WPClever, free, wordpress.org,
v8.0.4+; declares WooCommerce 11.2 / WordPress 7.1). Chosen in AgDR-0005.

### 3.2 The box product
A new product of type **Composite**:

| Setting | Value |
|---|---|
| Name | Build your CZERA box |
| Pricing | Exclude base price (price = sum of chosen items) |
| Quantity (whole box) | Min 2, Max 8 |
| Catalog visibility | Hidden (not in Shop / category grids or search) |
| Component **Towels** | Multiple selection: yes · custom quantity: yes · each item 0–6 · whole component 0–6 · optional · products 57, 60, 63, 66, 69, 72 |
| Component **Bathrobes** | Multiple selection: yes · custom quantity: yes · each item 0–2 · whole component 0–2 · optional · products 51, 54 |

### 3.3 Cart display (plugin global settings)
- Hide component products on cart and checkout: **"Yes, but list component
  sub-product names under the main composite in separate lines"**.
- Hide them on the mini cart (the slide-in bag) and on order details.
- Cart count = the box counts as one product.

The items remain hidden lines underneath, so WooCommerce reduces each item's
stock normally.

### 3.4 The page `/build-your-box/` (page 74)
- **Intro** (Spectra blocks): eyebrow "Build your own box", title
  "A gift set that's yours alone.", line "Choose up to six towels and two
  bathrobes. We pack them together in one CZERA box."
- **Builder:** the box product's form embedded on the page
  (WooCommerce's `[product_page]` shortcode, or its Single Product block,
  pointed at the box product's ID once the product is created).
  Each item shows photo, size or colour, price and − / + quantity.
- **Total panel:** running total, item count, reasons for anything blocked
  ("Up to 6 towels per box", "Add at least 2 items"), and the add button.
  Sticky beside the items on desktop; a bottom bar on phones (the one
  sticky-bar exception allowed by `design.md` §6.13).
- **Look:** restyled with Additional CSS to the static builder (ivory page,
  Montserrat, gold accents, "Add to bag" wording). Class prefix `czera-box-`.

### 3.5 Server-side check
The plugin enforces the limits only in the browser. A short snippet, run
through the free **Code Snippets** plugin, hooks
`woocommerce_add_to_cart_validation` for the box product and rejects the
request unless: towels ≤ 6, bathrobes ≤ 2, total ≥ 2, and every item belongs
to its group. The rejection message reuses the page's wording.

### 3.6 Copy to align afterwards
The Home page's "Build your own box" band still reads "Colour: White, or
striped for the beach. One per box", which no longer applies. Proposed steps:
**1 Towels** (any size, up to 6) · **2 Bathrobes** (white or black, up to 2) ·
**3 We pack it** (one box, assembled by our team). Confirm with the owner
before changing.

## 4. Out of scope
- WhatsApp checkout (separate plugin, later). The box line must read clearly
  in that message when it is built.
- Arabic version.
- Gift message, recipient details, delivery date.

## 5. Checks before handover
| Case | Expected |
|---|---|
| 1 item | Add button disabled; reason shown |
| 7 towels | Blocked at 6; reason shown |
| 3 bathrobes | Blocked at 2; reason shown |
| Crafted add-to-cart request outside the rules | Rejected by the server-side check |
| 2 bath towels + 1 black bathrobe | One "Build your CZERA box" line, contents listed, total 1,940 EGP |
| Order placed (test) | Stock of each chosen item reduced |
| Editor | Page editable in the block editor without layout breakage |
| Phone layout | Items stack; total panel becomes a bottom bar |

## 6. Open questions for the client
- Confirm the box needs no extra fee and the packing text on the page.
- Confirm the Home band steps in §3.6.
