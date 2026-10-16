# Build your box revision 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the WPC plugin's picker on czeramaison.com/build-your-box/ with our own picker that follows the static CZERA design. Colour filters the towel rows; towels and bathrobes have live group limits; "Your box" lists each item with a remove button; there is a clear-selection button; counts start at 0.

**Architecture:**
- A new Code Snippet, "CZERA box builder", registers the shortcode `[czera_box_builder]`.
  - It prints the static design's markup, filled with live product data from WooCommerce.
  - A small inline script runs the picker.
  - The form posts to the existing WPC box product 210 with `wooco_ids`.
- The rule snippet 5 exposes one `czera_box_config()`, which the builder reads, so the page and the server check share the same rules.
- The builder CSS replaces the old block in Additional CSS.
- Snippets 6 and 7, which worked around the plugin's picker, are retired.

**Tech Stack:** WordPress 7.1, WooCommerce 11.2, Astra Pro, WPC Composite Products 8.0.4, Code Snippets 4.0.0. PHP snippets with plain inline JS (no build step). Python 3 standard library for `tools/wp/box_checks.py`.

**Spec:** `docs/superpowers/specs/2026-10-16-wp-build-your-box-revision-design.md`. The approved mockup sits next to it (`…-revision-mockup.html`; open it in a browser). The original spec is `docs/superpowers/specs/2026-10-16-wp-build-your-box-design.md`. Decision record: `docs/agdr/AgDR-0005-wp-box-builder-plugin.md`.

## Global Constraints

- **Rules:** towels ≤ **6** in total, bathrobes ≤ **2** in total, at least **2** items, price = sum of items, no box fee.
- **Products:** towels 57, 60, 63, 66 (white), 69 (blue stripe), 72 (yellow stripe). Bathrobes 51 (white), 54 (black).
- **Box product:** 210. Component keys: Towels `8cdo`, Bathrobes `jt1j`.
- **Dropped from the static design:** "Black box · burgundy ribbon", "A box holds up to 6 pieces.", "Box and ribbon included free", "Choose your box", "Choose a ribbon", and the ribbon strip. Nothing on the page names a box colour or a ribbon.
- **Copy:**
  - CZERA in capitals.
  - Plain facts and full stops.
  - No exclamation marks.
  - No "discover / elevate / indulge".
- **Exact strings:**
  - "Build your own box"
  - "A gift set that's yours alone."
  - "Choose a colour", "Choose your towels", "Choose your bathrobes"
  - "Up to 6 · *n* of 6", "Up to 2 · *n* of 2"
  - "You have 6 towels. Remove one to choose another." / "You have 2 bathrobes. Remove one to choose another."
  - "Beach towels come in blue or yellow stripes only." / "Stripes come in the 100 × 200 beach size only."
  - "Your box", "Clear selection", "Nothing chosen yet."
  - "Total · *n* pieces", "Choose at least 2 pieces."
  - "Add box to bag", "Sold out"
  - "Turn on JavaScript to build a box."
- **Accessibility:**
  - Real `<button>`s with names.
  - Focus kept after each change.
  - Polite live regions for the total, the reason and each full-group note.
  - Focus ring 2px #8a5c12.
  - Targets ≥ 44px; the × remove buttons ≥ 32px inside a 44px row.
- **How the site is edited:**
  - All site edits go through the site's own tools: Code Snippets REST (`/wp-json/code-snippets/v1/snippets`), the block editor and the Customizer in the logged-in Chrome.
  - Blocks are built with `wp.blocks.createBlock`, never hand-written block HTML.
  - Additional CSS for this feature lives only between `/* ---------- Build your box page` and `/* ---------- end build your box page */`; nothing outside those markers changes.
- **Reference copies:**
  - Every live snippet has a reference copy in `tools/wp/live/<name>.php`. Its header is `<?php`, then `// Reference copy of live Code Snippet ID <n> "<name>" on czeramaison.com (scope: <scope>).`, then `// The site database is authoritative; update both together.`, then a blank line, then the code exactly as stored.
  - The CSS block has its copy in `tools/wp/live/build-your-box.css`.
- **Site behaviour to expect:**
  - Logged-out front-end requests get the coming-soon stub.
  - LiteSpeed excludes `/wp-json/` and `/wp-json/wc/store/`.
  - Page views need `?nocache=<random>`.

## Review Focus

- **Reloading after "Add box to bag".** A reload must not post the box again. The builder redirects to `/build-your-box/` after a successful add (post, redirect, get). Pinned in Task 2, Step 6.
- **A crafted or stale form.** The server rule message (for example "Towels: up to 6 per box.") must show on the builder page, not vanish. Pinned in Task 2, Step 6.
- **A product missing or trashed in WooCommerce.** The builder skips that row rather than breaking, and `check_page` fails loudly because the item list no longer matches. Pinned in Task 2, Step 1 (`check_page` compares the item IDs).
- **Phones.** The fixed bar must never cover the footer or the last bathrobe row, and "Show contents" must open the list. Pinned in Task 3, Step 4.
- **Keyboard users across colour switches.** Focus must stay on the colour button that was pressed, and on − when + becomes disabled. Pinned in Task 2, Step 6.

---

### Task 1: One rules config for the server check and the builder

**Files:**
- Modify: `tools/wp/live/czera-box-rules.php` (whole file)
- Live: Code Snippet 5 "CZERA box rules" (same ID, stays active, scope global)

**Interfaces:**
- Produces the PHP function `czera_box_config(): array`. It returns `['box_id' => 210, 'min' => 2, 'groups' => [ '8cdo' => ['name' => 'towels', 'cap' => 6, 'products' => [57, 60, 63, 66, 69, 72]], 'jt1j' => ['name' => 'bathrobes', 'cap' => 2, 'products' => [51, 54]] ]]`.
- Task 2 reads it.

- [ ] **Step 1: Write the new reference copy (the failing check)**

Replace the whole of `tools/wp/live/czera-box-rules.php` with:

