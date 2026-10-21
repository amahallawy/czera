<?php
// Reference copy of live Code Snippet ID 13 "CZERA hero" on czeramaison.com (scope: global).
// The site database is authoritative; update both together. Added by amahallawy/czera#96; film everywhere and no reduced-motion poster since #119.

/**
 * CZERA hero: the Home hero film's play/pause button and its sign-off shade, as on the static
 * showroom (design.md §6.2). The hero is the Spectra container with the czera-hero class on the
 * Home page (ID 87); its background video is the 30s brand film (media 291), on every screen size
 * (#119: tablets and phones too; there is no tablet or phone poster any more). On the front page
 * only, a script printed on wp_footer:
 * - adds a quiet, icon-only round button over the film, named "Pause film" or "Play film" by state
 *   (WCAG 2.2.2), shown only while the film has a source for the current width;
 * - sets body.hero-signoff while the film plays its 24-30s ivory linen sign-off (from 0.6s before
 *   the cut, so the 600ms fade is full when the linen appears) and clears it when the film loops,
 *   so the header shade deepens behind MENU and BAG;
 * The film plays for every visitor, Reduce Motion included, with the button always there to pause it
 * (owner decision, 2026-10-21, #119).
 * It finds the film as the hero's Spectra background video, or failing that any video in the hero.
 * Anywhere the hero or its video is missing it does nothing. The button's look and the shade are
 * the "Hero film" Additional CSS block (tools/wp/live/hero-film.css).
 */

add_action( 'wp_footer', function () {
	if ( is_admin() || ! is_front_page() ) {
		return;
	}
	?>
<script>
( function () {
	var SIGNOFF_START = 24;
	var SIGNOFF_LEAD = 0.6;

	function init() {
		var hero = document.querySelector( '.czera-hero' );
		var video = hero && ( hero.querySelector( '.spectra-background-video__wrapper video' ) || hero.querySelector( 'video' ) );
		if ( ! video ) {
			return;
		}
		var button = document.createElement( 'button' );
		button.type = 'button';
		button.className = 'czera-hero-play';
		button.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">'
			+ '<path class="czera-hero-play__play" d="M4.5 2.5v11l9-5.5z" fill="currentColor"/>'
			+ '<path class="czera-hero-play__pause" d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>';
		hero.appendChild( button );

		function hasFilm() {
			var source = video.querySelector( 'source' );
			var src = source ? source.getAttribute( 'src' ) : video.getAttribute( 'src' );
			return Boolean( src ) && video.getClientRects().length > 0;
		}
		function setState() {
			var playing = ! video.paused;
			button.setAttribute( 'aria-label', playing ? 'Pause film' : 'Play film' );
			button.setAttribute( 'data-state', playing ? 'playing' : 'paused' );
		}
		function syncSignoff() {
			document.body.classList.toggle( 'hero-signoff',
				hasFilm() && video.currentTime >= SIGNOFF_START - SIGNOFF_LEAD );
		}
		function sync() {
			button.hidden = ! hasFilm();
			setState();
			syncSignoff();
		}
		function watchFrames() {
			syncSignoff();
			video.requestVideoFrameCallback( watchFrames );
		}

		button.addEventListener( 'click', function () {
			if ( video.paused ) {
				var playing = video.play();
				if ( playing && typeof playing.catch === 'function' ) {
					playing.catch( setState );
				}
			} else {
				video.pause();
			}
		} );
		[ 'play', 'pause', 'emptied', 'loadstart', 'loadeddata', 'seeked' ].forEach( function ( type ) {
			video.addEventListener( type, sync );
		} );
		if ( 'requestVideoFrameCallback' in video ) {
			video.requestVideoFrameCallback( watchFrames );
		} else {
			video.addEventListener( 'timeupdate', syncSignoff );
		}
		// Spectra swaps or drops the source when the width crosses a band (250ms debounce).
		var resizeTimer;
		window.addEventListener( 'resize', function () {
			clearTimeout( resizeTimer );
			resizeTimer = setTimeout( sync, 400 );
		} );
		sync();
	}

	// Run now: this script prints in the footer, after the hero.
	init();
}() );
</script>
	<?php
}, 30 );
