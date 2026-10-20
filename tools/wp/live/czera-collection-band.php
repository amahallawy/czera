<?php
// Reference copy of live Code Snippet ID 11 "CZERA collection band" on czeramaison.com (scope: front-end).
// The site database is authoritative; update both together. Added by amahallawy/czera#91.

/**
 * CZERA collection band: the Build-your-box band after the product grid on the shop page and every
 * product-category page (design.md §5.4 and §6.15; catalog.html's band after the last card). It is
 * printed on woocommerce_after_shop_loop at priority 20, after the grid and its pagination (priority
 * 10), inside the content column beside the filter sidebar; and on woocommerce_no_products_found, so
 * an empty category still ends on it. Nowhere else: not on single products, the cart or checkout.
 *
 * It reuses the Home band's classes (czera-box-band, czera-box-copy, czera-box-title, czera-box-lede,
 * czera-btn-gold, czera-box-media), so the "Build your own box band" Additional CSS block draws it;
 * the "Collection band (czera#91)" block makes it the compact version the static collection uses.
 * Copy: the design's, in the client's words (amahallawy/czera#105): the title "Build Your Own Box", the
 * client's line and a "Create your box" button, with no eyebrow; the photo is the Home band's
 * (attachment 34).
 */

if ( ! function_exists( 'czera_collection_band' ) ) {
	function czera_collection_band() {
		static $printed = false;
		if ( $printed || ! function_exists( 'is_shop' ) || ! ( is_shop() || is_product_category() ) ) {
			return;
		}
		$printed = true;
		$image   = wp_get_attachment_image( 34, 'large', false, [ 'alt' => '', 'loading' => 'lazy' ] );
		?>
		<section class="czera-box-band czera-collection-band" aria-labelledby="czera-collection-band-title">
			<div class="czera-box-copy">
				<h2 class="czera-box-title" id="czera-collection-band-title"><?php echo esc_html( 'Build Your Own Box' ); ?></h2>
				<p class="czera-box-lede"><?php echo esc_html( 'Create a gift that feels personal. Choose your towels, select your preferred options, and complete your CZERA experience with our signature gift box.' ); ?></p>
				<div class="wp-block-button"><a class="wp-block-button__link wp-element-button czera-btn-gold" href="<?php echo esc_url( home_url( '/build-your-box/' ) ); ?>"><?php echo esc_html( 'Create your box' ); ?></a></div>
			</div>
			<?php if ( $image ) : ?>
				<div class="czera-box-media"><figure class="czera-box-media__img"><?php echo $image; // phpcs:ignore WordPress.Security.EscapeOutput -- built by wp_get_attachment_image(). ?></figure></div>
			<?php endif; ?>
		</section>
		<?php
	}
}

add_action( 'woocommerce_after_shop_loop', 'czera_collection_band', 20 );
add_action( 'woocommerce_no_products_found', 'czera_collection_band', 20 );