```php
<?php
// Reference copy of live Code Snippet ID 5 "CZERA box rules" on czeramaison.com (scope: global).
// The site database is authoritative; update both together.

/**
 * CZERA box rules: enforce the Build your box limits on the server.
 * The WPC Composite plugin checks each item's limit on the server, but not the
 * per-group totals, the 2-item minimum, whole quantities, or which products sit
 * under which component (AgDR-0005).
 * The ids are cleaned the way the plugin cleans them, so both read the same string.
 * Order again passes the stored ids in $cart_item_data (6th argument) with no
 * wooco_ids in the request, so the rules run on those ids too.
 * czera_box_config() is the one source of the rules; the "CZERA box builder"
 * snippet reads it too, so the page and this check never disagree.
 */
if ( ! function_exists( 'czera_box_config' ) ) {
	/**
	 * The Build your box rules. Keys of 'groups' are the WPC component keys of box product 210.
	 */
	function czera_box_config() {
		return [
			'box_id' => 210,
			'min'    => 2,
			'groups' => [
				'8cdo' => [ 'name' => 'towels', 'cap' => 6, 'products' => [ 57, 60, 63, 66, 69, 72 ] ],
				'jt1j' => [ 'name' => 'bathrobes', 'cap' => 2, 'products' => [ 51, 54 ] ],
			],
		];
	}
}

add_filter( 'woocommerce_add_to_cart_validation', function ( $passed, $product_id, $quantity = 1, $variation_id = 0, $variations = [], $cart_item_data = [] ) {
	$cfg = czera_box_config();
	if ( ! $passed || (int) $product_id !== $cfg['box_id'] ) {
		return $passed;
	}
	$ids = '';
	if ( ! empty( $_REQUEST['wooco_ids'] ) ) {
		$ids = sanitize_text_field( wp_unslash( $_REQUEST['wooco_ids'] ) );
	} elseif ( is_array( $cart_item_data ) && isset( $cart_item_data['wooco_ids'] ) && is_string( $cart_item_data['wooco_ids'] ) ) {
		$ids = sanitize_text_field( $cart_item_data['wooco_ids'] );
	}
	$ids = ( class_exists( 'WPCleverWooco_Helper' ) && method_exists( 'WPCleverWooco_Helper', 'clean_ids' ) )
		? WPCleverWooco_Helper::clean_ids( $ids )
		: preg_replace( '/[^,.%\/0-9a-zA-Z]/', '', $ids );
	$counts = array_fill_keys( array_keys( $cfg['groups'] ), 0 );
	foreach ( array_filter( explode( ',', $ids ) ) as $item ) {
		$parts = explode( '/', $item );
		$id    = absint( $parts[0] ?? 0 );
		$qty   = (float) ( $parts[1] ?? 1 );
		$key   = sanitize_key( $parts[2] ?? '' );
		if ( $qty <= 0 ) {
			continue;
		}
		if ( floor( $qty ) !== $qty ) {
			wc_add_notice( 'Add whole items to your box.', 'error' );
			return false;
		}
		if ( ! isset( $cfg['groups'][ $key ] ) || ! in_array( $id, $cfg['groups'][ $key ]['products'], true ) ) {
			wc_add_notice( 'This box can only hold CZERA towels and bathrobes.', 'error' );
			return false;
		}
		$counts[ $key ] += $qty;
	}
	foreach ( $cfg['groups'] as $key => $group ) {
		if ( $counts[ $key ] > $group['cap'] ) {
			wc_add_notice( sprintf( '%s: up to %d per box.', ucfirst( $group['name'] ), $group['cap'] ), 'error' );
			return false;
		}
	}
	if ( array_sum( $counts ) < $cfg['min'] ) {
		wc_add_notice( sprintf( 'Add at least %d items to your box.', $cfg['min'] ), 'error' );
		return false;
	}
	return $passed;
}, 20, 6 );
```

- [ ] **Step 2: Run the drift check to verify it fails**

Run (from the repo root, with `WP_AUTH` exported): `python tools/wp/box_checks.py snippets`
Expected: FAIL, `snippet 5 "CZERA box rules" differs from tools/wp/live/czera-box-rules.php; update the one that is wrong`.

- [ ] **Step 3: Update live snippet 5 to the same code**

POST `/wp-json/code-snippets/v1/snippets/5` with `{"code": <the file's content after its header>}`, sent as JSON with `ensure_ascii`. The header ends at the first blank line. Keep `active: true` and `scope: global`. Afterwards:
- `curl -s -o /dev/null -w "%{http_code}" "https://czeramaison.com/?nocache=$RANDOM"` must print `200`, and `/wp-json/` must also return 200.
- If either is 500, set the snippet `active: false` at once and stop.

- [ ] **Step 4: Run the checks to verify they pass**

Run: `python tools/wp/box_checks.py snippets && python tools/wp/box_checks.py rules`
Expected: `snippets OK 5, 6, 7` and `rules OK`. All 13 cases still pass, so the behaviour did not change.

- [ ] **Step 5: Commit**

```bash
git add tools/wp/live/czera-box-rules.php
git commit -F - <<'EOF'
refactor: one rules config for the box check and the builder

Refs #49

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: The builder snippet and page 74

**Files:**
- Create: `tools/wp/live/czera-box-builder.php`
- Modify: `tools/wp/box_checks.py` (`SNIPPETS`, `check_page`)
- Live: a new Code Snippet "CZERA box builder" (scope global, active); page 74 content

**Interfaces:**
- Consumes `czera_box_config()` from Task 1.
- Produces:
  - the shortcode `[czera_box_builder]`;
  - the markup classes Task 3 styles: `czera-box-builder`, `box-page`, `box-steps`, `eyebrow`, `box-page__title`, `box-frame`, `box-frame--mini`, `box-frame--main`, `box-step`, `box-step__name`, `box-step__limit`, `box-step__note`, `box-step__full`, `box-options`, `box-option`, `swatch swatch--{white|blue|yellow}`, `box-size`, `box-size__label`, `qty`, `box-preview`, `box-preview__body`, `box-preview__head`, `box-clear`, `box-line__name`, `box-remove`, `box-empty`, `box-preview__toggle`, `box-preview__live`, `box-preview__total`, `box-preview__reason`, `btn btn--ink btn--block`, `czera-box-builder__notices`, `czera-box-noscript`;
  - the body class `czera-has-box-bar` and the CSS variable `--czera-box-bar-h`, both set by the script;
  - `is-open` on `.box-preview` and `is-tall` on `.box-preview`.

- [ ] **Step 1: Write the failing page check**

In `tools/wp/box_checks.py`, replace the four `assert` lines at the end of `check_page` (from `assert 'czera-box-intro' in html` through `assert 'Add box to bag' in html, …`) with:

```python
    for needle in ('czera-box-builder', 'Build your own box', 'Choose a colour', 'Choose your towels',
                   'Choose your bathrobes', 'Clear selection', 'Add box to bag', 'name="wooco_ids"'):
        assert needle in html, f'{needle!r} missing from the page'
    assert 'czera-box-intro' not in html, 'the old Spectra intro is still on the page'
    assert 'wooco-wrap' not in html, "the plugin's own picker is still on the page"
    data = json.loads(html.split('data-box-data>', 1)[1].split('</script>', 1)[0])
    ids = sorted(i['id'] for i in data['items'])
    assert ids == sorted(TOWELS + ROBES), f'builder items {ids}, expected {sorted(TOWELS + ROBES)}'
    assert data['caps'] == {'towels': 6, 'bathrobes': 2} and data['min'] == 2, f'builder rules {data}'
