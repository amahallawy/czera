# Build your box (WordPress) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the czeramaison.com Build your box page: a composite "Build your CZERA box" product (up to 6 towels, up to 2 bathrobes, at least 2 items, price = sum of items) that reaches the bag as one product with its contents listed.

**Architecture:** WPC Composite Products (free) provides the box product, the item picker and the one-line cart display. A Code Snippets snippet adds the server-side rule check the plugin lacks. Page 74 holds a Spectra intro plus the embedded product form, restyled with Additional CSS. Checks run from a small Python script in this repo against the live site.

**Tech Stack:** WordPress 7.1, WooCommerce 11.2, Astra Pro, Spectra Blocks, WPC Composite Products 8.0.4+, Code Snippets, Python 3 (standard library) for checks.

**Spec:** `docs/superpowers/specs/2026-10-16-wp-build-your-box-design.md` · Decision: `docs/agdr/AgDR-0005-wp-box-builder-plugin.md`

## Global Constraints

- Rules: towels ≤ **6**, bathrobes ≤ **2**, total ≥ **2**, price = sum of items, no box fee, no box/size/ribbon choice, colours mix freely.
- Towel products: 57, 60, 63, 66, 69, 72. Bathrobe products: 51, 54.
- Brand name in visible text is always **CZERA** (capitals).
- Copy rules (`design.md`): plain facts, full stops, no exclamation marks, no "discover / elevate / indulge".
- Headings weight 300; Italiana only for product names; small gold text #8a5c12 on ivory; contrast ≥ 4.5:1.
- All site edits go through the live site's own tools: REST API with the Application Password, the block editor and Customizer in the logged-in Chrome. Never hand-write block HTML; build blocks with `wp.blocks.createBlock` in the editor.
- Additional CSS for this feature lives between `/* ---------- Build your box page` and `/* ---------- end build your box page */`, class prefix `czera-box-`.
- The site is behind Spectra's coming-soon mode: logged-out visitors are redirected client-side, but server requests (add-to-cart, Store API) still work. LiteSpeed caches pages, so add `?nocache=N` when viewing.

## Review Focus

- **Box added twice** (customer adds a second box): each box is checked on its own; two valid boxes are allowed. Test in Task 3.
- **Zero-quantity items in the request** (`63/0/...`): ignored, not counted, not rejected. Test in Task 3.
- **Foreign product slipped into the box** (e.g. a gift set id): rejected with "This box can only hold CZERA towels and bathrobes." Test in Task 3.
- **Box opened on a phone**: total panel reachable as a bottom bar, nothing hidden under it. Check in Task 5.
- **Item out of stock later**: the plugin's own stock check rejects it; our snippet must not mask that message (it returns early when `$passed` is already false). Checked by code review in Task 3.

---

### Task 1: Install the plugins and set cart display

**Files:**
- Create: `tools/wp/box_checks.py` (shared check script, extended in later tasks)

**Interfaces:**
- Produces: `box_checks.py` with `api(path, method='GET', body=None)` (Basic-auth REST helper reading `WP_AUTH` from the environment), `SITE`, `AUTH`, and `check_plugins()`.

- [ ] **Step 1: Write the failing check**

```python
# tools/wp/box_checks.py
"""Live checks for the czeramaison.com Build your box page.
Usage: WP_AUTH='user:app password' CZERA_BOX_ID=<id> python tools/wp/box_checks.py <check>"""
import base64, json, os, sys, urllib.request, urllib.error

SITE = 'https://czeramaison.com'
AUTH = 'Basic ' + base64.b64encode(os.environ['WP_AUTH'].encode()).decode()

def api(path, method='GET', body=None):
    req = urllib.request.Request(SITE + '/wp-json' + path, method=method,
        headers={'Authorization': AUTH, 'Content-Type': 'application/json'},
        data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {'error': e.code, 'body': e.read().decode()[:300]}

def check_plugins():
    active = {p['plugin'].split('/')[0] for p in api('/wp/v2/plugins') if p['status'] == 'active'}
    missing = {'wpc-composite-products', 'code-snippets'} - active
    assert not missing, f'not active: {missing}'
    print('plugins OK')

CHECKS = {'plugins': check_plugins}

if __name__ == '__main__':
    CHECKS[sys.argv[1]]()
```

- [ ] **Step 2: Run it to verify it fails**

Run: `WP_AUTH='...' python tools/wp/box_checks.py plugins`
Expected: `AssertionError: not active: {'wpc-composite-products', 'code-snippets'}`

