<?php
// Reference copy of live Code Snippet ID 9 "CZERA bag" on czeramaison.com (scope: global).
// The site database is authoritative; update both together.

/**
 * CZERA bag: product buttons say "Add to bag", and every add to the bag shows the CZERA toast.
 * The buttons' own text, aria-label and name come from WooCommerce here, so the collection pages and
 * the Home gift sets no longer draw the label in CSS. The toast is printed once per page on wp_footer
 * and defines window.czeraToast(text); WooCommerce's AJAX add (the added_to_cart event) and the
 * product blocks' Store API add (wc-blocks_added_to_cart) call it, and the box builder (snippet 8)
 * calls it after a box add. Its look is the "Bag toast" Additional CSS block.
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

// WooCommerce's "%s in cart" string reads "Add to bag" wherever it is used. The product button block
// (Home gift sets) shows it once the product is in the bag; the CZERA buttons always read "Add to bag",
// as they did when CSS drew the label.
add_filter( 'gettext', function ( $translation, $text, $domain ) {
	return '%s in cart' === $text && 'woocommerce' === $domain ? 'Add to bag' : $translation;
}, 10, 3 );

// The toast announces each add, so the product blocks' cart store (which speaks this text through
// @wordpress/a11y, and skips it when empty) says nothing: one announcement per add, and none says "cart".
add_filter( 'script_module_data_@wordpress/interactivity', function ( $data ) {
	if ( isset( $data['config']['woocommerce']['messages']['addedToCartText'] ) ) {
		$data['config']['woocommerce']['messages']['addedToCartText'] = '';
	}
	return $data;
}, 20 );

// After the footer scripts (priority 20), so jQuery and WooCommerce's add-to-cart script are there.
add_action( 'wp_footer', function () {
	if ( is_admin() || ! function_exists( 'wc_get_cart_url' ) ) {
		return;
	}
	?>
<span class="czera-toast__sr" data-czera-toast-sr role="status"></span>
<div class="czera-toast" data-czera-toast hidden><span data-czera-toast-text></span> <button type="button" class="czera-toast__link" data-czera-toast-bag data-cart-url="<?php echo esc_url( wc_get_cart_url() ); ?>">View bag ›</button></div>
<script>
(function () {
	const toast = document.querySelector('[data-czera-toast]');
	if (!toast || window.czeraToast) return;
	const text = toast.querySelector('[data-czera-toast-text]');
	const sr = document.querySelector('[data-czera-toast-sr]');
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
		// Move focus into the bag (its close button, once the slide-in has made it visible), else onto
		// the header Bag link, then hide the toast: focus never falls back to the page.
		const started = Date.now();
		const settle = () => {
			const close = Array.from(document.querySelectorAll('.astra-cart-drawer.active .astra-cart-drawer-close'))
				.find(c => c.offsetParent && getComputedStyle(c).visibility === 'visible');
			if (!close && Date.now() - started < 1000) {
				setTimeout(settle, 50);
				return;
			}
			(close || link).focus();
			toast.hidden = true;
		};
		settle();
	});
	// Shown 12px under the header as it is now, for 3.5 s. Screen readers hear it from the status
	// region, which is always on the page: emptied, then filled 100 ms later, so a repeated message is
	// announced again. Called before load, it waits for load + 300 ms, so the header has settled.
	function show(message) {
		const run = ++shown;
		const head = Array.from(document.querySelectorAll('#masthead .ast-primary-header-bar')).find(h => h.offsetHeight);
		if (head) toast.style.top = Math.max(0, head.getBoundingClientRect().bottom) + 12 + 'px';
		text.textContent = message;
		toast.hidden = false;
		if (sr) {
			sr.textContent = '';
			setTimeout(() => { if (run === shown) sr.textContent = message; }, 100);
		}
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
	// One add, one toast, whichever event reports it. Without a name from the button, a product page
	// names its own product.
	let last = 0;
	const added = name => {
		const now = Date.now();
		if (now - last < 250) return;
		last = now;
		const title = document.querySelector('.product_title');
		name = name || (title ? title.textContent.trim() : '');
		window.czeraToast(name ? `${name} added to your bag` : 'Added to your bag');
	};
	if (window.jQuery) {
		jQuery(document.body).on('added_to_cart', (e, fragments, hash, $button) => {
			added($button && $button.length ? String($button.data('product_name') || $button.attr('data-product_name') || '') : '');
		});
	}
	// The product blocks add through the Store API and send no button with their event, so remember
	// the name on the button that was pressed.
	let pressed = '';
	document.addEventListener('click', e => {
		const b = e.target.closest ? e.target.closest('.wc-block-components-product-button__button') : null;
		if (b) pressed = b.getAttribute('data-product_name') || '';
	}, true);
	document.body.addEventListener('wc-blocks_added_to_cart', () => {
		const name = pressed;
		pressed = '';
		added(name);
	});
})();
</script>
	<?php
}, 99 );
