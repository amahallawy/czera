<?php
// Reference copy of live Code Snippet ID 14 "CZERA card photo swap" on czeramaison.com (scope: front-end).
// The site database is authoritative; update both together. Added by amahallawy/czera#109.

/**
 * CZERA card photo swap: product cards fade to the product's second photo on hover, as the static
 * showroom's cards do (.card__img--alt in css/components.css). This snippet only adds the photo: the
 * first gallery image, after the main image inside the card's link, with the class
 * czera-card__img-alt. It is decorative (empty alt, aria-hidden) and lazy-loaded. The "Card photo
 * swap" Additional CSS block stacks it over the main photo and fades it in.
 *
 * Two card types:
 * - Shop-loop cards (collection pages, /shop/ and a product page's related products, through Astra):
 *   WC_Product::get_image() while a loop item is printing, so cart lines, the mini cart and the
 *   product gallery, which also call get_image(), are left alone.
 * - Home gift sets (woocommerce/product-image blocks with the class czera-card__media, inside the
 *   product collections): the block's rendered HTML, after its first <img>. Other product-image
 *   blocks are left alone, since only these cards have the CSS that hides the photo.
 */

if ( ! function_exists( 'czera_card_alt_image' ) ) {
	/** The product's first gallery photo as the hidden second card photo, or '' when it has none. */
	function czera_card_alt_image( $product, $size ) {
		if ( ! $product instanceof WC_Product ) {
			return '';
		}
		$ids = $product->get_gallery_image_ids();
		if ( empty( $ids ) ) {
			return '';
		}
		return wp_get_attachment_image(
			(int) $ids[0],
			$size,
			false,
			[
				'class'       => 'czera-card__img-alt',
				'alt'         => '',
				'aria-hidden' => 'true',
				'loading'     => 'lazy',
				'decoding'    => 'async',
			]
		);
	}
}

// Collection pages: only while a shop-loop item is printing.
add_action( 'woocommerce_before_shop_loop_item', function () {
	$GLOBALS['czera_card_in_loop'] = true;
}, 1 );
// Cleared after each item, and again after the whole loop and before the footer in case an item's
// closing hook never runs (a template override), so nothing later in the page is affected.
$czera_card_loop_end = function () {
	$GLOBALS['czera_card_in_loop'] = false;
};
add_action( 'woocommerce_after_shop_loop_item', $czera_card_loop_end, 99 );
add_action( 'woocommerce_after_shop_loop', $czera_card_loop_end, 99 );
add_action( 'wp_footer', $czera_card_loop_end, 0 );
add_filter( 'woocommerce_product_get_image', function ( $image, $product, $size ) {
	if ( is_admin() || empty( $GLOBALS['czera_card_in_loop'] ) ) {
		return $image;
	}
	return $image . czera_card_alt_image( $product, $size );
}, 10, 3 );

// Home gift sets: the product-image block in each product collection.
add_filter( 'render_block_woocommerce/product-image', function ( $content, $block, $instance ) {
	$class = isset( $block['attrs']['className'] ) ? (string) $block['attrs']['className'] : '';
	if ( is_admin() || empty( $instance->context['postId'] ) || false === strpos( $class, 'czera-card__media' ) ) {
		return $content;
	}
	$alt = czera_card_alt_image( wc_get_product( (int) $instance->context['postId'] ), 'large' );
	if ( '' === $alt ) {
		return $content;
	}
	return preg_replace_callback( '/<img\b[^>]*>/', function ( $m ) use ( $alt ) {
		return $m[0] . $alt;
	}, $content, 1 );
}, 10, 3 );
