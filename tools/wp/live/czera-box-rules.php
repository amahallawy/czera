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
 */
add_filter( 'woocommerce_add_to_cart_validation', function ( $passed, $product_id, $quantity = 1, $variation_id = 0, $variations = [], $cart_item_data = [] ) {
	$box_id = 210;
	if ( ! $passed || (int) $product_id !== $box_id ) {
		return $passed;
	}
	// Component key => the products it may hold.
	$groups = [
		'8cdo' => [ 57, 60, 63, 66, 69, 72 ], // Towels
		'jt1j' => [ 51, 54 ],                 // Bathrobes
	];
	$ids = '';
	if ( ! empty( $_REQUEST['wooco_ids'] ) ) {
		$ids = sanitize_text_field( wp_unslash( $_REQUEST['wooco_ids'] ) );
	} elseif ( is_array( $cart_item_data ) && isset( $cart_item_data['wooco_ids'] ) ) {
		$ids = sanitize_text_field( (string) $cart_item_data['wooco_ids'] );
	}
	$ids = ( class_exists( 'WPCleverWooco_Helper' ) && method_exists( 'WPCleverWooco_Helper', 'clean_ids' ) )
		? WPCleverWooco_Helper::clean_ids( $ids )
		: preg_replace( '/[^,.%\/0-9a-zA-Z]/', '', $ids );
	$t = 0;
	$r = 0;
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
		if ( ! isset( $groups[ $key ] ) || ! in_array( $id, $groups[ $key ], true ) ) {
			wc_add_notice( 'This box can only hold CZERA towels and bathrobes.', 'error' );
			return false;
		}
		if ( '8cdo' === $key ) {
			$t += $qty;
		} else {
			$r += $qty;
		}
	}
	if ( $t > 6 ) {
		wc_add_notice( 'Towels: up to 6 per box.', 'error' );
		return false;
	}
	if ( $r > 2 ) {
		wc_add_notice( 'Bathrobes: up to 2 per box.', 'error' );
		return false;
	}
	if ( $t + $r < 2 ) {
		wc_add_notice( 'Add at least 2 items to your box.', 'error' );
		return false;
	}
	return $passed;
}, 20, 6 );
