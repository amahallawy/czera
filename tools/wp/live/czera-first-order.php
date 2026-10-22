<?php
// Reference copy of live Code Snippet ID 17 "CZERA first order and sale" on czeramaison.com (scope: global).
// The site database is authoritative; update both together.

/**
 * CZERA first order and sale (#123), following the static design (design.md §6.11–6.11b).
 *
 * First-order code: the WooCommerce coupon whose meta czera_first_order is "yes" drives the top line on
 * every page and the code block in the slide-in bag. The wording is the design's; the code and percent
 * come from the coupon, so the text never drifts from the real code and disappears when the coupon is
 * off, expired or used up. The coupon itself carries the rules (percent, individual use, sale items
 * included, one use per customer, checked at checkout).
 *
 * Sale: a product's own WooCommerce sale price. The badge reads "Sale", screen readers hear "Was …, now
 * …", the menu's Sale item (class czera-menu-sale) shows only while something is on sale, and the shop
 * sidebar's Sale filter ([czera_sale_filter], ?sale=1) keeps only the products on sale.
 */

if ( ! function_exists( 'czera_first_order_coupon' ) ) {
	/** The live first-order coupon, or null when there is none, or it is off, expired or used up. */
	function czera_first_order_coupon() {
		static $coupon = false;
		if ( false !== $coupon ) {
			return $coupon;
		}
		$coupon = null;
		if ( ! class_exists( 'WC_Coupon' ) ) {
			return null;
		}
		$ids = get_posts( [
			'post_type'   => 'shop_coupon',
			'post_status' => 'publish',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => 'czera_first_order', // phpcs:ignore WordPress.DB.SlowDBQuery -- a handful of coupons.
			'meta_value'  => 'yes', // phpcs:ignore WordPress.DB.SlowDBQuery
		] );
		if ( ! $ids ) {
			return null;
		}
		$found   = new WC_Coupon( $ids[0] );
		$expires = $found->get_date_expires();
		if ( 'percent' !== $found->get_discount_type()
			|| ( $expires && $expires->getTimestamp() < time() )
			|| ( $found->get_usage_limit() && $found->get_usage_count() >= $found->get_usage_limit() ) ) {
			return null;
		}
		$coupon = $found;
		return $coupon;
	}
}

if ( ! function_exists( 'czera_first_order_text' ) ) {
	/** [ 'code' => 'WELCOME10', 'percent' => '10' ] for the live coupon, or null. */
	function czera_first_order_text() {
		$coupon = czera_first_order_coupon();
		if ( ! $coupon ) {
			return null;
		}
		return [
			'code'    => strtoupper( $coupon->get_code() ),
			'percent' => wc_format_localized_decimal( (float) $coupon->get_amount() ),
		];
	}
}

// ---------------------------------------------------------------------------------------------------
// Top line: the first child of the site header, on every page. Closing it is remembered per code
// (localStorage czera.promo.v1, as on the design site), so a new code shows it again. The script after
// it removes it before paint when it was closed, so cached pages never flash it.
add_action( 'astra_masthead_top', function () {
	$text = czera_first_order_text();
	if ( ! $text ) {
		return;
	}
	?>
<div class="czera-promo" data-czera-promo data-code="<?php echo esc_attr( $text['code'] ); ?>">
	<p class="czera-promo__text">First order · <b><?php echo esc_html( $text['percent'] ); ?>% off</b> with code <b><?php echo esc_html( $text['code'] ); ?></b></p>
	<button type="button" class="czera-promo__close" data-czera-promo-close aria-label="Close offer"><span aria-hidden="true">×</span></button>
</div>
<script>
(function () {
	var line = document.currentScript.previousElementSibling;
	var root = document.documentElement;
	try {
		if (localStorage.getItem('czera.promo.v1') === line.dataset.code) { line.remove(); return; }
	} catch (e) { /* storage blocked: the line shows, and closing it lasts for this page */ }
	root.classList.add('czera-promo-on');
	// The line wraps on phones and at large text sizes; the Home hero moves down by its real height.
	var measure = function () { root.style.setProperty('--czera-promo-h', line.offsetHeight + 'px'); };
	measure();
	var observer = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
	if (observer) observer.observe(line); else window.addEventListener('resize', measure);
	line.querySelector('[data-czera-promo-close]').addEventListener('click', function () {
		try { localStorage.setItem('czera.promo.v1', line.dataset.code); } catch (e) { /* see above */ }
		if (observer) observer.disconnect();
		var toggle = Array.prototype.find.call(document.querySelectorAll('[data-czera-menu-toggle]'), function (b) { return b.offsetParent; });
		if (toggle) toggle.focus();
		line.remove();
		root.classList.remove('czera-promo-on');
		root.style.setProperty('--czera-promo-h', '0px');
		window.dispatchEvent(new Event('resize'));
	});
})();
</script>
	<?php
} );

