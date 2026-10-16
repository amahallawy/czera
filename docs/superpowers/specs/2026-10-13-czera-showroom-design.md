# Czera showroom: design spec

**Date**: 2026-10-13
**Issue**: #9
**Status**: Draft, awaiting owner review
**Mockups**: `.superpowers/brainstorm/605-1791904595/content/` (local, gitignored)

## 1. What changes and why

The site was built as a design with placeholder content. The client has now
supplied the real catalogue, and the site is rebuilt around it:

- **Source of truth for every fact, name and price**:
  `assets/czera products/<product>/info.txt` (plus photos) and
  `assets/CZERA’s Catalogue 15-09-2026.pdf`. Nothing from the old copy carries
  over: no "Egyptian cotton", "Nile Delta" or "600–800 GSM".
- **Positioning**: a consumer showroom for home and gift buyers, not a B2B
  hospitality site. `PRODUCT.md`, `design.md` and `CLAUDE.md` are updated to
  match in the same PR as this spec.
- **Buying**: visitors add products to a **bag**, then send the whole bag as an
  order on **WhatsApp**. No payment or checkout on the site.

Supported claims (and only these): 100% (premium) cotton; towels 650+ GSM
(catalogue p6); robes 1200 GSM, fit up to 130 kg; ultra soft and highly
absorbent; hotel-style quality; gift-ready black box with satin ribbon. Do not
say "by hand" unless the client confirms it.

## 2. Products and pricing

16 products in four categories. Display names follow the catalogue and drop
the repeated "Luxury" prefix. Prices in EGP.

| Category | Product | Contents / spec | Price |
|---|---|---|---|
| Towels | Face Towel | 30 × 30 cm | 50 |
| Towels | Hand Towel | 50 × 100 cm | 230 |
| Towels | Bath Towel | 70 × 140 cm | 470 |
| Towels | Bath Sheet | 90 × 160 cm | 650 |
| Bathrobes | White Bathrobe | 1200 GSM, fits up to 130 kg | 1,000 |
| Bathrobes | Black Bathrobe | 1200 GSM, fits up to 130 kg | 1,000 |
| Beach | Blue Stripe Beach Towel | 100 × 200 cm | 850 |
| Beach | Yellow Stripe Beach Towel | 100 × 200 cm | 850 |
| Gift sets | The Complete Czera Set | 2 × 30×30, 50×100, 70×140, 90×160; burgundy ribbon | 1,450 |
| Gift sets | 3 Bath Towels Set | 3 × 70×140 | 1,410 |
| Gift sets | 3 Bath Sheets Set | 3 × 90×160 | 1,950 |
| Gift sets | Hand & Bath Sheet Set | 2 × 90×160 + 2 × 50×100 | 1,760 |
| Gift sets | His & Hers Robes | white robe + black robe | 2,000 |
| Gift sets | Robe & Beach Set, Black + Blue | black robe + blue stripe beach towel | 1,850 |
| Gift sets | Robe & Beach Set, White + Yellow | white robe + yellow stripe beach towel | 1,850 |
| Gift sets | Beach Towel Set | yellow stripe + blue stripe beach towels | 1,700 |

**Pricing rule**: every gift set costs exactly the sum of its pieces, so the
box and ribbon are free. Build Your Own Box follows the same rule. (The
client's mockup showed 1,850 EGP for a box whose towels sum to 1,450; treated
as a placeholder.)

**Beach colours**: the owner confirmed the striped sets are **yellow and
blue**. The product photos for the Beach Towel Set and the White + Yellow
Robe & Beach Set show orange; use catalogue pages 20 and 17 for those two
until the client supplies new photos.

## 3. Site-wide

- **Navigation**: Towels · Bathrobes · Beach · Gift sets · Build your box ·
  About, in a **slide-in menu** opened by a "Menu" button on the left, on
  every screen size. The CZERA wordmark is **centred**; the **bag icon and
  item count** sit on the right. (Changed 2026-10-16, amahallawy/czera#48:
  the inline nav beside a left-aligned logo was replaced. See `design.md`
  §6.1.)
