# AgDR-0001: Product data as an ES module

## Context

The showroom lists 16 products with names, prices, sizes and images. Several pages (catalogue, product detail, bag, home) and Node tests need the same data.

## Options considered

- (a) Hard-code the data in each HTML page.
- (b) A `products.json` file fetched at runtime.
- (c) `js/data/products.js` exporting an array.

## Decision

Option (c). One source of truth, importable by pages and by Node tests with no fetch or CORS step.

## Consequences

- Editing a price is a one-file change.
- No CMS; the data file is edited by hand.
- Pages must be served over HTTP to load the module.
