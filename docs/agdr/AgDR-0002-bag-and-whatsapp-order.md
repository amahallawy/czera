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
