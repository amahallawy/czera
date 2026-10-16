<?php
// Reference copy of live Code Snippet ID 7 "CZERA box keyboard" on czeramaison.com (scope: front-end).
// The site database is authoritative; update both together.

/**
 * CZERA box keyboard: makes the Build your box picker (page 74) usable by keyboard and screen reader.
 * - Each item's photo becomes a checkbox (tabindex 0, role checkbox, aria-checked synced with the
 *   plugin's wooco_item_selected class, aria-label "name, size, price"). Enter / Space clicks it, which runs
 *   the plugin's own click handler on .wooco_component_product_selection_item (the click bubbles up;
 *   the plugin ignores clicks inside the qty area and on links, so the photo is used, not the card).
 *   The checkbox is the photo rather than the whole card because a checkbox's children are
 *   presentational in ARIA, and the qty controls inside the card must stay exposed.
 * - The - / + links get names ("Remove one Bath Towel" / "Add one Bath Towel"); they and the qty
 *   field leave the Tab order while their item is not selected (the plugin ignores them then).
 *   Astra adds those links by script, so the observer also watches the item's subtree.
 * - The reason box and the total are polite live regions.
 * - The add button mirrors the plugin's wooco-disabled class as aria-disabled="true" (the plugin only
 *   blocks the click). The real disabled attribute is not used, so the button stays focusable.
 */
add_action( 'wp_footer', static function () {
	if ( ! is_page( 74 ) ) {
		return;
	}
	?>
<script id="czera-box-keyboard">
(function () {
	function text(el) {
		return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
	}
	function setup() {
		document.querySelectorAll('.wooco_component_product_selection_item').forEach(function (item) {
			var name = text(item.querySelector('.wooco_component_product_selection_grid_item_name'));
			var price = text(item.querySelector('.wooco_component_product_selection_grid_item_desc .amount'));
			var size = text(item.querySelector('.wooco_component_product_short_description'));
			var pick = item.querySelector('.wooco_component_product_selection_grid_item_image');
			if (!pick || !name) {
				return;
			}
			pick.classList.add('czera-box-pick');
			pick.setAttribute('tabindex', '0');
			pick.setAttribute('role', 'checkbox');
			pick.setAttribute('aria-label', [name, size, price].filter(Boolean).join(', '));
			// Astra adds the - / + links by script after load, so look them up on every sync.
			function sync() {
				var on = item.classList.contains('wooco_item_selected');
				pick.setAttribute('aria-checked', on ? 'true' : 'false');
				var minus = item.querySelector('.quantity .minus');
				var plus = item.querySelector('.quantity .plus');
				if (minus) {
					minus.setAttribute('aria-label', 'Remove one ' + name);
				}
				if (plus) {
					plus.setAttribute('aria-label', 'Add one ' + name);
				}
				item.querySelectorAll('.quantity .minus, .quantity .plus, .quantity input').forEach(function (c) {
					if (on) {
						c.removeAttribute('tabindex');
						c.removeAttribute('aria-disabled');
					} else {
						c.setAttribute('tabindex', '-1');
						c.setAttribute('aria-disabled', 'true');
					}
				});
			}
			sync();
			new MutationObserver(sync).observe(item, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
			pick.addEventListener('keydown', function (e) {
				if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
					e.preventDefault();
					pick.click();
				}
			});
		});
		document.querySelectorAll('.wooco-alert, .wooco-summary').forEach(function (el) {
			el.setAttribute('aria-live', 'polite');
			el.setAttribute('aria-atomic', 'true');
		});
		document.querySelectorAll('.single_add_to_cart_button').forEach(function (btn) {
			function syncButton() {
				if (btn.classList.contains('wooco-disabled')) {
					btn.setAttribute('aria-disabled', 'true');
				} else {
					btn.removeAttribute('aria-disabled');
				}
			}
			syncButton();
			new MutationObserver(syncButton).observe(btn, { attributes: true, attributeFilter: ['class'] });
		});
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setup);
	} else {
		setup();
	}
})();
</script>
	<?php
} );