```

Also change the comment in that function from "runs the same blocks and [product_page] shortcode server-side" to "runs the same blocks and [czera_box_builder] shortcode server-side".

- [ ] **Step 2: Run it to verify it fails**

Run: `python tools/wp/box_checks.py page`
Expected: FAIL with `AssertionError: 'czera-box-builder' missing from the page`.

- [ ] **Step 3: Create the builder snippet**

Write `tools/wp/live/czera-box-builder.php` with this content. After Step 4, `<ID>` in the header becomes the real snippet ID.

```php
<?php
// Reference copy of live Code Snippet ID <ID> "CZERA box builder" on czeramaison.com (scope: global).
// The site database is authoritative; update both together.

/**
 * CZERA box builder: the Build your box picker, shortcode [czera_box_builder] on page 74.
 * Follows the static build-your-box design (spec 2026-10-16-wp-build-your-box-revision-design.md):
 * 1 colour filter, 2 towels, 3 bathrobes, live group limits, "Your box" with remove buttons,
 * Clear selection, and a bottom bar on phones. "Add box to bag" posts the WPC box product with
 * wooco_ids "id/qty/componentKey,..."; snippet 5 (czera_box_config) checks the same rules on the server.
 * After a successful add the shopper is sent back to the page (post, redirect, get), and the
 * box product's own page redirects here, so the plugin's picker is never shown.
 */

if ( ! function_exists( 'czera_box_builder_rows' ) ) {
	/** Row labels and towel colours by product ID. Sizes, prices and stock come from WooCommerce. */
	function czera_box_builder_rows() {
		return [
			57 => [ 'Face', 'white' ],
			60 => [ 'Hand', 'white' ],
			63 => [ 'Bath', 'white' ],
			66 => [ 'Bath sheet', 'white' ],
			69 => [ 'Beach', 'blue' ],
			72 => [ 'Beach', 'yellow' ],
			51 => [ 'White bathrobe', 'white' ],
			54 => [ 'Black bathrobe', 'black' ],
		];
	}
}

add_action( 'template_redirect', function () {
	if ( function_exists( 'czera_box_config' ) && function_exists( 'is_product' ) && is_product()
		&& (int) get_queried_object_id() === czera_box_config()['box_id'] ) {
		wp_safe_redirect( home_url( '/build-your-box/' ), 302 );
		exit;
	}
} );

add_filter( 'woocommerce_add_to_cart_redirect', function ( $url, $product = null ) {
	if ( function_exists( 'czera_box_config' ) && $product instanceof WC_Product
		&& $product->get_id() === czera_box_config()['box_id'] && ! wp_doing_ajax() ) {
		return home_url( '/build-your-box/' );
	}
	return $url;
}, 10, 2 );

