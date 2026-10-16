# Astra header builder on czeramaison.com

Reference record of the Astra (4.14.1 + Astra Pro) header-builder settings that
amahallawy/czera#66 changed, so the change can be reverted. The site database is
authoritative; update this file when you change these settings.

Settings live in the Customizer as `astra-settings[<key>]`. Change them in the
logged-in Customizer with `wp.customize('astra-settings[<key>]').set(value)` and
`wp.customize.previewer.save()`.

## After (since #66)

```json
"header-desktop-items": {
  "popup":   { "popup_content": [] },
  "above":   { "above_left": [], "above_left_center": [], "above_center": [], "above_right_center": [], "above_right": [] },
  "primary": { "primary_left": ["html-1"], "primary_left_center": [], "primary_center": ["logo"], "primary_right_center": [], "primary_right": ["woo-cart"] },
  "below":   { "below_left": [], "below_left_center": [], "below_center": [], "below_right_center": [], "below_right": [] }
}
"header-mobile-items": {
  "popup":   { "popup_content": [] },
  "above":   { "above_left": [], "above_center": [], "above_right": [] },
  "primary": { "primary_left": ["html-1"], "primary_center": ["logo"], "primary_right": ["woo-cart"] },
  "below":   { "below_left": [], "below_center": [], "below_right": [] }
}
"mobile-header-type": "dropdown"
"header-html-1": "[czera_menu_toggle]"
```

- HTML 1 holds only the `[czera_menu_toggle]` shortcode. Astra runs shortcodes
  in its HTML elements; the shortcode, the menu panel and its script come from
  Code Snippet 10 "CZERA menu" (`czera-menu.php`). If that snippet is off, the
  header shows the shortcode as text, so turn both off together.
- Astra's `menu-1`, `mobile-trigger` and the off-canvas `mobile-menu` are out of
  every row, so Astra prints no nav, toggle or dropdown. The only primary nav is
  the snippet's slide-in panel.
- `mobile-header-type` is unchanged; with no `mobile-trigger` it has no effect.
- Logo widths (150 / 130 / 110 px), the transparent Home header and the sticky
  header are unchanged.
- Additional CSS: "Site menu (slide-in, CZERA menu snippet)" is new
  (`site-menu.css`); "Header over the Home hero" and "Header once scrolled" cover
  the Menu button (`header-over-hero.css`, `header-scrolled.css`); "Header: menu
  links" is retired.

## Before (until #66)

```json
"header-desktop-items": {
  "popup":   { "popup_content": ["mobile-menu"] },
  "above":   { "above_left": [], "above_left_center": [], "above_center": [], "above_right_center": [], "above_right": [] },
  "primary": { "primary_left": ["logo"], "primary_left_center": [], "primary_center": ["menu-1"], "primary_right_center": [], "primary_right": ["woo-cart"] },
  "below":   { "below_left": [], "below_left_center": [], "below_center": [], "below_right_center": [], "below_right": [] }
}
"header-mobile-items": {
  "popup":   { "popup_content": ["mobile-menu"] },
  "above":   { "above_left": [], "above_center": [], "above_right": [] },
  "primary": { "primary_left": ["logo"], "primary_center": [], "primary_right": ["woo-cart", "mobile-trigger"] },
  "below":   { "below_left": [], "below_center": [], "below_right": [] }
}
"mobile-header-type": "dropdown"
"header-html-1": "Insert HTML text here."
```

## Reverting

1. In the Customizer, set the four "Before" values above and save.
2. In Additional CSS, delete the "Site menu" block and put back the "Header:
   menu links" block (`tools/wp/live/header-menu-links.css` in Git history
   before #66). The two header blocks can stay (their Menu button rules then
   match nothing), but before #66 "Header over the Home hero" also coloured the
   inline nav over the hero: add
   `.main-header-menu > .menu-item > .menu-link` and Astra's `.menu-toggle` to
   its ivory (`#f4f2ec`) rule, and
   `.main-header-menu > .menu-item:hover > .menu-link` to its sand (`#d8c28a`)
   hover rule, each prefixed with
   `.ast-theme-transparent-header .ast-primary-header-bar:not(.ast-sticky-active)`.
3. Deactivate Code Snippet 10 "CZERA menu" and drop it from `SNIPPETS` in
   `tools/wp/box_checks.py`.

Any save of the header-builder settings can move the footer and shop-sidebar
widgets to `wp_inactive_widgets`. Before saving, snapshot `GET /wp/v2/sidebars`
and `GET /wp/v2/widgets?context=edit`; afterwards, PUT any moved widget back to
its sidebar in its old order and check the sidebars match the snapshot. (The #66
save moved none.)
