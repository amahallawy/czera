<?php
// Reference copy of live Code Snippet ID 22"CZERA SEO" on czeramaison.com (scope: global).
// The site database is authoritative; update both together. Added by amahallawy/czera#157.

/**
 * CZERA SEO: invisible search-readiness additions for the store (#157). Nothing here changes what a
 * visitor sees.
 *
 * - Every Product in Rank Math's JSON-LD names CZERA as its brand. Free Rank Math can't set a fixed
 *   brand, and WooCommerce Brands would print "Brand: CZERA" on each product page.
 */

// ---------------------------------------------------------------------------------------------------
// Product schema. The entity is the Product node Rank Math is about to print.
add_filter( 'rank_math/snippet/rich_snippet_product_entity', function ( $entity ) {
	$entity['brand'] = [
		'@type' => 'Brand',
		'name'  => 'CZERA',
	];
	return $entity;
} );
