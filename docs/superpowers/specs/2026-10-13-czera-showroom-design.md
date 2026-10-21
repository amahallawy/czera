# Czera showroom: design spec

**Date**: 2026-10-13
**Issue**: #9
**Status**: Draft, awaiting owner review
**Mockups**: `.superpowers/brainstorm/605-1791904595/content/` (local, gitignored)

> **Note, 2026-10-18 (#84): WhatsApp replaced by email (owner).** Orders and
> enquiries now go to **support@czeramaison.com**: the bag's last step opens
> the visitor's email app with the order written into the body, contact
> buttons say "Contact us", and the site no longer mentions WhatsApp. The
> sections below are updated to match.

> **Note, 2026-10-20 (#101): client copy and menu.** The menu is now Shop
> all · The towel collection · Bathrobes · Beach towels · Gift sets ·
> Build Your Own Box (featured in gold) · About CZERA. The hero's fact line
> is gone. The About chapters, the bulk band and the Build Your Own Box
> bands (Home, Collection) carry the client's own words, and the box bands
> no longer list steps. Six towels lead with the client's newer photos.
> The sections below are updated to match.

> **Note, 2026-10-20 (#103): no box colour.** The builder no longer asks
> for a box colour, and the bag and the order email no longer name one
> ("Custom box: 2 × Face, 1 × Bath, white"). The remaining "Build your box"
> and "Start your box" wording now uses the client's "Build Your Own Box"
> and "Create your box". The sections below are updated to match.

> **Note, 2026-10-20 (#107): bathrobes in the box.** The builder gains a
> third step, "Choose your bathrobes", with the WordPress builder's limits
> (6 towels, 2 bathrobes, at least 2 pieces). The sections below are
> updated to match.

> **Note, 2026-10-21 (#119): hero film everywhere.** The owner wants the film to play by itself on
> every device, phones and Reduce Motion included, with the pause button always visible, and the
> hero to fill the phone screen. WordPress follows on tablets and phones.

> **Note, 2026-10-21 (#117): Our story paragraph.** At the client's request the Home story
> paragraph reads "CZERA brings the comfort of premium hotel textiles into your everyday life.
> Discover 100% cotton towels, bathrobes and thoughtfully curated gift sets, crafted for comfort,
> quality and lasting elegance." (it was "Our towels, robes and gift sets bring the calm of a fine
> hotel into your home.").

> **Note, 2026-10-21 (#113): mixed towel colours.** Owner decision: one box
> can hold towels of different colours, as on the WordPress builder. The
> colour buttons only filter the towel rows. The sections below are
> updated to match.

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
  order by **email** (support@czeramaison.com; WhatsApp until #84). No
  payment or checkout on the site.

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

- **Navigation**: Shop all · The towel collection · Bathrobes · Beach
  towels · Gift sets · Build Your Own Box · About CZERA (client order,
  2026-10-20, #101; Build Your Own Box is styled in gold to invite a click,
  still one item in the list), in a **slide-in menu** opened by a "Menu" button on the left, on
  every screen size. The CZERA wordmark is **centred**; the **bag icon and
  item count** sit on the right. (Changed 2026-10-16, amahallawy/czera#48:
  the inline nav beside a left-aligned logo was replaced. See `design.md`
  §6.1.)
- **Product card** (used everywhere): photo (second photo on hover), name,
  one spec line, price, and a gold **"Add to bag ›"** link. Adding shows a
  short confirmation ("Black Bathrobe added to your bag · View bag").
- **Footer** (dark): wordmark and "Luxury towels & bath essentials"; Shop
  links; Help (How to order, Sizes & care, Delivery, About); Contact
  (support@czeramaison.com, the social icons and a "Contact us" button that
  opens an email); English · العربية switch.
- **Logo**: `assets/logo/czera-wordmark-white.png` has a fake checkerboard
  baked into the image and cannot be used. A clean transparent PNG or SVG is
  needed (from the brand book, per `CLAUDE.md`).

## 4. Home (`index.html`)

Order changed 2026-10-17 (client request, amahallawy/czera#68): Our story
now follows the hero. (About led the menu from #68 until #101 moved it to
the end.)

| # | Section | Choice |
|---|---|---|
| 1 | Hero | **A**: existing 30s film full-bleed; headline "The hotel experience, at home." bottom-left, no fact line under it (#101); buttons "Shop the collection" and "Build Your Own Box" (#103). |
| 2 | Our story | **A**: keep the existing text-over-image layout (PR #2); catalogue photo; copy from catalogue p2/p6 ("The hotel experience, brought home", "It's all in the details"). |
| 3 | Shop by category | **B**: editorial grid. Large Gift sets tile (8 sets, from 1,410 EGP), Towels and Bathrobes tiles, Beach as a wide band. Each tile opens the Collection with that category selected. |
| 4 | Gift sets | **B**: grouped by occasion with tabs. **Two tabs of four** (assumed, see §11): *For the home* (Complete Set, 3 Bath Towels, 3 Bath Sheets, Hand & Bath Sheet) and *Robes & beach* (His & Hers, both Robe & Beach sets, Beach Towel Set). |
| 5 | Build your own box | **C**: dark band in the black-box look; title "Build Your Own Box", the client's line "Create a gift that feels personal. Choose your towels, select your preferred options, and complete your CZERA experience with our signature gift box." and a gold "Create your box" button (#101; no steps list, so no box-colour step). |
| 6 | Material & craft | **B**: four icon promises as in the catalogue (100% cotton, Highly absorbent, Long-lasting, Hotel quality with 650+ GSM / 1200 GSM) plus a four-photo strip. |
| 7 | How to order + footer | **B**: three steps: *Add to bag* → *Send your bag by email* → *We confirm and deliver* (title "Three steps, all by email."); one line for bulk and corporate orders ("Custom quantities, quoted by email."); then the footer. |

## 5. Collection (`catalog.html`)

- **Header & filters, C**: title plus a **left sidebar** with Category, Price
  (under 500 / 500–1,500 / over 1,500) and Colour (white, black, striped).
  Each option shows its count; options that would return nothing are greyed
  out. Category lists Towels, Beach, Bathrobes, Gift sets (the grid's order;
  #91), while the menu and footer keep their own order. Counts are computed
  from the product data, never hard-coded. On phones the sidebar becomes a
  "Filters" button that opens a panel.
- **Card, B**: the site-wide card with "Add to bag ›".
- **Grid, B**: three columns beside the sidebar, closed by one full-width dark
  **Build Your Own Box** band (the same client copy and "Create your box"
  button as Home's, #101) after the last product card, for every filter
  result (#91; it was after the first row and hid below four products). On
  the WordPress store the shop and category pages end with the same band.

## 6. Product page (`product.html`, one template for all 16)

- **Photos & panel, A**: photos stacked large on the left; the buying panel
  stays in view while they scroll. Panel: category, name, price, short
  description, "In the box" list (sets), quantity, **"Add to bag · price"**,
  a small **"Or order just this by email ›"** link, four quick facts, and
  the delivery line. On phones: swipeable photos, panel below.
- **Details, A**: fold-out sections inside the panel. *Description* and
  *Features* open by default (text from `info.txt`); *Sizes & care* and
  *Delivery & payment* closed.
- **Related, C**: for towels and beach towels, a dark band "Add this to a box
  of your own" that opens Build Your Own Box with this item already inside.
  For robes and gift sets, the band links to Build Your Own Box without
  pre-filling. Beside it, *Recently viewed*; first-time visitors see
  *Bestsellers* instead.

## 7. The bag and the email order

- The bag is stored in the visitor's browser and survives page changes and
  reloads. No account.
- **Layout, C**, inside a side panel that slides in from the right, in two
  steps:
  1. **Your bag**: items with photo, name, spec, quantity (− / +), remove,
     line price, total, "Continue".
  2. **Delivery details**: name, phone, address, city (required) and note
     (optional), then **"Send order by email"**.
- The button opens the visitor's email app (a `mailto:` link) addressed to
  support@czeramaison.com, subject **"Order from czeramaison.com"**, with the
  order pre-written in the body (line breaks sent as CRLF, every value
  URL-encoded):

  ```
  Hello Czera, I'd like to order:
  • 1 × The Complete Czera Set: 1,450 EGP
  • 1 × Black Bathrobe: 1,000 EGP
  • 1 × Custom box: 2 × Face, 1 × Bath, white: 570 EGP
  Total: 3,020 EGP

  Name: …
  Phone: …
  Address: …, City: …
  Note: …
  ```

- A confirmation step follows with the order text, a "Copy order" button,
  and the address plus a "try again" link for visitors whose email app did
  not open. Some email apps cut a mailto link past about 2,000 characters;
  a longer order still opens the email app, and the confirmation asks the
  visitor to check every item arrived or paste the copied order.
- The single-item "Or order just this by email" link on the product page
  sends the same format with one line and skips the bag.

## 8. Build Your Own Box (`build-your-box.html`, new)

- **Layout, A** (the client's mockup): three steps down the left (colour,
  which only filters the towel rows; towels: that colour's sizes with
  quantity; bathrobes: white and black, #107), a preview with the running item list and total on the right that
  stays in view. On phones the preview becomes a total bar at the bottom.
- No box colour choice (#103): the team picks the box to fit the towels,
  as on the WordPress builder. The preview photo has no caption.
- Price = sum of the chosen towels and bathrobes; "Box included free".
- Limits as on the WordPress builder (#107): up to 6 towels in all, up to
  2 bathrobes, at least 2 pieces. A full group disables its + buttons and
  says why. One box can mix towel colours (#113); counts in other colours
  are kept when the colour changes, and no colour is ever disabled. A box
  of bathrobes alone is fine.
- **"Add box to bag"** adds one bag line that lists each towel with its
  colour, then the bathrobes ("Custom box: 2 × Bath (white), 1 × Beach
  (blue stripe); 1 × Black bathrobe"). A box saved in an older bag (one
  colour, counts per size) still loads as the same towels in that colour.
- No ribbon choice (owner, 2026-10-18): ribbons are added when available.
- Opening the page from a product's related band pre-fills that towel.
- Draft until the client confirms: stripes only in the 100 × 200 size.

## 9. About (`about.html`, new)

- **Layout, A**: photo header "Every detail feels like home."; two
  image-and-text chapters (*Our belief*, *The details*) and a dark
  bulk-orders band ("Tailored solutions for hotels, businesses and special
  occasions." → an "Enquire now" email with the subject "Bulk or corporate
  order"), all in the client's words (#101; full text in `design.md` §13);
  contact strip (Email, Follow
  icons, Delivery). Chapters stay short until the client
  writes more.

## 10. Images

- Client originals move to `graphics/` (not shipped, per `CLAUDE.md`).
- The client's newer photos (2026-10-20, #101) lead six towels as
  `assets/img/products/<slug>-main.jpg`: Face Towel, Hand Towel, Bath
  Towel, Bath Sheet and the blue and yellow striped beach towels. Their
  earlier photos follow as the second and third images.
- Page-ready copies go to `assets/img/products/<slug>-<n>.jpg` and
  `assets/img/catalogue/` at web sizes. Catalogue pages are cropped to their
  photo area; their printed text, icons and CamScanner stamp must not show.
- Prefer clean product shots; some product photos have text or icon panels
  printed on them (for example the black robe's "1200 gm / 130 kg").

## 11. Placeholders and open questions

Placeholders (approved by the owner, clearly marked in the code):

- ~~WhatsApp number: +20 100 000 0000~~ (retired in #84; orders go to
  support@czeramaison.com, set by the owner)
- Delivery: "Across Egypt in 2–5 days, next day in Cairo & Giza"
- Payment: "Cash on delivery or InstaPay"
- Care: "Machine wash warm, tumble dry low"

For the client:

1. Home gift-set tabs: two tabs of four sets each, or a different grouping?
2. Build Your Own Box: which colours come in which sizes? Min and max pieces?
3. Are black towels sold (the mockup offers black as a towel colour)?
4. New photos for the two yellow sets.
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
  order link and message format (WhatsApp at first; email since #84).
- Logic worth unit tests: price totals, filter counts, the build-box price,
  and the order message and mailto link builders.
- `projects.yaml` keeps `release.bar: none` until the site is deployed.