add_shortcode( 'czera_box_builder', function () {
	if ( ! function_exists( 'czera_box_config' ) || ! function_exists( 'wc_get_product' ) ) {
		return '';
	}
	$cfg   = czera_box_config();
	$rows  = czera_box_builder_rows();
	$caps  = [];
	$items = [];
	foreach ( $cfg['groups'] as $key => $group ) {
		$caps[ $group['name'] ] = $group['cap'];
		foreach ( $group['products'] as $id ) {
			$product = wc_get_product( $id );
			if ( ! $product ) {
				continue;
			}
			$items[] = [
				'id'     => $id,
				'key'    => $key,
				'group'  => $group['name'],
				'label'  => $rows[ $id ][0] ?? $product->get_name(),
				'colour' => $rows[ $id ][1] ?? '',
				'spec'   => trim( wp_strip_all_tags( $product->get_short_description() ) ),
				'price'  => (float) wc_get_price_to_display( $product ),
				'stock'  => $product->is_purchasable() && $product->is_in_stock(),
			];
		}
	}
	$data   = [ 'min' => $cfg['min'], 'caps' => $caps, 'items' => $items ];
	$image  = wp_get_attachment_image( 23, 'large', false, [ 'alt' => 'Folded CZERA towels' ] );
	// No WooCommerce session in REST renders (box_checks page), so only print notices when there is one.
	$notice = ( function_exists( 'WC' ) && WC()->session ) ? wc_print_notices( true ) : '';
	ob_start();
	?>
<div class="czera-box-builder" data-box-builder>
	<div class="czera-box-builder__notices"><?php echo $notice; // WooCommerce escapes its own notices. ?></div>
	<noscript><p class="czera-box-noscript">Turn on JavaScript to build a box.</p></noscript>
	<div class="box-page">
		<div class="box-steps">
			<span class="eyebrow">Build your own box</span>
			<h1 class="box-page__title">A gift set that's yours alone.</h1>
			<figure class="box-frame box-frame--mini"><?php echo $image; ?></figure>
			<fieldset class="box-step"><legend><span class="box-step__name"><i>1</i> Choose a colour</span></legend>
				<div class="box-options" data-options="colour"></div>
				<p class="box-step__note" data-colour-note></p>
			</fieldset>
			<fieldset class="box-step"><legend><span class="box-step__name"><i>2</i> Choose your towels</span><span class="box-step__limit" data-limit="towels"></span></legend>
				<div data-rows="towels"></div>
				<p class="box-step__full" id="czera-box-full-towels" data-full="towels" aria-live="polite"></p>
			</fieldset>
			<fieldset class="box-step"><legend><span class="box-step__name"><i>3</i> Choose your bathrobes</span><span class="box-step__limit" data-limit="bathrobes"></span></legend>
				<div data-rows="bathrobes"></div>
				<p class="box-step__full" id="czera-box-full-bathrobes" data-full="bathrobes" aria-live="polite"></p>
			</fieldset>
		</div>
		<aside class="box-preview" data-preview>
			<figure class="box-frame box-frame--main"><?php echo $image; ?></figure>
			<form class="box-preview__body" method="post" action="<?php echo esc_url( home_url( '/build-your-box/' ) ); ?>" data-box-form>
				<div class="box-preview__head"><h2>Your box</h2><button type="button" class="box-clear" data-clear disabled>Clear selection</button></div>
				<ul data-summary id="czera-box-contents"></ul>
				<button type="button" class="box-preview__toggle" data-contents-toggle aria-expanded="false" aria-controls="czera-box-contents">Show contents</button>
				<div aria-live="polite" aria-atomic="true" class="box-preview__live">
					<p class="box-preview__total"><span data-piece-count></span><b data-total></b></p>
					<p class="box-preview__reason" data-reason></p>
				</div>
				<input type="hidden" name="add-to-cart" value="<?php echo esc_attr( $cfg['box_id'] ); ?>">
				<input type="hidden" name="quantity" value="1">
				<input type="hidden" name="wooco_ids" value="" data-ids>
				<button type="submit" class="btn btn--ink btn--block" data-add-box disabled>Add box to bag</button>
			</form>
		</aside>
	</div>
	<script type="application/json" data-box-data><?php echo wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP ); ?></script>
</div>
<script>
(function () {
	var root = document.querySelector('[data-box-builder]');
	if (!root || root.dataset.ready) return;
	root.dataset.ready = '1';
	const data = JSON.parse(root.querySelector('[data-box-data]').textContent);
	const COLOURS = [
		{ id: 'white', label: 'White' },
		{ id: 'blue', label: 'Blue stripe' },
		{ id: 'yellow', label: 'Yellow stripe' }
	];
	const items = data.items;
	const qty = {};
	items.forEach(p => { qty[p.id] = 0; });
	let colour = 'white';
	const $ = s => root.querySelector(s);
	const $$ = s => Array.from(root.querySelectorAll(s));
	const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
	const egp = n => n.toLocaleString('en-US') + ' EGP';
	const inGroup = g => items.filter(p => p.group === g);
	const count = g => inGroup(g).reduce((n, p) => n + qty[p.id], 0);
	const full = g => count(g) >= data.caps[g];
	const colourName = c => (COLOURS.find(x => x.id === c) || { label: c }).label.toLowerCase();
	const lineName = p => p.group === 'towels' ? `${p.label} ${p.spec}, ${colourName(p.colour)}` : p.label;
	const rowName = p => p.group === 'towels' ? `${p.label} ${p.spec.replace(' cm', '')}` : p.label;

	function row(p) {
		const isFull = full(p.group);
		const q = qty[p.id];
		const plusOff = isFull || !p.stock;
		const why = isFull ? ` aria-describedby="czera-box-full-${p.group}"` : '';
		return `<div class="box-size${plusOff && q === 0 ? ' is-disabled' : ''}">
			<span class="box-size__label">${esc(rowName(p))}${p.group === 'bathrobes' ? `<small>${esc(p.spec)}</small>` : ''}</span>
			<small>${p.stock ? egp(p.price) : 'Sold out'}</small>
			<span class="qty"><button type="button" data-id="${p.id}" data-delta="-1" aria-label="One less ${esc(lineName(p))}"${q === 0 ? ' disabled' : ''}>−</button>
			<span>${q}</span><button type="button" data-id="${p.id}" data-delta="1" aria-label="One more ${esc(lineName(p))}"${plusOff ? ' disabled' + why : ''}>+</button></span></div>`;
	}

	function render() {
		const towelsFull = full('towels');
		$('[data-options="colour"]').innerHTML = COLOURS.map(c => {
			const has = inGroup('towels').some(p => p.colour === c.id && qty[p.id] > 0);
			const off = towelsFull && !has;
			return `<button type="button" class="box-option" data-colour="${c.id}" aria-pressed="${colour === c.id}"${off ? ' disabled aria-describedby="czera-box-full-towels"' : ''}><span class="swatch swatch--${c.id}" aria-hidden="true"></span>${c.label}</button>`;
		}).join('');
		$('[data-colour-note]').textContent = colour === 'white'
			? 'Beach towels come in blue or yellow stripes only.'
			: 'Stripes come in the 100 × 200 beach size only.';
		$('[data-rows="towels"]').innerHTML = inGroup('towels').filter(p => p.colour === colour).map(row).join('');
		$('[data-rows="bathrobes"]').innerHTML = inGroup('bathrobes').map(row).join('');
		['towels', 'bathrobes'].forEach(g => {
			const n = count(g);
			const cap = data.caps[g];
			$(`[data-limit="${g}"]`).innerHTML = `Up to ${cap} · <b>${n} of ${cap}</b>`;
			$(`[data-full="${g}"]`).textContent = n >= cap ? `You have ${cap} ${g}. Remove one to choose another.` : '';
		});
		const chosen = items.filter(p => qty[p.id] > 0);
		$('[data-summary]').innerHTML = chosen.length
			? chosen.map(p => `<li><span class="box-line__name">${qty[p.id]} × ${esc(lineName(p))}</span><span>${egp(qty[p.id] * p.price)}</span><button type="button" class="box-remove" data-remove="${p.id}" aria-label="Remove ${esc(lineName(p))}">×</button></li>`).join('')
			: '<li class="box-empty">Nothing chosen yet.</li>';
		const n = count('towels') + count('bathrobes');
		const total = chosen.reduce((t, p) => t + qty[p.id] * p.price, 0);
		$('[data-piece-count]').textContent = `Total · ${n} ${n === 1 ? 'piece' : 'pieces'}`;
		$('[data-total]').textContent = egp(total);
		const ok = n >= data.min;
		$('[data-reason]').textContent = ok ? '' : `Choose at least ${data.min} pieces.`;
		$('[data-add-box]').disabled = !ok;
		$('[data-clear]').disabled = n === 0;
		$('[data-ids]').value = chosen.map(p => `${p.id}/${qty[p.id]}/${p.key}`).join(',');
	}

	// Re-rendering replaces the controls, so put focus back on the same control,
	// or on its sibling when that one became disabled.
	function keepFocus(change) {
		const a = document.activeElement;
		let key = null;
		let fallback = null;
		if (a && root.contains(a) && a.dataset) {
			if (a.dataset.id) {
				key = `[data-id="${a.dataset.id}"][data-delta="${a.dataset.delta}"]`;
				fallback = `[data-id="${a.dataset.id}"]:not([disabled])`;
			} else if (a.dataset.colour) {
				key = `[data-colour="${a.dataset.colour}"]`;
			}
		}
		change();
		render();
		if (!key) return;
		let el = root.querySelector(key);
		if ((!el || el.disabled) && fallback) el = root.querySelector(fallback);
		if (el && !el.disabled) el.focus();
	}

	const firstColour = () => $('[data-colour][aria-pressed="true"]') || $('[data-colour]:not([disabled])');

	root.addEventListener('click', e => {
		const c = e.target.closest('[data-colour]');
		if (c) {
			if (!c.disabled) keepFocus(() => { colour = c.dataset.colour; });
			return;
		}
		const s = e.target.closest('[data-id]');
		if (s) {
			if (s.disabled) return;
			const p = items.find(x => String(x.id) === s.dataset.id);
			const delta = Number(s.dataset.delta);
			if (delta > 0 && (full(p.group) || !p.stock)) return;
			keepFocus(() => { qty[p.id] = Math.max(0, qty[p.id] + delta); });
			return;
		}
		const r = e.target.closest('[data-remove]');
		if (r) {
			const index = $$('[data-remove]').indexOf(r);
			qty[r.dataset.remove] = 0;
			render();
			const left = $$('[data-remove]');
			const next = left[index] || left[index - 1] || ($('[data-clear]').disabled ? firstColour() : $('[data-clear]'));
			if (next) next.focus();
			return;
		}
		if (e.target.closest('[data-clear]')) {
			Object.keys(qty).forEach(k => { qty[k] = 0; });
			render();
			const f = firstColour();
			if (f) f.focus();
			return;
		}
		const t = e.target.closest('[data-contents-toggle]');
		if (t) {
			const open = t.getAttribute('aria-expanded') !== 'true';
			t.setAttribute('aria-expanded', String(open));
			t.textContent = open ? 'Hide contents' : 'Show contents';
			$('[data-preview]').classList.toggle('is-open', open);
			syncBar();
		}
	});

	$('[data-box-form]').addEventListener('submit', e => {
		render();
		if ($('[data-add-box]').disabled) e.preventDefault();
	});

	// Phones: the total bar is fixed, so keep the page (footer included) clear of it.
	document.body.classList.add('czera-has-box-bar');
	const preview = $('[data-preview]');
	const bar = $('.box-preview__body');
	const list = $('[data-summary]');
	function syncBar() {
		const open = preview.classList.contains('is-open');
		const extra = open && getComputedStyle(list).display !== 'none' ? list.getBoundingClientRect().height : 0;
		document.documentElement.style.setProperty('--czera-box-bar-h', Math.max(0, Math.ceil(bar.getBoundingClientRect().height - extra)) + 'px');
		// Desktop: the panel stays sticky only while it fits under the header.
		const top = parseFloat(getComputedStyle(root).getPropertyValue('--czera-box-top')) || 125;
		preview.classList.toggle('is-tall', window.matchMedia('(min-width: 900px)').matches && preview.offsetHeight > window.innerHeight - top - 16);
	}
	if ('ResizeObserver' in window) new ResizeObserver(syncBar).observe(bar);
	window.addEventListener('resize', syncBar);
	render();
	syncBar();
})();
</script>
	<?php
	return ob_get_clean();
} );
```

- [ ] **Step 4: Create the live snippet from the file**

- POST `/wp-json/code-snippets/v1/snippets` with `{"name": "CZERA box builder", "scope": "global", "active": true, "code": <the file's content after its header>}`, sent as JSON with `ensure_ascii`. Note the returned `id`.
- Put that ID into the file's header line in place of `<ID>`.
- In `tools/wp/box_checks.py`, set `SNIPPETS = {5: 'czera-box-rules.php', 6: 'czera-box-labels.php', 7: 'czera-box-keyboard.php', <id>: 'czera-box-builder.php'}`, with `<id>` replaced by the number.
- Confirm that home and `/wp-json/` both return 200. If either returns 500, deactivate the snippet at once and stop.

- [ ] **Step 5: Put the shortcode on page 74**

Do this in the block editor for page 74 (Chrome, logged in):
1. Run `wp.data.dispatch('core/block-editor').resetBlocks([wp.blocks.createBlock('core/shortcode', { text: '[czera_box_builder]' })])`.
2. Then run `wp.data.dispatch('core/editor').savePost()`.
3. Reload the editor and confirm it holds 1 block, 0 invalid, with no "Attempt recovery".

The page meta stays as it is (no sidebar, title disabled, full width, unboxed).

- [ ] **Step 6: Run the checks and the browser checks**

Run: `python tools/wp/box_checks.py page && python tools/wp/box_checks.py snippets && python tools/wp/box_checks.py rules`
Expected: `page OK (…)`, `snippets OK 5, 6, 7, <id>` and `rules OK`.

Then, in Chrome (logged in), on `https://czeramaison.com/build-your-box/?nocache=<random>`, check each of these. The page is not styled until Task 3, so check behaviour, not looks.
- [ ] All counts are 0. "Add box to bag" is disabled, with "Choose at least 2 pieces.".
- [ ] White + 4 × Bath + 1 × Face, then Blue stripe + 1 × Beach gives "6 of 6". Every towel + is disabled, Yellow stripe is disabled, and "You have 6 towels. Remove one to choose another." shows.
- [ ] The × on the beach line brings it back to "5 of 6", and Yellow stripe is enabled again.
- [ ] Keyboard only: Tab to Blue stripe and press Enter; focus stays on Blue stripe. Tab to a towel + and press Enter until the group is full; focus moves to that row's −.
- [ ] White bathrobe + and Black bathrobe + give "2 of 2", and both bathrobe + buttons are disabled.
- [ ] "Clear selection" sets everything back to 0 and shows "Nothing chosen yet.".
- [ ] 2 × Bath + 1 × Black bathrobe gives a total of 1,940 EGP. Press "Add box to bag":
  - The page comes back at `/build-your-box/` with WooCommerce's added notice above step 1.
  - Reloading does not add a second box: the bag still has one box line.
  - The bag shows one "Build your CZERA box" line with 2 × Bath Towel and 1 × Black Bathrobe.
  - Remove that line from the bag afterwards.
- [ ] Crafted form: in DevTools, enable the button and set `wooco_ids` to `63/7/8cdo`, then submit. The page shows "Towels: up to 6 per box." and the bag is unchanged.
- [ ] `https://czeramaison.com/product/build-your-czera-box/` redirects to `/build-your-box/`.

- [ ] **Step 7: Commit**

```bash
git add tools/wp/live/czera-box-builder.php tools/wp/box_checks.py
git commit -F - <<'EOF'
feat: our own Build your box picker on top of the WPC box

- [czera_box_builder]: colour filter, towels and bathrobes with live group limits,
  Your box with remove buttons, clear selection, counts from 0
- Posts the WPC box product; redirects back after adding; box product page redirects here
- check_page now checks the builder markup and its item list

Refs #49

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: The builder's look (Additional CSS)

**Files:**
- Modify: `tools/wp/live/build-your-box.css` (whole file)
- Live: the Additional CSS block between `/* ---------- Build your box page` and `/* ---------- end build your box page */`

**Interfaces:**
- Consumes the classes, body class and CSS variables from Task 2.

- [ ] **Step 1: Write the new reference CSS**

Replace the whole of `tools/wp/live/build-your-box.css` with the text below.

The first line, `/* Reference copy …`, is the file's header. Only the text from the opening `/* ---------- Build your box page` marker to the closing `/* ---------- end build your box page */` marker goes live.

The rules are the static `css/pages/build-box.css` without the box and ribbon parts, with the static tokens they need declared on `.czera-box-builder`.

```css
/* Reference copy of the live Additional CSS block (Customizer > Additional CSS) on czeramaison.com, from marker to marker. The site is authoritative; update both together. */
/* ---------- Build your box page (revision 1: the static build-your-box design, [czera_box_builder]) ---------- */
.czera-box-builder {
  --color-bg: #f4f2ec; --color-surface: #e7e1d5; --color-surface-soft: #faf8f3;
  --color-gold: #d4af36; --color-gold-sand: #d8c28a; --color-gold-deep: #ba7c17; --color-gold-text: #8a5c12;
  --color-ink: #2b2b2b; --color-ink-strong: #010100; --color-ink-mute: #6b6b6b; --color-ink-faint: #a3a099;
  --color-on-dark: #f4f2ec; --swatch-blue: #2f5d8a; --swatch-yellow: #e3b93c;
  --fs-2xs: 0.6875rem; --fs-xs: 0.75rem; --fs-sm: 0.8125rem; --fs-base: 0.9375rem; --fs-md: 1.0625rem;
  --fs-lg: 1.3125rem; --fs-xl: 1.75rem; --fs-2xl: 2.375rem;
  --lh-tight: 1.1; --lh-base: 1.5; --ls-tight: -0.01em; --ls-wide: 0.06em; --ls-widest: 0.18em;
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem; --space-5: 1.5rem;
  --space-6: 2rem; --space-7: 3rem; --space-9: 6rem;
  --gutter: clamp(1rem, 4vw, 3rem);
  --border-hairline: 1px solid #d8c28a; --border-divider: 1px solid rgba(43, 43, 43, 0.12);
  --font-display: "Italiana", "Didot", "Bodoni 72", "Times New Roman", serif;
  --czera-box-top: 125px; /* sticky header is 109px once scrolled, + 16px */
  max-width: 1320px; margin-inline: auto; padding-inline: var(--gutter);
  color: var(--color-ink); font-size: var(--fs-base);
}
.admin-bar .czera-box-builder { --czera-box-top: 157px; }
.czera-box-builder__notices:empty { display: none; }
.czera-box-builder__notices { padding-block-start: var(--space-5); }
.czera-box-noscript { padding-block: var(--space-5); font-size: var(--fs-sm); }

/* Resets against the theme's button and fieldset styles. */
.czera-box-builder button { font: inherit; border-radius: 0; box-shadow: none; text-transform: none; letter-spacing: normal; line-height: 1.2; }
.czera-box-builder fieldset, .czera-box-builder legend { border: 0; }
.czera-box-builder figure { margin: 0; }

.czera-box-builder .eyebrow { font-size: var(--fs-2xs); font-weight: 500; letter-spacing: var(--ls-widest); text-transform: uppercase; color: var(--color-ink-mute); }
.czera-box-builder .box-page {
  display: grid; grid-template-columns: 1.25fr 1fr; gap: var(--space-7);
  padding-block: var(--space-7) var(--space-9); align-items: start;
}
.czera-box-builder .box-page__title {
  font-family: var(--font-display); font-weight: 300;
  font-size: clamp(1.75rem, 3.5vw, var(--fs-2xl)); line-height: var(--lh-tight);
  color: var(--color-ink-strong); margin-block: var(--space-2) var(--space-6);
}
.czera-box-builder .box-step { padding: 0; margin: 0 0 var(--space-6); min-inline-size: 0; }
.czera-box-builder .box-step legend {
  display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); inline-size: 100%;
  padding: 0; margin-block-end: var(--space-3);
  font-size: var(--fs-sm); letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--color-ink-strong);
}
.czera-box-builder .box-step__name { display: inline-flex; align-items: center; gap: var(--space-3); }
.czera-box-builder .box-step legend i {
  display: inline-grid; place-items: center; inline-size: 26px; block-size: 26px; border-radius: 50%;
  background: var(--color-ink-strong); color: var(--color-bg); font-style: normal; font-size: var(--fs-xs);
}
.czera-box-builder .box-step__limit { font-size: var(--fs-xs); letter-spacing: var(--ls-wide); text-transform: none; color: var(--color-ink-mute); }
.czera-box-builder .box-step__limit b { font-weight: 500; color: var(--color-ink-strong); }
.czera-box-builder .box-step__note { margin: var(--space-3) 0 0; font-size: var(--fs-xs); color: var(--color-ink-mute); }
.czera-box-builder .box-step__full { margin: var(--space-3) 0 0; font-size: var(--fs-xs); color: var(--color-ink); }
.czera-box-builder .box-step__full:empty { display: none; }

