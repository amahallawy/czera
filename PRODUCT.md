# Product

## Register

brand + showroom

## Source of truth

Every product name, price, size, weight and claim on the site comes from the
client's own material: `assets/czera products/<product>/info.txt` (with its
photos) and `assets/CZERA’s Catalogue 15-09-2026.pdf`. The site's earlier copy
(Egyptian cotton, Nile Delta, 600–800 GSM, a B2B hospitality brief) was
placeholder design content and does not apply. Full design decisions:
[docs/superpowers/specs/2026-10-13-czera-showroom-design.md](docs/superpowers/specs/2026-10-13-czera-showroom-design.md).

## Users

**Primary:** home and gift buyers in Egypt. Someone buying towels or a robe
for their own home, or a boxed set for a wedding, a birthday or an
anniversary.

**Secondary:** bulk and corporate buyers (wedding favours, company gifts,
hotels and spas) who order in quantity by email.

**Context:** most visitors arrive on a phone, often from Instagram, and want
three things fast: what it looks like, what it costs, and how to order it.
Many are buying a gift and care as much about the box and ribbon as about
the towel.

**Job to be done:** find the right towel, robe or gift set (or build a custom
box), see the price, put it in the bag, and send the order by email.

## Product purpose

Czera makes 100% cotton towels, bathrobes and gift sets: towels at 650+ GSM,
robes at 1200 GSM that fit up to 130 kg, presented in a black Czera gift box
with satin ribbon. The site is a **showroom**: every product with its photo,
contents and price in EGP; a bag the visitor fills as they browse; and one
button that sends the whole bag as an order by email to
support@czeramaison.com (it opens the visitor's email app with the order
already written). There is no online payment or checkout.

Success: a visitor leaves with an order sent by email, or with a clear
idea of what they will order and how.

## Brand personality

**The hotel experience, at home.**

Warm, refined, gift-ready. The catalogue's own lines set the tone: "Every
detail feels like home", "It's all in the details", "Everyday moments deserve
extraordinary comfort". Calm and confident, never loud.

Voice rules:

- Use the client's catalogue phrasing as the starting point; tidy it, don't
  invent new claims.
- No exclamation marks. Avoid hype words: "discover", "elevate", "indulge",
  "best in class". "Luxury" appears only in the brand line "Luxury towels &
  bath essentials".
- State the real facts plainly: sizes, GSM, what is in the box, the price.
- Don't claim what the material doesn't say (origin, "by hand") until the
  client confirms it.

## Anti-references

Czera must NOT look or feel like:

- **A discount shop.** Rows of black "Buy now" buttons, red sale badges,
  countdown timers, "Trending now" strips.
- **Industrial B2B supplier sites (Standard Textile, Welspun).** Catalogue
  dumps, PDFs as primary content, "request a quote" as the only action.
- **Hotel-amenity wholesalers.** Low-res product grids, dated typography, no
  brand at all.
- **Generic "AI luxury" bath sites.** Cormorant Garamond, gold gradients,
  "Indulge in luxury" headlines.

The references Czera does follow: Abyss Habidecor for editorial pacing on the
home page, Frette for the collection grid and product page.

## Design principles

1. **Real data only.** Names, prices and claims come from the client's files.
   If the material doesn't say it, the site doesn't either.
2. **Show it, price it, make it easy to order.** Every product shows its
   photo, its contents and its price; adding to the bag is one tap.
3. **Quiet commerce.** Ordering is always close but never shouts: a gold
   "Add to bag ›" text link on cards, one solid button per screen, no
   pop-ups.
4. **Gifts lead.** Half the range is boxed sets; the box and ribbon are part
   of the product and get photographed and described as such.
5. **Arabic is a peer, not a translation.** RTL is designed-with, not
   paste-translated. The Arabic version follows as its own phase once the
   English pages are approved.
6. **The brand leads the header.** The CZERA wordmark sits centred; the
   menu is one tap away behind a "Menu" button on every device, and the bag
   is always visible. Categories stay one tap from Home through the
   category tiles and the footer's Shop links, so hiding the inline nav
   costs browsing nothing (2026-10-16).

## Accessibility & inclusion

WCAG 2.1 AA basics (focus states, alt text, contrast, reduced motion,
sequential headings) are documented in `design.md` §11 and treated as a
baseline.

**Strategic commitment specific to Czera's audience:**

- **Phones on mobile data are the default.** Most visitors come from
  Instagram on 4G. Progressive image loading, per-page image budgets and
  lazy-loading below the fold shape what the site is, not what it does at
  the end. The one exception is the Home hero film, which autoplays on every
  connection (owner decision, 2026-10-21, #119).
- **The bag and the email order must work on any phone browser**, with no
  account, and survive page reloads.
