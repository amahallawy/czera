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