// ---------------------------------------------------------------------------------------------------
// The code in the bag: the note, a field with Apply (or the applied code with Remove), then Subtotal /
// First order −10% / Total. It is part of the mini cart, so WooCommerce's fragments re-render it after
// every change. The subtotal line WooCommerce prints is replaced by these rows.
add_action( 'init', function () {
	remove_action( 'woocommerce_widget_shopping_cart_total', 'woocommerce_widget_shopping_cart_subtotal', 10 );
}, 20 );

if ( ! function_exists( 'czera_bag_coupon_label' ) ) {
	/** "First order −10%" for the first-order coupon, else "Code ABC −10%" / "Code ABC". */
	function czera_bag_coupon_label( $code ) {
		$coupon = new WC_Coupon( $code );
		$first  = czera_first_order_coupon();
		$off    = 'percent' === $coupon->get_discount_type()
			? ' −' . wc_format_localized_decimal( (float) $coupon->get_amount() ) . '%'
			: '';
		if ( $first && wc_format_coupon_code( $first->get_code() ) === wc_format_coupon_code( $code ) ) {
			return 'First order' . $off;
		}
		return 'Code ' . strtoupper( $code ) . $off;
	}
}

add_action( 'woocommerce_widget_shopping_cart_before_buttons', function () {
	$cart = WC()->cart;
	if ( ! $cart ) {
		return;
	}
	$text    = czera_first_order_text();
	$applied = $cart->get_applied_coupons();
	$code    = $applied ? strtoupper( reset( $applied ) ) : '';
	$nonce   = wp_create_nonce( 'czera-bag-code' );
	$url     = WC_AJAX::get_endpoint( 'czera_bag_code' );

	if ( $text || $applied ) :
		?>
<form class="czera-bag-code" data-czera-code-form data-url="<?php echo esc_url( $url ); ?>" data-nonce="<?php echo esc_attr( $nonce ); ?>" novalidate>
		<?php if ( $text ) : ?>
	<p class="czera-bag-code__note" id="czera-bag-code-note"><b>First order?</b> Enter <?php echo esc_html( $text['code'] ); ?> for <?php echo esc_html( $text['percent'] ); ?>% off.</p>
		<?php endif; ?>
	<label class="czera-bag-code__label" for="czera-bag-code">Discount code</label>
	<div class="czera-bag-code__row">
		<?php if ( $applied ) : ?>
		<input id="czera-bag-code" name="code" type="text" value="<?php echo esc_attr( $code ); ?>" readonly aria-describedby="<?php echo $text ? 'czera-bag-code-note ' : ''; ?>czera-bag-code-error" />
		<button type="button" class="czera-bag-code__btn czera-bag-code__btn--text" data-czera-code-remove data-code="<?php echo esc_attr( $code ); ?>">Remove<span class="screen-reader-text"> code <?php echo esc_html( $code ); ?></span></button>
		<?php else : ?>
		<input id="czera-bag-code" name="code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-invalid="false" aria-describedby="<?php echo $text ? 'czera-bag-code-note ' : ''; ?>czera-bag-code-error" />
		<button type="submit" class="czera-bag-code__btn">Apply</button>
		<?php endif; ?>
	</div>
	<p class="czera-bag-code__error" id="czera-bag-code-error" role="status" data-czera-code-error></p>
</form>
		<?php
	endif;

	$subtotal = (float) $cart->get_displayed_subtotal();
	$discount = (float) $cart->get_discount_total() + ( $cart->display_prices_including_tax() ? (float) $cart->get_discount_tax() : 0 );
	if ( ! $applied || $discount <= 0 ) :
		?>
<div class="czera-bag-totals"><p class="czera-bag-totals__row czera-bag-totals__row--total"><span>Subtotal</span><b><?php echo wp_kses_post( wc_price( $subtotal ) ); ?></b></p></div>
		<?php
		return;
	endif;
	?>
<div class="czera-bag-totals">
	<p class="czera-bag-totals__row"><span>Subtotal</span><span><?php echo wp_kses_post( wc_price( $subtotal ) ); ?></span></p>
	<?php foreach ( $applied as $applied_code ) : ?>
	<p class="czera-bag-totals__row czera-bag-totals__row--saving"><span><?php echo esc_html( czera_bag_coupon_label( $applied_code ) ); ?></span><span>−<?php echo wp_kses_post( wc_price( $cart->get_coupon_discount_amount( $applied_code, ! $cart->display_prices_including_tax() ) ) ); ?></span></p>
	<?php endforeach; ?>
	<p class="czera-bag-totals__row czera-bag-totals__row--total"><span>Total</span><b><?php echo wp_kses_post( wc_price( max( 0, $subtotal - $discount ) ) ); ?></b></p>
</div>
	<?php
} );

