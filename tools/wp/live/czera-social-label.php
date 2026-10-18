<?php
// Reference copy of live Code Snippet ID 12 "CZERA social label" on czeramaison.com (scope: front-end).
// The site database is authoritative; update both together. Added by amahallawy/czera#88.

/**
 * CZERA social label: names the Social Icons lists "CZERA on social media" for screen readers, as the
 * static design's <ul aria-label="CZERA on social media"> does (design.md §11). The core/social-links
 * block has no label attribute here, so a render_block filter adds aria-label to the block's <ul>, only
 * when its class list holds czera-footer__social (footer widget block-7) or czera-about-social (About
 * page, ID 75). Other Social Icons blocks, such as the coming-soon page's, are left as they are.
 */

if ( ! function_exists( 'czera_social_label' ) ) {
	function czera_social_label( $block_content ) {
		if ( ! is_string( $block_content ) || '' === $block_content || ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}
		$tags = new WP_HTML_Tag_Processor( $block_content );
		if ( ! $tags->next_tag( 'ul' ) ) {
			return $block_content;
		}
		if ( ! $tags->has_class( 'czera-footer__social' ) && ! $tags->has_class( 'czera-about-social' ) ) {
			return $block_content;
		}
		$tags->set_attribute( 'aria-label', 'CZERA on social media' );
		return $tags->get_updated_html();
	}
}

add_filter( 'render_block_core/social-links', 'czera_social_label', 10, 1 );
