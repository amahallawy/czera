<?php
// Reference copy of live Code Snippet ID 9 "CZERA bag" on czeramaison.com (scope: global).
// The site database is authoritative; update both together.

/**
 * CZERA bag: product buttons say "Add to bag", and every add to the bag shows the CZERA toast.
 * The buttons' own text, aria-label and name come from WooCommerce here, so the collection pages
 * no longer draw the label in CSS. The toast is printed once per page on wp_footer and defines
 * window.czeraToast(text); WooCommerce's AJAX add (the added_to_cart event) calls it, and the box
 * builder (snippet 8) calls it after a box add. Its look is the "Bag toast" Additional CSS block.
 */

if ( ! function_exists( 'czera_bag_wording' ) ) {
	/** Whether a product's add button gets the CZERA wording: purchasable, in stock, not the box. */
	function czera_bag_wording( $product ) {
		if ( ! $product instanceof WC_Product || ! $product->is_purchasable() || ! $product->is_in_stock() ) {
			return false;
		}
		return ! function_exists( 'czera_box_config' ) || $product->get_id() !== (int) czera_box_config()['box_id'];
	}
}

// "Add to cart" becomes "Add to bag"; other texts ("Read more", "Select options") stay as they are.
foreach ( [ 'woocommerce_product_add_to_cart_text', 'woocommerce_product_single_add_to_cart_text' ] as $czera_bag_hook ) {
	add_filter( $czera_bag_hook, function ( $text, $product = null ) {
		return __( 'Add to cart', 'woocommerce' ) === $text && czera_bag_wording( $product ) ? 'Add to bag' : $text;
	}, 10, 2 );
}

// The loop button's aria-label is its accessible name, so it says "bag" too.
add_filter( 'woocommerce_product_add_to_cart_description', function ( $text, $product = null ) {
	if ( czera_bag_wording( $product )
		&& sprintf( __( 'Add to cart: &ldquo;%s&rdquo;', 'woocommerce' ), $product->get_name() ) === $text ) {
		return sprintf( 'Add to bag: &ldquo;%s&rdquo;', $product->get_name() );
	}
	return $text;
}, 10, 2 );

// The toast announces the add, so WooCommerce's own "has been added to your cart" live message is
// left empty (its script skips an empty one); the button carries the name for the toast instead.
add_filter( 'woocommerce_product_add_to_cart_success_message', function ( $text, $product = null ) {
	return czera_bag_wording( $product ) ? '' : $text;
}, 10, 2 );

add_filter( 'woocommerce_loop_add_to_cart_args', function ( $args, $product = null ) {
	if ( $product instanceof WC_Product ) {
		$args['attributes']['data-product_name'] = $product->get_name();
	}
	return $args;
}, 10, 2 );

// After the footer scripts (priority 20), so jQuery and WooCommerce's add-to-cart script are there.
add_action( 'wp_footer', function () {
	if ( is_admin() || ! function_exists( 'wc_get_cart_url' ) ) {
		return;
	}
	?>
<div class="czera-toast" data-czera-toast role="status" hidden><span data-czera-toast-text></span> <button type="button" class="czera-toast__link" data-czera-toast-bag data-cart-url="<?php echo esc_url( wc_get_cart_url() ); ?>">View bag ›</button></div>
<script>
(function () {
	const toast = document.querySelector('[data-czera-toast]');
	if (!toast || window.czeraToast) return;
	const text = toast.querySelector('[data-czera-toast-text]');
	const toBag = toast.querySelector('[data-czera-toast-bag]');
	let shown = 0;
	// "View bag" presses the header's own Bag link, so Astra opens the same slide-in bag
	// (or, where Astra sends that link to the cart page, goes there too).
	toBag.addEventListener('click', () => {
		const link = Array.from(document.querySelectorAll('.ast-site-header-cart a.cart-container')).find(a => a.offsetParent);
		if (!link) {
			window.location.href = toBag.dataset.cartUrl;
			return;
		}
		link.click();
		toast.hidden = true;
	});
	// Shown 12px under the header as it is now, for 3.5 s. The text goes in a frame after the toast
	// is shown, so screen readers announce it. Called before load, it waits for load + 300 ms,
	// so the header has settled.
	function show(message) {
		const run = ++shown;
		const head = Array.from(document.querySelectorAll('#masthead .ast-primary-header-bar')).find(h => h.offsetHeight);
		if (head) toast.style.top = Math.max(0, head.getBoundingClientRect().bottom) + 12 + 'px';
		text.textContent = '';
		toast.hidden = false;
		requestAnimationFrame(() => { text.textContent = message; });
		// Never pull the toast out from under keyboard focus: wait until focus leaves it.
		const hide = () => {
			if (run !== shown) return;
			if (toast.contains(document.activeElement)) toast.addEventListener('focusout', hide, { once: true });
			else toast.hidden = true;
		};
		setTimeout(hide, 3500);
	}
	window.czeraToast = function (message) {
		if (document.readyState === 'complete') show(message);
		else window.addEventListener('load', () => setTimeout(() => show(message), 300), { once: true });
	};
	if (window.jQuery) {
		jQuery(document.body).on('added_to_cart', (e, fragments, hash, $button) => {
			const name = $button && $button.length ? String($button.data('product_name') || $button.attr('data-product_name') || '') : '';
			window.czeraToast(name ? `${name} added to your bag` : 'Added to your bag');
		});
	}
})();
</script>
	<?php
}, 99 );