.czera-box-builder .box-options { display: flex; flex-wrap: wrap; gap: var(--space-3); }
.czera-box-builder .box-option {
  display: inline-flex; align-items: center; gap: var(--space-2); min-block-size: 44px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-ink-faint); background: var(--color-surface-soft);
  font-size: var(--fs-sm); color: var(--color-ink-strong); cursor: pointer;
}
.czera-box-builder .box-option:hover { border-color: var(--color-ink-strong); background: var(--color-surface-soft); color: var(--color-ink-strong); }
.czera-box-builder .box-option[aria-pressed="true"] { border-color: var(--color-ink-strong); box-shadow: inset 0 0 0 1px var(--color-ink-strong); }
.czera-box-builder .box-option:disabled { color: var(--color-ink-mute); border-style: dashed; border-color: var(--color-ink-faint); background: transparent; cursor: not-allowed; }
.czera-box-builder .box-option:disabled .swatch { opacity: 0.45; }
.czera-box-builder .swatch { inline-size: 18px; block-size: 18px; border-radius: 50%; border: 1px solid var(--color-ink-faint); flex: none; }
.czera-box-builder .swatch--white { background: var(--color-surface-soft); }
.czera-box-builder .swatch--blue { background: repeating-linear-gradient(90deg, var(--swatch-blue) 0 4px, var(--color-surface-soft) 4px 6px); }
.czera-box-builder .swatch--yellow { background: repeating-linear-gradient(90deg, var(--swatch-yellow) 0 4px, var(--color-surface-soft) 4px 6px); }