// Apply or remove the code from the bag. Any failure reads "That code isn't valid." (the design's line);
// WooCommerce's own notices are cleared so they don't show up later on another page.
add_action( 'wc_ajax_czera_bag_code', function () {
	check_ajax_referer( 'czera-bag-code', 'security' );
	$cart = WC()->cart;
	$do   = isset( $_POST['do'] ) ? sanitize_key( wp_unslash( $_POST['do'] ) ) : 'apply';
	$code = isset( $_POST['code'] ) ? wc_format_coupon_code( wp_unslash( $_POST['code'] ) ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- wc_format_coupon_code sanitises.
	if ( ! $cart ) {
		wp_send_json( [ 'ok' => false, 'message' => "That code isn't valid." ] );
	}
	if ( 'remove' === $do ) {
		$cart->remove_coupon( $code );
		$cart->calculate_totals();
		wc_clear_notices();
		wp_send_json( [ 'ok' => true ] );
	}
	$ok = '' !== $code && ! $cart->is_empty() && $cart->apply_coupon( $code );
	$cart->calculate_totals();
	wc_clear_notices();
	wp_send_json( [ 'ok' => (bool) $ok, 'message' => $ok ? '' : "That code isn't valid." ] );
} );

// An emptied bag drops its code too, so the next bag starts without a discount.
add_action( 'woocommerce_cart_item_removed', function () {
	$cart = WC()->cart;
	if ( $cart && $cart->is_empty() && $cart->get_applied_coupons() ) {
		$cart->remove_coupons();
	}
} );

add_action( 'wp_footer', function () {
	if ( is_admin() ) {
		return;
	}
	?>
<script>
(function () {
	if (window.czeraBagCode) return;
	window.czeraBagCode = true;
	// The mini cart is replaced on every refresh, so the handlers are delegated and focus is put back
	// once WooCommerce reports the new fragments.
	var focusAfter = null;
	function refresh(target) {
		focusAfter = target;
		if (window.jQuery) jQuery(document.body).trigger('wc_fragment_refresh');
		else window.location.reload();
	}
	if (window.jQuery) {
		jQuery(document.body).on('wc_fragments_refreshed wc_fragments_loaded', function () {
			if (!focusAfter) return;
			var el = document.querySelector('.astra-cart-drawer ' + focusAfter) || document.querySelector(focusAfter);
			focusAfter = null;
			if (el) el.focus();
		});
	}
	function send(form, data) {
		var body = new URLSearchParams(data);
		body.set('security', form.dataset.nonce);
		return fetch(form.dataset.url, { method: 'POST', credentials: 'same-origin', body: body })
			.then(function (r) { return r.json(); })
			.catch(function () { return { ok: false, message: "That code isn't valid." }; });
	}
	document.addEventListener('submit', function (e) {
		var form = e.target.closest && e.target.closest('[data-czera-code-form]');
		if (!form) return;
		e.preventDefault();
		var input = form.querySelector('#czera-bag-code');
		var error = form.querySelector('[data-czera-code-error]');
		if (!input || input.readOnly) return;
		send(form, { do: 'apply', code: input.value }).then(function (res) {
			if (res && res.ok) { refresh('[data-czera-code-remove]'); return; }
			input.setAttribute('aria-invalid', 'true');
			error.textContent = '';
			setTimeout(function () { error.textContent = (res && res.message) || "That code isn't valid."; }, 50);
			input.focus();
		});
	});
	document.addEventListener('click', function (e) {
		var btn = e.target.closest && e.target.closest('[data-czera-code-remove]');
		if (!btn) return;
		var form = btn.closest('[data-czera-code-form]');
		send(form, { do: 'remove', code: btn.dataset.code }).then(function () { refresh('#czera-bag-code'); });
	});
	document.addEventListener('input', function (e) {
		if (e.target.id !== 'czera-bag-code' || e.target.getAttribute('aria-invalid') !== 'true') return;
		e.target.setAttribute('aria-invalid', 'false');
		var error = document.querySelector('[data-czera-code-error]');
		if (error) error.textContent = '';
	});
})();
</script>
	<?php
}, 30 );

// ---------------------------------------------------------------------------------------------------
// Sale: the badge reads "Sale" (no "!", no percentage), and screen readers hear "Was …, now …".
// Priority 20: Astra replaces the badge at 10 with its own "Sale!" circle.
add_filter( 'woocommerce_sale_flash', function () {
	return '<span class="onsale czera-sale-flag">Sale</span>';
}, 20 );

add_filter( 'gettext', function ( $translation, $text, $domain ) {
	if ( 'woocommerce' !== $domain ) {
		return $translation;
	}
	if ( 'Original price was: %s.' === $text ) {
		return 'Was %s,';
	}
	if ( 'Current price is: %s.' === $text ) {
		return 'now %s.';
	}
	return $translation;
}, 10, 3 );

if ( ! function_exists( 'czera_sale_ids' ) ) {
	/** IDs of the published products on sale (WooCommerce's cached list, variations' parents included). */
	function czera_sale_ids() {
		return array_values( array_filter( array_map( 'absint', wc_get_product_ids_on_sale() ) ) );
	}
}

// The menu's Sale item shows only while at least one product is on sale. Never filtered in wp-admin or
// the REST API, so editing the menu can never drop the item.
add_filter( 'wp_get_nav_menu_items', function ( $items ) {
	if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || ! function_exists( 'wc_get_product_ids_on_sale' ) ) {
		return $items;
	}
	if ( czera_sale_ids() ) {
		return $items;
	}
	return array_values( array_filter( $items, function ( $item ) {
		return ! in_array( 'czera-menu-sale', (array) $item->classes, true );
	} ) );
}, 20 );

