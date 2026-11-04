# AgDR-0007: A small "CZERA SEO" snippet on Rank Math filters, and Rank Math's public head route for the checks

## Context

Phase 1 of the store's search-readiness work (amahallawy/czera#157) is invisible
SEO only: nothing a visitor sees may change. Two needs came out of it that
Rank Math's free settings can't meet:

- **Structured data.** Every Product should name CZERA as its brand and carry its
  exact store name. Rank Math's default Product name is `%seo_title%`, the search
  title with " | CZERA" on the end, printed as `Hand &amp; Bath Sheet Set, 4 Pieces |
  CZERA`. The final review also found an author `Person` node in page heads, with the
  admin's `/author/<slug>/` URL and Gravatar, which breaks #155's goal of keeping the
  login name private. Rank Math 1.0.281 prints JSON-LD through `wp_kses_post_deep()`
  after all its filters, so every `&` in a name comes out as `&amp;`.
- **Checking the result.** The store sits behind a coming-soon redirect for
  logged-out visitors (owner decision until launch), and an application password
  can't log in to the front end. `tools/wp/seo_checks.py` needs the rendered `<head>`
  of every page to check titles, descriptions, robots and JSON-LD.

## Options considered

For the structured data:

- (a) **A small "CZERA SEO" Code Snippet** (live snippet 22, reference copy
  `tools/wp/live/czera-seo.php`) on Rank Math's own filters:
  `rich_snippet_product_entity` sets the brand and the product name;
  `rank_math/json_ld` removes every author `Person` node and every `author` key;
  `rank_math/schema/add_global_entities` keeps the Organization, WebSite and
  WebPage nodes on pages once their default schema type is None; and a buffer
  around Rank Math's JSON-LD print (`rank_math/head`, priorities 89 to 91) decodes
  `&amp;` and `&#038;` to `&` in that script only. The same tool and review path as
  every other snippet, and nothing new installed.
- (b) **WooCommerce Brands** with a CZERA term. Rank Math would read the brand
  from it, but the theme prints "Brand: CZERA" on every product page, which is a
  visible change. It fixes neither the name nor the author data.
- (c) **Rank Math Pro.** Its schema editor can set a fixed brand and edit the
  templates, but it's a paid plugin added for a few fields, and it still prints
  through the same kses step.

For reading heads:

- (d) **Rank Math's Headless CMS support** (General Settings, Others), which
  registers `/wp-json/rankmath/v1/getHead?url=...` and returns the head Rank Math
  would print for any URL.
- (e) **A logged-in browser session** for the checks. That needs a real login
  cookie rather than the application password, so the checks couldn't run as a
  plain script.
- (f) **Turning off the coming-soon redirect** while checking. The owner ruled it
  out.

## Decision

Options (a) and (d).

(a) changes nothing a visitor sees, needs no new plugin, and covers all three
structured-data fixes in one place. The page default schema type is also set to
None in Rank Math (`titles.pt_page_default_rich_snippet`), so the snippet's author
filter is defence in depth rather than the only guard. The ampersand buffer only
touches the `application/ld+json` script, and only decodes `&amp;`/`&#038;`. kses
has already stripped tags from the strings, so decoding can't put markup into the
script.

(d) is one switch, and the checks run as a plain script with the application
password.

## Consequences

- `getHead` is public: anyone can read the head Rank Math would print for any URL,
  including pages behind the coming-soon redirect. Once the author data is gone
  (this fix), a head holds only what every page's HTML holds at launch: titles,
  descriptions, robots, canonical, Open Graph and JSON-LD. Low sensitivity. Whether
  to keep Headless support after launch is decided then; it's on the launch
  checklist.
- The brand is overwritten on every product. If WooCommerce Brands is ever used,
  the snippet's brand line should be revisited (it says so in a comment).
- The ampersand buffer depends on Rank Math printing JSON-LD on `rank_math/head`
  at priority 90 (class-jsonld.php, 1.0.281). If an update moves it, names show
  `&amp;` again, and `seo_checks.py schema` fails on it.
- Pages carry WebPage, not Article. The Slack "Written by" label is dropped, along
  with the author data.
- The snippet lives in the site database. The repo copy is a reference, so the two
  are updated together.
