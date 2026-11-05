<?php
// Reference copy of live Code Snippet ID 22 "CZERA SEO" on czeramaison.com (scope: global).
// The site database is authoritative; update both together. Added by amahallawy/czera#157.

/**
 * CZERA SEO: invisible search-readiness additions for the store (#157, AgDR-0007). Nothing here
 * changes what a visitor sees.
 *
 * - Every Product in Rank Math's JSON-LD names CZERA as its brand, and carries the product's exact
 *   store name rather than its search title. Free Rank Math can't set a fixed brand, and
 *   WooCommerce Brands would print "Brand: CZERA" on each product page.
 * - No JSON-LD names an author: Rank Math's author Person node (the admin's /author/<slug>/ URL
 *   and Gravatar) and every "author" key are removed, and so is the "Written by" Slack label.
 *   The admin's login name stays private (#155). Pages keep their Organization, WebSite and
 *   WebPage nodes now that their default schema type is None.
 * - Rank Math 1.0.281 prints JSON-LD through wp_kses_post_deep(), which turns every "&" in a name
 *   into "&amp;" after all its filters have run. JSON is not HTML, so the printed script is decoded
 *   once: "&amp;" and "&#038;" become "&". Nothing else in it changes.
 */

// ---------------------------------------------------------------------------------------------------
// Product schema. The entity is the Product node Rank Math is about to print.
add_filter( 'rank_math/snippet/rich_snippet_product_entity', function ( $entity ) {
	// Overwrites any brand. If WooCommerce Brands is ever used, revisit this: the taxonomy's own
	// brand would then be the one to keep.
	$entity['brand'] = [
		'@type' => 'Brand',
		'name'  => 'CZERA',
	];

	// Rank Math's default name is %seo_title%, the search title with " | CZERA" on the end.
	$item   = null;
	$object = get_queried_object();
	if ( $object instanceof WP_Post && 'product' === $object->post_type && function_exists( 'wc_get_product' ) ) {
		$item = wc_get_product( $object->ID );
	}
	if ( ! $item && isset( $GLOBALS['product'] ) && $GLOBALS['product'] instanceof WC_Product ) {
		$item = $GLOBALS['product'];
	}
	if ( $item instanceof WC_Product ) {
		$entity['name'] = html_entity_decode( $item->get_name(), ENT_QUOTES, 'UTF-8' );
	}
	return $entity;
} );

// ---------------------------------------------------------------------------------------------------
// Author data. Runs after all of Rank Math's own json_ld filters.
add_filter( 'rank_math/json_ld', function ( $data ) {
	$clean = function ( $value ) use ( &$clean ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}
		$is_list = array_keys( $value ) === range( 0, count( $value ) - 1 );
		$out     = [];
		foreach ( $value as $key => $item ) {
			if ( 'author' === $key ) {
				continue;
			}
			if ( is_array( $item ) && isset( $item['@type'] ) && in_array( 'Person', (array) $item['@type'], true ) ) {
				$where = ( isset( $item['url'] ) ? $item['url'] : '' ) . ' ' . ( isset( $item['@id'] ) ? $item['@id'] : '' );
				if ( false !== strpos( $where, '/author/' ) ) {
					continue;
				}
			}
			$out[ $key ] = $clean( $item );
		}
		return $is_list ? array_values( $out ) : $out;
	};
	return is_array( $data ) ? $clean( $data ) : $data;
}, PHP_INT_MAX );

// Pages have no default schema type (Titles & Meta > Pages > Schema Type: None), which drops the
// Article and its author. Rank Math would then also drop the Organization, WebSite and WebPage
// nodes from those pages; this keeps them.
add_filter( 'rank_math/schema/add_global_entities', function ( $add ) {
	return is_singular( 'page' ) ? true : $add;
} );

// Rank Math's Slack preview line "Written by" on pages.
add_filter( 'rank_math/opengraph/slack_enhanced_data', function ( $data ) {
	unset( $data['Written by'] );
	return $data;
} );

// ---------------------------------------------------------------------------------------------------
// The printed JSON-LD. Rank Math echoes it on rank_math/head at priority 90; this buffers just that.
// The strings were already passed through kses, so no tag can appear by decoding the ampersand.
add_action( 'rank_math/head', function () {
	ob_start();
}, 89 );

add_action( 'rank_math/head', function () {
	$printed = ob_get_clean();
	if ( false === $printed ) {
		return;
	}
	echo preg_replace_callback( // phpcs:ignore WordPress.Security.EscapeOutput -- Rank Math's own output, re-printed.
		'#(<script type="application/ld\+json"[^>]*>)(.*?)(</script>)#s',
		function ( $m ) {
			return $m[1] . str_replace( [ '&amp;', '&#038;' ], '&', $m[2] ) . $m[3];
		},
		$printed
	);
}, 91 );