if ( ! function_exists( 'czera_sale_filter_on' ) ) {
	/** Whether this request asks for the Sale filter and something is on sale. */
	function czera_sale_filter_on() {
		return isset( $_GET['sale'] ) && '1' === $_GET['sale'] && czera_sale_ids(); // phpcs:ignore WordPress.Security.NonceVerification -- a read-only filter link.
	}
}

// ?sale=1 on the shop and category pages keeps only the products on sale. With nothing on sale it is
// ignored, so an old link opens the full collection.
add_action( 'pre_get_posts', function ( $query ) {
	if ( is_admin() || ! $query->is_main_query() || ! function_exists( 'wc_get_product_ids_on_sale' ) || ! czera_sale_filter_on() ) {
		return;
	}
	if ( ! ( $query->is_post_type_archive( 'product' ) || $query->is_tax( get_object_taxonomies( 'product' ) ) ) ) {
		return;
	}
	$query->set( 'post__in', array_merge( [ 0 ], czera_sale_ids() ) );
} );

// The Sale filter in the shop sidebar, styled like the Colour filter: "On sale (n)", n counted within
// the category being shown. Clicking it again clears it.
add_shortcode( 'czera_sale_filter', function () {
	if ( ! function_exists( 'wc_get_product_ids_on_sale' ) ) {
		return '';
	}
	$ids = czera_sale_ids();
	if ( ! $ids ) {
		return '';
	}
	$args = [
		'post_type'      => 'product',
		'post_status'    => 'publish',
		'post__in'       => $ids,
		'fields'         => 'ids',
		'posts_per_page' => -1,
		'no_found_rows'  => true,
	];
	if ( is_product_taxonomy() ) {
		$term              = get_queried_object();
		$args['tax_query'] = [ [ 'taxonomy' => $term->taxonomy, 'field' => 'term_id', 'terms' => $term->term_id ] ]; // phpcs:ignore WordPress.DB.SlowDBQuery
	}
	$count  = count( get_posts( $args ) );
	$active = czera_sale_filter_on();
	$url    = $active ? remove_query_arg( [ 'sale', 'paged' ] ) : add_query_arg( 'sale', '1', remove_query_arg( 'paged' ) );
	$class  = 'woocommerce-widget-layered-nav-list__item wc-layered-nav-term' . ( $active ? ' woocommerce-widget-layered-nav-list__item--chosen chosen' : '' );
	return '<div class="czera-sale-filter"><h2 class="widget-title">Sale</h2>'
		. '<ul class="woocommerce-widget-layered-nav-list"><li class="' . esc_attr( $class ) . '">'
		. '<a rel="nofollow" href="' . esc_url( $url ) . '"' . ( $active ? ' aria-current="true"' : '' ) . '>'
		. '<span class="title">On sale</span> <span class="count">(' . (int) $count . ')</span></a></li></ul></div>';
} );
