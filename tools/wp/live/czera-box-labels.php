<?php
// Reference copy of live Code Snippet ID 6 "CZERA box labels" on czeramaison.com (scope: global).
// The site database is authoritative; update both together.

/**
 * CZERA box labels: the Build your box product (ID 210) says "Add box to bag".
 * The composite plugin overrides single_add_to_cart_text() and runs its own
 * wooco_product_single_add_to_cart_text filter, so both filters are hooked.
 * Any other product keeps its original label.
 */
$czera_box_label = static function ( $text, $product = null ) {
	if ( $product instanceof WC_Product && 210 === $product->get_id() ) {
		return 'Add box to bag';
	}
	return $text;
};
add_filter( 'woocommerce_product_single_add_to_cart_text', $czera_box_label, 20, 2 );
add_filter( 'wooco_product_single_add_to_cart_text', $czera_box_label, 20, 2 );
