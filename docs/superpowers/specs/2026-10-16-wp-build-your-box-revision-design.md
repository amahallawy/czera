# Build your box (WordPress), revision 1: the static design, with group limits

Date: 2026-10-16 · Issue: amahallawy/czera#56 · Follows #49 (PR #55) · Revises: `2026-10-16-wp-build-your-box-design.md` §3.4 and its As-built section · Decision record: `docs/agdr/AgDR-0005-wp-box-builder-plugin.md`

## 1. Why

The owner reviewed the first build on 2026-10-16. The page used the WPC plugin's own picker, restyled. Their notes:

- It does not follow the CZERA design. Follow the static `build-your-box.html`. Drop the box and ribbon parts.
- The limits are written for bathrobes only. Write them for both groups.
- There is no button to clear the selection.
- A quantity should start at 0, not 1.
- The towel limit applies to all towels together, and the bathrobe limit to all bathrobes together. With 6 towels of any sizes and colours chosen, no more towels can be added. With 2 bathrobes, no more bathrobes.

The approved mockup (`2026-10-16-wp-build-your-box-revision-mockup.html`, next to this file; open it in a browser) is the reference for layout and behaviour. It uses the static site's CSS and the live prices.

## 2. What stays from the original spec

- The rules: towels ≤ 6, bathrobes ≤ 2, at least 2 items, price = sum of items, no box fee.
- Box product 210 (WPC Composite Products): component keys Towels `8cdo` and Bathrobes `jt1j`.
- The cart and order display: one box line, with its contents listed under it.
- The server rule check (snippet 5). It rejects anything outside the rules, whatever the page sends.
- The LiteSpeed exclusions and the `box_checks.py` rules and cache checks.

## 3. The page

Page 74 `/build-your-box/` follows `build-your-box.html` and `css/pages/build-box.css`, with these changes.

### 3.1 Removed from the static design

- Labels: "Black box · burgundy ribbon" (the preview caption), "A box holds up to 6 pieces.", "Box and ribbon included free".
- Controls: "Choose your box" and "Choose a ribbon".
- The ribbon strip under the preview image.

The preview image stays. The caption and alt text do not mention a box colour or a ribbon.

### 3.2 Left column

- The eyebrow "Build your own box" and the title "A gift set that's yours alone."
- **1 Choose a colour.** Buttons White, Blue stripe and Yellow stripe, with swatches as in the static design.
  - The colour only filters the towel rows in step 2.
  - Counts already chosen in other colours are kept when the colour changes.
  - The note under the buttons reads "Beach towels come in blue or yellow stripes only." while White is selected, and "Stripes come in the 100 × 200 beach size only." while a stripe is selected.
- **2 Choose your towels.** The legend shows "Up to 6 · *n* of 6" on its right.
  - White shows four rows: Face 30 × 30, Hand 50 × 100, Bath 70 × 140 and Bath sheet 90 × 160 (products 57, 60, 63, 66).
  - Blue stripe shows Beach 100 × 200 (product 69). Yellow stripe shows Beach 100 × 200 (product 72).
  - Each row shows its price and − *q* +, and *q* starts at 0.
- **3 Choose your bathrobes** (new). The legend shows "Up to 2 · *n* of 2".
  - The rows are White bathrobe and Black bathrobe (products 51, 54). Each has the line "1200 GSM · fits up to 130 kg", its price and − *q* +.

### 3.3 Group limits, live

When the towels in total reach 6:

- Every towel + is disabled.
- Rows at 0 look disabled.
- Colour buttons with nothing chosen in that colour are disabled.
- Under step 2 the page shows "You have 6 towels. Remove one to choose another." Each disabled control points to that line.

Bathrobes work the same way at 2, with "You have 2 bathrobes. Remove one to choose another."

Other rules for the buttons:

- − is disabled at 0.
- A sold-out item shows "Sold out" in place of its price, and its + is disabled.

### 3.4 Your box (right column, sticky on desktop)

- The heading "Your box", with a **Clear selection** button on its right. The button is disabled when nothing is chosen, and resets every count to 0.
- One line per chosen item.
  - Towels read "*q* × Bath 70 × 140 cm, white". Bathrobes read "*q* × Black bathrobe".
  - Each line shows its line price and a × button that removes that item. The button's accessible name is "Remove *item*".
  - With nothing chosen, the list reads "Nothing chosen yet."
- "Total · *n* pieces" and the total in EGP.
- Below 2 pieces, the reason line reads "Choose at least 2 pieces." and the add button is disabled.
- The button **Add box to bag**.

### 3.5 Phones (under 900px)

As in the static design:

- The steps stack.
- A small preview image sits above step 1.
- The "Your box" panel becomes a fixed bottom bar. It shows "Show contents" / "Hide contents", the total, the reason and the button.
- The page gets matching bottom padding, so the bar never covers the footer.

### 3.6 Adding to the bag

- Add box to bag posts a normal form to the box product: `add-to-cart=210`, `quantity=1`, and `wooco_ids` built from the counts as `id/qty/componentKey`, comma-separated.
- The page reloads, and the builder shows WooCommerce's notices (the added message, or a server rule message) above step 1.
- The selection starts again from 0.
- The bag shows one "Build your CZERA box" line, with the contents listed under it.

### 3.7 Accessibility

