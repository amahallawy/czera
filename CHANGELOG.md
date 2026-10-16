# Changelog

All notable changes to the Czera site. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/). Every merge to `main` goes live on
Cloudflare; each PR adds its entry under `[Unreleased]`, and a release PR turns
that section into a version.

## [Unreleased]

- Header: the CZERA logo now sits in the centre, with a "Menu" button on the
  left and the bag on the right, on every screen size. The inline top menu is
  gone; the links live in a side menu that slides in from the left (from the
  right in Arabic).
- The side menu now behaves as a proper dialog: keyboard focus stays inside it
  while it is open and returns to the Menu button when it closes, and the page
  has a single "Primary" navigation.
- `design.md`, `PRODUCT.md` and the showroom spec describe the new header.

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
