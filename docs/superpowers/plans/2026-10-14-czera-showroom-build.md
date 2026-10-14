# Czera Showroom Build — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Czera site as the showroom in the approved spec: Home, Collection, Product, a bag whose order is sent on WhatsApp, Build Your Own Box and About, driven by one product data file built from the client's real catalogue.

**Architecture:** Static HTML pages, each loading one ES module (`js/pages/*.js`). Pure logic (data, prices, bag, filters, box rules, WhatsApp message) lives in `js/lib/` and is unit-tested with Node's built-in test runner. A shared shell module renders the header, footer, bag panel and toast into every page so they exist once. The bag is kept in `localStorage`; ordering opens `wa.me` with a pre-written message.

**Tech Stack:** HTML5, CSS custom properties (existing `css/tokens.css`), vanilla JavaScript ES modules, Node 24 `node --test` (no npm dependencies), Python 3 + PyMuPDF (already installed) for one-off image preparation.

**Spec:** `docs/superpowers/specs/2026-10-13-czera-showroom-design.md` (approved in PR #10). Visual reference for every section: the chosen mockups in `.superpowers/brainstorm/605-1791904595/content/` (local, gitignored), listed per task.

## Global Constraints

- Facts only from the client's files: 100% (premium) cotton; towels 650+ GSM; robes 1200 GSM, fit up to 130 kg; ultra soft and highly absorbent; hotel-style quality; black gift box with satin ribbon. Never "Egyptian cotton", "Nile Delta", "600–800 GSM", or "by hand".
- No "Bestseller" claims: the client hasn't said which products sell best, so the product page's first-visit fallback shows "Gift sets" instead of the spec's "Bestsellers" (spec §6) until they do.
- No exclamation marks. No "discover", "elevate", "indulge". "Luxury" only in the brand line "Luxury towels & bath essentials".
- Currency format: `1,450 EGP`. Sizes: `90 × 160 cm` (multiplication sign, spaces).
- Product names: catalogue title case, no "Luxury" prefix, in Italiana (`var(--font-display)`).
- Placeholders, marked `// PLACEHOLDER` in code: WhatsApp `+20 100 000 0000` (`201000000000` in links); delivery "Across Egypt in 2–5 days, next day in Cairo & Giza"; payment "Cash on delivery or InstaPay"; care "Machine wash warm, tumble dry low".
- Build Your Own Box drafts: stripes (blue, yellow) only in the 100 × 200 size; 2 to 6 pieces per box.
- No framework, bundler or npm dependency (`CLAUDE.md`). Use tokens from `css/tokens.css`, never hex literals in new CSS (one exception: `--color-whatsapp`, added to `tokens.css`); logical properties (`margin-inline-start`), never `margin-left`.
- Production HTML/CSS references only `assets/`, never `graphics/` or `.superpowers/`.
- Headings weight 300. One solid gold element per screen; the gold "Add to bag ›" text link is the only repeated gold.
- Every image has `alt` text; every icon button has `aria-label`; visible focus on all controls.
- Pages must be served over HTTP (ES modules do not load from `file://`). Local preview: `python -m http.server 8000` from the project root.

## Review Focus

1. **A stored bag that is corrupt or out of date** (invalid JSON, a product slug that no longer exists, a negative or fractional quantity) must load as an empty or cleaned bag, never crash the page. Pinned in Task 5.
2. **`localStorage` unavailable or throwing** (Safari private mode, storage full) must leave the bag working in memory for the visit. Pinned in Task 5.
3. **Customer text with `&`, `#`, line breaks or Arabic** in name, address or note must reach WhatsApp intact (correct URL encoding). Pinned in Task 6.
4. **A product page opened with a missing or unknown `?slug=`** must show a "not found" message with a link to the collection, not a blank page. Pinned in Task 3 (`findProduct` returns `null`) and Task 13.
5. **Impossible Build Your Own Box selections** (0 or 1 piece, more than 6, a striped colour with non-beach sizes) must block "Add box to bag" with a reason. Pinned in Task 4.

---

## Delivery: issues, branches and PRs

Five PRs, one issue each (workflow rule: one issue per PR). Create all five issues before Task 1 so each PR can close its own:

| PR | Issue title | Branch | Tasks |
|---|---|---|---|
| 1 | Showroom foundation: product data, images, bag and order logic | `feature/#N-showroom-foundation` | 1–8 |
| 2 | Site shell: header, footer, bag panel and WhatsApp order | `feature/#N-site-shell` | 9–10 |
| 3 | Home page rebuild | `feature/#N-home` | 11 |
| 4 | Collection and product pages | `feature/#N-collection-product` | 12–13 |
| 5 | Build Your Own Box and About pages | `feature/#N-box-about` | 14–16 |

Each issue body lists its tasks' deliverables as acceptance criteria. Open each PR from `main` after the previous one merges (memory: stacked PRs need retargeting). Commit messages follow `type: subject` with the Claude trailer; stage specific files only.

## File map

```
package.json                     # {"type":"module"} + "test" script; no deps
js/config.js                     # placeholders (WhatsApp, delivery, payment, care) + box limits
js/data/products.js              # the 16 products (single source of product data)
js/lib/escape.js                 # escapeHtml
js/lib/format.js                 # formatEGP
js/lib/products.js               # findProduct, byCategory, giftGroup, categoryMeta
js/lib/box.js                    # Build Your Own Box rules and pricing
js/lib/bag.js                    # bag store (localStorage-backed) + line pricing
js/lib/whatsapp.js               # order message + wa.me link
js/lib/checkout.js               # delivery-details validation
js/lib/filters.js                # collection filters + facet counts
js/lib/recent.js                 # recently viewed products
js/ui/shell.js                   # header, footer, toast; creates the bag; wires add-to-bag
js/ui/bag-panel.js               # two-step bag panel + WhatsApp send
js/ui/menu.js                    # mobile slide-in menu (moved from js/main.js)
js/ui/reveal.js                  # scroll reveal + hero header (moved from js/main.js)
js/ui/card.js                    # product card HTML
js/pages/home.js | collection.js | product.js | build-box.js | about.js
tests/*.test.js                  # node --test
tools/prepare_images.py          # one-off: client photos + catalogue crops → assets/img/
assets/img/products/*.jpg        # web-size product photos
assets/img/catalogue/*.jpg       # cropped catalogue photography
docs/agdr/AgDR-0001…0004-*.md    # agent decision records
index.html, catalog.html, product.html, build-your-box.html (new), about.html (new)
css/components.css               # + header nav, bag button, card, bag panel, toast, footer, dark band
css/pages/landing.css | catalog.css | product.css | build-box.css (new) | about.css (new)
```

Removed by the end: `js/main.js`, `js/catalog.js` (replaced by modules), Unsplash URLs, Journal markup.

---

## PR 1 — Foundation

### Task 1: Decision records (AgDRs)

**Files:**
- Create: `docs/agdr/AgDR-0001-product-data-module.md`, `docs/agdr/AgDR-0002-bag-and-whatsapp-order.md`, `docs/agdr/AgDR-0003-js-rendered-shell-es-modules.md`, `docs/agdr/AgDR-0004-image-preparation-script.md`

**Interfaces:** none (documentation). Required before any code by `.claude/rules/agdr-decisions.md`.

- [ ] **Step 1: Write the four AgDRs**, each with the headings Context, Options considered, Decision, Consequences, and this content:

  - **0001 Product data as an ES module.** Options: (a) data hard-coded in each HTML page, (b) `products.json` fetched at runtime, (c) `js/data/products.js` exporting an array. Decision (c): one source, importable by pages and by Node tests with no fetch or CORS step. Consequence: editing a price is a one-file change; no CMS.
  - **0002 Bag in `localStorage`, order via `wa.me`.** Options: (a) server-side cart, (b) `localStorage` + WhatsApp deep link, (c) no bag (single-item WhatsApp links only). Decision (b): the spec's showroom has no backend; the bag survives reloads; the order arrives as a WhatsApp message. Consequences: prices are recomputed from data on every render (stored lines hold slugs and quantities only); key `czera.bag.v1`; in-memory fallback when storage throws.
  - **0003 JS-rendered shell, one ES module per page.** Options: (a) copy header/footer/bag markup into all five pages, (b) render them from one module, (c) a build step with includes. Decision (b): one source for shared chrome without adding a build (forbidden without cause by `CLAUDE.md`). Consequences: pages need HTTP to load modules; a `<noscript>` line tells no-JS visitors to turn on JavaScript to order; `js/main.js` logic moves into modules.
  - **0004 Image preparation script.** Options: (a) hand-export each image, (b) a one-off Python script using the already-installed PyMuPDF, (c) an npm image pipeline. Decision (b): repeatable, no new dependency in the site; outputs are committed, the script is not part of serving. Consequence: client originals move to the gitignored `graphics/`.

- [ ] **Step 2: Commit**

```bash
git add docs/agdr/AgDR-0001-product-data-module.md docs/agdr/AgDR-0002-bag-and-whatsapp-order.md docs/agdr/AgDR-0003-js-rendered-shell-es-modules.md docs/agdr/AgDR-0004-image-preparation-script.md
git commit -m "docs: record AgDRs for data module, bag, shell and image script"
```

### Task 2: Image preparation

**Files:**
- Create: `tools/prepare_images.py`
- Create (generated): `assets/img/products/*.jpg`, `assets/img/catalogue/*.jpg`
- Move (untracked → gitignored): `assets/czera products/` and `assets/CZERA’s Catalogue 15-09-2026.pdf` → `graphics/client-2026-10/`

**Interfaces:**
- Produces: product images named `assets/img/products/<slug>-<n>.jpg` (n = 1-based position of the source file in its folder, sorted by filename) and catalogue crops `assets/img/catalogue/p<NN>.jpg`. Task 3 references exactly these paths.

- [ ] **Step 1: Move the client originals out of `assets/`**

```bash
mkdir -p graphics/client-2026-10
mv "assets/czera products" graphics/client-2026-10/
mv "assets/CZERA’s Catalogue 15-09-2026.pdf" graphics/client-2026-10/catalogue-2026-09-15.pdf
```

- [ ] **Step 2: Write `tools/prepare_images.py`**

```python
"""One-off: turn client originals into web-size images under assets/img/.

Run from the project root:  python tools/prepare_images.py
Requires PyMuPDF (pip install pymupdf). See docs/agdr/AgDR-0004.
"""
import glob
import os
import pymupdf

SRC = "graphics/client-2026-10"
OUT_PRODUCTS = "assets/img/products"
OUT_CATALOGUE = "assets/img/catalogue"
MAX_SIDE = 1400
JPG_QUALITY = 82

# client folder name -> product slug (js/data/products.js)
FOLDERS = {
    "White Towel 30 x 30 cm": "face-towel",
    "White Towel 50 x 100 cm": "hand-towel",
    "White Towel 70 x 140 cm": "bath-towel",
    "White Bath Towel 90 x 160 cm": "bath-sheet",
    "Premium White Bathrobe 1200 GSM": "white-bathrobe",
    "Premium Black Bathrobe 1200 GSM": "black-bathrobe",
    "Blue & White Striped Beach Towel 100 x 200 cm": "blue-stripe-beach-towel",
    "Yellow & White Striped Beach Towel 100 x 200 cm": "yellow-stripe-beach-towel",
    "Luxury 5-Piece Towel Gift Set": "complete-czera-set",
    "Luxury 3-Piece Towel Gift Set": "three-bath-towels-set",
    "Luxury 3-Piece Bath Towel Gift Set 90 × 160 cm": "three-bath-sheets-set",
    "Luxury 4-Piece Towel Gift Set": "hand-and-bath-sheet-set",
    "Luxury His & Hers Bathrobe Gift Set": "his-and-hers-robes",
    "Luxury Bathrobe & Beach Towel Gift Set (Black + Blue)": "robe-beach-black-blue",
    "Luxury Bathrobe & Beach Towel Gift Set (White + Yellow)": "robe-beach-white-yellow",
    "Luxury Beach Towel Gift Set": "beach-towel-set",
}

# catalogue page -> crop box as fractions (x0, y0, x1, y1) of the page.
# Each box keeps the photo and excludes printed headlines, icon rows and the
# CamScanner stamp along the bottom edge.
CROPS = {
    1: (0.30, 0.42, 1.00, 0.88),
    2: (0.38, 0.35, 1.00, 0.88),
    4: (0.35, 0.45, 1.00, 0.88),
    5: (0.35, 0.45, 1.00, 0.88),
    6: (0.35, 0.40, 1.00, 0.88),
    7: (0.30, 0.30, 1.00, 0.88),
    8: (0.35, 0.40, 1.00, 0.88),
    9: (0.40, 0.15, 1.00, 0.88),
    10: (0.40, 0.15, 1.00, 0.88),
    11: (0.38, 0.30, 1.00, 0.88),
    13: (0.30, 0.35, 0.85, 0.88),
    17: (0.38, 0.25, 1.00, 0.88),
    19: (0.38, 0.20, 1.00, 0.88),
    20: (0.30, 0.40, 1.00, 0.88),
    21: (0.30, 0.40, 1.00, 0.80),
}


def save_scaled(pix, path):
    scale = min(1.0, MAX_SIDE / max(pix.width, pix.height))
    if scale < 1.0:
        pix = pymupdf.Pixmap(pix, int(pix.width * scale), int(pix.height * scale))
    pix.save(path, jpg_quality=JPG_QUALITY)


def products():
    os.makedirs(OUT_PRODUCTS, exist_ok=True)
    for folder, slug in FOLDERS.items():
        files = sorted(glob.glob(os.path.join(SRC, "czera products", folder, "*.jpeg")))
        if not files:
            raise SystemExit(f"no photos found for {folder!r}")
        for n, f in enumerate(files, start=1):
            save_scaled(pymupdf.Pixmap(f), os.path.join(OUT_PRODUCTS, f"{slug}-{n}.jpg"))


def catalogue():
    os.makedirs(OUT_CATALOGUE, exist_ok=True)
    doc = pymupdf.open(os.path.join(SRC, "catalogue-2026-09-15.pdf"))
    for page_no, (x0, y0, x1, y1) in CROPS.items():
        page = doc[page_no - 1]
        r = page.rect
        clip = pymupdf.Rect(r.width * x0, r.height * y0, r.width * x1, r.height * y1)
        pix = page.get_pixmap(dpi=200, clip=clip)
        save_scaled(pix, os.path.join(OUT_CATALOGUE, f"p{page_no:02d}.jpg"))


if __name__ == "__main__":
    products()
    catalogue()
    print("done")
```

- [ ] **Step 3: Run it**

Run: `python tools/prepare_images.py`
Expected: `done`; 48 files in `assets/img/products/`, 15 in `assets/img/catalogue/`.

- [ ] **Step 4: Check the crops by eye.** Open each `assets/img/catalogue/p*.jpg` (Read tool). Acceptance: no printed headline, icon row, label arrow or "Scanned with CamScanner" stamp is visible. If one is, tighten that page's box in `CROPS` (raise `y0`, lower `y1`, or raise `x0`) and re-run Step 3. Also check total size: `du -sh assets/img` should be under 20 MB.

- [ ] **Step 5: Commit**

```bash
git add tools/prepare_images.py assets/img/products assets/img/catalogue
git commit -m "feat: add web-size product photos and catalogue crops"
```

### Task 3: Product data, config and lookups

**Files:**
- Create: `package.json`, `js/config.js`, `js/data/products.js`, `js/lib/escape.js`, `js/lib/format.js`, `js/lib/products.js`
- Test: `tests/products.test.js`, `tests/format.test.js`

**Interfaces:**
- Produces:
  - `PRODUCTS: Product[]` where `Product = { slug, name, category: 'towels'|'bathrobes'|'beach'|'gift-sets', price: number, spec: string, colours: ('white'|'black'|'striped')[], images: string[], description: string, features: string[], contents: {qty:number,label:string,spec:string}[]|null, ribbon: 'burgundy'|'gold'|null, giftGroup: 'home'|'robes-beach'|null, boxable: boolean }`
  - `CATEGORIES: {id, label, navLabel}[]`
  - `formatEGP(amount: number) → string` ("1,450 EGP")
  - `escapeHtml(value: unknown) → string`
  - `findProduct(slug: string|null) → Product|null`, `byCategory(id) → Product[]`, `giftGroup(id) → Product[]`, `categoryMeta(id) → {count:number, minPrice:number}`
  - `CONFIG = { whatsappNumber, whatsappDisplay, deliveryText, paymentText, careText, instagram, boxMinPieces, boxMaxPieces }`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "czera-site",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Write the failing tests**

`tests/format.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEGP } from '../js/lib/format.js';
import { escapeHtml } from '../js/lib/escape.js';

test('formatEGP groups thousands and appends EGP', () => {
  assert.equal(formatEGP(1450), '1,450 EGP');
  assert.equal(formatEGP(50), '50 EGP');
  assert.equal(formatEGP(12345), '12,345 EGP');
});

test('escapeHtml neutralises markup characters', () => {
  assert.equal(escapeHtml('<b>"A" & \'B\'</b>'), '&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;');
  assert.equal(escapeHtml(null), '');
});
```

`tests/products.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, CATEGORIES } from '../js/data/products.js';
import { findProduct, byCategory, giftGroup, categoryMeta } from '../js/lib/products.js';

test('there are 16 products with unique slugs', () => {
  assert.equal(PRODUCTS.length, 16);
  assert.equal(new Set(PRODUCTS.map(p => p.slug)).size, 16);
});

test('category counts match the spec', () => {
  assert.equal(byCategory('towels').length, 4);
  assert.equal(byCategory('bathrobes').length, 2);
  assert.equal(byCategory('beach').length, 2);
  assert.equal(byCategory('gift-sets').length, 8);
  assert.deepEqual(CATEGORIES.map(c => c.id), ['towels', 'bathrobes', 'beach', 'gift-sets']);
});

test('every gift set costs the sum of its pieces (box and ribbon free)', () => {
  const unit = {
    'Face towel': 50, 'Hand towel': 230, 'Bath towel': 470, 'Bath sheet': 650,
    'White bathrobe': 1000, 'Black bathrobe': 1000,
    'Blue stripe beach towel': 850, 'Yellow stripe beach towel': 850,
  };
  for (const p of byCategory('gift-sets')) {
    const sum = p.contents.reduce((s, c) => s + c.qty * unit[c.label], 0);
    assert.equal(p.price, sum, p.slug);
  }
});

test('gift groups are two groups of four', () => {
  assert.equal(giftGroup('home').length, 4);
  assert.equal(giftGroup('robes-beach').length, 4);
});

test('findProduct returns null for unknown or missing slugs', () => {
  assert.equal(findProduct('bath-sheet').price, 650);
  assert.equal(findProduct('nope'), null);
  assert.equal(findProduct(null), null);
  assert.equal(findProduct(''), null);
});

test('categoryMeta gives count and lowest price', () => {
  assert.deepEqual(categoryMeta('gift-sets'), { count: 8, minPrice: 1410 });
  assert.deepEqual(categoryMeta('towels'), { count: 4, minPrice: 50 });
});

test('no product copy makes an unsupported claim', () => {
  const banned = /egyptian|nile|by hand|indulge|discover|elevate|bestseller|!/i;
  for (const p of PRODUCTS) {
    assert.ok(!banned.test([p.name, p.description, ...p.features].join(' ')), p.slug);
  }
});

test('every product has at least one image under assets/img', () => {
  for (const p of PRODUCTS) {
    assert.ok(p.images.length >= 1, p.slug);
    for (const src of p.images) assert.match(src, /^assets\/img\/(products|catalogue)\/[a-z0-9-]+\.jpg$/);
  }
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL (`Cannot find module '../js/lib/format.js'`).

- [ ] **Step 4: Write `js/lib/format.js` and `js/lib/escape.js`**

```js
// js/lib/format.js
export function formatEGP(amount) {
  return `${Number(amount).toLocaleString('en-US')} EGP`;
}
```

```js
// js/lib/escape.js
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, ch => MAP[ch]);
}
```

- [ ] **Step 5: Write `js/config.js`**

```js
// Site-wide settings. PLACEHOLDER values are approved drafts; replace before launch (spec §11).
export const CONFIG = {
  whatsappNumber: '201000000000',          // PLACEHOLDER — digits only, for wa.me links
  whatsappDisplay: '+20 100 000 0000',     // PLACEHOLDER
  deliveryText: 'Across Egypt in 2–5 days, next day in Cairo & Giza', // PLACEHOLDER
  paymentText: 'Cash on delivery or InstaPay',                          // PLACEHOLDER
  careText: 'Machine wash warm, tumble dry low',                        // PLACEHOLDER
  instagram: 'czera_maison',
  boxMinPieces: 2, // DRAFT until the client confirms (spec §8)
  boxMaxPieces: 6, // DRAFT until the client confirms (spec §8)
};
```

- [ ] **Step 6: Write `js/data/products.js`**

Image lists use only clean shots (no printed text panels: those are blue beach 1, black robe 2, white robe 3, bath sheet 3, face 1, hand 2, bath 3, yellow beach 3). The two yellow sets use catalogue crops until new photos arrive (spec §2).

```js
// The 16 products. Source of truth: the client's info.txt files and catalogue PDF
// (graphics/client-2026-10/). Prices in EGP. Read PRODUCT.md before editing copy.
const img = (slug, ...n) => n.map(i => `assets/img/products/${slug}-${i}.jpg`);
const SET_FEATURES = ['Premium 100% cotton', 'Ultra soft and highly absorbent', 'Hotel-style quality', 'Gift-ready packaging'];