- All controls are real `<button>` elements with names, for example "One more Bath 70 × 140 cm, white".
- After each change, focus stays on the same control, or on its sibling when that control became disabled.
- The total and the reason line form one polite live region. Each full-group note is its own polite region.
- Focus rings are #8a5c12. Every target is at least 44px; the × remove buttons are at least 32px, inside a 44px row.
- Without JavaScript, the page shows the static design's message: "Turn on JavaScript to build a box."

## 4. How it is built

- **Rules config (snippet 5, "CZERA box rules").** The product lists, component keys, caps and minimum move into one function, `czera_box_config()`. The rule filter and the builder both read it, so the two never disagree.
- **New snippet "CZERA box builder".** It registers the shortcode `[czera_box_builder]`.
  - On the server it reads each product's name, short description (the size line), price and stock from WooCommerce. It prints the markup in §3, with the counts at 0, the product data as a JSON block, and the form.
  - A small inline script renders the state and handles the controls.
  - The builder CSS is the static `build-box.css` ported into the Additional CSS block, scoped under `.czera-box-builder`. It uses the site's values (the 125px sticky offset under the header).
- **Page 74.** The builder prints the eyebrow and title inside its left column, as the static design does. So the page holds only one `core/shortcode` block, `[czera_box_builder]`, and the Spectra intro container (`czera-box-intro`) is removed. The page has one h1.
- **Redirect.** `/product/build-your-czera-box/` redirects (302) to `/build-your-box/`, so nobody reaches the plugin's picker.
- **Retired:**
  - Snippet 6 "CZERA box labels" and snippet 7 "CZERA box keyboard" are deactivated and then deleted.
  - Their reference copies in `tools/wp/live/` are removed.
  - The old picker CSS in the "Build your box page" block is replaced.
  - The WPC Localization alert strings and `show_short_description` stay as they are. They are harmless and only appear on the plugin's own picker, which is no longer shown.

## 5. Checks

`tools/wp/box_checks.py`:

- `page` asserts that the builder markup is present (`czera-box-builder`, "Choose your towels", "Choose your bathrobes", "Clear selection"), along with the 8 product IDs and "Add box to bag".
- `snippets` covers 5 and the builder snippet against their copies in `tools/wp/live/`, and asserts that 6 and 7 no longer exist.
- `rules`, `product`, `plugins` and `cache` are unchanged and must still pass.

Browser checks (logged in, live page):

1. Quantities start at 0. The add button is disabled with "Choose at least 2 pieces."
2. White: 4 Bath and 1 Face, then Blue stripe: 1 Beach. Towels are full at 6/6. Every towel + is disabled, Yellow stripe is disabled, and the note shows.
3. Remove the beach line with ×. Towels are back to 5/6, and Yellow stripe is enabled again.
4. Bathrobes: White 1 and Black 1 reach 2/2, and both + buttons are disabled.
5. Clear selection resets everything to 0 and "Nothing chosen yet." shows.
6. 2 Bath and 1 Black bathrobe give 1,940 EGP. Add box to bag shows the added notice, and the bag has one box line listing 2 × Bath Towel and 1 × Black Bathrobe. Remove it afterwards.
7. Phone (390px): the bottom bar shows, Show contents works, and the footer is not covered.
8. Keyboard only: steps 2 to 6 work with Tab, Enter and Space, and focus is never lost.
9. `/product/build-your-czera-box/` redirects to `/build-your-box/`.

## As built (revision 1)

- Snippet 5 "CZERA box rules" now defines `czera_box_config()`: box 210, min 2, groups `8cdo` towels cap 6 [57, 60, 63, 66, 69, 72], `jt1j` bathrobes cap 2 [51, 54]. Cap messages come from the config ("Towels: up to 6 per box.", "Bathrobes: up to 2 per box.").
- Snippet 8 "CZERA box builder" (global): shortcode `[czera_box_builder]`, product-page redirect (302 to /build-your-box/), and redirect back to /build-your-box/ after adding the box. Reference copy `tools/wp/live/czera-box-builder.php`.
- Page 74 holds one `core/shortcode` block, `[czera_box_builder]`. The Spectra intro is gone.
- Additional CSS block between the Build your box markers replaced with the static design (copy `tools/wp/live/build-your-box.css`).
- Snippets 6 "CZERA box labels" and 7 "CZERA box keyboard" are deactivated and in the Code Snippets trash. They were not permanently deleted; the owner can empty the trash in wp-admin. `box_checks.py snippets` treats a retired snippet as absent, or trashed and inactive.
- Unchanged: WPC settings (cart and order display `yes_list`), LiteSpeed exclusions, box product 210.
- Page 74 is never page-cached: the builder calls `litespeed_control_set_nocache`. A cached copy replayed or hid the add-to-bag notices.
- The Additional CSS block also carries an Astra override, `body .entry-content[data-ast-blocks-layout] > .czera-box-builder { max-width: 1320px; }`. Astra's full-width layout otherwise stretches the builder edge to edge.
- Sizes are in px, not rem, because Astra's phone root font is 14.592px.
- On phones Clear selection sits on the left, as in the mockup.
- On this page Astra's scroll-to-top button is hidden on phones, because it covered + and ×.
- A hand-crafted request for 7 of one towel shows WPC's own "You cannot add this composite products to the cart." That is because WPC's per-item limit rejects it first. Split requests show "Towels: up to 6 per box." The builder itself cannot send either.
- Checks: `box_checks.py all` OK on 2026-10-16; browser checks in Task 2 Step 6 and Task 3 Step 4 passed.
