<?php
// Reference copy of live Code Snippet ID 8 "CZERA box builder" on czeramaison.com (scope: global).
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
	// The page shows this shopper's notices after post, redirect, get, so LiteSpeed must not cache it:
	// a cached copy would replay an old "added" notice or hide a new one.
	do_action( 'litespeed_control_set_nocache', 'czera box builder' );
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
