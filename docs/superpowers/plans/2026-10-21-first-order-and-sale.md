# First-order Code and Sale (design site) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-order discount code (10% demo, code WELCOME10) and a Sale section (sale prices, label, menu item, Sale view) to the static showroom design for the client to approve.

**Architecture:** Two small pure modules carry the rules: `js/lib/pricing.js` (sale price per product) and `js/lib/discount.js` (code check, totals, stored code). Everything that shows or sums a price goes through `currentPrice(p)`; the bag panel, the order email and the page shell read the discount through `discount.js`. UI is plain DOM strings as elsewhere; CSS in the existing files.

**Tech Stack:** Vanilla ES modules, no build, Node test runner (`npm test`), Playwright for browser checks.

**Spec:** `docs/superpowers/specs/2026-10-21-first-order-and-sale-design.md`

## Global Constraints

- Demo values: code `WELCOME10`, `10` percent (owner, 2026-10-21), from `CONFIG.firstOrder` only; no other file hard-codes them.
- The code works on every product, sale items included, and on custom boxes; one code per order; matched case-insensitively after trimming.
- Discount = round(subtotal after sale prices × percent / 100) to whole EGP.
- Sale label: ivory #F4F2EC background, gold #8A5C12 text, small caps, ≥ 11px, top-left of the card photo; no red, no percentage, no countdowns, no pop-ups.
- Old price struck through in muted grey (`--color-ink-mute`), new price in the usual ink; screen readers hear "Was … , now …".
- Menu: "Sale" after Build Your Own Box, before About CZERA, styled like the other items (not `featured`), only while ≥ 1 product is on sale.
- Copy (verbatim): top line "First order · 10% off with code WELCOME10"; Home note label "Welcome to CZERA", heading "10% off your first order.", line "Use the code at checkout."; bag note "First order? Enter WELCOME10 for 10% off."; error "That code isn't valid."; Sale line "A few pieces at a gentler price, while they last." (placeholder); empty Sale "Nothing on sale right now."; email line "Code WELCOME10: −10% (−239 EGP)" format.
- No hype words (PRODUCT.md); client product text untouched; box colour/ribbon never a choice.
- 44px targets, visible focus, WCAG AA contrast, works at 390 and 1440.

## Review Focus

1. A code typed as " welcome10 " (spaces, lower case) is accepted. Test in Task 4.
2. A visitor clears the bag after applying the code: the code is cleared too, and the next bag shows no discount. Test in Task 4 (storage) and checked in Task 5.
3. A stored code that no longer matches `CONFIG.firstOrder.code` (code changed later) gives no discount and is dropped on read. Test in Task 4.
4. The top line dismissed for one code shows again when the code changes. Test in Task 6 (`promoDismissed`).
5. A product with `salePrice` missing, non-numeric, or ≥ `price` is not on sale (no label, no struck price, not on the Sale page). Test in Task 1.

---

### Task 1: Sale prices in the model

**Files:**
- Create: `js/lib/pricing.js`, `tests/pricing.test.js`
- Modify: `js/data/products.js` (demo sale prices), `js/lib/bag.js` (`describeLine`), `js/lib/box.js` (`boxPrice`), `js/lib/filters.js` (price bands), `tests/bag.test.js`, `tests/box.test.js`

**Interfaces:**
- Produces: `isOnSale(p) -> boolean`, `currentPrice(p) -> number`, `saleProducts(products = PRODUCTS) -> Product[]` from `js/lib/pricing.js`. Products may carry an optional `salePrice: number`.

- [x] **Step 1: Write failing tests** in `tests/pricing.test.js`:
  - `currentPrice` returns `salePrice` when on sale, else `price`; `isOnSale` true for `{price: 1450, salePrice: 1160}`.
  - Not on sale for `salePrice` undefined, `'abc'`, `1450` (equal), `1600` (higher), `0`, negative.
  - `saleProducts()` returns exactly the demo slugs `['complete-czera-set', 'blue-stripe-beach-towel']`.
  - In `tests/bag.test.js`: `describeLine({type:'product', slug:'complete-czera-set', qty:2}).total === 2320` and `.unitPrice === 1160`.
  - In `tests/box.test.js`: a box with `'blue-beach': 1, 'white-bath': 1` prices at `680 + 470`.
- [x] **Step 2: Run** `npm test` — the new tests fail (module missing / old prices).
- [x] **Step 3: Implement** `js/lib/pricing.js`; add `salePrice: 1160` to `complete-czera-set` and `salePrice: 680` to `blue-stripe-beach-towel` in `js/data/products.js` with a comment `// DEMO sale for the client (#123): remove or replace after approval.`; use `currentPrice` in `describeLine` (both price fields), `boxPrice`, and the two `PRICE_BANDS` tests in `filters.js`. Category tile "from" prices (`categoryMeta`) keep the regular price.
- [x] **Step 4: Run** `npm test` — all pass (existing filter counts unchanged: 3 / 7 / 6).
- [x] **Step 5: Commit** `feat: sale prices in the product model (#123)`.

