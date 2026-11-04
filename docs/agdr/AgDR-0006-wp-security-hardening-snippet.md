# AgDR-0006: A Code Snippet, not a security plugin, for WordPress hardening

## Context

The security review of czeramaison.com on 2026-11-04 (amahallawy/czera#155) found
that the only admin account's login name is public (REST users list, author
archives, oEmbed), that `xmlrpc.php` accepts `system.multicall` (hundreds of
password guesses per request), and that front-end pages send no security headers
while advertising the PHP and WordPress versions. The site already runs Code
Snippets for all its custom PHP, and Jetpack, which keeps its connection to
WordPress.com through signed requests that can use `xmlrpc.php`.

## Options considered

- (a) **One "CZERA security" Code Snippet.** A few dozen lines on core hooks:
  hide the users endpoint from anyone who can't edit posts (customers included) and
  author archives from everyone, strip author fields from oEmbed, turn off XML-RPC's
  username/password methods and remove `pingback.*`, send the headers, drop the
  generator tag. Same tool and review path as every other snippet; nothing new installed.
- (b) **A security plugin** (Wordfence, Solid Security, All-In-One Security). Covers
  all of this plus a firewall, login limiting and two-factor, but is a large new
  dependency with its own settings, cron jobs and update cadence, and overlaps with
  Hostinger's and LiteSpeed's own tools.
- (c) **Server config** (`.htaccess` rules on Hostinger). Blocks `xmlrpc.php` outright
  and sets headers before PHP runs, but lives outside the repo and the Code Snippets
  record. Blocking the whole file would also cut Jetpack's connection.

## Decision

Option (a). It fixes every finding that code can fix with no new dependency, and
it keeps XML-RPC reachable for Jetpack while removing the brute-force paths:
`xmlrpc_enabled` set to false refuses every username/password method with a 405
before the password is checked, which is what password guessing uses, including
guesses batched in `system.multicall` (WordPress re-adds that method after the
`xmlrpc_methods` filter, so it can't be removed, only emptied). Jetpack signs its
own requests rather than sending a password, so its connection is expected to keep
working; that is checked in Jetpack's dashboard (connection, Stats) after
deploying, and the `xmlrpc_enabled` line is the one to drop if it breaks.

## Consequences

- The lost-password forms (WordPress's and WooCommerce's) still say when no account
  matches; making them generic needs more than a filter, and the admin's slug is
  the bigger leak. Left for later.
- Login limiting and two-factor are not covered; they need a plugin or Hostinger's
  setting, and that is left to the owner (recorded in #155 as out of scope).
- Headers are added through the `wp_headers` filter, which applies to front-end
  requests only, so REST and wp-admin responses keep WordPress's own headers.
  LiteSpeed caches a page's headers with the page, so its cache is purged once
  after deploying.
- `X-Frame-Options: SAMEORIGIN` would block a payment gateway that shows the
  store's pages inside its own iframe. Payment is on delivery today; revisit when
  a card gateway is added.
- HSTS is set without `includeSubDomains` or `preload`, since not every subdomain
  is known to serve HTTPS. It can be tightened later.
- No Content-Security-Policy beyond the existing `upgrade-insecure-requests`: the
  theme, WooCommerce and the snippets use inline scripts, and a real policy needs
  its own testing.
