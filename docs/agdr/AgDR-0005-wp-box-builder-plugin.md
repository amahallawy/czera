# AgDR-0005: WPC Composite Products for the WordPress box builder

## Context

The WordPress site (czeramaison.com) needs a Build your box page: the
customer picks up to 6 towels and up to 2 bathrobes (at least 2 items),
priced as the sum of the items, added to the bag as one product with its
contents listed. The owner asked for a ready plugin if one does exactly this.
The critical requirement is **separate limits per group** (6 towels / 2 robes)
inside one box.

## Options considered

- (a) **WPC Composite Products** (WPClever, free on wordpress.org). Per-component
  min/max for the whole component, multiple selection with quantities, overall
  box minimum, "exclude base price" pricing, option to show the items as one
  product with its contents listed. Verified in the plugin's source (v8.0.4).
  The browser enforces every limit. Server validation enforces each item's
  own maximum, but not the group totals, the 2-item minimum or products
  outside the box. It cleans the submitted ids with `clean_ids()`.
- (b) **Mix and Match Products** (woocommerce.com, $89/yr). One min/max for the
  whole box only; no per-group limits. Fails the critical requirement.
- (c) **Extendons Custom Product Boxes** ($79/yr). Per-section limits on paper;
  cart display undocumented and not verified.
- (d) **Custom plugin.** Exact control and a true single cart line, but more
  build and maintenance work.

## Decision

Option (a), chosen by the owner on 2026-10-16. It meets every requirement for
free; the gaps in the plugin's server validation are closed by a small server-side
`woocommerce_add_to_cart_validation` check run through the free Code Snippets
plugin. The snippet mirrors the plugin's id cleaning.

## Consequences

- The box's items are real cart and order lines hidden under the box line, so
  stock is tracked per item. Admin order data shows them unless hidden.
- Two plugins added to the site: WPC Composite Products and Code Snippets.
- The plugin's form is restyled with Additional CSS (`czera-box-` prefix) to
  match the static design.
- LiteSpeed Cache excludes `/wp-json/wc/store/` site-wide (Do Not Cache URIs):
  it had cached the Store API cart publicly, so one shopper's bag (and the
  addresses the cart response carries) could be served to another.
- If the plugin is abandoned or changes its data model, option (d) is the
  fallback; the rules in the spec stay the same.