export const CATEGORIES = [
  { id: 'towels', label: 'Towels', navLabel: 'Towels' },
  { id: 'bathrobes', label: 'Bathrobes', navLabel: 'Bathrobes' },
  { id: 'beach', label: 'Beach', navLabel: 'Beach' },
  { id: 'gift-sets', label: 'Gift sets', navLabel: 'Gift sets' },
];

export const PRODUCTS = [
  {
    slug: 'complete-czera-set', name: 'The Complete Czera Set', category: 'gift-sets', price: 1450,
    spec: '5 pieces · burgundy ribbon', colours: ['white'], images: img('complete-czera-set', 1, 2, 3),
    description: 'Five 100% cotton towels, from face towel to bath sheet, presented in the black Czera gift box and finished with burgundy satin ribbons.',
    features: [...SET_FEATURES, 'For weddings, birthdays and special occasions'],
    contents: [
      { qty: 2, label: 'Face towel', spec: '30 × 30 cm' },
      { qty: 1, label: 'Hand towel', spec: '50 × 100 cm' },
      { qty: 1, label: 'Bath towel', spec: '70 × 140 cm' },
      { qty: 1, label: 'Bath sheet', spec: '90 × 160 cm' },
    ],
    ribbon: 'burgundy', giftGroup: 'home', boxable: false,
  },
  {
    slug: 'three-bath-towels-set', name: '3 Bath Towels Set', category: 'gift-sets', price: 1410,
    spec: '3 × 70 × 140 cm', colours: ['white'], images: img('three-bath-towels-set', 1, 2, 3),
    description: 'Three 100% cotton bath towels, presented in the black Czera gift box and finished with satin ribbons. Soft, absorbent and hotel-inspired.',
    features: [...SET_FEATURES, 'For weddings, birthdays and special occasions'],
    contents: [{ qty: 3, label: 'Bath towel', spec: '70 × 140 cm' }],
    ribbon: 'burgundy', giftGroup: 'home', boxable: false,
  },
  {
    slug: 'three-bath-sheets-set', name: '3 Bath Sheets Set', category: 'gift-sets', price: 1950,
    spec: '3 × 90 × 160 cm', colours: ['white'], images: img('three-bath-sheets-set', 1, 2, 3),
    description: 'Three generously sized 100% cotton bath sheets, presented in the black Czera gift box and finished with satin ribbons.',
    features: [...SET_FEATURES, 'For weddings, birthdays and special occasions'],
    contents: [{ qty: 3, label: 'Bath sheet', spec: '90 × 160 cm' }],
    ribbon: 'burgundy', giftGroup: 'home', boxable: false,
  },
  {
    slug: 'hand-and-bath-sheet-set', name: 'Hand & Bath Sheet Set', category: 'gift-sets', price: 1760,
    spec: '4 pieces · black box', colours: ['white'], images: img('hand-and-bath-sheet-set', 1, 2, 3),
    description: 'Two bath sheets and two hand towels in 100% cotton, presented in the black Czera gift box and finished with satin ribbons.',
    features: [...SET_FEATURES, 'For weddings, birthdays and special occasions'],
    contents: [
      { qty: 2, label: 'Bath sheet', spec: '90 × 160 cm' },
      { qty: 2, label: 'Hand towel', spec: '50 × 100 cm' },
    ],
    ribbon: 'burgundy', giftGroup: 'home', boxable: false,
  },
  {
    slug: 'his-and-hers-robes', name: 'His & Hers Robes', category: 'gift-sets', price: 2000,
    spec: '2 robes · 1200 GSM', colours: ['white', 'black'], images: img('his-and-hers-robes', 2, 1, 3),
    description: 'Two 100% cotton bathrobes, one white and one black, at 1200 GSM, presented in the black Czera gift box with satin ribbons.',
    features: ['Premium 100% cotton', '1200 GSM', 'Fits up to 130 kg', 'Thick and plush', 'Gift-ready packaging', 'For weddings and anniversaries'],
    contents: [
      { qty: 1, label: 'White bathrobe', spec: '1200 GSM' },
      { qty: 1, label: 'Black bathrobe', spec: '1200 GSM' },
    ],
    ribbon: 'gold', giftGroup: 'robes-beach', boxable: false,
  },
  {
    slug: 'robe-beach-black-blue', name: 'Robe & Beach Set, Black + Blue', category: 'gift-sets', price: 1850,
    spec: 'Robe + beach towel', colours: ['black', 'striped'], images: img('robe-beach-black-blue', 2, 3, 1),
    description: 'A black 1200 GSM bathrobe and a blue-and-white striped beach towel, presented in the black Czera gift box with satin ribbon.',
    features: ['Premium 100% cotton', 'Bathrobe: 1200 GSM, fits up to 130 kg', 'Beach towel: 100 × 200 cm', 'Gift-ready packaging'],
    contents: [
      { qty: 1, label: 'Black bathrobe', spec: '1200 GSM' },
      { qty: 1, label: 'Blue stripe beach towel', spec: '100 × 200 cm' },
    ],
    ribbon: 'gold', giftGroup: 'robes-beach', boxable: false,
  },
  {
    slug: 'robe-beach-white-yellow', name: 'Robe & Beach Set, White + Yellow', category: 'gift-sets', price: 1850,
    spec: 'Robe + beach towel', colours: ['white', 'striped'], images: ['assets/img/catalogue/p17.jpg'],
    description: 'A white 1200 GSM bathrobe and a yellow-and-white striped beach towel, presented in the black Czera gift box with satin ribbon.',
    features: ['Premium 100% cotton', 'Bathrobe: 1200 GSM, fits up to 130 kg', 'Beach towel: 100 × 200 cm', 'Gift-ready packaging'],
    contents: [
      { qty: 1, label: 'White bathrobe', spec: '1200 GSM' },
      { qty: 1, label: 'Yellow stripe beach towel', spec: '100 × 200 cm' },
    ],
    ribbon: 'gold', giftGroup: 'robes-beach', boxable: false,
  },
  {
    slug: 'beach-towel-set', name: 'Beach Towel Set', category: 'gift-sets', price: 1700,
    spec: 'Yellow + blue · 2 × 100 × 200 cm', colours: ['striped'], images: ['assets/img/catalogue/p20.jpg'],
    description: 'Two 100% cotton beach towels, one in yellow and white stripes and one in blue and white, presented in the black Czera gift box with satin ribbons.',
    features: ['100% premium cotton', 'Ultra soft and highly absorbent', 'Gift-ready packaging', 'For beach and pool'],
    contents: [
      { qty: 1, label: 'Yellow stripe beach towel', spec: '100 × 200 cm' },
      { qty: 1, label: 'Blue stripe beach towel', spec: '100 × 200 cm' },
    ],
    ribbon: 'gold', giftGroup: 'robes-beach', boxable: false,
  },
  {
    slug: 'white-bathrobe', name: 'White Bathrobe', category: 'bathrobes', price: 1000,
    spec: '1200 GSM · fits up to 130 kg', colours: ['white'], images: img('white-bathrobe', 2, 1),
    description: 'A 100% cotton bathrobe at 1200 GSM: soft, thick and absorbent, with a generous fit for up to 130 kg. The hotel and spa feeling, at home.',
    features: ['100% premium cotton', '1200 GSM', 'Fits up to 130 kg', 'Ultra soft and highly absorbent', 'Thick and plush', 'Hotel-style quality'],
    contents: null, ribbon: null, giftGroup: null, boxable: false,
  },
  {
    slug: 'black-bathrobe', name: 'Black Bathrobe', category: 'bathrobes', price: 1000,
    spec: '1200 GSM · fits up to 130 kg', colours: ['black'], images: img('black-bathrobe', 1, 3),
    description: 'A 100% cotton bathrobe at 1200 GSM: soft, thick and absorbent, with a generous fit for up to 130 kg. The hotel and spa feeling, at home.',
    features: ['100% premium cotton', '1200 GSM', 'Fits up to 130 kg', 'Ultra soft and highly absorbent', 'Thick and plush', 'Hotel-style quality'],
    contents: null, ribbon: null, giftGroup: null, boxable: false,
  },
  {
    slug: 'face-towel', name: 'Face Towel', category: 'towels', price: 50,
    spec: '30 × 30 cm', colours: ['white'], images: img('face-towel', 2, 3),
    description: 'A compact 100% cotton towel for face and hands. Soft and absorbent, with a timeless finish that suits every bathroom.',
    features: ['100% premium cotton', '30 × 30 cm', 'Soft and absorbent', 'For face and hands'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'hand-towel', name: 'Hand Towel', category: 'towels', price: 230,
    spec: '50 × 100 cm', colours: ['white'], images: img('hand-towel', 1, 3),
    description: 'A 100% cotton towel that pairs softness with excellent absorbency, with a plush texture and a classic hotel-style finish.',
    features: ['100% cotton', '50 × 100 cm', 'Ultra soft and absorbent', 'Hotel-style quality', 'Durable and easy to care for'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'bath-towel', name: 'Bath Towel', category: 'towels', price: 470,
    spec: '70 × 140 cm', colours: ['white'], images: img('bath-towel', 1, 2),
    description: 'A 100% cotton bath towel with a plush terry texture and a classic hotel-style finish. Soft and highly absorbent, for every day.',
    features: ['100% premium cotton', '70 × 140 cm', 'Ultra soft and highly absorbent', 'Classic hotel-style finish', 'Durable'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'bath-sheet', name: 'Bath Sheet', category: 'towels', price: 650,
    spec: '90 × 160 cm', colours: ['white'], images: img('bath-sheet', 1, 2),
    description: 'A generous 100% cotton bath sheet with a plush, soft texture and excellent absorbency. Extra coverage with a classic hotel-style finish.',
    features: ['100% premium cotton', '90 × 160 cm', 'Ultra soft and highly absorbent', 'Generous size for extra comfort', 'Classic hotel-style finish'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'blue-stripe-beach-towel', name: 'Blue Stripe Beach Towel', category: 'beach', price: 850,
    spec: '100 × 200 cm', colours: ['striped'], images: img('blue-stripe-beach-towel', 2, 3),
    description: 'A 100% cotton beach towel in bold blue-and-white stripes. Plush, absorbent and generously sized for the pool or the sea.',
    features: ['100% premium cotton', '100 × 200 cm', 'Ultra soft and highly absorbent', 'Blue and white stripes', 'For beach and pool'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'yellow-stripe-beach-towel', name: 'Yellow Stripe Beach Towel', category: 'beach', price: 850,
    spec: '100 × 200 cm', colours: ['striped'], images: img('yellow-stripe-beach-towel', 1, 2),
    description: 'A 100% cotton beach towel in yellow-and-white stripes. Plush, absorbent and generously sized for the pool or the sea.',
    features: ['100% premium cotton', '100 × 200 cm', 'Ultra soft and highly absorbent', 'Yellow and white stripes', 'For beach and pool'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
];
```

- [ ] **Step 7: Write `js/lib/products.js`**

```js
import { PRODUCTS } from '../data/products.js';

export function findProduct(slug) {
  if (!slug) return null;
  return PRODUCTS.find(p => p.slug === slug) ?? null;
}

export function byCategory(id) {
  return PRODUCTS.filter(p => p.category === id);
}

export function giftGroup(id) {
  return PRODUCTS.filter(p => p.giftGroup === id);
}

export function categoryMeta(id) {
  const list = byCategory(id);
  return { count: list.length, minPrice: Math.min(...list.map(p => p.price)) };
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all tests in `format.test.js` and `products.test.js`).

- [ ] **Step 9: Commit**

```bash
git add package.json js/config.js js/data/products.js js/lib/escape.js js/lib/format.js js/lib/products.js tests/format.test.js tests/products.test.js
git commit -m "feat: add product data, config and lookup helpers"
```

### Task 4: Build Your Own Box rules

**Files:**
- Create: `js/lib/box.js`
- Test: `tests/box.test.js`

**Interfaces:**
- Consumes: `findProduct`, `CONFIG.boxMinPieces/boxMaxPieces`.
- Produces:
  - `BOX_SIZES: {id:'face'|'hand'|'bath'|'sheet'|'beach', label, spec, slug}[]`
  - `BOX_COLOURS = ['black','beige']`, `RIBBONS = ['burgundy','gold']`, `TOWEL_COLOURS = ['white','black','blue','yellow']`, `STRIPED = ['blue','yellow']`
  - `emptyBox() → BoxSelection` where `BoxSelection = {box, ribbon, colour, items: {face,hand,bath,sheet,beach}}`
  - `pieceCount(sel) → number`, `boxPrice(sel) → number`, `validateBox(sel) → {ok:boolean, reason:string|null}`, `boxKey(sel) → string`, `boxItemsText(sel) → string`, `boxLabel(sel) → string`, `sizeAllowed(sel, sizeId) → boolean`

- [ ] **Step 1: Write the failing test** `tests/box.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyBox, pieceCount, boxPrice, validateBox, boxKey, boxItemsText, boxLabel, sizeAllowed } from '../js/lib/box.js';

const sample = () => ({ ...emptyBox(), items: { face: 2, hand: 1, bath: 1, sheet: 1, beach: 0 } });

test('price is the sum of the chosen towels; box and ribbon are free', () => {
  assert.equal(boxPrice(sample()), 1450);
  assert.equal(pieceCount(sample()), 5);
});

test('defaults: black box, burgundy ribbon, white, no pieces', () => {
  const b = emptyBox();
  assert.equal(b.box, 'black'); assert.equal(b.ribbon, 'burgundy'); assert.equal(b.colour, 'white');
  assert.equal(pieceCount(b), 0);
});

test('needs at least two pieces', () => {
  assert.deepEqual(validateBox(emptyBox()), { ok: false, reason: 'Choose at least 2 pieces.' });
  assert.equal(validateBox({ ...emptyBox(), items: { ...emptyBox().items, face: 1 } }).ok, false);
});

test('holds at most six pieces', () => {
  const sel = { ...emptyBox(), items: { face: 7, hand: 0, bath: 0, sheet: 0, beach: 0 } };
  assert.deepEqual(validateBox(sel), { ok: false, reason: 'A box holds up to 6 pieces.' });
});

test('striped colours come in the beach size only', () => {
  const sel = { ...sample(), colour: 'blue' };
  assert.deepEqual(validateBox(sel), { ok: false, reason: 'Striped colours come in the beach size only.' });
  assert.equal(sizeAllowed(sel, 'face'), false);
  assert.equal(sizeAllowed(sel, 'beach'), true);
  const beachOnly = { ...emptyBox(), colour: 'yellow', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 2 } };
  assert.deepEqual(validateBox(beachOnly), { ok: true, reason: null });
});

test('rejects unknown choices and bad quantities', () => {
  assert.equal(validateBox({ ...sample(), box: 'gold' }).ok, false);
  assert.equal(validateBox({ ...sample(), items: { ...sample().items, face: -1 } }).ok, false);
  assert.equal(validateBox({ ...sample(), items: { ...sample().items, face: 1.5 } }).ok, false);
  assert.equal(validateBox(null).ok, false);
});

test('key, items text and label are stable and readable', () => {
  assert.equal(boxKey(sample()), 'black|burgundy|white|face:2,hand:1,bath:1,sheet:1');
  assert.equal(boxItemsText(sample()), '2 × Face, 1 × Hand, 1 × Bath, 1 × Bath sheet');
  assert.equal(boxLabel(sample()), 'Custom box (black box, burgundy ribbon): 2 × Face, 1 × Hand, 1 × Bath, 1 × Bath sheet, white');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/box.test.js`
Expected: FAIL (`Cannot find module '../js/lib/box.js'`).

- [ ] **Step 3: Write `js/lib/box.js`**

```js
import { CONFIG } from '../config.js';
import { findProduct } from './products.js';

export const BOX_SIZES = [
  { id: 'face', label: 'Face', spec: '30 × 30 cm', slug: 'face-towel' },
  { id: 'hand', label: 'Hand', spec: '50 × 100 cm', slug: 'hand-towel' },
  { id: 'bath', label: 'Bath', spec: '70 × 140 cm', slug: 'bath-towel' },
  { id: 'sheet', label: 'Bath sheet', spec: '90 × 160 cm', slug: 'bath-sheet' },
  { id: 'beach', label: 'Beach', spec: '100 × 200 cm', slug: 'blue-stripe-beach-towel' },
];
export const BOX_COLOURS = ['black', 'beige'];
export const RIBBONS = ['burgundy', 'gold'];
export const TOWEL_COLOURS = ['white', 'black', 'blue', 'yellow'];
export const STRIPED = ['blue', 'yellow']; // DRAFT: stripes only in the beach size (spec §8)

export function emptyBox() {
  return { box: 'black', ribbon: 'burgundy', colour: 'white', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 0 } };
}

export function pieceCount(sel) {
  return BOX_SIZES.reduce((n, s) => n + (sel.items[s.id] || 0), 0);
}

export function boxPrice(sel) {
  return BOX_SIZES.reduce((sum, s) => sum + (sel.items[s.id] || 0) * findProduct(s.slug).price, 0);
}

export function sizeAllowed(sel, sizeId) {
  return !STRIPED.includes(sel.colour) || sizeId === 'beach';
}

export function validateBox(sel) {
  const invalid = { ok: false, reason: 'Invalid choice.' };
  if (!sel || typeof sel !== 'object' || !sel.items) return invalid;
  if (!BOX_COLOURS.includes(sel.box) || !RIBBONS.includes(sel.ribbon) || !TOWEL_COLOURS.includes(sel.colour)) return invalid;
  for (const s of BOX_SIZES) {
    const q = sel.items[s.id] ?? 0;
    if (!Number.isInteger(q) || q < 0) return invalid;
  }
  const n = pieceCount(sel);
  if (n < CONFIG.boxMinPieces) return { ok: false, reason: `Choose at least ${CONFIG.boxMinPieces} pieces.` };
  if (n > CONFIG.boxMaxPieces) return { ok: false, reason: `A box holds up to ${CONFIG.boxMaxPieces} pieces.` };
  if (BOX_SIZES.some(s => (sel.items[s.id] || 0) > 0 && !sizeAllowed(sel, s.id))) {
    return { ok: false, reason: 'Striped colours come in the beach size only.' };
  }
  return { ok: true, reason: null };
}

function chosen(sel) {
  return BOX_SIZES.filter(s => (sel.items[s.id] || 0) > 0);
}

export function boxKey(sel) {
  const items = chosen(sel).map(s => `${s.id}:${sel.items[s.id]}`).join(',');
  return `${sel.box}|${sel.ribbon}|${sel.colour}|${items}`;
}

export function boxItemsText(sel) {
  return chosen(sel).map(s => `${sel.items[s.id]} × ${s.label}`).join(', ');
}

export function boxLabel(sel) {
  return `Custom box (${sel.box} box, ${sel.ribbon} ribbon): ${boxItemsText(sel)}, ${sel.colour}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/box.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add js/lib/box.js tests/box.test.js
git commit -m "feat: add Build Your Own Box rules and pricing"
```

### Task 5: Bag store

**Files:**
- Create: `js/lib/bag.js`
- Test: `tests/bag.test.js`

**Interfaces:**
- Consumes: `findProduct`, `validateBox`, `boxKey`, `boxPrice`, `boxLabel`, `boxItemsText`.
- Produces:
  - `BAG_KEY = 'czera.bag.v1'`, `MAX_QTY = 20`
  - `BagLine = {type:'product', slug, qty} | {type:'box', box: BoxSelection, qty}`
  - `lineKey(line) → string`
  - `createBag(storage) → { lines(): BagLine[], add(line): void, setQty(key, qty): void, remove(key): void, clear(): void, count(): number, subscribe(fn): () => void }` — `storage` is any object with `getItem/setItem` (may throw or be `null`)
  - `describeLine(line) → {key, title, spec, image, unitPrice, qty, total, messageLabel}`
  - `bagTotal(lines) → number`

- [ ] **Step 1: Write the failing test** `tests/bag.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBag, describeLine, bagTotal, lineKey, BAG_KEY, MAX_QTY } from '../js/lib/bag.js';
import { emptyBox } from '../js/lib/box.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { getItem: k => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
}
const throwingStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
const box = () => ({ ...emptyBox(), items: { face: 2, hand: 0, bath: 1, sheet: 0, beach: 0 } });

test('adding the same product twice merges quantities and persists', () => {
  const s = memoryStorage();
  const bag = createBag(s);
  bag.add({ type: 'product', slug: 'bath-sheet', qty: 1 });
  bag.add({ type: 'product', slug: 'bath-sheet', qty: 2 });
  assert.equal(bag.count(), 3);
  assert.deepEqual(JSON.parse(s.data[BAG_KEY]), [{ type: 'product', slug: 'bath-sheet', qty: 3 }]);
});

test('a new bag reads what an earlier page saved', () => {
  const s = memoryStorage();
  createBag(s).add({ type: 'product', slug: 'face-towel', qty: 2 });
  assert.equal(createBag(s).count(), 2);
});

test('quantity is clamped to MAX_QTY and setQty below 1 removes the line', () => {
  const bag = createBag(memoryStorage());
  bag.add({ type: 'product', slug: 'face-towel', qty: 99 });
  assert.equal(bag.count(), MAX_QTY);
  bag.setQty('product:face-towel', 0);
  assert.equal(bag.lines().length, 0);
});

test('corrupt or outdated stored data loads as a cleaned bag', () => {
  assert.equal(createBag(memoryStorage({ [BAG_KEY]: '{not json' })).count(), 0);
  assert.equal(createBag(memoryStorage({ [BAG_KEY]: '{"a":1}' })).count(), 0);
  const stored = JSON.stringify([
    { type: 'product', slug: 'gone-product', qty: 1 },
    { type: 'product', slug: 'bath-sheet', qty: -2 },
    { type: 'product', slug: 'bath-towel', qty: 1.5 },
    { type: 'product', slug: 'hand-towel', qty: 2 },
    { type: 'box', box: { box: 'gold' }, qty: 1 },
  ]);
  const bag = createBag(memoryStorage({ [BAG_KEY]: stored }));
  assert.deepEqual(bag.lines(), [{ type: 'product', slug: 'hand-towel', qty: 2 }]);
});

test('storage that throws (or is missing) leaves the bag working in memory', () => {
  for (const storage of [throwingStorage, null]) {
    const bag = createBag(storage);
    bag.add({ type: 'product', slug: 'bath-sheet', qty: 1 });
    assert.equal(bag.count(), 1);
  }
});

test('add ignores unknown products and invalid boxes', () => {
  const bag = createBag(memoryStorage());
  bag.add({ type: 'product', slug: 'nope', qty: 1 });
  bag.add({ type: 'box', box: emptyBox(), qty: 1 });
  assert.equal(bag.count(), 0);
});

test('custom boxes are lines with their own key and price', () => {
  const bag = createBag(memoryStorage());
  bag.add({ type: 'box', box: box(), qty: 1 });
  const [line] = bag.lines();
  assert.equal(lineKey(line), 'box:black|burgundy|white|face:2,bath:1');
  const d = describeLine(line);
  assert.equal(d.total, 570);
  assert.equal(d.messageLabel, 'Custom box (black box, burgundy ribbon): 2 × Face, 1 × Bath, white');
});

test('describeLine and bagTotal compute prices from current data', () => {
  const lines = [
    { type: 'product', slug: 'complete-czera-set', qty: 1 },
    { type: 'product', slug: 'black-bathrobe', qty: 1 },
    { type: 'box', box: box(), qty: 1 },
  ];
  assert.equal(describeLine(lines[0]).total, 1450);
  assert.equal(bagTotal(lines), 3020);
});

test('subscribers hear every change', () => {
  const bag = createBag(memoryStorage());
  let calls = 0;
  const off = bag.subscribe(() => { calls += 1; });
  bag.add({ type: 'product', slug: 'face-towel', qty: 1 });
  bag.remove('product:face-towel');
  off();
  bag.add({ type: 'product', slug: 'face-towel', qty: 1 });
  assert.equal(calls, 2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/bag.test.js`
Expected: FAIL (`Cannot find module '../js/lib/bag.js'`).

- [ ] **Step 3: Write `js/lib/bag.js`**

```js
import { findProduct } from './products.js';
import { validateBox, boxKey, boxPrice, boxLabel, boxItemsText } from './box.js';

export const BAG_KEY = 'czera.bag.v1';
export const MAX_QTY = 20;

export function lineKey(line) {
  return line.type === 'box' ? `box:${boxKey(line.box)}` : `product:${line.slug}`;
}

function cleanQty(q) {
  return Number.isInteger(q) && q >= 1 ? Math.min(q, MAX_QTY) : 0;
}

function cleanLine(line) {
  if (!line || typeof line !== 'object') return null;
  const qty = cleanQty(line.qty);
  if (!qty) return null;
  if (line.type === 'product' && findProduct(line.slug)) return { type: 'product', slug: line.slug, qty };
  if (line.type === 'box' && validateBox(line.box).ok) {
    const b = line.box;
    return { type: 'box', box: { box: b.box, ribbon: b.ribbon, colour: b.colour, items: { ...b.items } }, qty };
  }
  return null;
}

function read(storage) {
  try {
    const raw = storage?.getItem(BAG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(cleanLine).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function createBag(storage) {
  let items = read(storage);
  const listeners = new Set();

  function commit() {
    try { storage?.setItem(BAG_KEY, JSON.stringify(items)); } catch { /* storage unavailable: keep in memory (AgDR-0002) */ }
    listeners.forEach(fn => fn());
  }

  return {
    lines: () => items.map(l => (l.type === 'box' ? { ...l, box: { ...l.box, items: { ...l.box.items } } } : { ...l })),
    count: () => items.reduce((n, l) => n + l.qty, 0),
    add(line) {
      const clean = cleanLine(line);
      if (!clean) return;
      const key = lineKey(clean);
      const existing = items.find(l => lineKey(l) === key);
      if (existing) existing.qty = Math.min(existing.qty + clean.qty, MAX_QTY);
      else items.push(clean);
      commit();
    },
    setQty(key, qty) {
      const q = cleanQty(qty);
      items = q ? items.map(l => (lineKey(l) === key ? { ...l, qty: q } : l)) : items.filter(l => lineKey(l) !== key);
      commit();
    },
    remove(key) {
      items = items.filter(l => lineKey(l) !== key);
      commit();
    },
    clear() {
      items = [];
      commit();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export function describeLine(line) {
  if (line.type === 'box') {
    const unit = boxPrice(line.box);
    return {
      key: lineKey(line), title: 'Custom box',
      spec: `${line.box.box} box, ${line.box.ribbon} ribbon · ${boxItemsText(line.box)} · ${line.box.colour}`,
      image: 'assets/img/products/complete-czera-set-2.jpg',
      unitPrice: unit, qty: line.qty, total: unit * line.qty, messageLabel: boxLabel(line.box),
    };
  }
  const p = findProduct(line.slug);
  return {
    key: lineKey(line), title: p.name, spec: p.spec, image: p.images[0],
    unitPrice: p.price, qty: line.qty, total: p.price * line.qty, messageLabel: p.name,
  };
}

export function bagTotal(lines) {
  return lines.reduce((sum, l) => sum + describeLine(l).total, 0);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/bag.test.js`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add js/lib/bag.js tests/bag.test.js
git commit -m "feat: add localStorage-backed bag with line pricing"
```

### Task 6: WhatsApp order message and delivery-details validation

**Files:**
- Create: `js/lib/whatsapp.js`, `js/lib/checkout.js`
- Test: `tests/whatsapp.test.js`, `tests/checkout.test.js`

**Interfaces:**
- Consumes: `describeLine`, `bagTotal`, `formatEGP`, `CONFIG.whatsappNumber`.
- Produces:
  - `buildOrderMessage(lines: BagLine[], details?: Details) → string`
  - `orderLink(message: string, number = CONFIG.whatsappNumber) → string` (`https://wa.me/<digits>?text=<encoded>`)
  - `Details = {name, phone, address, city, note}`; `validateDetails(details) → {ok:boolean, errors: Partial<Record<'name'|'phone'|'address'|'city', string>>}`

- [ ] **Step 1: Write the failing tests**

`tests/whatsapp.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOrderMessage, orderLink } from '../js/lib/whatsapp.js';
import { emptyBox } from '../js/lib/box.js';

const lines = [
  { type: 'product', slug: 'complete-czera-set', qty: 1 },
  { type: 'product', slug: 'black-bathrobe', qty: 1 },
  { type: 'box', box: { ...emptyBox(), items: { face: 2, hand: 0, bath: 1, sheet: 0, beach: 0 } }, qty: 1 },
];
const details = { name: 'Sara', phone: '0100 123 4567', address: '12 Street', city: 'Cairo', note: 'Gift, please add a card' };

test('message matches the spec format with details', () => {
  assert.equal(buildOrderMessage(lines, details), [
    "Hello Czera, I'd like to order:",
    '• 1 × The Complete Czera Set: 1,450 EGP',
    '• 1 × Black Bathrobe: 1,000 EGP',
    '• 1 × Custom box (black box, burgundy ribbon): 2 × Face, 1 × Bath, white: 570 EGP',
    'Total: 3,020 EGP',
    '',
    'Name: Sara',
    'Phone: 0100 123 4567',
    'Address: 12 Street, City: Cairo',
    'Note: Gift, please add a card',
  ].join('\n'));
});

test('single-item message has no details block, and an empty note is left out', () => {
  assert.equal(buildOrderMessage([lines[1]]), "Hello Czera, I'd like to order:\n• 1 × Black Bathrobe: 1,000 EGP\nTotal: 1,000 EGP");
  assert.ok(!buildOrderMessage(lines, { ...details, note: '  ' }).includes('Note:'));
});

test('orderLink encodes &, #, line breaks and Arabic so WhatsApp receives them intact', () => {
  const msg = 'A & B #1\nسارة';
  const link = orderLink(msg, '201000000000');
  assert.ok(link.startsWith('https://wa.me/201000000000?text='));
  assert.equal(decodeURIComponent(link.split('?text=')[1]), msg);
  assert.ok(!link.includes('#'));
  assert.ok(!link.includes('&'));
});
```

`tests/checkout.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDetails } from '../js/lib/checkout.js';

const ok = { name: 'Sara', phone: '01001234567', address: '12 Street', city: 'Cairo', note: '' };

test('complete details pass', () => {
  assert.deepEqual(validateDetails(ok), { ok: true, errors: {} });
});

test('name, address and city are required (whitespace does not count)', () => {
  const r = validateDetails({ ...ok, name: '  ', address: '', city: undefined });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['address', 'city', 'name']);
});

test('phone needs at least 8 digits; spaces, + and dashes are allowed', () => {
  assert.equal(validateDetails({ ...ok, phone: '+20 100-123-4567' }).ok, true);
  assert.equal(validateDetails({ ...ok, phone: '12345' }).errors.phone, 'Enter a phone number we can call.');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/whatsapp.test.js tests/checkout.test.js`
Expected: FAIL (modules not found).

- [ ] **Step 3: Write `js/lib/whatsapp.js` and `js/lib/checkout.js`**

```js
// js/lib/whatsapp.js
import { CONFIG } from '../config.js';
import { describeLine, bagTotal } from './bag.js';
import { formatEGP } from './format.js';

export function buildOrderMessage(lines, details) {
  const out = ["Hello Czera, I'd like to order:"];
  for (const line of lines) {
    const d = describeLine(line);
    out.push(`• ${d.qty} × ${d.messageLabel}: ${formatEGP(d.total)}`);
  }
  out.push(`Total: ${formatEGP(bagTotal(lines))}`);
  if (details) {
    out.push('', `Name: ${details.name.trim()}`, `Phone: ${details.phone.trim()}`,
      `Address: ${details.address.trim()}, City: ${details.city.trim()}`);
    if (details.note && details.note.trim()) out.push(`Note: ${details.note.trim()}`);
  }
  return out.join('\n');
}

export function orderLink(message, number = CONFIG.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
```

```js
// js/lib/checkout.js
const REQUIRED = { name: 'Enter your name.', address: 'Enter your address.', city: 'Enter your city.' };

export function validateDetails(details = {}) {
  const errors = {};
  for (const [field, message] of Object.entries(REQUIRED)) {
    if (!String(details[field] ?? '').trim()) errors[field] = message;
  }
  const digits = String(details.phone ?? '').replace(/\D/g, '');
  if (digits.length < 8) errors.phone = 'Enter a phone number we can call.';
  return { ok: Object.keys(errors).length === 0, errors };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/whatsapp.test.js tests/checkout.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add js/lib/whatsapp.js js/lib/checkout.js tests/whatsapp.test.js tests/checkout.test.js
git commit -m "feat: build WhatsApp order message and validate delivery details"
```

### Task 7: Collection filters and recently viewed

**Files:**
- Create: `js/lib/filters.js`, `js/lib/recent.js`
- Test: `tests/filters.test.js`, `tests/recent.test.js`

**Interfaces:**
- Produces:
  - `PRICE_BANDS: {id:'under-500'|'500-1500'|'over-1500', label, test(price)}[]`, `COLOURS: {id:'white'|'black'|'striped', label}[]`
  - `FilterState = {categories:Set<string>, prices:Set<string>, colours:Set<string>}`; `emptyFilters() → FilterState`
  - `filterProducts(products, state) → Product[]` (OR within a facet, AND across facets; order preserved)
  - `facetCounts(products, state) → {category:Record<id,number>, price:Record<id,number>, colour:Record<id,number>}` (each count applies the other facets' selections)
  - `RECENT_KEY = 'czera.recent.v1'`; `readRecent(storage) → string[]`; `pushRecent(storage, slug, max = 4) → string[]`

- [ ] **Step 1: Write the failing tests**

`tests/filters.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../js/data/products.js';
import { emptyFilters, filterProducts, facetCounts } from '../js/lib/filters.js';

test('no filters returns all 16 in data order', () => {
  assert.deepEqual(filterProducts(PRODUCTS, emptyFilters()).map(p => p.slug), PRODUCTS.map(p => p.slug));
});

test('price bands split 3 / 7 / 6', () => {
  const c = facetCounts(PRODUCTS, emptyFilters());
  assert.deepEqual(c.price, { 'under-500': 3, '500-1500': 7, 'over-1500': 6 });
  assert.deepEqual(c.category, { towels: 4, bathrobes: 2, beach: 2, 'gift-sets': 8 });
});

test('OR within a facet, AND across facets', () => {
  const s = emptyFilters();
  s.categories.add('towels'); s.categories.add('beach');
  assert.equal(filterProducts(PRODUCTS, s).length, 6);
  s.prices.add('under-500');
  assert.deepEqual(filterProducts(PRODUCTS, s).map(p => p.slug), ['face-towel', 'hand-towel', 'bath-towel']);
});

test('counts reflect the other facets, so dead options show 0', () => {
  const s = emptyFilters();
  s.categories.add('bathrobes');
  const c = facetCounts(PRODUCTS, s);
  assert.equal(c.price['under-500'], 0);
  assert.equal(c.colour.striped, 0);
  assert.equal(c.category.towels, 4); // own facet ignores its own selection
});
```

`tests/recent.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readRecent, pushRecent, RECENT_KEY } from '../js/lib/recent.js';

const mem = (init = {}) => { const d = { ...init }; return { getItem: k => d[k] ?? null, setItem: (k, v) => { d[k] = v; } }; };

test('keeps the latest four unique slugs, newest first', () => {
  const s = mem();
  for (const slug of ['a-1', 'b-1', 'c-1', 'a-1', 'd-1', 'e-1']) pushRecent(s, slug);
  assert.deepEqual(readRecent(s), ['e-1', 'd-1', 'a-1', 'c-1']);
});

test('bad stored data or throwing storage reads as empty', () => {
  assert.deepEqual(readRecent(mem({ [RECENT_KEY]: 'oops' })), []);
  assert.deepEqual(readRecent({ getItem() { throw new Error('x'); } }), []);
  assert.deepEqual(readRecent(null), []);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/filters.test.js tests/recent.test.js`
Expected: FAIL (modules not found).

- [ ] **Step 3: Write `js/lib/filters.js` and `js/lib/recent.js`**

```js
// js/lib/filters.js
import { CATEGORIES } from '../data/products.js';

export const PRICE_BANDS = [
  { id: 'under-500', label: 'Under 500 EGP', test: p => p < 500 },
  { id: '500-1500', label: '500–1,500 EGP', test: p => p >= 500 && p <= 1500 },
  { id: 'over-1500', label: 'Over 1,500 EGP', test: p => p > 1500 },
];
export const COLOURS = [
  { id: 'white', label: 'White' },
  { id: 'black', label: 'Black' },
  { id: 'striped', label: 'Striped' },
];

export function emptyFilters() {
  return { categories: new Set(), prices: new Set(), colours: new Set() };
}

const FACETS = {
  category: (p, sel) => sel.size === 0 || sel.has(p.category),
  price: (p, sel) => sel.size === 0 || PRICE_BANDS.some(b => sel.has(b.id) && b.test(p.price)),
  colour: (p, sel) => sel.size === 0 || p.colours.some(c => sel.has(c)),
};
const SELECTION = { category: 'categories', price: 'prices', colour: 'colours' };

function matches(p, state, ignore) {
  return Object.keys(FACETS).every(f => f === ignore || FACETS[f](p, state[SELECTION[f]]));
}

export function filterProducts(products, state) {
  return products.filter(p => matches(p, state));
}

export function facetCounts(products, state) {
  const count = (facet, test) => products.filter(p => matches(p, state, facet) && test(p)).length;
  return {
    category: Object.fromEntries(CATEGORIES.map(c => [c.id, count('category', p => p.category === c.id)])),
    price: Object.fromEntries(PRICE_BANDS.map(b => [b.id, count('price', p => b.test(p.price))])),
    colour: Object.fromEntries(COLOURS.map(c => [c.id, count('colour', p => p.colours.includes(c.id))])),
  };
}
```

```js
// js/lib/recent.js
export const RECENT_KEY = 'czera.recent.v1';

export function readRecent(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function pushRecent(storage, slug, max = 4) {
  const next = [slug, ...readRecent(storage).filter(s => s !== slug)].slice(0, max);
  try { storage?.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* storage unavailable: nothing to remember */ }
  return next;
}
```

- [ ] **Step 4: Run all tests**

Run: `npm test`
Expected: PASS (every test file).

- [ ] **Step 5: Commit**

```bash
git add js/lib/filters.js js/lib/recent.js tests/filters.test.js tests/recent.test.js
git commit -m "feat: add collection filters with facet counts and recently viewed"
```

### Task 8: Open PR 1

- [ ] **Step 1: Push and open the PR** (title `feat(#N): showroom foundation — product data, images, bag and order logic`; body with Summary, Test plan with the `npm test` output, Glossary: Bag line, Facet count, AgDR, Custom box). Then switch to the code-reviewer persona per `pr-workflow.md`.

---

## PR 2 — Site shell

### Task 9: Shared shell (header, footer, menu, reveal, card)

**Files:**
- Create: `js/ui/shell.js`, `js/ui/menu.js`, `js/ui/reveal.js`, `js/ui/card.js`, `js/ui/bag-panel.js` (stub; replaced in Task 10), `js/pages/home.js`, `js/pages/collection.js`, `js/pages/product.js` (minimal)
- Modify: `css/components.css` (header nav + bag button, card, footer, toast, dark band), `index.html`, `catalog.html`, `product.html` (header/footer placeholders, module scripts, titles)
- Delete: `js/main.js`
- Test: `tests/card.test.js`

**Interfaces:**
- Consumes: `createBag`, `CATEGORIES`, `CONFIG`, `escapeHtml`, `formatEGP`, `findProduct`.
- Produces:
  - `initShell({ hasHero = false } = {}) → { bag }` — replaces `[data-shell-header]` and `[data-shell-footer]` with the header and footer, appends the toast to `<body>`, keeps `[data-bag-count]` in sync, handles clicks on `[data-add-to-bag]` (value = product slug, optional `data-qty`), calls `initBagPanel(bag)`, `initMenu()`, `initHeaderScroll()` (hero pages) and `initReveal()`.
  - `showToast(text: string) → void`
  - `renderProductCard(product) → string`
  - `initMenu()`, `initReveal(selectors?: string)`, `initHeaderScroll()`
  - `initBagPanel(bag)` (Task 10 provides the real one)

Visual reference: header and bag icon in `coll-03-grid.html` (`.topnav`, `.bag`), card in `coll-02-card.html` option B (`.p`, `.rowp`, `.add`), toast in `coll-03-grid.html` (`.toast`), footer in `home-07-footer.html` (`footer.f`), dark band in `home-04-buildbox.html` option C (`.band.dark`). Port their values into `css/components.css` using tokens.

- [ ] **Step 1: Write the failing test** `tests/card.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderProductCard } from '../js/ui/card.js';
import { findProduct } from '../js/lib/products.js';

test('card shows name, spec, price, link and add-to-bag control', () => {
  const html = renderProductCard(findProduct('hand-and-bath-sheet-set'));
  assert.match(html, /href="product\.html\?slug=hand-and-bath-sheet-set"/);
  assert.match(html, /Hand &amp; Bath Sheet Set/);
  assert.match(html, /1,760 EGP/);
  assert.match(html, /data-add-to-bag="hand-and-bath-sheet-set"/);
  assert.match(html, /alt="Hand &amp; Bath Sheet Set"/);
});

test('second photo is included for hover when the product has one', () => {
  assert.match(renderProductCard(findProduct('bath-sheet')), /card__img--alt/);
  assert.doesNotMatch(renderProductCard(findProduct('beach-towel-set')), /card__img--alt/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/card.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Write `js/ui/card.js`**

```js
import { escapeHtml } from '../lib/escape.js';
import { formatEGP } from '../lib/format.js';

export function renderProductCard(p) {
  const name = escapeHtml(p.name);
  const href = `product.html?slug=${escapeHtml(p.slug)}`;
  const alt = p.images[1]
    ? `<img class="card__img card__img--alt" src="${escapeHtml(p.images[1])}" alt="" loading="lazy" />`
    : '';
  return `
    <article class="card">
      <a class="card__media" href="${href}" tabindex="-1" aria-hidden="true">
        <img class="card__img" src="${escapeHtml(p.images[0])}" alt="${name}" loading="lazy" />${alt}
      </a>
      <h3 class="card__name"><a href="${href}">${name}</a></h3>
      <p class="card__spec">${escapeHtml(p.spec)}</p>
      <div class="card__row">
        <span class="card__price">${formatEGP(p.price)}</span>
        <button class="card__add" type="button" data-add-to-bag="${escapeHtml(p.slug)}" aria-label="Add ${name} to bag">Add to bag ›</button>
      </div>
    </article>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/card.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Move menu, header-scroll and reveal into modules.** Create `js/ui/menu.js` exporting `initMenu()` whose body is the menu section of today's `js/main.js` (the block from `const menuToggle` through the `.site-menu__link` close handlers) unchanged. Create `js/ui/reveal.js` exporting `initHeaderScroll()` (the "Header transparency on hero pages" block, without the `has-hero` check, since the caller decides) and `initReveal(selectors = '.chapter__content, .chapter__heading, .section__head, .reveal-target')` (the scroll-reveal block, using `selectors` instead of the hard-coded list). Delete `js/main.js`.

- [ ] **Step 6: Write the temporary `js/ui/bag-panel.js` stub** so the shell loads before Task 10:

```js
// Replaced in full by Task 10.
export function initBagPanel() {}
```

- [ ] **Step 7: Write `js/ui/shell.js`**

```js
import { CATEGORIES } from '../data/products.js';
import { CONFIG } from '../config.js';
import { createBag } from '../lib/bag.js';
import { findProduct } from '../lib/products.js';
import { escapeHtml } from '../lib/escape.js';
import { initMenu } from './menu.js';
import { initReveal, initHeaderScroll } from './reveal.js';
import { initBagPanel } from './bag-panel.js';

const BAG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>';

function navLinks(cls = '') {
  const a = (href, text) => `<a${cls ? ` class="${cls}"` : ''} href="${href}">${escapeHtml(text)}</a>`;
  return CATEGORIES.map(c => a(`catalog.html?category=${c.id}`, c.navLabel)).join('')
    + a('build-your-box.html', 'Build your box') + a('about.html', 'About');
}

function headerHtml() {
  return `
  <header class="site-header">
    <div class="container site-header__inner">
      <a href="index.html" class="brand-mark" aria-label="Czera, home">
        <img class="brand-mark__img brand-mark__img--default" src="assets/logo/czera-wordmark-alt.png" alt="Czera" />
        <img class="brand-mark__img brand-mark__img--gold" src="assets/logo/czera-wordmark-gold.png" alt="" aria-hidden="true" />
      </a>
      <nav class="site-nav" aria-label="Primary">${navLinks()}</nav>
      <button class="bag-button" type="button" data-bag-open aria-label="Open your bag">
        ${BAG_ICON}<span class="bag-button__label">Bag</span><span class="bag-button__count" data-bag-count>0</span>
      </button>
      <button class="menu-toggle" type="button" data-menu-toggle aria-label="Open menu" aria-expanded="false" aria-controls="site-menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M4 8h16M4 12h9M4 16h16"/></svg>
      </button>
    </div>
  </header>
  <div class="site-menu-backdrop" data-menu-backdrop aria-hidden="true" hidden></div>
  <aside id="site-menu" class="site-menu" data-site-menu aria-label="Site menu" aria-hidden="true" hidden>
    <div class="site-menu__head"><button class="site-menu__close" type="button" data-menu-close aria-label="Close menu">×</button></div>
    <nav class="site-menu__nav" aria-label="Primary">${navLinks('site-menu__link')}</nav>
  </aside>`;
}

function footerHtml() {
  const shop = CATEGORIES.map(c => `<li><a href="catalog.html?category=${c.id}">${escapeHtml(c.label)}</a></li>`).join('');
  return `
  <footer class="site-footer" id="contact">
    <div class="container footer-grid">
      <div><p class="footer__mark">CZERA</p><p class="footer__tag">Luxury towels &amp; bath essentials</p>
        <p class="footer__about">100% cotton towels, bathrobes and gift sets. Every detail feels like home.</p></div>
      <div><h4 class="footer__heading">Shop</h4><ul class="footer__list">${shop}<li><a href="build-your-box.html">Build your box</a></li></ul></div>
      <div><h4 class="footer__heading">Help</h4><ul class="footer__list">
        <li><a href="index.html#how-to-order">How to order</a></li><li><a href="about.html#sizes">Sizes &amp; care</a></li>
        <li><a href="about.html#delivery">Delivery</a></li><li><a href="about.html">About Czera</a></li></ul></div>
      <div><h4 class="footer__heading">Contact</h4><ul class="footer__list">
        <li>WhatsApp ${escapeHtml(CONFIG.whatsappDisplay)}</li>
        <li><a href="https://www.instagram.com/${CONFIG.instagram}" rel="noopener">Instagram @${CONFIG.instagram}</a></li></ul>
        <a class="btn btn--outline-gold" href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noopener">Order on WhatsApp</a></div>
    </div>
    <div class="container footer__bottom"><span>© <span data-current-year></span> Czera</span><span>English · <span lang="ar">العربية</span></span></div>
  </footer>`;
}

let toastTimer;
export function showToast(text) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.querySelector('[data-toast-text]').textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3500);
}

function replacePlaceholder(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.outerHTML = html;
}

export function initShell({ hasHero = false } = {}) {
  replacePlaceholder('[data-shell-header]', headerHtml());
  replacePlaceholder('[data-shell-footer]', footerHtml());
  document.body.insertAdjacentHTML('beforeend',
    '<div class="toast" data-toast role="status" hidden><span data-toast-text></span> <button type="button" class="toast__link" data-bag-open>View bag ›</button></div>');
  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  let storage = null;
  try { storage = window.localStorage; } catch { storage = null; }
  const bag = createBag(storage);
  const refresh = () => {
    const el = document.querySelector('[data-bag-count]');
    if (el) el.textContent = String(bag.count());
  };
  bag.subscribe(refresh);
  refresh();

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add-to-bag]');
    if (!add) return;
    const product = findProduct(add.dataset.addToBag);
    if (!product) return;
    bag.add({ type: 'product', slug: product.slug, qty: Number(add.dataset.qty || 1) });
    showToast(`${product.name} added to your bag`);
  });

  initBagPanel(bag);
  initMenu();
  if (hasHero) initHeaderScroll();
  initReveal();
  return { bag };
}
```

- [ ] **Step 8: Switch the three existing pages to the shell.** In `index.html`, `catalog.html` and `product.html`: replace everything from `<header` through the closing `</aside>` of the slide-in menu with `<div data-shell-header></div>`; replace the `<footer …>…</footer>` block with `<div data-shell-footer></div>`; replace the `<script src="js/main.js">` and `<script src="js/catalog.js">` tags with `<script type="module" src="js/pages/home.js"></script>` (resp. `collection.js`, `product.js`); add `<noscript><p class="noscript">Turn on JavaScript to use the bag and order on WhatsApp.</p></noscript>` right after `<body>`. Set `<title>Czera — Towels, bathrobes and gift sets</title>` and `<meta name="description" content="100% cotton towels, 1200 GSM bathrobes and boxed gift sets. Order on WhatsApp." />` on all three. Create the minimal page modules:

```js
// js/pages/home.js
import { initShell } from '../ui/shell.js';
initShell({ hasHero: true });
```

```js
// js/pages/collection.js  and  js/pages/product.js
import { initShell } from '../ui/shell.js';
initShell();
```

- [ ] **Step 9: Port the shell CSS** into `css/components.css`: `.site-nav` (inline links, `--fs-2xs`, `--ls-widest`, uppercase; hidden below 900px, where `.menu-toggle` shows), `.bag-button` + `.bag-button__count` (deep-gold circle, ivory number), `.card*` (from `coll-02-card.html` option B; `.card__media` relative 4:5; `.card__img--alt` absolutely positioned, opacity 0, faded in on `.card:hover`; `.card__add` a text button styled as the gold link with an underline), `.toast` (fixed under the header at the inline end, ink background, ivory text), the footer from `home-07-footer.html` (`footer.f`: ink background, four columns → one column below 768px), `.btn--outline-gold`, `.btn--ink`, `.btn--light`, `.btn--outline-light`, `.band--dark` (two-column dark band, gold eyebrow), `.noscript`. Remove `.site-header--centered-mark`, `.site-menu__utilities` and `.icon-button` rules only if nothing references them after Step 8 (`grep -rn`).

- [ ] **Step 10: Verify in the browser.** Run `python -m http.server 8000` and open `http://localhost:8000/index.html`, `catalog.html`, `product.html` with Playwright at 1440×900 and 390×844. Expected: header with six links and "Bag 0" on desktop, hamburger on mobile; the menu opens and closes; the footer shows four columns with `+20 100 000 0000`; no console errors. Run `npm test`: PASS.

- [ ] **Step 11: Commit**

```bash
git add js/ui/shell.js js/ui/menu.js js/ui/reveal.js js/ui/card.js js/ui/bag-panel.js js/pages/home.js js/pages/collection.js js/pages/product.js tests/card.test.js css/components.css index.html catalog.html product.html
git rm js/main.js
git commit -m "feat: render shared header, footer, card and toast from one module"
```

### Task 10: Bag panel and WhatsApp order

**Files:**
- Modify (replace): `js/ui/bag-panel.js`
- Modify: `css/components.css` (bag panel), `css/tokens.css` (`--color-whatsapp`)

**Interfaces:**
- Consumes: bag API (Task 5), `describeLine`, `bagTotal`, `formatEGP`, `escapeHtml`, `validateDetails`, `buildOrderMessage`, `orderLink`, `CONFIG.deliveryText/paymentText`.
- Produces: `initBagPanel(bag)` — any `[data-bag-open]` click opens the panel; ESC, the backdrop and × close it and return focus to the trigger.

Visual reference: `bag-01.html` option C (two steps) and option A (panel look: `.drawer`, `.it`, `.tot`, `.fld`, `.wabtn`).

- [ ] **Step 1: Write `js/ui/bag-panel.js`**

```js
import { describeLine, bagTotal } from '../lib/bag.js';
import { formatEGP } from '../lib/format.js';
import { escapeHtml } from '../lib/escape.js';
import { validateDetails } from '../lib/checkout.js';
import { buildOrderMessage, orderLink } from '../lib/whatsapp.js';
import { CONFIG } from '../config.js';

const FIELDS = [
  { id: 'name', label: 'Full name', autocomplete: 'name', required: true },
  { id: 'phone', label: 'Phone', autocomplete: 'tel', required: true, type: 'tel' },
  { id: 'address', label: 'Address', autocomplete: 'street-address', required: true },
  { id: 'city', label: 'City', autocomplete: 'address-level2', required: true },
  { id: 'note', label: 'Note (optional), e.g. "it\'s a gift"', autocomplete: 'off', required: false },
];

export function initBagPanel(bag) {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="bag-backdrop" data-bag-backdrop hidden></div>
    <aside class="bag-panel" data-bag-panel role="dialog" aria-modal="true" aria-labelledby="bag-title" hidden>
      <div class="bag-panel__head"><h2 id="bag-title" class="bag-panel__title">Your bag</h2>
        <button type="button" class="bag-panel__close" data-bag-close aria-label="Close bag">×</button></div>
      <div class="bag-panel__body" data-bag-body></div>
    </aside>`);
  const panel = document.querySelector('[data-bag-panel]');
  const backdrop = document.querySelector('[data-bag-backdrop]');
  const body = document.querySelector('[data-bag-body]');
  let step = 1;
  let trigger = null;
  let sent = false;

  function renderItems() {
    const lines = bag.lines();
    if (!lines.length) {
      body.innerHTML = '<p class="bag-panel__empty">Your bag is empty.</p><a class="btn btn--ink" href="catalog.html">Shop the collection</a>';
      return;
    }
    const rows = lines.map(l => {
      const d = describeLine(l);
      return `<div class="bag-line" data-key="${escapeHtml(d.key)}">
        <img src="${escapeHtml(d.image)}" alt="" class="bag-line__img" />
        <div><p class="bag-line__title">${escapeHtml(d.title)}</p><p class="bag-line__spec">${escapeHtml(d.spec)}</p>
          <div class="qty"><button type="button" data-qty="-1" aria-label="One less">−</button><span>${d.qty}</span><button type="button" data-qty="1" aria-label="One more">+</button></div>
          <button type="button" class="bag-line__remove" data-remove>Remove</button></div>
        <span class="bag-line__price">${formatEGP(d.total)}</span></div>`;
    }).join('');
    body.innerHTML = `<p class="bag-panel__step">Step 1 of 2</p>${rows}
      <div class="bag-total"><span>Total</span><b>${formatEGP(bagTotal(lines))}</b></div>
      <p class="bag-panel__note">Delivery fee confirmed on WhatsApp · ${escapeHtml(CONFIG.paymentText)}</p>
      <button type="button" class="btn btn--ink btn--block" data-continue>Continue ›</button>`;
  }

  function renderDetails(values = {}, errors = {}) {
    const inputs = FIELDS.map(f => `
      <label class="field"><span class="field__label">${escapeHtml(f.label)}${f.required ? ' *' : ''}</span>
        <input name="${f.id}" type="${f.type || 'text'}" autocomplete="${f.autocomplete}" value="${escapeHtml(values[f.id] || '')}" ${f.required ? 'required' : ''} aria-invalid="${errors[f.id] ? 'true' : 'false'}" />
        ${errors[f.id] ? `<span class="field__error">${escapeHtml(errors[f.id])}</span>` : ''}</label>`).join('');
    body.innerHTML = `<p class="bag-panel__step">Step 2 of 2</p><h3 class="bag-panel__sub">Delivery details</h3>
      <form data-details novalidate>${inputs}
        <p class="bag-panel__note">${escapeHtml(CONFIG.deliveryText)}</p>
        <button type="submit" class="btn btn--whatsapp btn--block">Send order on WhatsApp</button>
        <button type="button" class="bag-panel__back" data-back>‹ Back to bag</button></form>
      ${sent ? '<p class="bag-panel__sent">WhatsApp opened with your order. <button type="button" data-clear>Clear bag</button></p>' : ''}`;
  }

  function render() { if (step === 1) renderItems(); else renderDetails(); }

  function open(from) {
    trigger = from; step = 1; sent = false; render();
    panel.hidden = false; backdrop.hidden = false;
    document.body.classList.add('bag-open');
    panel.querySelector('[data-bag-close]').focus();
  }
  function close() {
    panel.hidden = true; backdrop.hidden = true;
    document.body.classList.remove('bag-open');
    trigger?.focus();
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-bag-open]');
    if (opener) { e.preventDefault(); open(opener); return; }
    if (e.target.closest('[data-bag-close]') || e.target === backdrop) { close(); return; }
    if (panel.hidden) return;
    const line = e.target.closest('.bag-line');
    if (line && e.target.closest('[data-qty]')) {
      const cur = bag.lines().find(l => describeLine(l).key === line.dataset.key);
      bag.setQty(line.dataset.key, cur.qty + Number(e.target.closest('[data-qty]').dataset.qty));
      render();
    } else if (line && e.target.closest('[data-remove]')) { bag.remove(line.dataset.key); render(); }
    else if (e.target.closest('[data-continue]')) { step = 2; render(); body.querySelector('input')?.focus(); }
    else if (e.target.closest('[data-back]')) { step = 1; render(); }
    else if (e.target.closest('[data-clear]')) { bag.clear(); close(); }
  });

  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-details]')) return;
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.target));
    const { ok, errors } = validateDetails(values);
    if (!ok) { renderDetails(values, errors); body.querySelector('[aria-invalid="true"]')?.focus(); return; }
    window.open(orderLink(buildOrderMessage(bag.lines(), values)), '_blank', 'noopener');
    sent = true; renderDetails(values);
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
}
```

- [ ] **Step 2: Port the bag panel CSS** into `css/components.css`: `.bag-panel` fixed at the inline end, width `min(400px, 100vw)`, full height, `--color-surface-soft` background, scrollable body; `.bag-backdrop` fixed, `--color-overlay`; `.bag-line` grid `56px 1fr auto`; `.qty`; `.field`, `.field__error` (deep-gold text); `.btn--whatsapp` using a new token `--color-whatsapp: #1f7a4d;` added to `css/tokens.css`; `.btn--block`; `body.bag-open { overflow: hidden; }`.

- [ ] **Step 3: Verify in the browser** (server from Task 9). On `catalog.html` run in the console `document.body.insertAdjacentHTML('beforeend','<button data-add-to-bag="bath-sheet">t</button>')` and click it. Expected: toast "Bath Sheet added to your bag", count 1. Open the bag: the line shows 650 EGP; + makes 2 and 1,300 EGP; Continue → details form; submit empty → four errors and focus on the first; valid values → a new tab opens `https://wa.me/201000000000?text=…` whose decoded text matches the spec format. Reload: the bag still holds the item. Run `npm test`: PASS.

- [ ] **Step 4: Commit**

```bash
git add js/ui/bag-panel.js css/components.css css/tokens.css
git commit -m "feat: add two-step bag panel that sends the order on WhatsApp"
```

- [ ] **Step 5: Open PR 2** (title `feat(#N): site shell — header, footer, bag panel and WhatsApp order`; Glossary: Shell, Bag panel, Toast, wa.me link). Code-reviewer persona, plus the security-auditor persona (the panel renders customer text: confirm every interpolation goes through `escapeHtml`).

---

## PR 3 — Home

### Task 11: Rebuild `index.html`

**Files:**
- Modify: `index.html`, `css/pages/landing.css`, `js/pages/home.js`

**Interfaces:**
- Consumes: `initShell`, `renderProductCard`, `giftGroup`, `categoryMeta`, `formatEGP`, `CONFIG`.
- Produces: nothing for later tasks.

Visual reference (chosen options): `home-01-hero.html` A, `home-02-categories.html` B, `home-03-giftsets.html` B, `home-04-buildbox.html` C, `home-05-story.html` A, `home-06-material.html` B, `home-07-footer.html` B.

- [ ] **Step 1: Replace `<main>` in `index.html`.** Keep the existing hero `<video>` element and the existing `#brand` story section; replace everything else in `<main>` so it reads:

```html
<main id="main">
  <section class="hero">
    <!-- keep the existing <video class="hero__media" …> element here, unchanged -->
    <div class="hero__overlay" aria-hidden="true"></div>
    <div class="hero__copy">
      <span class="eyebrow">Towels · Bathrobes · Gift sets</span>
      <h1 class="hero__title">The hotel experience,<br />at home.</h1>
      <p class="hero__lede">100% cotton towels and 1200 GSM bathrobes, presented in the black Czera gift box.</p>
      <div class="hero__actions"><a class="btn btn--light" href="catalog.html">Shop the collection</a><a class="btn btn--outline-light" href="build-your-box.html">Build your own box</a></div>
    </div>
  </section>

  <section class="section categories" aria-labelledby="cat-title">
    <header class="section__head"><span class="eyebrow">The collection</span><h2 id="cat-title" class="section__title">Shop by category</h2></header>
    <div class="cat-grid">
      <a class="cat-tile cat-tile--big" href="catalog.html?category=gift-sets"><img src="assets/img/products/complete-czera-set-3.jpg" alt="The Complete Czera Set in its black gift box" /><span class="cat-tile__label"><small data-category-meta="gift-sets"></small><b>Gift sets</b><u>Shop gifts</u></span></a>
      <a class="cat-tile" href="catalog.html?category=towels"><img src="assets/img/catalogue/p07.jpg" alt="Folded white towels on stone" /><span class="cat-tile__label"><small data-category-meta="towels"></small><b>Towels</b><u>Shop towels</u></span></a>
      <a class="cat-tile" href="catalog.html?category=bathrobes"><img src="assets/img/catalogue/p09.jpg" alt="White bathrobe on a hook" /><span class="cat-tile__label"><small data-category-meta="bathrobes"></small><b>Bathrobes</b><u>Shop robes</u></span></a>
      <a class="cat-tile cat-tile--wide" href="catalog.html?category=beach"><img src="assets/img/catalogue/p11.jpg" alt="Yellow striped beach towel on a lounger by the sea" /><span class="cat-tile__label"><small data-category-meta="beach"></small><b>Beach</b><u>Shop beach</u></span></a>
    </div>
  </section>

  <section class="section gifts" aria-labelledby="gifts-title">
    <header class="section__head"><span class="eyebrow">Gift sets</span><h2 id="gifts-title" class="section__title">A gift for every occasion</h2></header>
    <div class="tabs" role="tablist" aria-label="Gift sets">
      <button role="tab" id="tab-home" aria-controls="panel-gifts" aria-selected="true" data-gift-tab="home">For the home</button>
      <button role="tab" id="tab-robes" aria-controls="panel-gifts" aria-selected="false" data-gift-tab="robes-beach">Robes &amp; beach</button>
    </div>
    <div id="panel-gifts" role="tabpanel" class="card-row" data-gift-panel></div>
    <p class="gifts__more"><a class="link" href="catalog.html?category=gift-sets">See all gift sets ›</a></p>
  </section>

  <section class="band band--dark" aria-labelledby="box-title">
    <div class="band__copy">
      <span class="eyebrow">Build your own box</span>
      <h2 id="box-title" class="band__title">A gift set that's<br />yours alone.</h2>
      <p>Choose the box, the towels, the colour and the ribbon. Box and ribbon are included free.</p>
      <ol class="steps"><li><b>Box</b>Black or beige</li><li><b>Towels</b>Five sizes, any mix</li><li><b>Colour</b>White, black or stripes</li><li><b>Ribbon</b>Burgundy or gold</li></ol>
      <a class="btn btn--gold" href="build-your-box.html">Start your box</a>
    </div>
    <img class="band__media" src="assets/img/products/hand-and-bath-sheet-set-1.jpg" alt="Towels tied with burgundy Czera ribbon" />
  </section>

  <!-- existing <section id="brand" class="chapter chapter--story"> stays here, with these edits:
       .chapter__title  → "The hotel experience,<br />brought home."
       .chapter__body   → "Czera began with a simple belief: everyday moments deserve the comfort of the world's finest hotels. Our towels, robes and gift sets bring that same calm into your home."
       .chapter__pullquote → "It's all in the details."
       .chapter__link   → href="about.html", text "About Czera →"
       .chapter__media aria-label → "White towels stacked beside a stone bath in warm light" -->

  <section class="section promises" aria-labelledby="promise-title">
    <header class="section__head"><span class="eyebrow">Why Czera</span><h2 id="promise-title" class="section__title">Hotel quality, every piece.</h2></header>
    <ul class="promise-list">
      <li><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 30c-5 0-8-3-8-7s3-7 7-7c1-5 5-8 9-8s8 3 9 8c4 0 7 3 7 7s-3 7-8 7"/><path d="M24 22v18M20 36l4 4 4-4"/></svg><b>100% cotton</b><span>Soft, breathable and gentle on skin</span></li>
      <li><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6s-12 14-12 23a12 12 0 0024 0C36 20 24 6 24 6z"/></svg><b>Highly absorbent</b><span>Dries you faster, wash after wash</span></li>
      <li><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 38C10 20 22 10 38 10c0 16-10 28-28 28z"/><path d="M10 38l18-18"/></svg><b>Long-lasting</b><span>Keeps its softness over years of use</span></li>
      <li><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 18l8-8h16l8 8-16 22z"/><path d="M8 18h32M18 10l6 8 6-8M24 18v22"/></svg><b>Hotel quality</b><span>650+ GSM towels, 1200 GSM robes</span></li>
    </ul>
    <div class="photo-strip">
      <img src="assets/img/catalogue/p04.jpg" alt="Face towels on stone" loading="lazy" />
      <img src="assets/img/catalogue/p05.jpg" alt="Hand towels folded by a basin" loading="lazy" />
      <img src="assets/img/catalogue/p08.jpg" alt="Bath sheet draped over a tub" loading="lazy" />
      <img src="assets/img/catalogue/p10.jpg" alt="Black bathrobe" loading="lazy" />
    </div>
  </section>

  <section class="section how" id="how-to-order" aria-labelledby="how-title">
    <header class="section__head"><span class="eyebrow">How to order</span><h2 id="how-title" class="section__title">Three steps, all on WhatsApp.</h2></header>
    <ol class="how-steps">
      <li><i>1</i><b>Add to bag</b><span>Pick towels, robes or a gift set, or build your own box.</span></li>
      <li><i>2</i><b>Send your bag on WhatsApp</b><span>Your order is written into the message for you.</span></li>
      <li><i>3</i><b>We confirm and deliver</b><span data-delivery-text></span></li>
    </ol>
    <p class="how__bulk"><b>Ordering for a wedding, a company or a hotel?</b> Custom quantities and ribbon colours. <a class="link" href="about.html#bulk">Bulk orders ›</a></p>
  </section>
</main>
```

The old Collection (`#collection`), Material (`#material`) and Journal (`#journal`) sections and every Unsplash URL are gone.

- [ ] **Step 2: Write `js/pages/home.js`**

```js
import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { giftGroup, categoryMeta } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';
import { CONFIG } from '../config.js';

initShell({ hasHero: true });

const META_TEXT = {
  'gift-sets': m => `${m.count} sets · from ${formatEGP(m.minPrice)}`,
  towels: m => `${m.count} sizes · from ${formatEGP(m.minPrice)}`,
  bathrobes: m => `1200 GSM · ${formatEGP(m.minPrice)}`,
  beach: m => `100 × 200 cm · ${formatEGP(m.minPrice)}`,
};
document.querySelectorAll('[data-category-meta]').forEach(el => {
  const id = el.dataset.categoryMeta;
  el.textContent = META_TEXT[id](categoryMeta(id));
});

const panel = document.querySelector('[data-gift-panel]');
function showGroup(id) {
  panel.innerHTML = giftGroup(id).map(renderProductCard).join('');
  document.querySelectorAll('[data-gift-tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.giftTab === id)));
}
document.querySelectorAll('[data-gift-tab]').forEach(t => t.addEventListener('click', () => showGroup(t.dataset.giftTab)));
showGroup('home');

const delivery = document.querySelector('[data-delivery-text]');
if (delivery) delivery.textContent = `We confirm the price and delivery. ${CONFIG.deliveryText}.`;
```

- [ ] **Step 3: Rewrite `css/pages/landing.css`** for the new sections, porting values from the reference mockups: `.hero__copy` (bottom inline-start, max 46%), `.cat-grid` (grid `1.25fr 1fr 1fr` × 2 rows at 520px; `--big` spans 2 rows, `--wide` spans columns 2–3; one column below 768px with 4:3 tiles), `.tabs` (small caps, ink underline on `[aria-selected="true"]`), `.card-row` (4 columns → 2 at md → horizontal scroll-snap at sm), `.band--dark` layout, `.promise-list` (4 → 2 columns), `.photo-strip`, `.how-steps`. Keep the `.chapter--story` rules; point its media background at `assets/img/catalogue/p02.jpg`. Delete rules for `.chapter--dark`, `.chapter--split`, `.chapter--editorial`, `.editorial-*` and `.spec-list` after confirming with `grep -rn` that nothing uses them.

- [ ] **Step 4: Verify** with Playwright at 1440×900 and 390×844: seven sections in order; the tiles read "8 sets · from 1,410 EGP", "4 sizes · from 50 EGP", "1200 GSM · 1,000 EGP", "100 × 200 cm · 850 EGP"; the tabs switch between two groups of four cards; "Add to bag ›" on a card updates the count; no horizontal scroll at 390px; no console errors. `grep -n -i "unsplash\|egyptian\|nile\|600" index.html` returns nothing.

- [ ] **Step 5: Commit and open PR 3**

```bash
git add index.html css/pages/landing.css js/pages/home.js
git commit -m "feat: rebuild home page around the real catalogue"
```

PR title `feat(#N): home page rebuild`; Glossary: Gift group, Category tile, Dark band. Design review by the ui/ux persona is required (UI change).

---

## PR 4 — Collection and product pages

### Task 12: Collection (`catalog.html`)

**Files:**
- Modify: `catalog.html` (replace `<main>`), `css/pages/catalog.css` (rewrite), `js/pages/collection.js`
- Delete: `js/catalog.js`

**Interfaces:**
- Consumes: `PRODUCTS`, `CATEGORIES`, `emptyFilters`, `filterProducts`, `facetCounts`, `PRICE_BANDS`, `COLOURS`, `renderProductCard`, `escapeHtml`, `initShell`.

Visual reference: `coll-01-header.html` C (sidebar), `coll-03-grid.html` B (grid with band).

- [ ] **Step 1: Replace `<main>` in `catalog.html`**

```html
<main id="main" class="collection container">
  <aside class="filters" data-filters aria-label="Filters">
    <p class="crumb"><a href="index.html">Home</a> / Collection</p>
    <h1 class="filters__title">The collection</h1>
    <button type="button" class="filters__toggle" data-filters-toggle aria-expanded="false" aria-controls="filter-groups">Filters</button>
    <div id="filter-groups" class="filters__groups" data-filter-groups></div>
  </aside>
  <section class="collection__results" aria-live="polite">
    <p class="collection__count" data-result-count></p>
    <div class="collection__grid" data-grid></div>
  </section>
</main>
```

- [ ] **Step 2: Write `js/pages/collection.js`**

```js
import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { emptyFilters, filterProducts, facetCounts, PRICE_BANDS, COLOURS } from '../lib/filters.js';
import { escapeHtml } from '../lib/escape.js';

initShell();

const state = emptyFilters();
const preset = new URLSearchParams(location.search).get('category');
if (CATEGORIES.some(c => c.id === preset)) state.categories.add(preset);

const GROUPS = [
  { facet: 'category', key: 'categories', title: 'Category', options: CATEGORIES },
  { facet: 'price', key: 'prices', title: 'Price', options: PRICE_BANDS },
  { facet: 'colour', key: 'colours', title: 'Colour', options: COLOURS },
];
const BAND = `<div class="grid-band band band--dark">
  <div class="band__copy"><span class="eyebrow">Build your own box</span><h2 class="band__title">Can't choose? Make your own.</h2>
  <p>Pick the towels, colour and ribbon. Box and ribbon are included free.</p><a class="btn btn--gold" href="build-your-box.html">Start your box</a></div>
  <img class="band__media" src="assets/img/products/hand-and-bath-sheet-set-1.jpg" alt="" /></div>`;

function render() {
  const counts = facetCounts(PRODUCTS, state);
  document.querySelector('[data-filter-groups]').innerHTML = GROUPS.map(g => `
    <fieldset class="filter-group"><legend>${g.title}</legend>
      ${g.options.map(o => {
        const n = counts[g.facet][o.id];
        const checked = state[g.key].has(o.id);
        const dead = n === 0 && !checked;
        return `<label class="filter-option${dead ? ' is-empty' : ''}">
          <input type="checkbox" data-facet="${g.key}" value="${escapeHtml(o.id)}" ${checked ? 'checked' : ''} ${dead ? 'disabled' : ''} />
          ${escapeHtml(o.label)} <span>(${n})</span></label>`;
      }).join('')}
    </fieldset>`).join('');

  const results = filterProducts(PRODUCTS, state);
  const cards = results.map(renderProductCard);
  if (results.length >= 4) cards.splice(3, 0, BAND);
  document.querySelector('[data-grid]').innerHTML = cards.join('');
  document.querySelector('[data-result-count]').textContent = `${results.length} ${results.length === 1 ? 'product' : 'products'}`;
}

document.addEventListener('change', e => {
  const box = e.target.closest('[data-facet]');
  if (!box) return;
  const set = state[box.dataset.facet];
  if (box.checked) set.add(box.value); else set.delete(box.value);
  render();
});

const toggle = document.querySelector('[data-filters-toggle]');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  document.querySelector('[data-filters]').classList.toggle('is-open', open);
});

render();
```

- [ ] **Step 3: Rewrite `css/pages/catalog.css`**: `.collection` grid `200px 1fr` with gap `--space-7`; `.filter-group` with a hairline top border and a small-caps legend; `.filter-option.is-empty` in `--color-ink-faint`; `.collection__grid` 3 columns (2 below 1024px); `.grid-band` spans all columns, ~200px tall; below 768px the sidebar collapses behind `.filters__toggle` (`.filters__groups` hidden unless `.filters.is-open`). Then delete `js/catalog.js`.

- [ ] **Step 4: Verify** with Playwright: `catalog.html` shows 16 cards with the band after the third; `catalog.html?category=gift-sets` pre-ticks Gift sets and shows 8; with Bathrobes ticked, "Under 500 EGP" is disabled with (0); with only Beach ticked (2 results) the band is hidden; mobile shows the Filters button. No console errors.

- [ ] **Step 5: Commit**

```bash
git add catalog.html css/pages/catalog.css js/pages/collection.js
git rm js/catalog.js
git commit -m "feat: rebuild collection with sidebar filters and box band"
```

### Task 13: Product page (`product.html`)

**Files:**
- Modify: `product.html` (replace `<main>`), `css/pages/product.css` (rewrite), `js/pages/product.js`

**Interfaces:**
- Consumes: `findProduct`, `PRODUCTS`, `CATEGORIES`, `formatEGP`, `escapeHtml`, `buildOrderMessage`, `orderLink`, `readRecent`, `pushRecent`, `renderProductCard`, `BOX_SIZES`, `CONFIG`, `initShell`.

Visual reference: `prod-01-top.html` A, `prod-02-details.html` A, `prod-03-related.html` C.

- [ ] **Step 1: Replace `<main>` in `product.html`** with `<main id="main" class="product container" data-product-root></main>`.

- [ ] **Step 2: Write `js/pages/product.js`**

```js
import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { findProduct } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';
import { escapeHtml } from '../lib/escape.js';
import { buildOrderMessage, orderLink } from '../lib/whatsapp.js';
import { readRecent, pushRecent } from '../lib/recent.js';
import { BOX_SIZES } from '../lib/box.js';
import { CONFIG } from '../config.js';

initShell();
const root = document.querySelector('[data-product-root]');
const p = findProduct(new URLSearchParams(location.search).get('slug'));
let storage = null;
try { storage = window.localStorage; } catch { storage = null; }

if (!p) {
  document.title = 'Product not found — Czera';
  root.innerHTML = `<div class="product__missing"><h1>We couldn't find that product.</h1>
    <p>It may have moved. Everything we make is in the collection.</p><a class="btn btn--ink" href="catalog.html">See the collection</a></div>`;
} else {
  document.title = `${p.name} — Czera`;
  const recent = readRecent(storage).filter(s => s !== p.slug).map(findProduct).filter(Boolean).slice(0, 2);
  pushRecent(storage, p.slug);
  const side = recent.length ? recent : PRODUCTS.filter(x => x.category === 'gift-sets' && x.slug !== p.slug).slice(0, 2);
  const sideTitle = recent.length ? 'Recently viewed' : 'Gift sets';
  const category = CATEGORIES.find(c => c.id === p.category).label;
  const boxSize = BOX_SIZES.find(s => s.slug === p.slug) || (p.category === 'beach' ? BOX_SIZES.find(s => s.id === 'beach') : null);
  const boxHref = p.boxable && boxSize ? `build-your-box.html?add=${boxSize.id}` : 'build-your-box.html';
  const contents = p.contents ? `<div class="pdp__incl"><h2>In the box</h2><ul>${p.contents.map(c =>
    `<li>${c.qty} × ${escapeHtml(c.label)} <span>${escapeHtml(c.spec)}</span></li>`).join('')}</ul></div>` : '';

  root.innerHTML = `
    <div class="pdp">
      <div class="pdp__photos">${p.images.map((src, i) =>
        `<img src="${escapeHtml(src)}" alt="${i === 0 ? escapeHtml(p.name) : ''}" ${i ? 'loading="lazy"' : ''} />`).join('')}</div>
      <div class="pdp__panel">
        <p class="crumb"><a href="catalog.html?category=${p.category}">${escapeHtml(category)}</a></p>
        <h1 class="pdp__name">${escapeHtml(p.name)}</h1>
        <p class="pdp__price">${formatEGP(p.price)}</p>
        <p class="pdp__lede">${escapeHtml(p.description)}</p>
        ${contents}
        <div class="pdp__buy">
          <div class="qty"><button type="button" data-step="-1" aria-label="One less">−</button><span data-qty-value>1</span><button type="button" data-step="1" aria-label="One more">+</button></div>
          <button type="button" class="btn btn--ink" data-add-to-bag="${p.slug}" data-qty="1">Add to bag · <span data-buy-total>${formatEGP(p.price)}</span></button>
        </div>
        <a class="link pdp__wa" data-order-one href="#" target="_blank" rel="noopener">Or order just this on WhatsApp ›</a>
        <p class="pdp__ship">${escapeHtml(CONFIG.deliveryText)} · ${escapeHtml(CONFIG.paymentText)}</p>
        <details class="acc" open><summary>Description</summary><p>${escapeHtml(p.description)}</p></details>
        <details class="acc" open><summary>Features</summary><ul>${p.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul></details>
        <details class="acc"><summary>Sizes &amp; care</summary><p>${escapeHtml(p.spec)}. ${escapeHtml(CONFIG.careText)}.</p></details>
        <details class="acc"><summary>Delivery &amp; payment</summary><p>${escapeHtml(CONFIG.deliveryText)}. ${escapeHtml(CONFIG.paymentText)}.</p></details>
      </div>
    </div>
    <section class="pdp-related">
      <a class="band band--dark pdp-related__box" href="${boxHref}">
        <span class="band__copy"><span class="eyebrow">Build your own box</span>
          <span class="band__title">${p.boxable ? 'Add this to a box of your own.' : 'Make a gift box of your own.'}</span>
          <span class="btn btn--gold">${p.boxable ? 'Start with this item' : 'Start your box'}</span></span>
      </a>
      <div class="pdp-related__side"><h2>${sideTitle}</h2><div class="card-row card-row--2">${side.map(renderProductCard).join('')}</div></div>
    </section>`;

  let qty = 1;
  const addBtn = root.querySelector('.pdp__buy [data-add-to-bag]');
  const sync = () => {
    root.querySelector('[data-qty-value]').textContent = String(qty);
    root.querySelector('[data-buy-total]').textContent = formatEGP(p.price * qty);
    addBtn.dataset.qty = String(qty);
    root.querySelector('[data-order-one]').href = orderLink(buildOrderMessage([{ type: 'product', slug: p.slug, qty }]));
  };
  root.addEventListener('click', e => {
    const step = e.target.closest('[data-step]');
    if (step) { qty = Math.min(20, Math.max(1, qty + Number(step.dataset.step))); sync(); }
  });
  sync();
}
```

- [ ] **Step 3: Rewrite `css/pages/product.css`**: `.pdp` grid `1.25fr 1fr` with gap `--space-8`; `.pdp__photos` first image full width at 4:3, the rest in 2 columns at 4:5; `.pdp__panel { position: sticky; top: calc(var(--header-h, 72px) + var(--space-5)); align-self: start; }`; `.acc` with hairline borders and a small-caps `summary` showing +/− via `::after`; `.pdp-related` grid `1.1fr 1fr`; below 900px everything stacks, the photos become a horizontal scroll-snap row, and the panel is not sticky.

- [ ] **Step 4: Verify** with Playwright: `product.html?slug=complete-czera-set` shows three photos, 1,450 EGP, "In the box" with 4 rows, Description and Features open; + makes the button read "Add to bag · 2,900 EGP" and the WhatsApp link's decoded text ends "Total: 2,900 EGP"; Add puts 2 in the bag. `product.html?slug=bath-sheet` links its band to `build-your-box.html?add=sheet`. `product.html?slug=nope` and plain `product.html` show the not-found message with a link. Visit two products, then a third: "Recently viewed" lists the previous two. No console errors.

- [ ] **Step 5: Commit and open PR 4**

```bash
git add product.html css/pages/product.css js/pages/product.js
git commit -m "feat: rebuild product page from data with sticky panel and related band"
```

PR title `feat(#N): collection and product pages`; Glossary: Facet, Sticky panel, Recently viewed. Design review required.

---

## PR 5 — Build Your Own Box and About

### Task 14: Build Your Own Box page

**Files:**
- Create: `build-your-box.html`, `css/pages/build-box.css`, `js/pages/build-box.js`

**Interfaces:**
- Consumes: `emptyBox`, `BOX_SIZES`, `BOX_COLOURS`, `RIBBONS`, `TOWEL_COLOURS`, `STRIPED`, `boxPrice`, `pieceCount`, `validateBox`, `sizeAllowed`, `findProduct`, `formatEGP`, `initShell`, `showToast`.

Visual reference: `box-01.html` A.

- [ ] **Step 1: Create `build-your-box.html`** with the same `<head>` as `catalog.html` (fonts, `tokens.css`, `base.css`, `components.css`) plus `css/pages/build-box.css`, title `Build your own box — Czera`, and this body:

```html
<body>
  <noscript><p class="noscript">Turn on JavaScript to build a box and order on WhatsApp.</p></noscript>
  <a href="#main" class="skip-link">Skip to content</a>
  <div data-shell-header></div>
  <main id="main" class="box-page container">
    <div class="box-steps">
      <span class="eyebrow">Build your own box</span>
      <h1 class="box-page__title">A gift set that's yours alone.</h1>
      <fieldset class="box-step"><legend><i>1</i> Choose your box</legend><div class="box-options" data-options="box"></div></fieldset>
      <fieldset class="box-step"><legend><i>2</i> Choose your towels</legend><div class="box-options" data-options="items"></div></fieldset>
      <fieldset class="box-step"><legend><i>3</i> Choose a colour</legend><div class="box-options" data-options="colour"></div></fieldset>
      <fieldset class="box-step"><legend><i>4</i> Choose a ribbon</legend><div class="box-options" data-options="ribbon"></div></fieldset>
    </div>
    <aside class="box-preview" aria-live="polite">
      <img src="assets/img/products/complete-czera-set-2.jpg" alt="A black Czera gift box with towels tied in ribbon" class="box-preview__img" />
      <div class="box-preview__body">
        <h2>Your box</h2><ul data-summary></ul>
        <p class="box-preview__total"><span data-piece-count></span><b data-total></b></p>
        <p class="box-preview__free">Box and ribbon included free</p>
        <p class="box-preview__reason" data-reason></p>
        <button type="button" class="btn btn--ink btn--block" data-add-box>Add box to bag</button>
      </div>
    </aside>
  </main>
  <div data-shell-footer></div>
  <script type="module" src="js/pages/build-box.js"></script>
</body>
```

- [ ] **Step 2: Write `js/pages/build-box.js`**

```js
import { initShell, showToast } from '../ui/shell.js';
import { emptyBox, BOX_SIZES, BOX_COLOURS, RIBBONS, TOWEL_COLOURS, STRIPED, boxPrice, pieceCount, validateBox, sizeAllowed } from '../lib/box.js';
import { findProduct } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';

const { bag } = initShell();
const sel = emptyBox();
const preset = new URLSearchParams(location.search).get('add');
if (BOX_SIZES.some(s => s.id === preset)) sel.items[preset] = 1;

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const choice = (group, value, label) =>
  `<button type="button" class="box-option" data-group="${group}" data-value="${value}" aria-pressed="${sel[group] === value}">
     <span class="swatch swatch--${value}" aria-hidden="true"></span>${label}</button>`;

function render() {
  document.querySelector('[data-options="box"]').innerHTML = BOX_COLOURS.map(v => choice('box', v, cap(v))).join('');
  document.querySelector('[data-options="ribbon"]').innerHTML = RIBBONS.map(v => choice('ribbon', v, cap(v))).join('');
  document.querySelector('[data-options="colour"]').innerHTML = TOWEL_COLOURS.map(v =>
    choice('colour', v, STRIPED.includes(v) ? `${cap(v)} stripe` : cap(v))).join('');
  document.querySelector('[data-options="items"]').innerHTML = BOX_SIZES.map(s => {
    const allowed = sizeAllowed(sel, s.id);
    const q = sel.items[s.id];
    return `<div class="box-size${allowed ? '' : ' is-disabled'}"><span class="box-size__label">${s.label} ${s.spec.replace(' cm', '')}</span>
      <small>${formatEGP(findProduct(s.slug).price)}</small>
      <span class="qty"><button type="button" data-size="${s.id}" data-delta="-1" aria-label="One less ${s.label}" ${q === 0 ? 'disabled' : ''}>−</button>
      <span>${q}</span><button type="button" data-size="${s.id}" data-delta="1" aria-label="One more ${s.label}" ${allowed ? '' : 'disabled'}>+</button></span></div>`;
  }).join('');

  const chosen = BOX_SIZES.filter(s => sel.items[s.id] > 0);
  document.querySelector('[data-summary]').innerHTML =
    `<li>${cap(sel.box)} box · ${sel.ribbon} ribbon <span>free</span></li>` +
    chosen.map(s => `<li>${sel.items[s.id]} × ${s.label} ${s.spec}, ${sel.colour} <span>${formatEGP(sel.items[s.id] * findProduct(s.slug).price)}</span></li>`).join('');
  const n = pieceCount(sel);
  document.querySelector('[data-piece-count]').textContent = `Total · ${n} ${n === 1 ? 'piece' : 'pieces'}`;
  document.querySelector('[data-total]').textContent = formatEGP(boxPrice(sel));
  const { ok, reason } = validateBox(sel);
  document.querySelector('[data-reason]').textContent = ok ? '' : reason;
  document.querySelector('[data-add-box]').disabled = !ok;
}

document.addEventListener('click', e => {
  const opt = e.target.closest('[data-group]');
  if (opt) {
    sel[opt.dataset.group] = opt.dataset.value;
    if (STRIPED.includes(sel.colour)) BOX_SIZES.forEach(s => { if (s.id !== 'beach') sel.items[s.id] = 0; });
    render();
    return;
  }
  const step = e.target.closest('[data-size]');
  if (step) {
    const id = step.dataset.size;
    sel.items[id] = Math.max(0, sel.items[id] + Number(step.dataset.delta));
    render();
    return;
  }
  if (e.target.closest('[data-add-box]') && validateBox(sel).ok) {
    bag.add({ type: 'box', box: structuredClone(sel), qty: 1 });
    showToast('Your custom box was added to your bag');
  }
});

render();
```

- [ ] **Step 3: Write `css/pages/build-box.css`**: `.box-page` grid `1.25fr 1fr` with gap `--space-7`; `.box-step legend i` ink circle with ivory number; `.box-option` bordered tile, `[aria-pressed="true"]` gets an inset ink outline; swatches `.swatch--black/beige/white/blue/yellow/burgundy/gold` (blue and yellow as striped gradients); `.box-size.is-disabled` in faint ink; `.box-preview` sticky like `.pdp__panel`; below 900px `.box-preview__body` becomes a fixed bottom bar showing only `[data-piece-count]`, `[data-total]` and the button (the one allowed sticky bar, `design.md` §6.13), the preview image hides, and `.box-page` gets `padding-block-end` equal to the bar height.

- [ ] **Step 4: Verify** with Playwright: initial state disables "Add box to bag" and reads "Choose at least 2 pieces."; 2 Face + 1 Hand + 1 Bath + 1 Bath sheet shows 1,450 EGP and enables the button; a 7th piece shows "A box holds up to 6 pieces."; choosing Blue stripe empties non-beach sizes and disables their + buttons; `build-your-box.html?add=sheet` starts with 1 Bath sheet; adding the box puts a "Custom box" line in the bag whose WhatsApp text matches `boxLabel`. At 390px the bottom bar shows. No console errors.

- [ ] **Step 5: Commit**

```bash
git add build-your-box.html css/pages/build-box.css js/pages/build-box.js
git commit -m "feat: add Build Your Own Box page"
```

### Task 15: About page

**Files:**
- Create: `about.html`, `css/pages/about.css`, `js/pages/about.js`

**Interfaces:**
- Consumes: `initShell`, `CONFIG`, `orderLink`.

Visual reference: `about-01.html` A.

- [ ] **Step 1: Create `about.html`** (same `<head>` pattern with `css/pages/about.css`, title `About — Czera`; body has the noscript line, skip link, `<div data-shell-header></div>`, then `<main>` below, then `<div data-shell-footer></div>` and `<script type="module" src="js/pages/about.js"></script>`):

```html
<main id="main">
  <section class="about-hero"><img src="assets/img/catalogue/p01.jpg" alt="Folded white towels by a stone bath overlooking the sea" />
    <div class="about-hero__copy"><span class="eyebrow">About Czera</span><h1>Every detail feels like home.</h1></div></section>
  <section class="about-chapter"><img src="assets/img/catalogue/p02.jpg" alt="White towels stacked beside a stone bath" loading="lazy" />
    <div><span class="eyebrow">Our belief</span><h2>Everyday moments deserve extraordinary comfort.</h2>
      <p>Inspired by the world's finest hotels, our towels, robes and gift sets bring the same calm into your home.</p></div></section>
  <section class="about-chapter about-chapter--flip" id="sizes"><img src="assets/img/products/his-and-hers-robes-1.jpg" alt="White and black Czera bathrobes tied with gold ribbon" loading="lazy" />
    <div><span class="eyebrow">The details</span><h2>It's all in how it feels.</h2>
      <p>100% cotton throughout. Towels at 650+ GSM, robes at 1200 GSM that fit up to 130 kg, presented in the black Czera gift box with satin ribbon.</p>
      <p class="about-care" data-care></p></div></section>
  <section class="band band--dark about-bulk" id="bulk"><div class="band__copy"><span class="eyebrow">Bulk &amp; corporate orders</span>
      <h2 class="band__title">For weddings, companies and hotels.</h2><p>Custom quantities and ribbon colours, quoted on WhatsApp.</p></div>
    <a class="btn btn--gold" data-bulk-link href="#" target="_blank" rel="noopener">Ask on WhatsApp</a></section>
  <section class="about-contact" id="delivery">
    <div><h3>WhatsApp</h3><p data-wa-display></p></div>
    <div><h3>Instagram</h3><p><a data-ig href="#" rel="noopener"></a></p></div>
    <div><h3>Delivery</h3><p data-delivery></p></div>
  </section>
</main>
```

- [ ] **Step 2: Write `js/pages/about.js`**

```js
import { initShell } from '../ui/shell.js';
import { CONFIG } from '../config.js';
import { orderLink } from '../lib/whatsapp.js';

initShell();
document.querySelector('[data-care]').textContent = `Care: ${CONFIG.careText}.`;
document.querySelector('[data-wa-display]').textContent = CONFIG.whatsappDisplay;
const ig = document.querySelector('[data-ig]');
ig.href = `https://www.instagram.com/${CONFIG.instagram}`;
ig.textContent = `@${CONFIG.instagram}`;
document.querySelector('[data-delivery]').textContent = `${CONFIG.deliveryText}. ${CONFIG.paymentText}.`;
document.querySelector('[data-bulk-link]').href = orderLink("Hello Czera, I'd like to ask about a bulk or corporate order.");
```

- [ ] **Step 3: Write `css/pages/about.css`** porting `about-01.html` option A (`.hero`, `.chap`, `.bulk`, `.contact`): hero 260px rising to max 55vh; chapters two columns, `--flip` swaps sides with `grid-template-areas` (no `direction` hacks); contact three columns → one below 768px.

- [ ] **Step 4: Verify** with Playwright at both sizes: hero, two chapters, the dark bulk band whose button opens a wa.me link with the bulk message, and the contact strip with `+20 100 000 0000`, `@czera_maison` and the delivery text; the footer links "Sizes & care" and "Delivery" land on `#sizes` and `#delivery`. No console errors. `grep -n -i "by hand\|egyptian" about.html` returns nothing.

- [ ] **Step 5: Commit**

```bash
git add about.html css/pages/about.css js/pages/about.js
git commit -m "feat: add About page with bulk orders and contact"
```

### Task 16: Final sweep and PR 5

**Files:**
- Modify: any file the sweep flags; `.company/status.yaml`

- [ ] **Step 1: Claim and leftover sweep**

Run: `grep -rn -i "egyptian\|nile delta\|600.800\|by hand\|unsplash\|indulge\|journal\|bestseller" --include=*.html --include=*.js --include=*.css .`
Expected: no matches outside `docs/`, `graphics/` and `tests/`.

- [ ] **Step 2: Full test run and page sweep**

Run: `npm test` → PASS. Then with Playwright at 1440×900 and 390×844 visit `index.html`, `catalog.html`, `catalog.html?category=beach`, `product.html?slug=his-and-hers-robes`, `build-your-box.html`, `about.html`. Expected on each: no console errors; no horizontal scroll at 390px; `document.querySelectorAll('img:not([alt])').length === 0`; Tab reaches the bag button and every "Add to bag ›" with a visible focus ring.

- [ ] **Step 3: End-to-end order.** In a fresh browser profile add The Complete Czera Set from Home, a Black Bathrobe from the Collection, and a custom box (2 Face + 1 Bath, white, black box, burgundy) from Build Your Own Box; open the bag, Continue, fill the details, Send. Expected decoded message: exactly the spec §7 format with total 3,020 EGP.

- [ ] **Step 4: Update the status report**: `progress: 90`, `progress_note: "All pages built; awaiting review and the client's real WhatsApp number, delivery and payment details"`, `updated:` today. Run `python "C:/dev/Company/.claude/skills/project-status/status.py" check` → `ok`.

- [ ] **Step 5: Commit and open PR 5**

```bash
git add .company/status.yaml
git commit -m "chore: update status after showroom build"
```

PR title `feat(#N): Build Your Own Box and About pages`; Glossary: Box selection, Striped colour, Bulk order. Design review required. After merge, the QA-engineer persona verifies every issue's acceptance criteria (`workflow-gates.md` QA state).