- **Product card** (used everywhere): photo (second photo on hover), name,
  one spec line, price, and a gold **"Add to bag ›"** link. Adding shows a
  short confirmation ("Black Bathrobe added to your bag · View bag").
- **Footer** (dark): wordmark and "Luxury towels & bath essentials"; Shop
  links; Help (How to order, Sizes & care, Delivery, About); Contact
  (WhatsApp, Instagram @czera_maison, Facebook); English · العربية switch.
- **Logo**: `assets/logo/czera-wordmark-white.png` has a fake checkerboard
  baked into the image and cannot be used. A clean transparent PNG or SVG is
  needed (from the brand book, per `CLAUDE.md`).

## 4. Home (`index.html`)

| # | Section | Choice |
|---|---|---|
| 1 | Hero | **A**: existing 30s film full-bleed; headline "The hotel experience, at home." bottom-left; buttons "Shop the collection" and "Build your own box". |
| 2 | Shop by category | **B**: editorial grid. Large Gift sets tile (8 sets, from 1,410 EGP), Towels and Bathrobes tiles, Beach as a wide band. Each tile opens the Collection with that category selected. |
| 3 | Gift sets | **B**: grouped by occasion with tabs. **Two tabs of four** (assumed, see §11): *For the home* (Complete Set, 3 Bath Towels, 3 Bath Sheets, Hand & Bath Sheet) and *Robes & beach* (His & Hers, both Robe & Beach sets, Beach Towel Set). |
| 4 | Build your own box | **C**: dark band in the black-box look; four steps (box, towels, colour, ribbon); gold "Start your box" button. |
| 5 | Our story | **A**: keep the existing text-over-image layout (PR #2); catalogue photo; copy from catalogue p2/p6 ("The hotel experience, brought home", "It's all in the details"). |
| 6 | Material & craft | **B**: four icon promises as in the catalogue (100% cotton, Highly absorbent, Long-lasting, Hotel quality with 650+ GSM / 1200 GSM) plus a four-photo strip. |
| 7 | How to order + footer | **B**: three steps: *Add to bag* → *Send your bag on WhatsApp* → *We confirm and deliver*; one line for bulk and corporate orders; then the footer. |

## 5. Collection (`catalog.html`)

- **Header & filters, C**: title plus a **left sidebar** with Category, Price
  (under 500 / 500–1,500 / over 1,500) and Colour (white, black, striped).
  Each option shows its count; options that would return nothing are greyed
  out. Counts are computed from the product data, never hard-coded. On phones
  the sidebar becomes a "Filters" button that opens a panel.
- **Card, B**: the site-wide card with "Add to bag ›".
- **Grid, B**: three columns beside the sidebar, with one full-width dark
  **Build Your Own Box** band after the first row. The band hides when the
  current filter leaves fewer than four products.

## 6. Product page (`product.html`, one template for all 16)

- **Photos & panel, A**: photos stacked large on the left; the buying panel
  stays in view while they scroll. Panel: category, name, price, short
  description, "In the box" list (sets), quantity, **"Add to bag · price"**,
  a small **"Or order just this on WhatsApp ›"** link, four quick facts, and
  the delivery line. On phones: swipeable photos, panel below.
- **Details, A**: fold-out sections inside the panel. *Description* and
  *Features* open by default (text from `info.txt`); *Sizes & care* and
  *Delivery & payment* closed.
- **Related, C**: for towels and beach towels, a dark band "Add this to a box
  of your own" that opens Build Your Own Box with this item already inside.
  For robes and gift sets, the band links to Build Your Own Box without
  pre-filling. Beside it, *Recently viewed*; first-time visitors see
  *Bestsellers* instead.

## 7. The bag and the WhatsApp order

- The bag is stored in the visitor's browser and survives page changes and
  reloads. No account.
- **Layout, C**, inside a side panel that slides in from the right, in two
  steps:
  1. **Your bag**: items with photo, name, spec, quantity (− / +), remove,
     line price, total, "Continue".
  2. **Delivery details**: name, phone, address, city (required) and note
     (optional), then **"Send order on WhatsApp"**.
- The button opens WhatsApp to the shop number with the message pre-written:

  ```
  Hello Czera, I'd like to order:
  • 1 × The Complete Czera Set: 1,450 EGP
  • 1 × Black Bathrobe: 1,000 EGP
  • 1 × Custom box (black box, burgundy ribbon): 2 × Face, 1 × Bath, white: 570 EGP
  Total: 3,020 EGP

  Name: …
  Phone: …
  Address: …, City: …
  Note: …
  ```

- The single-item "Or order just this on WhatsApp" link on the product page
  sends the same format with one line and skips the bag.

## 8. Build Your Own Box (`build-your-box.html`, new)

- **Layout, A** (the client's mockup): four steps down the left (box: black
  or beige; towels: five sizes with quantity; colour; ribbon: burgundy or
  gold), a preview with the running item list and total on the right that
  stays in view. On phones the preview becomes a total bar at the bottom.
- Price = sum of the chosen towels; "Box and ribbon included free".
- **"Add box to bag"** adds one bag line that lists the box, ribbon, colour
  and contents.
- Opening the page from a product's related band pre-fills that towel.
- Drafts until the client confirms: stripes only in the 100 × 200 size; 2 to
  6 pieces per box. There is no photo of the beige box yet; the preview uses
  the black-box photo with a beige-box swatch until one exists.

## 9. About (`about.html`, new)

- **Layout, A**: photo header "Every detail feels like home."; two
  image-and-text chapters (*Our belief*, *The details*) using catalogue copy;
  dark bulk-orders band (weddings, companies, hotels → WhatsApp); contact
  strip (WhatsApp, Instagram, delivery). Chapters stay short until the client
  writes more.

## 10. Images

- Client originals move to `graphics/` (not shipped, per `CLAUDE.md`).
- Page-ready copies go to `assets/img/products/<slug>-<n>.jpg` and
  `assets/img/catalogue/` at web sizes. Catalogue pages are cropped to their
  photo area; their printed text, icons and CamScanner stamp must not show.
- Prefer clean product shots; some product photos have text or icon panels
  printed on them (for example the black robe's "1200 gm / 130 kg").

## 11. Placeholders and open questions

Placeholders (approved by the owner, clearly marked in the code):

- WhatsApp number: **+20 100 000 0000**
- Delivery: "Across Egypt in 2–5 days, next day in Cairo & Giza"
- Payment: "Cash on delivery or InstaPay"
- Care: "Machine wash warm, tumble dry low"

For the client:

1. Home gift-set tabs: two tabs of four sets each, or a different grouping?
2. Build Your Own Box: which colours come in which sizes? Min and max pieces?
3. Are black towels sold (the mockup offers black as a towel colour)?
4. New photos for the two yellow sets, and a beige-box photo.
5. Clean logo files.
6. Can we say the boxes are wrapped "by hand"?

## 12. Scope

**In**: Home, Collection, Product, bag panel, Build Your Own Box, About;
product data for all 16 products; image pipeline.

**Already done with this spec (PR for #9)**: `PRODUCT.md` rewritten;
`design.md`, `CLAUDE.md` and `docs/lovart-brand-guidance.md` updated to the
showroom design and the real-data rule.

**Out**: online payment or checkout, accounts, a CMS, the Journal, and the
Arabic version, which follows as its own phase once the English pages are
approved.

## 13. Build notes

- Static HTML/CSS/vanilla JS, no framework or bundler (`CLAUDE.md`).
- Decisions that need an AgDR before building: where product data lives (one
  shared data file read by every page), bag storage in the browser, and the
  WhatsApp link and message format.
- Logic worth unit tests: price totals, filter counts, the build-box price,
  and the WhatsApp message builder.
- `projects.yaml` keeps `release.bar: none` until the site is deployed.
