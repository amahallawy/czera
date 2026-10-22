# First-order code and a Sale section — design

Date: 2026-10-21 · Issue: amahallawy/czera#123 · Scope now: the static showroom design (this repo), for the client to approve. The WordPress store (czeramaison.com) is designed and built later, after approval (§9).

## 1. Why

The client wants two ways to sell more without looking like a discount shop:

- **A first-order discount.** A customer's first order from the website gets a discount. The amount is not decided yet.
- **Sales to clear stock.** When the client has excess stock and needs room for new supply, they pick some products and put them on sale.

The owner will show both to the client on the design site before the website launches. WordPress follows only after the client approves.

## 2. Goals, non-goals, anti-goals

**Goals**

- A visitor learns about the first-order code without hunting for it, and sees the saving clearly in the bag and in the order.
- A visitor can tell at a glance which products are on sale and what they used to cost.
- On the design site, the discount, the code and which products are on sale are each one edit (`CONFIG.firstOrder`, a product's sale price).

**Non-goals (now)**

- Checking that a customer has truly never ordered before (the design site has no customer history).
- The WordPress store (later, §9).
- Countdowns, end dates shown to visitors, bundles, "buy 2 get 1", free delivery offers, loyalty points.
- Arabic.

**Anti-goals (would make it a failure even if it works)**

- Anything that makes CZERA look like a discount shop: red badges, "SALE!!" banners, countdown timers, pop-ups, flashing (PRODUCT.md anti-references).
- Hype words in the copy ("amazing deal", "don't miss out", "discover").
- A discount that silently fails: if a code is entered and not applied, the visitor must be told why.

## 3. First-order code

For the client demo: **10% off** (owner, 2026-10-21) with the placeholder code **`WELCOME10`**. Both come from one setting (`CONFIG.firstOrder` on the design site: code, percent, and the three wordings below), so changing them is one edit.

### 3.1 Where it is shown (owner chose all three)

1. **Top line on every page.** A thin black line above the header with ivory small caps: "First order · **10% off** with code **WELCOME10**" (the amount and code in gold). A close button (×, 44px target) hides it; it stays hidden on that device (remembered in the browser). It must not cover the hero film or the menu button.
2. ~~**Welcome note on Home.**~~ Removed by the owner after the first build (2026-10-22): the top line and the bag carry the code.
3. **In the bag, before ordering.** A gold-ruled note: "**First order?** Enter **WELCOME10** for 10% off.", with a code field and an "Apply" button. Once applied, the totals show:
   - Subtotal
   - First order −10% (the saving, in gold text)
   - Total

### 3.2 Rules

- The code works on **every product, sale items included** (owner decision), and on custom boxes.
- 10% of the bag subtotal after sale prices, rounded to whole pounds.
- One code per order. Wrong code: a short message under the field, "That code isn't valid." Removing the code restores the total.
- The code is checked against the setting only; there is no customer history, so "first order" is on trust. On the WordPress store it works once per phone number (owner, 2026-10-22, #137; §9.1). The bag remembers an applied code until the order is sent. Codes are matched without regard to letter case.
- **Order email** (the bag's "Email the order"): the lines, then "Code WELCOME10: −10% (−239 EGP)", then the total.

## 4. Sale

### 4.1 How a sale price looks (owner chose style B)

- On every product card (Collection, Home gift sets, related products): the **old price crossed out** in muted grey, then the **new price** in the usual ink, plus a **small "Sale" label** on the top-left corner of the photo.
- The label is **ivory with gold text** (my call between the two shown; the owner can switch to black-and-gold): ivory background (#F4F2EC), gold text (#8A5C12), small caps, 11px+, no red, no percentage.
- Product page: the same old/new prices beside the name and the same label on the main photo.
- Sale products **stay in their normal category** too (with the label), and the Sale filter gathers them (§4.2).
- The bag, the order email and the custom box total use the **sale price**. (A towel on sale counts at its sale price inside a custom box.)
- design.md currently says "no sale badges" (§4 rule 10, §6.8); the owner's style-B decision overrides that, and design.md is updated in the same PR.

### 4.2 Menu and Sale filter

> **Revised by the owner, 2026-10-22:** Sale is a filter on the Collection, not a separate page. The filter panel gets a "Sale" group (one checkbox, "On sale"), under Category (#135), shown only while something is on sale, and the menu item opens the Collection with it ticked (`catalog.html?sale=1`). The Sale page, its line and its empty state below are superseded.

- **Menu:** "Sale" sits **right after Build Your Own Box**, before About CZERA, styled **exactly like the other menu items** (not gold, no icon, no count). It **only appears while at least one product is on sale**.
- **Sale page:** the Collection layout with only sale products: small grey eyebrow "Home / Sale", a light "Sale" heading, one short line (placeholder "A few pieces at a gentler price, while they last." until the client gives their words), then the cards. No filters needed when there are few items (the builder decides whether the usual filters stay).
- With no sale products, the Sale page (if reached by an old link) shows a calm empty state: "Nothing on sale right now." and a link to the full collection.

### 4.3 Who sets it

A product gets an optional sale price in `js/data/products.js`. For the client demo, two products are put on sale with example prices, clearly marked as demo data in the code (the owner removes them, or replaces them with real ones, after approval). The design site is a noindex client preview, so the demo prices on main are low-risk.

## 5. Constraints

- Follow the CZERA design system (design.md, tokens): Montserrat/Italiana, ivory/ink/gold, quiet commerce, 44px targets, visible focus, WCAG AA contrast, reduced-motion-safe.
- Client text is used as given (memory rule); placeholders above are clearly placeholders.
- Box colour and ribbon are never customer choices (unchanged).
- Design site: vanilla ES modules, no build; logic tested first with the Node test runner (`npm test`).
- Every change goes issue → branch → PR → code review → owner merge.

## 6. Decided by the owner

- First-order code: shown in all three places (§3.1); works on all products, sale items included.
- Sale: price style B (struck-through old price + new price + small label); "Sale" menu item after Build Your Own Box, styled like the other items, no count.
- Design site first; WordPress is discussed only after the client approves it.

## 7. Left to the builder (or marked as my call)

- **Label colour:** ivory (my call); black-and-gold is the alternative the owner saw.
- ~~**Welcome note position on Home:** after Gift sets (my call).~~ Note removed (2026-10-22).
- **Sale page URL and mechanism on the design site** (e.g. a `sale` view of the Collection page) and whether filters stay on it.
- **Exact wording** of the error and empty states, within the voice rules.
- Rounding and display details for the saving line, and how the bag stores the applied code.

## 8. Open for the client

- The final discount amount (10% is the demo figure) and the code word.
- Their own line for the Sale page.
- Whether the first-order code should have an end date.

## 9. WordPress

Out of scope until the client approves the design site; the owner will discuss it then. Notes to pick up at that point (from the design review, 2026-10-21):

- The code and percent shown in the top line, Home note and bag note should come from the WooCommerce coupon itself, so the text never drifts from the real code and disappears when the coupon is off or expired.
- The WordPress "bag" is Astra's slide-in drawer, which has no code field; WooCommerce's cart and checkout have their own coupon field, and the one-use-per-email check can only run at checkout (it needs the billing email). Where the code is typed on WordPress is an owner decision for then.
- A WooCommerce coupon (percentage, not excluding sale items, one use per email), WooCommerce's own sale-price field per product, the "Sale!" badge restyled to the ivory label, a Sale page from WooCommerce's on-sale listing, a "Sale" menu item that hides when nothing is on sale, and a discount row in the CZERA order emails (#111).

### 9.1 As built on WordPress (2026-10-22)

Built after the design was confirmed, following it: the code is entered in the bag, as on the design site.

- **Coupon:** WooCommerce coupon `welcome10` (id 349): 10% percent, individual use, sale items included, one use per customer (checked at checkout by billing email), meta `czera_first_order = yes`. Changing the code or percent is an edit to this coupon; the top line and the bag follow it and disappear when it is off, expired or used up.
- **Code Snippet 17 "CZERA first order and sale"** (reference: `tools/wp/live/czera-first-order.php`): the top line as the first child of the Astra header (`astra_masthead_top`; scrolls away while the sticky bar stays, closing it is remembered per code in `czera.promo.v1`); the code block in the slide-in bag (note, field + Apply, or the code + Remove; Subtotal / First order −10% / Total) applied through `wc-ajax=czera_bag_code`; an emptied bag drops its code; the "Sale" badge and "Was …, now …" screen-reader text; the menu's Sale item (class `czera-menu-sale`, item 352, `/shop/?sale=1`) hidden while nothing is on sale; `?sale=1` on the shop and category pages; the `[czera_sale_filter]` sidebar group (widget block-9, under Category since #135).
- **Once per phone number (#137):** at checkout, an order with the first-order code is refused when the billing phone already has an order with it (pending, on hold, processing or completed; cancelled and failed don't count): "This code is only for a first order." (the message deliberately does not name the phone number as the reason; owner, 2026-10-22) Numbers are compared without spaces, country code (+20 / 0020, with or without a 0 after it) or leading 0, for mobiles and landlines, and Arabic-Indic digits count. An order that no longer carries the code drops its stored number. Orders placed with the code store the number's key in `_czera_first_order_phone`. The coupon's one-use-per-email limit stays.
- **Snippet 15 "CZERA order emails":** line amounts before the discount, and a gold "Code WELCOME10: −10%" row with the saving in both emails.
- **Sale prices:** The Complete CZERA Set (25) 1,160 and Blue Stripe Beach Towel (69) 680, demo values as on the design site. Home gift-set images show the sale badge (Home revision 353).
- **Additional CSS:** block "First order and sale (design #123)" (reference: `tools/wp/live/first-order-and-sale.css`).
- **Differences from the design, by necessity:** WordPress's filters are links, not checkboxes, so "On sale (n)" looks like the Colour filter; the cart and checkout pages also accept the code through WooCommerce's own coupon field.