- [ ] **Step 3: Install and activate both plugins**

```bash
for slug in wpc-composite-products code-snippets; do
  curl -s -u "$WP_AUTH" -X POST https://czeramaison.com/wp-json/wp/v2/plugins \
    -H 'Content-Type: application/json' -d "{\"slug\":\"$slug\",\"status\":\"active\"}" \
    | python -c "import sys,json;d=json.load(sys.stdin);print(d.get('plugin'),d.get('status'),d.get('code',''))"
done
```

- [ ] **Step 4: Set the plugin's cart display** (wp-admin → WPC → Composite Products, in Chrome)
  - "Hide composite products on cart & checkout" → **Yes, but list component sub-product names under the main composite in separate lines**
  - Hide on mini cart → **Yes**; hide on order details → **Yes**; cart contents count → **composite only**
  - Save, reload the page and confirm each value stuck.

- [ ] **Step 5: Run the check to verify it passes**

Run: `WP_AUTH='...' python tools/wp/box_checks.py plugins` → `plugins OK`

- [ ] **Step 6: Commit**

```bash
git add tools/wp/box_checks.py
git commit -m "chore: add live checks script for the WordPress box builder"
```

---

### Task 2: Create the box product

**Interfaces:**
- Consumes: `api()` from Task 1.
- Produces: the box product ID (passed as env `CZERA_BOX_ID`), constants `TOWELS`, `ROBES`, `BOX_ID`, helper `component_keys()` and `check_product()`.

- [ ] **Step 1: Write the failing check** (append above `CHECKS`)

```python
TOWELS = [57, 60, 63, 66, 69, 72]
ROBES = [51, 54]
BOX_ID = int(os.environ.get('CZERA_BOX_ID', '0'))

def box_meta():
    p = api(f'/wc/v3/products/{BOX_ID}?context=edit')
    return p, {m['key']: m['value'] for m in p['meta_data']}

def component_keys():
    """Return {'Towels': key, 'Bathrobes': key} from the box's wooco_components meta."""
    _, meta = box_meta()
    comps = meta['wooco_components']
    items = comps.items() if isinstance(comps, dict) else enumerate(comps)
    return {c.get('name'): str(k) for k, c in items}

def check_product():
    assert BOX_ID, 'set CZERA_BOX_ID'
    p, meta = box_meta()
    assert p['type'] == 'composite', p['type']
    assert p['catalog_visibility'] == 'hidden', p['catalog_visibility']
    assert p['name'] == 'Build your CZERA box', p['name']
    assert meta.get('wooco_pricing') == 'exclude', meta.get('wooco_pricing')
    assert str(meta.get('wooco_qty_min')) == '2' and str(meta.get('wooco_qty_max')) == '8'
    assert sorted(component_keys()) == ['Bathrobes', 'Towels'], component_keys()
    print('product OK', BOX_ID)
```

Add `'product': check_product` to `CHECKS`.

- [ ] **Step 2: Run it to verify it fails**

Run: `CZERA_BOX_ID=0 WP_AUTH='...' python tools/wp/box_checks.py product`
Expected: `AssertionError: set CZERA_BOX_ID`

- [ ] **Step 3: Create the product in wp-admin** (Products → Add New, in Chrome)
  - Name **Build your CZERA box**; Product type **Composite product**.
  - Short description: `Choose up to six towels and two bathrobes. We pack them together in one CZERA box.`
  - Composite tab: Pricing **Exclude base price**; Quantity min **2**, max **8**.
  - Component 1: name **Towels**, source **Products**, products 57, 60, 63, 66, 69, 72; Multiple selection **Yes**; Custom quantity **Yes**; each item min 0 / max 6; whole component limit min 0 / max 6; Optional **Yes**.
  - Component 2: name **Bathrobes**, products 51, 54; same switches; each item min 0 / max 2; whole component min 0 / max 2; Optional **Yes**.
  - Catalog visibility **Hidden**. Image: media 34 (ribbon-tied towels). Publish and note the new product ID.

- [ ] **Step 4: Run the check to verify it passes**

