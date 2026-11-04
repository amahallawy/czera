<?php
// Reference copy of live Code Snippet ID 19 "CZERA security" on czeramaison.com (scope: global).
// The site database is authoritative; update both together. Added by amahallawy/czera#155.

/**
 * CZERA security: closes what the 2026-11-04 security review found on the store (AgDR-0006).
 *
 * - The admin's login name is not shown to visitors or customers: no REST users list, no author
 *   archives (and so no ?author=1 → /author/<slug>/ redirect), no author in oEmbed, and one wording
 *   for a wrong username or a wrong password at login. The lost-password forms still say when an
 *   account doesn't exist (#155).
 * - XML-RPC refuses username/password methods, which also empties system.multicall (hundreds of
 *   password guesses in one request) of any use, and drops pingbacks. The file itself stays
 *   reachable for Jetpack.
 * - Front-end pages send the standard security headers, and no X-Powered-By or generator tag says
 *   which PHP or WordPress version runs the site.
 * Login limiting and two-factor are not here: they need a plugin or Hostinger's setting (#155).
 */

// ---------------------------------------------------------------------------------------------------
// The login name. Only people who edit content keep the users endpoint (the block editor's author
// list reads it); a logged-in customer could otherwise list the admin's slug.
add_filter( 'rest_endpoints', function ( $endpoints ) {
	if ( current_user_can( 'edit_posts' ) ) {
		return $endpoints;
	}
	foreach ( array_keys( $endpoints ) as $route ) {
		if ( 0 === strpos( $route, '/wp/v2/users' ) ) {
			unset( $endpoints[ $route ] );
		}
	}
	return $endpoints;
} );

// Priority 1, before WordPress's canonical redirect (10) turns ?author=1 into /author/<slug>/.
add_action( 'template_redirect', function () {
	if ( is_author() || isset( $_GET['author'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification -- only read to send the visitor home.
		wp_safe_redirect( home_url( '/' ), 302 );
		exit;
	}
}, 1 );

add_filter( 'oembed_response_data', function ( $data ) {
	unset( $data['author_name'], $data['author_url'] );
	return $data;
} );

// WordPress (and WooCommerce's My account form, which signs in the same way) otherwise says "the
// username … is not registered" or "the password you entered for the username … is incorrect".
add_filter( 'authenticate', function ( $user ) {
	if ( is_wp_error( $user ) && array_intersect( $user->get_error_codes(), [ 'invalid_username', 'invalid_email', 'incorrect_password' ] ) ) {
		return new WP_Error( 'czera_login_failed', '<strong>Error:</strong> Wrong username or password.' );
	}
	return $user;
}, 99 );

// ---------------------------------------------------------------------------------------------------
// XML-RPC. With xmlrpc_enabled off, every username/password method answers 405 before checking the
// password, so system.multicall can no longer carry guesses (WordPress re-adds multicall itself after
// xmlrpc_methods, so it can't be removed here). Pingbacks go: they let the site be used to hit others.
add_filter( 'xmlrpc_enabled', '__return_false' );

add_filter( 'xmlrpc_methods', function ( $methods ) {
	unset( $methods['pingback.ping'], $methods['pingback.extensions.getPingbacks'] );
	return $methods;
} );

// ---------------------------------------------------------------------------------------------------
// Headers. wp_headers covers front-end pages; REST and wp-admin keep WordPress's own. HSTS has no
// includeSubDomains or preload: not every subdomain is known to serve HTTPS.
add_filter( 'wp_headers', function ( $headers ) {
	unset( $headers['X-Pingback'] );
	if ( is_ssl() ) {
		$headers['Strict-Transport-Security'] = 'max-age=31536000';
	}
	$headers['X-Content-Type-Options'] = 'nosniff';
	$headers['X-Frame-Options']        = 'SAMEORIGIN';
	$headers['Referrer-Policy']        = 'strict-origin-when-cross-origin';
	$headers['Permissions-Policy']     = 'camera=(), microphone=(), geolocation=(), usb=()';
	return $headers;
} );

// On init, so REST, admin-ajax and wc-ajax responses lose it too.
add_action( 'init', function () {
	if ( ! headers_sent() ) {
		header_remove( 'X-Powered-By' );
	}
} );

// The generator tag in the page head and the feeds (WooCommerce adds its version to the same tag).
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );
