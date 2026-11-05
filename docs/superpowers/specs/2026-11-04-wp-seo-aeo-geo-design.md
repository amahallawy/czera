# CZERA store: search and AI-answer readiness (SEO, AEO, GEO)

Date: 2026-11-04. Status: draft for owner approval.

## Intent

When the store launches, people searching Google (SEO), seeing Google's answer
boxes (AEO), or asking an AI assistant such as ChatGPT, Gemini or Perplexity (GEO)
for cotton towels, bathrobes or towel gift sets in Egypt should find CZERA. The
answers they see should state CZERA's real facts. The site stays behind its
coming-soon redirect until the owner launches it (owner decision, 2026-11-04), so
nothing can rank before then. This work gets every page ready so it counts from
launch day.

## Decisions made with the owner

- **English only.** No Arabic anywhere: not visible on pages, not in search
  titles or descriptions, not in structured data, not in `llms.txt` (owner,
  2026-11-04). Arabic search is left to the Arabic phase that `PRODUCT.md` already
  plans.
- **Only confirmed facts.** The confirmed facts are enough (owner, 2026-11-04):
  - 100% cotton
  - towels 650+ GSM; robes 1200 GSM, fitting up to 130 kg
  - the sizes and prices on the store
  - the black CZERA gift box with satin ribbon
  - Build your box: up to 6 towels and up to 2 bathrobes, at least 2 pieces
  - payment on delivery, with the team calling to confirm each order and quote
    the delivery fee
  - returns and exchanges within 14 days on unused items (the policy page)
  - bulk and corporate orders by email, support@czeramaison.com
  - the first-order code while it is live

  The design site's delivery times ("2–5 days, next day in Cairo & Giza"),
  "InstaPay" and the care line are marked `PLACEHOLDER` in `js/data/products.js`.
  They are not confirmed and must not be used. Leave out any question that needs
  them.
- **The coming-soon mode stays as it is** until launch (owner).

## Calls made in writing this (for the owner to check)

- **Which products state a GSM.** "650+ GSM" comes from the catalogue's icon
  panel ("Hotel quality with 650+ GSM / 1200 GSM"). The per-product files don't
  give a GSM for any towel. My call: 650+ GSM is stated for the bath range (face,
  hand, bath towel, bath sheet) and the towel-only gift sets. 1200 GSM is stated
  for the robes and anything containing one. The beach towels state no GSM, since
  nothing ties the 650+ figure to them, until the client confirms. "Every product
  states its GSM" below means every product with a confirmed one.
- **No prices in meta descriptions or `llms.txt`.** Prices and sales change
  (two products carry a sale from #123). A price frozen into a cached search
  snippet or an AI answer goes stale. Structured data carries the price, because
  Rank Math reads the live WooCommerce price on each request.
- **Product names stay exactly as they are on the store** (owner, 2026-11-04),
  including "Luxury Beach Towel Gift Set" and "Set of Robe & Beach Towel
  White+Blue". Search titles, structured data and `llms.txt` use those names
  unchanged. A title over about 60 characters is left for Google to shorten; it
  is not reworded into a different name. Descriptions and copy describe each set's
  real contents as the client's files give them (the White+Blue set holds the
  black robe and the blue stripe beach towel).
- **No first-order code anywhere in this work.** It is one-use and can end at
  any time; the site's promo line already carries it.
- **Existing product text is tidied, not replaced.** `PRODUCT.md` says to use the
  client's catalogue phrasing as the starting point, tidy it, and invent nothing.
  The copy sheet shows each product's current text next to the proposed text, so
  the owner can see every change. Words in the descriptions that break the voice
  rules ("luxury" outside the brand line and the product names, "sophisticated")
  are tidied out.

## Constraints

- **The voice rules in `PRODUCT.md` apply to every word written:**
  - no exclamation marks;
  - no "discover", "elevate", "indulge" or "best in class";
  - "luxury" only in the brand line;
  - no "Egyptian cotton", origin or "by hand" claims;
  - facts stated plainly.
- **No hidden or stuffed text.** Nothing written for crawlers that a visitor
  can't see, apart from the standard invisible places: meta descriptions,
  structured data and `llms.txt`. That would be cloaking, which Google penalises.
- **Both sites match on visible copy.** Any text a visitor can see on the store
  (product descriptions, category introductions, the FAQ page) is mirrored on the
  design site, which is the approved design (`js/data/products.js` and the
  matching pages). Invisible SEO (meta, structured data, `llms.txt`, sitemap and
  robots settings) is WordPress only. The design site already sends
  `X-Robots-Tag: noindex` (`_headers`), so it never competes with the store in
  search.
- **The owner approves new visible copy before it goes live.** Write it first
  as one copy sheet (`docs/seo-copy-2026-11.md`) covering every product, category
  and FAQ answer; apply it once approved.
- **Use the existing tools:**
  - Rank Math (installed) for titles, descriptions, structured data and sitemaps;
  - WooCommerce product and category fields for copy;
  - the `czeramaison-com-wp` MCP connector for WordPress changes;
  - a PR for the design site and for any snippet.

  No new plugin without an AgDR.
- **Repo rules:** an issue and a PR per piece of work, a changelog entry, and the
  two-marker merge.

## Scope: what gets done