Run: `CZERA_BOX_ID=<id> WP_AUTH='...' python tools/wp/box_checks.py product` → `product OK <id>`
If a stored value differs (for example the pricing key's exact value), read it back and fix the setting in the editor; only adjust the check if the plugin stores the same meaning under a different value, and note it in the commit.

- [ ] **Step 5: Commit**

```bash
git add tools/wp/box_checks.py
git commit -m "chore: check the WordPress box product settings"
```

---

### Task 3: Server-side rule check

**Interfaces:**
- Consumes: `BOX_ID`, `TOWELS`, `ROBES`, `component_keys()`, `SITE`.
- Produces: an active Code Snippets snippet "CZERA box rules" and `check_rules()`.

- [ ] **Step 1: Write the failing check** (append above `CHECKS`)

```python
import http.cookiejar, urllib.parse

def add_box(ids, times=1):
    """Add the box `times` times in one session with a crafted wooco_ids string.
    Returns the number of box lines in that session's cart."""
    jar = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    for _ in range(times):
        data = urllib.parse.urlencode({'add-to-cart': BOX_ID, 'quantity': 1, 'wooco_ids': ids}).encode()
        op.open(f'{SITE}/?p={BOX_ID}', data).read()
    cart = json.loads(op.open(f'{SITE}/wp-json/wc/store/v1/cart').read())
    return sum(1 for i in cart['items'] if i['id'] == BOX_ID)

def check_rules():
    k = component_keys()
    t, r = k['Towels'], k['Bathrobes']
    cases = [
        (f'63/2/{t},54/1/{r}', 1, 1),            # 2 bath towels + black robe -> added
        (f'63/7/{t}', 1, 0),                      # 7 towels -> rejected
        (f'51/3/{r}', 1, 0),                      # 3 robes -> rejected
        (f'57/1/{t}', 1, 0),                      # 1 item -> rejected
        (f'63/2/{t},25/1/{t}', 1, 0),             # foreign product (gift set) -> rejected
        (f'63/2/{t},60/0/{t}', 1, 1),             # zero quantity ignored -> added
        (f'63/2/{t}', 2, 2),                      # two valid boxes -> both added
    ]
    for ids, times, expected in cases:
        got = add_box(ids, times)
        assert got == expected, f'{ids} x{times}: expected {expected} box line(s), got {got}'
    print('rules OK')
```

Add `'rules': check_rules` to `CHECKS`.

- [ ] **Step 2: Run it to verify it fails**

Run: `CZERA_BOX_ID=<id> WP_AUTH='...' python tools/wp/box_checks.py rules`
Expected: FAIL on `63/7/...` ("expected 0 box line(s), got 1"), because only the browser enforces the limits.

- [ ] **Step 3: Add the snippet** (Code Snippets → Add New, title "CZERA box rules", run everywhere, activate)

```php
/**
 * CZERA box rules: enforce the Build your box limits on the server.
 * The WPC Composite plugin checks them only in the browser (AgDR-0005).
 */
add_filter( 'woocommerce_add_to_cart_validation', function ( $passed, $product_id ) {
	$box_id = 0; // replace with the box product ID from Task 2
	if ( ! $passed || (int) $product_id !== $box_id ) {
		return $passed;
	}
	$towels = [ 57, 60, 63, 66, 69, 72 ];
	$robes  = [ 51, 54 ];
	$ids    = isset( $_REQUEST['wooco_ids'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['wooco_ids'] ) ) : '';
	$t = 0;
	$r = 0;
	foreach ( array_filter( explode( ',', $ids ) ) as $item ) {
		$parts = explode( '/', $item );
		$id    = absint( $parts[0] ?? 0 );
		$qty   = (float) ( $parts[1] ?? 1 );
		if ( $qty <= 0 ) {
			continue;
		}
		if ( in_array( $id, $towels, true ) ) {
			$t += $qty;
		} elseif ( in_array( $id, $robes, true ) ) {
			$r += $qty;
		} else {
			wc_add_notice( 'This box can only hold CZERA towels and bathrobes.', 'error' );
			return false;
		}
	}
	if ( $t > 6 ) {
		wc_add_notice( 'Up to 6 towels per box.', 'error' );
		return false;
	}
	if ( $r > 2 ) {
		wc_add_notice( 'Up to 2 bathrobes per box.', 'error' );
		return false;
	}
	if ( $t + $r < 2 ) {
		wc_add_notice( 'Add at least 2 items to your box.', 'error' );
		return false;
	}
	return $passed;
}, 20, 2 );
```

Priority 20 runs after the plugin's own check (priority 9). The plugin reads `wooco_ids` from the request in validation and only removes it later, when building the cart item, so the value is still present here.

- [ ] **Step 4: Run the check to verify it passes**

Run: `CZERA_BOX_ID=<id> WP_AUTH='...' python tools/wp/box_checks.py rules` → `rules OK`

- [ ] **Step 5: Commit**

```bash
git add tools/wp/box_checks.py
git commit -m "chore: check the server-side box rules"
```

---

### Task 4: The page and its look

**Interfaces:**
- Consumes: `BOX_ID`, `SITE`, `AUTH`.
- Produces: page 74 content, the Additional CSS block, and `check_page()`.

- [ ] **Step 1: Write the failing check** (append above `CHECKS`)

```python
def check_page():
    req = urllib.request.Request(f'{SITE}/build-your-box/?nocache=1', headers={'Authorization': AUTH})
    html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')
    assert 'czera-box-intro' in html, 'intro missing'
    assert 'wooco' in html, 'builder form missing'
    assert 'Choose up to six towels and two bathrobes' in html, 'intro line missing'
    print('page OK')
```

Add `'page': check_page` to `CHECKS`.

- [ ] **Step 2: Run it to verify it fails** → `AssertionError: intro missing`

- [ ] **Step 3: Build the page in the block editor** (page 74, in Chrome, `wp.blocks.createBlock` only)
  - Spectra container `czera-box-intro` (`variationSelected: true`): eyebrow "Build your own box" (`czera-eyebrow`), h1 "A gift set that's yours alone." (`czera-section-title`), paragraph "Choose up to six towels and two bathrobes. We pack them together in one CZERA box."
  - Below it a `core/shortcode` block: `[product_page id="<BOX_ID>"]`.
  - Page meta (as on Home): sidebar none, title disabled, full-width container, unboxed.
  - Save; reload the editor and confirm 0 invalid blocks.

- [ ] **Step 4: Style it** (Customizer → Additional CSS, between the markers)
  - Item cards: photo 4:5, name in Italiana with the "Czera Name Digits" font first, size/colour line 12px #6b6b6b, price 13px #010100, − / + controls at least 44px.
  - Total panel: sticky beside the items on desktop (`top: 104px`); under 900px a fixed bottom bar with matching body padding so nothing sits behind it.
  - Add button: gold #d4af36 on ink, 13px, 16px × 48px padding, label "Add box to bag" via CSS (the button keeps its accessible name).
  - Hide the plugin's own product title and price block on this page (the intro carries the heading).
  - Editor: rely on the existing `display: contents` editor rule; check the editor shows the same layout.

- [ ] **Step 5: Run the check to verify it passes** → `page OK`; then view the page logged in at 1440 px and compare with the static `build-your-box.html`.

- [ ] **Step 6: Commit**

```bash
git add tools/wp/box_checks.py
git commit -m "chore: check the Build your box page"
```

---

### Task 5: End-to-end checks and handover

- [ ] **Step 1: Run every check**

Run: `for c in plugins product rules page; do CZERA_BOX_ID=<id> WP_AUTH='...' python tools/wp/box_checks.py $c || break; done` → all OK.

- [ ] **Step 2: Browser checks (logged in, Chrome)**, spec §5:
  - 1 item → add button disabled, reason shown.
  - 7th towel → blocked, "Up to 6 towels per box."
  - 3rd robe → blocked, "Up to 2 bathrobes per box."
  - 2 bath towels + black robe → the bag shows one "Build your CZERA box" line with the contents listed, total **1,940 EGP**. Remove it afterwards.
  - Editor: page 74 opens without "Attempt recovery" and the layout matches the live page.
  - Phone layout (DevTools device mode or the owner's phone): items stack, the total is a bottom bar, the footer is not covered.

- [ ] **Step 3: Stock test (ask the owner first).** A test order needs a payment method. Only with the owner's yes: place one box order, confirm each chosen item's stock dropped, then cancel the order so stock is restored.

- [ ] **Step 4: Record the outcome** in the project memory (box product ID, snippet name, CSS markers) and resolve the spec's open questions that were answered.

- [ ] **Step 5: Commit and open the PR**

```bash
git add tools/wp/box_checks.py
git commit -m "chore: Build your box handover checks"
git push -u origin <branch>
gh pr create --title "feat(#NN): Build your box page on WordPress" --body-file <body>
```

---

### Task 6 (gated): Home band copy

Only after the owner confirms spec §3.6. In the Home page editor, replace the four box-band steps with **1 Towels** (Any size, up to six) · **2 Bathrobes** (White or black, up to two) · **3 We pack it** (One box, assembled by our team), and the lede with "Choose your towels and bathrobes. We pack them together in one CZERA box." Verify on the live page. No repo change.
