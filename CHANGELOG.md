# Changelog

All notable changes to the Czera site. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/). Every merge to `main` goes live on
Cloudflare; each PR adds its entry under `[Unreleased]`, and a release PR turns
that section into a version.

## [Unreleased]

- Collection: the "Build your own box" band now comes after all the products,
  full width, whatever the filters show (before, it sat after the first row
  and disappeared when fewer than four products matched). The Category filter
  lists Towels, Beach, Bathrobes, Gift sets, the order of the grid; the menu
  and footer are unchanged (#91).
- WordPress store (czeramaison.com): the shop page and every product category
  page end with the same band after the products: "Can't choose? Make your
  own.", the store builder's line, the band photo and a "Start your box"
  button to the Build your box page. It is not shown on product pages, the
  cart or checkout (#91).

- Collection: with no filters, products are listed white towels first, then
  the striped beach towels, then bathrobes, then gift boxes (towels by size).
  Filtered results keep that order.
- WordPress store (czeramaison.com): the shop and category pages use the same
  order, set with each product's position in WooCommerce.

- Orders and questions now go by email to support@czeramaison.com, and the
  site no longer mentions WhatsApp (owner decision, #84). The bag's last
  button, "Send order by email", opens your email app addressed to
  support@czeramaison.com with the subject "Order from czeramaison.com" and
  the order already written in the body: every item with its quantity and
  price, the total, your name, phone, address, city and note. The
  confirmation step that follows shows the order with a "Copy order" button,
  and the address and a "try again" link if your email app did not open;
  very long orders, which some email apps cut short, get a line asking you to
  check every item arrived. On the product page the small link is now "Or
  order just this by email ›".
- Contact buttons say "Contact us": the footer shows the email address and a
  "Contact us" button, and About's bulk-orders band has a "Contact us"
  button that starts an email titled "Bulk or corporate order". About's
  contact strip shows Email instead of WhatsApp, and How to order reads
  "Three steps, all by email." with "Send your bag by email" as step two.
- About: the Follow icons' hover colour is darker (4.4:1 on the beige
  strip, up from 2.7:1). Footer: the Contact us button sits 16px under the
  social icons instead of 32px.

- WordPress store (czeramaison.com): orders and questions go by email there
  too, and the About page no longer mentions WhatsApp (as #84 did for the
  showroom). About's bulk-orders band reads "Custom quantities, quoted by
  email." and its gold "Contact us" button starts an email to
  support@czeramaison.com titled "Bulk or corporate order"; the contact
  strip's first column is Email with the address as a link. The footer's
  Contact column shows support@czeramaison.com, the social icons, then a
  "Contact us" outline button 16px below them. Email links tell screen
  readers they open your email app. Social icons get the design's focus ring
  (gold in the footer, ink on About) and About's icons turn #8A5C12 on hover
  (4.4:1 on the beige strip). Styles: `tools/wp/live/about-page.css`,
  `tools/wp/live/footer-social.css` and a new
  `tools/wp/live/footer-contact.css`.

- WordPress store (czeramaison.com): the About page is built from the design:
  a photo hero ("About CZERA", "Every detail feels like home."), the "Our
  belief" and "The details" chapters (with the care line), the dark
  bulk-orders band with its gold "Ask on WhatsApp" button, and the contact
  strip (WhatsApp, Follow as Instagram, Facebook and TikTok icons, Delivery).
  It replaces the one-line placeholder; the page title is hidden so the photo
  sits right under the header. Styles are in a new Additional CSS block,
  copied to `tools/wp/live/about-page.css`.
- Footer and About page: Instagram, Facebook and TikTok are now icons
  instead of text, with the same names for screen readers.
- WordPress store (czeramaison.com): the footer's Instagram, Facebook and
  TikTok links are icons too, using WordPress's Social Icons block.

- WordPress store (czeramaison.com): Home's story now meets the hero with no
  empty strip on desktop (its photo fades in from the page colour), it ends on
  "About CZERA ›" only, and the Build-your-box band keeps gold for its button
  alone.

- Home: no more empty strip between the hero and Our story on desktop; the
  story photo now fades in from the page colour instead. The line under the
  hero buttons is gone, and the story ends on "About Czera ›" only.
- Build your box: no ribbon choice any more (ribbons are added when
  available). The builder has three steps (box, colour, towels), and the
  bag and WhatsApp message no longer mention a ribbon; boxes already in a
  bag still work. The Home and Collection bands and the bulk-order lines no
  longer offer ribbon colours.
- Home: the Build-your-box band is about half as tall (its photo no longer
  stretches it), with gold kept for the "Start your box" button.
- Home: category and band photos load only as they come into view.

- WordPress store (czeramaison.com): Home now matches the showroom's new
  order and fixes. Our story comes right after the hero with its new headline
  ("Everyday moments deserve extraordinary comfort."), a one-line body and two
  links (About CZERA, See the gift sets); About is first in the menu, set
  apart from the shop links. The hero headline stays the largest heading at
  every width, the story is shorter on phones, an ivory pause separates it from
  the hero on desktop, and the footer tagline is in sentence case. No order
  line under the hero buttons on the store.

- Home hero: one line under the buttons says how ordering works ("Order on
  WhatsApp · Delivery across Egypt in 2–5 days").
- Our story is shorter on phones (a wider photo, no pull-quote), so the first
  prices come about 300px sooner; on desktop it sits after a short ivory
  pause instead of cutting straight in from the hero film.
- Our story ends on two links: "About Czera ›" and "See the gift sets ›".
- Category tiles: a stronger shade behind the labels, so names and prices are
  readable on the white towel and robe photos (about 5.3:1 at worst).
- Smaller fixes: the bulk-orders line is set at a readable width, the footer
  tagline is in sentence case, and the footer column headings no longer skip
  a heading level.

- Our story now has its own headline, "Everyday moments deserve extraordinary
  comfort.", instead of repeating the hero's, and a shorter line of copy. Its
  title is set at section size so the hero headline stays the largest.
- On phones and small tablets (768px and below), section titles and the
  Build-your-box band title are smaller (28px) and the hero headline larger
  (at least 36px); the hero headline is now the largest heading at every
  width.
- About page: the "Our belief" heading is now "The hotel experience, brought
  home.", so it no longer repeats the Home story's headline.
- In the side menu, About sits apart from the shop links.
- Home: "Our story" now comes straight after the hero, and About is the first
  item in the side menu (client request).

- WordPress store (czeramaison.com): the header now matches the CZERA design:
  Menu on the left, the wordmark centred and the bag on the right on every
  screen size, with the menu in a slide-in panel.
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
- WordPress store (czeramaison.com): Build your box keeps your choices after
  adding the box, locked while that box is in your bag; Remove box from bag
  takes it out and lets you change it.
- WordPress store (czeramaison.com): Build your box page, in the CZERA design.
  Choose a colour to see its towel sizes, then towels and bathrobes; counts
  start at 0, up to 6 towels and 2 bathrobes in total, at least 2 items, and
  the price is the sum of the items. Your box lists each item with a remove
  button and a clear-selection button. The box reaches the bag as one line with
  its contents listed. The box rules are checked on the server, and the cart
  API is no longer cached. Live checks in `tools/wp/box_checks.py`.
- WordPress store (czeramaison.com): product buttons read "Add to bag" for
  screen readers too and keep their font after adding; every add to the bag
  shows the CZERA toast with View bag.

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
