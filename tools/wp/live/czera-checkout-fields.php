<?php
// Reference copy of live Code Snippet ID 16 "CZERA checkout fields" on czeramaison.com (scope: global).
// The site database is authoritative; update both together. Added by amahallawy/czera#111.

/**
 * CZERA checkout fields: Egyptian addresses have no postcode in everyday use, so checkout hides the
 * postcode for Egypt instead of requiring one (WooCommerce requires it by default, which blocked the
 * first test order). Works for the block checkout too, which reads the same country locale. The
 * phone field is required through WooCommerce's own setting (Customizer > WooCommerce > Checkout),
 * since the sales team calls every customer to confirm.
 */

add_filter( 'woocommerce_get_country_locale', function ( $locale ) {
	$locale['EG']['postcode'] = [
		'required' => false,
		'hidden'   => true,
	];
	return $locale;
} );
