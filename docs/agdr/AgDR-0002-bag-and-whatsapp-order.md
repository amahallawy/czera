# AgDR-0002: Bag in localStorage, order via wa.me

## Context

The showroom has no backend, yet visitors need to collect items and place an order.

## Options considered

- (a) A server-side cart.
- (b) A `localStorage` bag plus a WhatsApp deep link.
- (c) No bag; single-item WhatsApp links only.

## Decision

Option (b). The spec's showroom has no backend; the bag survives reloads; the order arrives as a WhatsApp message via `wa.me`.

## Consequences

- Prices are recomputed from the product data on every render; stored lines hold slugs and quantities only.
- Storage key is `czera.bag.v1`.
- An in-memory fallback is used when storage access throws.

## Update, 2026-10-18 (#84)

The owner replaced WhatsApp with email. The `localStorage` bag stays as decided; the order now
leaves as a `mailto:support@czeramaison.com` link (subject "Order from czeramaison.com", the same
message as the body), built in `js/lib/email.js`. The `wa.me` link is gone.
