<?php
// Reference copy of live Code Snippet ID 18 "CZERA returns policy" on czeramaison.com (scope: front-end).
// The site database is authoritative; update both together. Added by amahallawy/czera#151.

/**
 * CZERA returns policy (#151), following the static design (returns.html, js/pages/product.js).
 *
 * The policy itself is the page /returns-exchanges/ (page 12, WooCommerce's former "Refund and
 * Returns Policy" draft); the footer's Help column (widget block-7) links to it, and the checkout's
 * terms block (page 10) says placing an order accepts it. This snippet adds the rest:
 * - Product pages: "Returns and exchanges within 14 days on unused items. Read the policy" under
 *   the add-to-cart form, as the design's .pdp__returns line.
 * - The styles for that line and for the policy page (one reading column, numbered gold headings,
 *   the closing tagline in Italiana), as the design's css/pages/returns.css.
 */

if ( ! defined( 'CZERA_RETURNS_PAGE_ID' ) ) {
	define( 'CZERA_RETURNS_PAGE_ID', 12 );
}

add_action( 'woocommerce_single_product_summary', function () {
	$url = get_permalink( CZERA_RETURNS_PAGE_ID );
	if ( ! $url ) {
		return;
	}
	printf(
		'<p class="czera-pdp-returns">%s <a href="%s">%s</a></p>',
		esc_html__( 'Returns and exchanges within 14 days on unused items.', 'czera' ),
		esc_url( $url ),
		esc_html__( 'Read the policy', 'czera' )
	);
}, 31 ); // Right after the add-to-cart form (30).

add_action( 'wp_head', function () {
	if ( ! is_product() && ! is_page( CZERA_RETURNS_PAGE_ID ) ) {
		return;
	}
	?>
<style id="czera-returns">
.czera-pdp-returns { margin: 12px 0 0; font-size: 12px; line-height: 1.5; color: #6b6b6b; }
.czera-pdp-returns a { color: #2b2b2b; text-decoration: underline; text-underline-offset: 2px; }
.czera-pdp-returns a:hover, .czera-pdp-returns a:focus-visible { color: #010100; }
/* Policy page: as the design's returns.html + css/pages/returns.css (Astra title, box and sidebar are off on page 12). */
body .czera-policy { box-sizing: border-box; max-width: 720px; margin: 0 auto; padding: clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px);
  font-family: Montserrat, sans-serif; font-size: 15px; line-height: 1.65; color: #2b2b2b; }
body .czera-policy__head { padding-bottom: 32px; margin-bottom: 32px; border-bottom: 1px solid #d8c28a; }
body .czera-policy__eyebrow { display: block; font-size: 11px; font-weight: 500; line-height: 1.5; letter-spacing: 0.18em;
  text-transform: uppercase; color: #8a5c12; }
body .czera-policy .czera-policy__title { margin: 8px 0 16px; font-family: inherit; font-size: 38px; font-weight: 300;
  line-height: 1.1; letter-spacing: -0.025em; color: #010100; }
body .czera-policy .czera-policy__lede { margin: 0; font-size: 17px; }
body .czera-policy h2 { margin: 32px 0 12px; font-family: inherit; font-size: 21px; font-weight: 400; line-height: 1.2;
  letter-spacing: 0; color: #010100; }
body .czera-policy .czera-policy__head + h2 { margin-top: 0; }
body .czera-policy__num { color: #8a5c12; }
body .czera-policy p, body .czera-policy ul { margin: 0 0 12px; }
body .czera-policy ul { padding-left: 24px; list-style: disc; }
body .czera-policy li + li { margin-top: 4px; }
body .czera-policy__close { margin-top: 48px; padding-top: 32px; border-top: 1px solid #d8c28a; text-align: center; }
body .czera-policy__close p { margin: 0; }
body .czera-policy .czera-policy__tagline { margin-top: 8px; font-family: "Italiana", serif; font-size: 28px; font-weight: 400; color: #8a5c12; }
</style>
	<?php
} );
