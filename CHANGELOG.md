# Changelog

All notable changes to the Czera site. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/). Every merge to `main` goes live on
Cloudflare; each PR adds its entry under `[Unreleased]`, and a release PR turns
that section into a version.

## [Unreleased]

- Keyboard focus on the header's Menu, logo and Bag now shows a gold ring over
  the hero film, where the ink ring was hard to see; it turns ink again once
  the header is ivory.
- The "added to your bag" message no longer floats above the open side menu;
  it is dimmed behind it like the rest of the page.

- Header: the CZERA logo now sits in the centre, with a "Menu" button on the
  left and the bag on the right, on every screen size. The inline top menu is
  gone; the links live in a side menu that slides in from the left (from the
  right in Arabic).
- The side menu now behaves as a proper dialog: keyboard focus stays inside it
  while it is open and returns to the Menu button when it closes, and the page
  has a single "Primary" navigation.
- `design.md`, `PRODUCT.md` and the showroom spec describe the new header.

- WordPress store (czeramaison.com): after adding a box, Build your box shows
  the CZERA toast ("Your box was added to your bag", with View bag) instead of
  WooCommerce's notice box; any other message shows inline in the CZERA style.
- WordPress store (czeramaison.com): Build your box page, in the CZERA design.
  Choose a colour to see its towel sizes, then towels and bathrobes; counts
  start at 0, up to 6 towels and 2 bathrobes in total, at least 2 items, and
  the price is the sum of the items. Your box lists each item with a remove
  button and a clear-selection button. The box reaches the bag as one line with
  its contents listed. The box rules are checked on the server, and the cart
  API is no longer cached. Live checks in `tools/wp/box_checks.py`.

## [1.0.0] — 2026-10-15

- Sent to the client for acceptance. The next phase rebuilds the site in WordPress.
- First public preview on Cloudflare Workers: czera.ahmed-mahallawy-82.workers.dev
  (kept out of search engines with `X-Robots-Tag: noindex`).
- The showroom as shipped: Home, Collection with filters, Product pages, the bag
  with orders sent on WhatsApp, Build Your Own Box and About, in English.
- Built from the client's real catalogue: 16 products, prices in EGP.
- Two design critiques applied: hero film held back on phones with a towel
  poster, a clearer WhatsApp send step, box rules that only allow real
  combinations, and polish across all pages.
- Still placeholder until the client confirms: WhatsApp number, delivery and
  payment text, and the box colour/size rules.