.czera-box-builder .box-size {
  display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: var(--space-4);
  inline-size: 100%; padding-block: var(--space-2); border-block-end: var(--border-divider);
  font-size: var(--fs-sm); color: var(--color-ink-strong);
}
.czera-box-builder .box-size small { color: var(--color-ink-mute); font-size: var(--fs-xs); }
.czera-box-builder .box-size__label small { display: block; margin-block-start: 2px; }
.czera-box-builder .box-size.is-disabled, .czera-box-builder .box-size.is-disabled small { color: var(--color-ink-mute); }
.czera-box-builder .qty { display: inline-flex; align-items: center; border: 1px solid var(--color-ink-faint); }
.czera-box-builder .qty span { min-inline-size: 32px; text-align: center; font-size: var(--fs-sm); }
.czera-box-builder .qty button {
  inline-size: 44px; block-size: 44px; padding: 0; border: 0; background: none;
  font-size: var(--fs-md); color: var(--color-ink-strong); cursor: pointer;
}
.czera-box-builder .qty button:hover { background: var(--color-surface); color: var(--color-ink-strong); }
.czera-box-builder .qty button:disabled { color: var(--color-ink-faint); cursor: not-allowed; background: none; }

.czera-box-builder .box-preview {
  position: sticky; top: var(--czera-box-top);
  background: var(--color-surface-soft); border: var(--border-hairline);
}
.czera-box-builder .box-preview.is-tall { position: static; }
.czera-box-builder .box-frame { padding: var(--space-3); background: var(--color-ink-strong); border: 1px solid var(--color-ink-faint); }
.czera-box-builder .box-frame img { display: block; inline-size: 100%; block-size: auto; aspect-ratio: 4 / 3; object-fit: cover; }
.czera-box-builder .box-frame--mini { display: none; }
.czera-box-builder .box-preview__toggle { display: none; }
.czera-box-builder .box-preview__body { padding: var(--space-5); display: grid; gap: var(--space-3); margin: 0; }
.czera-box-builder .box-preview__body > * { margin: 0; }
.czera-box-builder .box-preview__head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-3); }
.czera-box-builder .box-preview h2 { margin: 0; font-weight: 300; letter-spacing: var(--ls-tight); font-size: var(--fs-xl); color: var(--color-ink-strong); }
.czera-box-builder .box-clear {
  min-block-size: 44px; padding: 0; border: 0; background: none; cursor: pointer;
  font-size: var(--fs-xs); letter-spacing: var(--ls-wide); text-transform: uppercase;
  color: var(--color-ink-strong); text-decoration: underline; text-underline-offset: 3px;
}
.czera-box-builder .box-clear:hover { background: none; color: var(--color-ink-strong); }
.czera-box-builder .box-clear:disabled { color: var(--color-ink-faint); text-decoration: none; cursor: not-allowed; }
.czera-box-builder .box-preview ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-2); font-size: var(--fs-sm); }
.czera-box-builder .box-preview li { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); min-block-size: 44px; }
.czera-box-builder .box-preview li span { color: var(--color-ink-mute); white-space: nowrap; }
.czera-box-builder .box-preview li .box-line__name { flex: 1; color: var(--color-ink); white-space: normal; }
.czera-box-builder .box-empty { color: var(--color-ink-mute); }
.czera-box-builder .box-remove {
  inline-size: 32px; block-size: 32px; flex: none; display: inline-grid; place-items: center; padding: 0;
  background: none; border: 1px solid var(--color-ink-faint); color: var(--color-ink-strong); font-size: 16px; line-height: 1; cursor: pointer;
}
.czera-box-builder .box-remove:hover { background: none; border-color: var(--color-ink-strong); color: var(--color-ink-strong); }
.czera-box-builder .box-preview__live { display: grid; gap: var(--space-2); }
.czera-box-builder .box-preview__live > * { margin: 0; }
.czera-box-builder .box-preview__total {
  display: flex; justify-content: space-between; align-items: baseline;
  padding-block-start: var(--space-3); border-block-start: var(--border-divider); font-size: var(--fs-sm);
}
.czera-box-builder .box-preview__total b { font-weight: 400; font-size: var(--fs-lg); color: var(--color-ink-strong); }
.czera-box-builder .box-preview__reason { font-size: var(--fs-xs); color: var(--color-ink-mute); min-block-size: 1.2em; }
.czera-box-builder .btn {
  display: flex; align-items: center; justify-content: center; inline-size: 100%; min-block-size: 48px;
  padding: var(--space-4); border: 1px solid var(--color-ink-strong); background: var(--color-ink-strong); color: var(--color-on-dark);
  font-size: var(--fs-sm); font-weight: 500; letter-spacing: var(--ls-wide); text-transform: uppercase; cursor: pointer;
}
.czera-box-builder .btn:hover { background: var(--color-gold-deep); border-color: var(--color-gold-deep); color: var(--color-on-dark); }
.czera-box-builder .btn:disabled, .czera-box-builder .btn:disabled:hover {
  opacity: 0.45; cursor: not-allowed; background: var(--color-ink-strong); border-color: var(--color-ink-strong); color: var(--color-on-dark);
}
.czera-box-builder .box-option:focus-visible, .czera-box-builder .qty button:focus-visible, .czera-box-builder .box-remove:focus-visible,
.czera-box-builder .box-clear:focus-visible, .czera-box-builder .box-preview__toggle:focus-visible, .czera-box-builder .btn:focus-visible {
  outline: 2px solid var(--color-gold-text); outline-offset: 2px;
}