1. **Search titles and meta descriptions for every page meant to be found:**
   - Pages: Home, Shop, About, Build your box, Returns & exchanges, and the new
     FAQ page.
   - The four categories: Towels, Bathrobes, Gift sets, Beach.
   - All 16 products, plus the Build your CZERA box product. That product
     redirects to `/build-your-box/` (snippet 8), so it should be kept out of the
     index, or point its canonical to that page, rather than get its own title.
   - Titles: unique, about 60 characters or fewer, ending "| CZERA".
     Descriptions: unique, about 155 characters or fewer, with the product's
     facts (size, GSM where confirmed, cotton, gift box), and no prices.
2. **Product text.** Each product's description grows from today's 35–60 words to
   a fuller, still short description (roughly 80–150 words) built only from the
   confirmed facts. GSM is stated wherever it is confirmed (see "Calls made"),
   since it is missing on most pages today and is the fact buyers and AI answers
   compare. Gift sets say what is in the box and
   that it comes in the CZERA gift box with satin ribbon.
3. **Category introductions.** Each of the four categories gets two or three
   sentences above its grid. Today they have none, and these are the pages most
   likely to rank for "towel gift set" style searches.
4. **An FAQ page.** A new "Questions" page at `/faq/`, linked from the footer's
   Help column next to "Returns & exchanges", laid out like the Returns page.
   - Draft questions, answered only from the confirmed facts:
     - What are CZERA towels made of?
     - How heavy are they (GSM)?
     - What sizes are there?
     - Who do the bathrobes fit?
     - What comes in a gift set?
     - Can I build my own box?
     - How do I order and pay?
     - Is there a delivery fee?
     - Can I return or exchange?
     - Do you take bulk or corporate orders?
     - How do I contact you?
   - On the store, the ordering and payment answers describe the store's
     checkout (order online, pay on delivery, the team calls to confirm). On the
     design site, those answers use its email-order wording.
5. **Structured data** through Rank Math:
   - Product on every product page: name, image, description, price in EGP,
     availability, brand CZERA.
   - Organization: name, logo, email, and the Instagram and Facebook profiles.
   - WebSite, and BreadcrumbList.
   - FAQPage on `/faq/`. Google rarely shows FAQ rich results for shops any
     more, but AI tools read this markup.
6. **`llms.txt`:**
   - Lists the key pages and every product, each with a one-line factual summary
     and a link.
   - No sample content.
   - Hostinger generates the file today (setting `enable_llms_txt`) and lists only
     the "Hello world!" post and the returns page. The builder chooses how to make
     it complete: Hostinger's file, Rank Math's own `llms.txt` feature, or a
     snippet, keeping one source.
7. **Clean-up:**
   - Delete the "Hello world!" sample post. It appears in the sitemap and in
     `llms.txt`.
   - Move "Build your CZERA box" out of "Uncategorized". Make "Gift sets" the
     default product category and remove "Uncategorized".
   - Keep cart, checkout and my-account out of the index.
   - Remove the blog-only sitemaps (post and category) if nothing is left in them.
8. **A launch-day checklist** in the same document as the copy sheet, for the
   owner or the builder on launch day:
   - Turn off the coming-soon redirect.
   - Delete or noindex `/coming-soon/`.
   - Confirm `robots.txt` is real text, not the redirect.
   - Submit the sitemap to Google Search Console and Bing Webmaster Tools (Bing
     feeds ChatGPT search and Copilot).
   - Check that Hostinger's CDN or bot settings don't block Googlebot, Bingbot,
     GPTBot, OAI-SearchBot, PerplexityBot or ClaudeBot. A test request as GPTBot
     on 2026-11-04 got an empty reply.
   - Run Google's Rich Results Test on a product page, a category and `/faq/`.
   - Purge the LiteSpeed cache.

## Search terms to write for (English)

Guided by the products and how the market phrases things; this is not measured
search data:

- cotton towels Egypt
- 100% cotton bath towel
- bath sheet
- hand towel
- face towel
- beach towel
- cotton bathrobe Egypt
- black or white bathrobe
- towel gift set Egypt
- bathrobe gift set
- his and hers robes
- wedding gift towels
- housewarming gift
- build your own gift box
- custom towel gift box
- hotel-style towels at home
- 650 GSM towel
- 1200 GSM bathrobe

Use them naturally in titles, descriptions and copy, never as lists.

## Non-goals

- Arabic, in any form.
- A blog or articles, link building, paid search.
- Changing the coming-soon mode before launch.
- New product photography or a page redesign beyond the category introduction and
  the FAQ page.
- Product claims beyond the confirmed list.

## Anti-goals (a failure even if the rankings work)

- Copy that breaks the CZERA voice, or reads like an SEO page: keyword
  repetition, "best towels in Egypt".
- Any unconfirmed fact on the site, in a search result or in an AI answer
  (Egyptian cotton, delivery times, care instructions, InstaPay).
- The store and the design site drifting apart on visible copy.
- Breaking checkout, the bag, Build your box, or the coming-soon redirect while
  working.

## Success

- Before launch:
  - Every indexable page has a unique title and description.
  - Every product states its size, and its GSM where confirmed.
  - The four categories have introductions.
  - `/faq/` is live on both sites.
  - `llms.txt` lists every product and no sample content.
  - Structured data validates (checked logged in or by rendering, since the
    public pages redirect).
- After launch: the launch checklist is done, and Search Console shows the store's
  pages indexed and earning impressions for the terms above within a few weeks.

## Left to the builder

- How to split this into issues and PRs. A sensible split: invisible SEO and
  clean-up first (no design change, no copy approval needed), then the copy
  sheet, then the visible copy and the FAQ page on both sites.
- The exact Rank Math settings and templates.
- How to generate `llms.txt` (see item 6).
- How to check structured data while the public pages redirect.
- The FAQ page's layout details, within "like the Returns page".
