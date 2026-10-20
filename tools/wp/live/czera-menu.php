<?php
// Reference copy of live Code Snippet ID 10 "CZERA menu" on czeramaison.com (scope: global).
// The site database is authoritative; update both together.

/**
 * CZERA menu: the header's Menu button and the slide-in menu panel (design.md §6.1), the site's only
 * primary nav at every width. The button sits in Astra's HTML 1 header element (primary row, left, on
 * desktop and mobile; see tools/wp/live/astra-header.md). HTML 1 stores a plain "Shop" link, so the
 * header still works with this snippet off; with it on, a filter on Astra's option swaps that for
 * the [czera_menu_toggle] shortcode. The panel, its backdrop and its script are printed once on
 * wp_footer, only on pages whose header printed the button (never on the coming-soon page), so they
 * are children of <body>: while the panel is open, every other child of <body> is inert. The nav
 * lists the top level of the "primary" menu location (the "Main menu", ID 21) as one flat list. An
 * item with the CSS class czera-menu-feature (Build Your Own Box) is the featured one: gold, with a
 * line gift box (design.md §6.1, amahallawy/czera#105). Its look is the "Site menu" Additional CSS block.
 */

if ( ! function_exists( 'czera_menu_items' ) ) {
	/** The primary menu's top-level items, with WordPress's current-item flags set. */
	function czera_menu_items() {
		$locations = get_nav_menu_locations();
		$menu      = ! empty( $locations['primary'] ) ? $locations['primary'] : 21;
		$items     = wp_get_nav_menu_items( $menu );
		if ( ! $items ) {
			return [];
		}
		if ( function_exists( '_wp_menu_item_classes_by_context' ) ) {
			_wp_menu_item_classes_by_context( $items );
		}
		return array_filter( $items, function ( $item ) {
			return 0 === (int) $item->menu_item_parent;
		} );
	}
}

if ( ! function_exists( 'czera_menu_gift_icon' ) ) {
	/** The featured item's line gift box, as the static showroom draws it (decorative). */
	function czera_menu_gift_icon() {
		return '<svg class="czera-site-menu__icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true" focusable="false"><path d="M4 11h16v9H4zM3 7.5h18V11H3zM12 7.5V20"/><path d="M12 7.5C10.5 4.5 7.5 4 7.5 6s2.5 1.5 4.5 1.5zM12 7.5c1.5-3 4.5-3.5 4.5-1.5S14 7.5 12 7.5z"/></svg>';
	}
}

// HTML 1 is the Menu button's slot: on the front end its stored fallback link becomes the shortcode.
add_filter( 'astra_get_option_header-html-1', function ( $value ) {
	return is_admin() ? $value : '[czera_menu_toggle]';
} );

// The Menu button, as the static showroom draws it: an icon and a small-caps "Menu" label. It marks
// the page, so wp_footer prints the panel only where there is a button to open it.
add_shortcode( 'czera_menu_toggle', function () {
	$GLOBALS['czera_menu_toggle_printed'] = true;
	return '<button class="czera-menu-toggle" type="button" data-czera-menu-toggle aria-label="Open menu" aria-expanded="false" aria-controls="czera-site-menu">'
		. '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true" focusable="false"><path d="M4 8h16M4 12h9M4 16h16"/></svg>'
		. '<span class="czera-menu-toggle__label">Menu</span></button>';
} );