### Task 2: Sale on cards, product page and the box builder

**Files:**
- Modify: `js/ui/card.js`, `js/pages/product.js` (price line 43, buy total line 48/70), `js/pages/build-box.js` (row prices lines 52, 54, 68), `css/components.css` (card label and struck price), `css/pages/product.css` (pdp price and label), `tests/card.test.js`

**Interfaces:**
- Consumes: `isOnSale`, `currentPrice` (Task 1).
- Produces: `priceHtml(p) -> string` exported from `js/ui/card.js` — `<span class="price"><s class="price__was"><span class="sr-only">Was </span>1,450 EGP</s> <span class="price__now"><span class="sr-only">, now </span>1,160 EGP</span></span>` when on sale, else the plain formatted price.

- [x] **Step 1: Write failing tests** in `tests/card.test.js`: the card for `complete-czera-set` contains `class="card__flag"` with text `Sale`, `<s class="price__was">` with `1,450 EGP`, and `1,160 EGP`; the card for `face-towel` has no `card__flag` and no `price__was`.
- [x] **Step 2: Run** `npm test` — fails.
- [x] **Step 3: Implement** `priceHtml` and the flag (`<span class="card__flag">Sale</span>` inside `.card__media`); product page uses `priceHtml` for `.pdp__price`, the same flag on the main photo, and `currentPrice` for the buy total; build-box rows and summary use `currentPrice`. CSS per Global Constraints (flag `position:absolute; inset-block-start/inline-start: var(--space-3)`).
- [x] **Step 4: Run** `npm test` — pass. Playwright at 1440 and 390: Collection shows the two flags; product page of `complete-czera-set` shows both prices and the flag; build-box blue stripe row shows 680 EGP.
- [x] **Step 5: Commit** `feat: sale label and struck-through prices (#123)`.

### Task 3: Sale menu item and Sale view

**Files:**
- Modify: `js/lib/nav.js`, `js/pages/collection.js`, `catalog.html` (eyebrow/heading/line hooks), `css/pages/catalog.css`, `tests/nav.test.js`

**Interfaces:**
- Consumes: `saleProducts` (Task 1).
- Produces: `menuItems(products = PRODUCTS)` — inserts `{ label: 'Sale', href: 'catalog.html?view=sale' }` after Build Your Own Box when `saleProducts(products).length > 0`, never `featured`.

- [x] **Step 1: Write failing tests** in `tests/nav.test.js`: with the demo data, labels end `['Gift sets', 'Build Your Own Box', 'Sale', 'About CZERA']` and the Sale item has no `featured`; `menuItems(PRODUCTS.map(p => ({ ...p, salePrice: undefined })))` has no Sale item; exactly one `featured` item still.
- [x] **Step 2: Run** `npm test` — fails.
- [x] **Step 3: Implement** `menuItems(products)`. In `collection.js`, `?view=sale`: grid = `saleProducts()` cards, no box band, filter groups hidden, the page header becomes eyebrow "Home / Sale", `<h1>` "Sale", line "A few pieces at a gentler price, while they last."; with no sale products the grid area shows "Nothing on sale right now." and a "Shop the collection" link to `catalog.html`. Page `<title>` "Sale — Czera".
- [x] **Step 4: Run** `npm test` — pass. Playwright: menu shows Sale in place, looks like its neighbours; `catalog.html?view=sale` shows the two products at 1440 and 390; with sale prices removed in the browser (or by test data) the empty state shows.
- [x] **Step 5: Commit** `feat: Sale menu item and Sale view (#123)`.

### Task 4: First-order discount rules and the order email

**Files:**
- Modify: `js/config.js` (`firstOrder`), `js/lib/email.js` (`buildOrderMessage`), `tests/email.test.js`
- Create: `js/lib/discount.js`, `tests/discount.test.js`

**Interfaces:**
- Produces from `js/lib/discount.js`:
  - `CONFIG.firstOrder = { code: 'WELCOME10', percent: 10 }`
  - `normaliseCode(s) -> string` (trim, upper case)
  - `isValidCode(s) -> boolean`
  - `orderTotals(lines, code) -> { subtotal, discount, total }` (discount 0 for an invalid or empty code)
  - `CODE_KEY = 'czera.code.v1'`, `readCode(storage) -> string` (returns '' unless the stored code is valid), `writeCode(storage, code)`, `clearCode(storage)` — all tolerate `null`/throwing storage like `bag.js`.
  - `buildOrderMessage(lines, details, code = '')` adds, when the code is valid, a line `Code WELCOME10: −10% (−239 EGP)` before `Total:`, and `Total:` is the discounted total.