@media (max-width: 899px) {
  .czera-box-builder .box-page { grid-template-columns: 1fr; gap: var(--space-5); padding-block-end: var(--space-7); }
  .czera-has-box-bar { padding-block-end: var(--czera-box-bar-h, 140px); }
  .czera-has-box-bar #ast-scroll-top { bottom: calc(var(--czera-box-bar-h, 140px) + 12px); }
  .czera-box-builder .box-preview { position: static; background: none; border: 0; }
  .czera-box-builder .box-frame--main, .czera-box-builder .box-preview h2 { display: none; }
  .czera-box-builder .box-preview__head { justify-content: flex-end; }
  .czera-box-builder .box-frame--mini { display: block; max-inline-size: 16rem; margin-block-end: var(--space-5); }
  .czera-box-builder .box-preview ul {
    display: none; max-block-size: 40vh; overflow-y: auto;
    padding-block-end: var(--space-2); border-block-end: var(--border-divider);
  }
  .czera-box-builder .box-preview.is-open ul { display: grid; }
  .czera-box-builder .box-preview__toggle {
    display: block; min-block-size: 44px; padding: 0; background: none; border: 0; cursor: pointer; text-align: start;
    font-size: var(--fs-xs); letter-spacing: var(--ls-wide); text-transform: uppercase;
    color: var(--color-ink-strong); text-decoration: underline; text-underline-offset: 3px;
  }
  .czera-box-builder .box-preview__toggle:hover { background: none; color: var(--color-ink-strong); }
  .czera-box-builder .box-preview__body {
    position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 40;
    background: var(--color-bg); border-block-start: var(--border-hairline);
    padding: var(--space-3) var(--gutter) calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
    gap: var(--space-2);
  }
  .czera-box-builder .box-preview__total { border: 0; padding: 0; }
  .czera-box-builder .box-preview__reason { min-block-size: 0; }
}
/* ---------- end build your box page */
```

- [ ] **Step 2: Replace the live block**

In the Customizer, Additional CSS (`custom_css[astra]`), replace everything from the `/* ---------- Build your box page` marker up to and including `/* ---------- end build your box page */` with the file's text from the opening marker to the end. Save with `wp.customize.previewer.save()`.

Record:
- the total length and the list of marker comments, before and after;
- that the text outside the block is byte-identical.

- [ ] **Step 3: Verify the live CSS equals the file**

On the live page (logged in), read the `#wp-custom-css` text in Chrome and take the part from the opening marker to the closing marker. It must equal the file from its second line to its end, after normalising line endings and surrounding whitespace. Compare SHA-256 hashes in the browser and locally.