add_action( 'wp_footer', function () {
	if ( is_admin() || empty( $GLOBALS['czera_menu_toggle_printed'] ) ) {
		return;
	}
	$items = czera_menu_items();
	?>
<div class="czera-site-menu-backdrop" data-czera-menu-backdrop aria-hidden="true" hidden></div>
<div id="czera-site-menu" class="czera-site-menu" data-czera-menu role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true" hidden>
	<div class="czera-site-menu__head"><button class="czera-site-menu__close" type="button" data-czera-menu-close aria-label="Close menu">&times;</button></div>
	<nav class="czera-site-menu__nav" aria-label="Primary"><ul class="czera-site-menu__list">
	<?php
	foreach ( $items as $item ) :
		$is_feature = in_array( 'czera-menu-feature', (array) $item->classes, true );
		$label      = esc_html( $item->title );
		?>
		<li><a class="czera-site-menu__link<?php echo $is_feature ? ' czera-site-menu__link--feature' : ''; ?>" href="<?php echo esc_url( $item->url ); ?>"<?php echo empty( $item->current ) ? '' : ' aria-current="page"'; ?>><?php echo $is_feature ? '<span>' . $label . '</span>' . czera_menu_gift_icon() : $label; // phpcs:ignore WordPress.Security.EscapeOutput -- the label is escaped above; the icon is a fixed string. ?></a></li>
	<?php endforeach; ?>
	</ul></nav>
</div>
<script>
(function () {
	const menu = document.querySelector('[data-czera-menu]');
	const backdrop = document.querySelector('[data-czera-menu-backdrop]');
	if (!menu || !backdrop || menu.dataset.ready) return;
	menu.dataset.ready = '1';
	const closeButton = menu.querySelector('[data-czera-menu-close]');
	// Astra prints the header twice (desktop and mobile; CSS shows one), so there are two Menu buttons.
	const toggles = () => Array.from(document.querySelectorAll('[data-czera-menu-toggle]'));
	const isOpen = () => menu.classList.contains('is-open');
	let opener = null;

	// Everything else on the page is inert while the menu is open, so Tab and screen readers stay
	// inside it.
	let inerted = [];
	function setBackground(on) {
		if (!on) { inerted.forEach(el => { el.inert = false; }); inerted = []; return; }
		inerted = Array.from(document.body.children).filter(el => el !== menu && el !== backdrop && !el.inert);
		inerted.forEach(el => { el.inert = true; });
	}
	// One pending hide at a time: a quick close, reopen, close must not let the first close's timer
	// hide the panel mid-slide.
	let hideTimer;
	let onEnd;
	const cancelHide = () => {
		clearTimeout(hideTimer);
		if (onEnd) menu.removeEventListener('transitionend', onEnd);
		onEnd = null;
	};

	function openMenu(from) {
		// Astra's bag drawer and the menu never show together: close the bag first.
		const drawer = document.querySelector('.astra-cart-drawer.active');
		if (drawer || document.documentElement.classList.contains('ast-mobile-cart-active')) {
			const close = (drawer || document).querySelector('.astra-cart-drawer-close');
			if (close) close.click();
		}
		cancelHide();
		opener = from;
		menu.hidden = false;
		backdrop.hidden = false;
		// Flush layout so the slide runs from the start position.
		void menu.offsetHeight;
		menu.classList.add('is-open');
		backdrop.classList.add('is-open');
		menu.setAttribute('aria-hidden', 'false');
		toggles().forEach(t => t.setAttribute('aria-expanded', 'true'));
		document.body.classList.add('czera-menu-open');
		setBackground(true);
		closeButton.focus();
	}

	function closeMenu() {
		menu.classList.remove('is-open');
		backdrop.classList.remove('is-open');
		menu.setAttribute('aria-hidden', 'true');
		toggles().forEach(t => t.setAttribute('aria-expanded', 'false'));
		document.body.classList.remove('czera-menu-open');
		setBackground(false);
		// Hide once the slide-out has finished, so screen readers skip the panel and its shadow is not
		// drawn. With no transition (reduced motion) hide at once; the timeout covers a transitionend
		// that never arrives.
		cancelHide();
		const hide = () => {
			cancelHide();
			if (!isOpen()) {
				menu.hidden = true;
				backdrop.hidden = true;
			}
		};
		onEnd = e => { if (e.target === menu && e.propertyName === 'transform') hide(); };
		const duration = parseFloat(getComputedStyle(menu).transitionDuration) || 0;
		if (duration === 0) {
			hide();
		} else {
			menu.addEventListener('transitionend', onEnd);
			hideTimer = setTimeout(hide, duration * 1000 + 100);
		}
		// Back to the button that opened the menu, or the one on show if the layout has changed.
		const back = opener && opener.offsetParent ? opener : toggles().find(t => t.offsetParent);
		if (back) back.focus();
	}

	document.addEventListener('click', e => {
		const toggle = e.target.closest ? e.target.closest('[data-czera-menu-toggle]') : null;
		if (toggle && !isOpen()) openMenu(toggle);
	});
	closeButton.addEventListener('click', closeMenu);
	backdrop.addEventListener('click', closeMenu);
	// A link closes the panel as it navigates (an anchor on the same page included).
	menu.addEventListener('click', e => {
		if (e.target.closest('a[href]') && isOpen()) closeMenu();
	});

	// Esc closes the menu; Tab stays inside it where `inert` is not supported.
	document.addEventListener('keydown', e => {
		if (!isOpen()) return;
		if (e.key === 'Escape') { closeMenu(); return; }
		if (e.key === 'Tab' && !('inert' in HTMLElement.prototype)) {
			const f = Array.from(menu.querySelectorAll('button, a[href]'));
			const first = f[0], last = f[f.length - 1];
			if (!menu.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
			else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
		}
	});
})();
</script>
	<?php
} );