- [x] **Step 1: Write failing tests** in `tests/discount.test.js`: `isValidCode(' welcome10 ')` true, `isValidCode('WELCOME1')` false; `orderTotals` for a bag of `complete-czera-set` ×1 (1,160) + `bath-towel` ×2 (940) with `'WELCOME10'` → `{ subtotal: 2100, discount: 210, total: 1890 }`; with `'nope'` → discount 0; rounding: subtotal 2,395 → discount 240; `readCode` of a stored `'OLD5'` returns `''`; `writeCode`/`readCode` round-trip `'welcome10'` → `'WELCOME10'`; `clearCode` empties it; null storage never throws. In `tests/email.test.js`: message with code contains `Code WELCOME10: −10% (−` and the discounted `Total:`; without a code the existing expected message is unchanged.
- [x] **Step 2: Run** `npm test` — fails.
- [x] **Step 3: Implement** `discount.js`, `CONFIG.firstOrder`, and the email change.
- [x] **Step 4: Run** `npm test` — pass.
- [x] **Step 5: Commit** `feat: first-order code rules and order email line (#123)`.

### Task 5: The code in the bag

**Files:**
- Modify: `js/ui/bag-panel.js` (`renderItems`, `renderSummary`, send, clear), `css/components.css` (bag note, code field, totals rows)

**Interfaces:**
- Consumes: `orderTotals`, `isValidCode`, `normaliseCode`, `readCode`, `writeCode`, `clearCode` (Task 4); `buildOrderMessage(lines, details, code)` (Task 4). Code stored in `localStorage` with the same try/catch pattern as the bag.

- [x] **Step 1: Implement** in step 1 of the bag, above the totals: the gold-ruled note "First order? Enter WELCOME10 for 10% off." (code and percent from `CONFIG.firstOrder`), a labelled text field (`aria-describedby` the note and the error) and an "Apply" button (44px). Valid → store, re-render with rows Subtotal / "First order −10%" (gold text, negative amount) / Total, field shows the code with a "Remove" text button. Invalid → "That code isn't valid." under the field (`role="status"`), no discount. Step 2 summary shows the same three rows when a code is applied. Sending passes the code to `buildOrderMessage`. "Clear bag" and an emptied bag clear the code. Focus stays on the field or the Remove/Apply control after re-render.
- [x] **Step 2: Verify** with Playwright at 390 and 1440: apply ` welcome10 ` → 10% row and total; wrong code → message, no row; remove → back to plain total; email preview contains the code line; clear bag → reopen shows no code. Keyboard: Tab to the field, type, Enter applies.
- [x] **Step 3: Run** `npm test` — pass.
- [x] **Step 4: Commit** `feat: first-order code in the bag (#123)`.

### Task 6: Top line and Home welcome note

**Files:**
- Modify: `js/ui/shell.js` (top line), `js/pages/home.js` and `index.html` (welcome note placeholder after the gifts section), `css/components.css` (top line), `css/pages/landing.css` (welcome note)
- Create: `tests/promo.test.js`; add `promoDismissed(storage, code) -> boolean` and `dismissPromo(storage, code)` to `js/lib/discount.js` (key `czera.promo.v1` stores the dismissed code).

**Interfaces:**
- Consumes: `CONFIG.firstOrder`.

- [x] **Step 1: Write failing tests** in `tests/promo.test.js`: not dismissed initially; `dismissPromo(s, 'WELCOME10')` → `promoDismissed(s, 'WELCOME10')` true and `promoDismissed(s, 'SPRING15')` false; throwing storage → false, no throw.
- [x] **Step 2: Run** `npm test` — fails.
- [x] **Step 3: Implement** the top line as the first child of `.site-header` (black, ivory small caps, amount and code in gold, × close with `aria-label="Close offer"`, 44px); the header and the page offset grow by the line's height while it shows (`--promo-h` on `:root`), on pages with and without the hero, so it never covers the hero copy, the menu button or the bag. Close → `dismissPromo` and remove. The Home note after the Gift sets section: label, light heading, muted line, code in a dashed gold outline, from `CONFIG.firstOrder`.
- [x] **Step 4: Run** `npm test` — pass. Playwright at 390 and 1440 on Home, Collection and a product page: the line shows, nothing overlaps, closing it removes it and it stays closed after reload; the Home note sits after Gift sets.
- [x] **Step 5: Commit** `feat: first-order top line and welcome note (#123)`.

### Task 7: Docs and the full check

**Files:**
- Modify: `design.md` (§4 rule 10 and §6.8 "no sale badges" → the ivory Sale label and struck price; new rows for the top line, welcome note, bag code and Sale view), `docs/superpowers/specs/2026-10-13-czera-showroom-design.md` (dated note #123), `CHANGELOG.md` (`[Unreleased]` entry), the spec and this plan.

- [x] **Step 1: Update** the docs listed.
- [x] **Step 2: Run** `npm test` — pass; Playwright pass at 1440 and 390 across Home, Collection, Sale, a product page, the builder and the bag (no overflow, no page errors, no red anywhere).
- [ ] **Step 3: Commit** `docs: first-order code and Sale in the design (#123)`, push, and open the PR with a Glossary. Use "Refs #123" (the issue stays open for the WordPress port).