- [ ] **Step 4: Check the look against the mockup**

Open `https://czeramaison.com/build-your-box/?nocache=<random>` (logged in) next to `docs/superpowers/specs/2026-10-16-wp-build-your-box-revision-mockup.html`.

At 1440 px:
- the left steps and right panel match the mockup;
- the panel stays sticky 157 px from the top with the admin bar;
- there is no theme button styling on −, +, colour buttons, ×, or Clear selection.

At 390 px (window or same-origin iframe):
- the steps stack, and the small image sits above step 1;
- the bottom bar shows Show contents, the total, the reason and the button, and Show contents opens the list;
- scrolled to the end, the footer and the last bathrobe row sit above the bar.

Tab through the page and confirm a 2px #8a5c12 ring on every control.

- [ ] **Step 5: Commit**

```bash
git add tools/wp/live/build-your-box.css
git commit -F - <<'EOF'
style: the static Build your box design for the WordPress picker

Refs #49

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Retire the plugin-picker workarounds

**Files:**
- Delete: `tools/wp/live/czera-box-labels.php`, `tools/wp/live/czera-box-keyboard.php`
- Modify: `tools/wp/box_checks.py` (`SNIPPETS`, `RETIRED`, `check_snippets`)
- Live: delete Code Snippets 6 and 7

**Interfaces:**
- Consumes the builder snippet ID from Task 2.

- [ ] **Step 1: Write the failing check**

In `tools/wp/box_checks.py`:
- Set `SNIPPETS = {5: 'czera-box-rules.php', <id>: 'czera-box-builder.php'}`, with `<id>` as the builder snippet ID from Task 2.
- Add `RETIRED = {6: 'CZERA box labels', 7: 'CZERA box keyboard'}` below `SNIPPETS`.
- Add this at the top of `check_snippets`, before its loop:

```python
    names = {s['id']: s['name'] for s in api('/code-snippets/v1/snippets')}
    for sid, name in RETIRED.items():
        assert sid not in names, f'retired snippet {sid} "{name}" still exists; delete it'
```

- [ ] **Step 2: Run it to verify it fails**

Run: `python tools/wp/box_checks.py snippets`
Expected: FAIL with `retired snippet 6 "CZERA box labels" still exists; delete it`.

- [ ] **Step 3: Delete snippets 6 and 7**

1. POST each with `{"active": false}`.
2. Then send `DELETE /wp-json/code-snippets/v1/snippets/6` and `/7`.
3. Confirm with GET `/wp-json/code-snippets/v1/snippets` that neither exists.

Also delete the files `tools/wp/live/czera-box-labels.php` and `tools/wp/live/czera-box-keyboard.php`.

- [ ] **Step 4: Run every check**

Run: `python tools/wp/box_checks.py all`
Expected: `plugins OK`, `product OK 210`, `rules OK`, `page OK (…)`, `snippets OK 5, <id>`, `cache OK`.

Then reload the live page and confirm:
- "Add box to bag" still reads that way (our own button);
- 2 × Bath + 1 × Black bathrobe still adds one box at 1,940 EGP, which you remove afterwards.

- [ ] **Step 5: Commit**

```bash
git add tools/wp/box_checks.py
git rm tools/wp/live/czera-box-labels.php tools/wp/live/czera-box-keyboard.php
git commit -F - <<'EOF'
chore: retire the snippets that patched the plugin's picker

Refs #49

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Records and handover

**Files:**
- Modify:
  - `docs/superpowers/specs/2026-10-16-wp-build-your-box-revision-design.md` (append "As built")
  - `docs/superpowers/specs/2026-10-16-wp-build-your-box-design.md` (§3.4 note)
  - `CHANGELOG.md` (the existing Build your box entry under `[Unreleased]`)

- [ ] **Step 1: Run every check once more**

Run: `python tools/wp/box_checks.py all` → all six checks print OK.

- [ ] **Step 2: Append "As built (revision 1)" to the revision spec**

Append this section to the revision spec, filling each value from Tasks 1–4:

```markdown
## As built (revision 1)

- Snippet 5 "CZERA box rules" now defines `czera_box_config()`: box 210, min 2, groups `8cdo` towels cap 6 [57, 60, 63, 66, 69, 72], `jt1j` bathrobes cap 2 [51, 54]. Cap messages come from the config ("Towels: up to 6 per box.", "Bathrobes: up to 2 per box.").
- Snippet <id> "CZERA box builder" (global): shortcode `[czera_box_builder]`, product-page redirect (302 to /build-your-box/), and redirect back to /build-your-box/ after adding the box. Reference copy `tools/wp/live/czera-box-builder.php`.
- Page 74 holds one `core/shortcode` block, `[czera_box_builder]`. The Spectra intro is gone.
- Additional CSS block between the Build your box markers replaced with the static design (copy `tools/wp/live/build-your-box.css`).
- Snippets 6 "CZERA box labels" and 7 "CZERA box keyboard" deleted.
- Unchanged: WPC settings (cart and order display `yes_list`), LiteSpeed exclusions, box product 210.
- Checks: `box_checks.py all` OK on <date>; browser checks in Task 2 Step 6 and Task 3 Step 4 passed.
```

- [ ] **Step 3: Point the original spec at the revision**

In `docs/superpowers/specs/2026-10-16-wp-build-your-box-design.md`, add this line directly under the `### 3.4 The page` heading:

```markdown
> Superseded on 2026-10-16 by `2026-10-16-wp-build-your-box-revision-design.md` (our own picker following the static design). The text below describes the first build.
```

- [ ] **Step 4: Update the CHANGELOG entry**

In `CHANGELOG.md` under `## [Unreleased]`, replace the existing entry that starts "WordPress store (czeramaison.com): Build your box page." with:

```markdown
- WordPress store (czeramaison.com): Build your box page, in the CZERA design.
  Choose a colour to see its towel sizes, then towels and bathrobes; counts
  start at 0, up to 6 towels and 2 bathrobes in total, at least 2 items, and
  the price is the sum of the items. Your box lists each item with a remove
  button and a clear-selection button. The box reaches the bag as one line with
  its contents listed. The box rules are checked on the server, and the cart
  API is no longer cached. Live checks in `tools/wp/box_checks.py`.
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-10-16-wp-build-your-box-revision-design.md docs/superpowers/specs/2026-10-16-wp-build-your-box-design.md CHANGELOG.md
git commit -F - <<'EOF'
docs: record the Build your box revision as built

Refs #49

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

The controller pushes the branch, which updates PR #55, and updates the project memory.
