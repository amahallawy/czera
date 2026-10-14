# AgDR-0003: JS-rendered shell, one ES module per page

## Context

Five pages share a header, footer and bag drawer. Copying that markup into each page invites drift.

## Options considered

- (a) Copy header, footer and bag markup into all five pages.
- (b) Render them from one module.
- (c) A build step with includes.

## Decision

Option (b). One source for shared chrome without adding a build step, which `CLAUDE.md` forbids without cause.

## Consequences

- Pages need HTTP to load modules.
- A `<noscript>` line tells no-JS visitors to turn on JavaScript to order.
- The logic in `js/main.js` moves into modules.
