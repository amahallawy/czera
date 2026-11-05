# CZERA store SEO, AEO and GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page of czeramaison.com ready for Google, its answer boxes and AI assistants from launch day: titles, descriptions, structured data, `llms.txt`, clean-up, then fuller product and category text and a FAQ page on both sites.

**Architecture:** Three phases, each its own GitHub issue and PR.
- **Phase 1** writes only invisible SEO through Rank Math's REST routes (`updateMeta`, `updateSettings`, `saveModule`) and WordPress clean-up through the `czeramaison-com-wp` MCP. It is driven by a live check script, `tools/wp/seo_checks.py`, in the style of `tools/wp/box_checks.py`, and the meta values live in a reference file, `tools/wp/seo_meta.json`.
- **Phase 2** is a copy sheet for the owner to approve.
- **Phase 3** applies the approved visible copy on WordPress and mirrors it on the design site.

**Tech Stack:** WordPress, WooCommerce and Rank Math on Hostinger (LiteSpeed). Python 3 standard library for the checks. The design site is static HTML, CSS and vanilla JS with `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-04-wp-seo-aeo-geo-design.md` (approved by the owner on 2026-11-04). Read it first. Its "Calls made" section is binding.

## Global Constraints

- **English only:** no Arabic characters (`[؀-ۿ]`) anywhere this work writes.
- **Confirmed facts only:**
  - 100% cotton
  - towels 650+ GSM: bath range (face, hand, bath towel, bath sheet) and the towel-only gift sets
  - robes 1200 GSM, fitting up to 130 kg
  - sizes as on the store
  - the black CZERA gift box with satin ribbon
  - Build your box: up to 6 towels and up to 2 bathrobes, at least 2 pieces
  - pay on delivery, with the team calling to confirm and quote the delivery fee
  - returns within 14 days on unused items
  - bulk orders by email, support@czeramaison.com
- **Banned in anything written** (case-insensitive):
  - `discover`, `elevate`, `indulge`, `best in class`
  - `egyptian cotton`, `by hand`, `handmade`
  - `!`
  - `instapay`
  - delivery times (`next day`, `2–5 days`, or any "deliver… in N days"); "within
    14 days" for returns is allowed
  - care instructions (`machine wash`, `tumble`)

  "luxury" is allowed only inside a product name or the brand line "Luxury towels & bath essentials".
- **No GSM on the beach towels.** That covers the two stripe beach towels, plus the beach towel within any set description, unless the set's robe gives it 1200 GSM for the robe only.
- **No prices** and **no first-order code** in meta descriptions or `llms.txt`. Structured data carries the live WooCommerce price.
- **Product names are used exactly as on the store** (`&amp;` decoded once to `&`). Titles are never reworded into a different name.
- **Search titles end with ` | CZERA`.** Aim for 60 characters or fewer; longer ones only when the exact product name forces it. Descriptions are 155 characters or fewer. Every title and every description is unique.
- **Visible copy** (product descriptions, category introductions, the FAQ page) **is mirrored on the design site.** Invisible SEO is WordPress only.
- **The coming-soon redirect keeps working for logged-out visitors** at all times (owner decision).
- **Repo rules:**
  - an issue per phase, a branch `{type}/#NN-...`, and a PR titled `type(#NN): ...` with a Glossary section;
  - a `CHANGELOG.md` entry under `## [Unreleased]`;
  - stage specific files only;
  - never commit to `main`;
  - the two-marker merge.
- **The live site is production.** Every write goes through the admin application password (`WP_AUTH='user:password'` for the scripts). Purge LiteSpeed (MCP ability `hostinger-ai/litespeed-cache-flush`) after each batch of changes and before each check run.

## Review Focus

1. **The coming-soon redirect after any change.** A logged-out GET of `/` and of a product URL must still return the `window.location.href = ".../coming-soon/"` script. The `site` check in Task 1 covers it.
2. **Names with `&`** (His & Hers Robes, Hand & Bath Sheet Set, the two "Robe & Beach Towel" sets). Titles, descriptions and JSON-LD must show `&` once: no `&amp;amp;`, no `&#038;` in the `<title>` text. Task 1's `meta` check asserts it.
3. **Products on sale** (Blue Stripe Beach Towel 850 → 680, The Complete CZERA Set 1450 → 1160). The Product schema `offers.price` must equal the product's live `price` from `/wc/v3/products`, not `regular_price`. Task 1's `schema` check asserts it.
4. **LiteSpeed serving an old head after a change.** Checks call the flush ability first, and every REST GET carries a `nocache` parameter, as `box_checks.api` does.
5. **The box product (ID 210).** It must be `noindex` and absent from `product-sitemap.xml`, while `/build-your-box/` stays indexable and in `page-sitemap.xml`. Snippet 8's redirect from the product to `/build-your-box/` must keep working. The `noindex` check in Task 1 asserts it.

---

## Phase 1: Invisible SEO and clean-up

Before Task 1, create the issue in `amahallawy/czera`: "Search-ready store, phase 1: titles, descriptions, structured data, llms.txt and clean-up". Its acceptance criteria are the passing checks below. Then create the branch `feature/#157-seo-phase-1` (issue #157). Its first commit adds the spec and this plan:
`git add docs/superpowers/specs/2026-11-04-wp-seo-aeo-geo-design.md docs/superpowers/plans/2026-11-04-wp-seo-aeo-geo.md`.

### Task 1: Live SEO checks (failing first)

**Files:**
- Create: `tools/wp/seo_checks.py`
- Create: `tools/wp/seo_meta.json` (empty structure, filled in Task 4)

**Interfaces:**
- **Produces** `seo_checks.py` with this CLI: `python tools/wp/seo_checks.py <check|all|push-meta>`. Checks: `site`, `cleanup`, `noindex`, `schema`, `meta`, `llms`.
- **Produces** `api(path, method='GET', body=None)`, `auth()`, `SITE`, `TIMEOUT`, copied from `box_checks.py` (same `WP_AUTH` env and `nocache` handling).
- **Produces** `head(url) -> str`: the rendered `<head>` HTML of a URL, from `GET /rankmath/v1/getHead?url=<url>`.
- **Produces** `indexable() -> list[dict]`, each `{'kind': 'page'|'cat'|'product', 'id': int, 'url': str, 'name': str}`:
  - pages 87 (Home), Shop, About, 74 (Build your box), 12 (Returns), and `faq` once it exists;
  - the categories `towels`, `bathrobes`, `gift-sets`, `beach`;
  - every published product except 210.
- **Produces** the `seo_meta.json` shape:
  `{"pages": {"<id>": {"title": str, "description": str}}, "terms": {"<id>": {...}}, "products": {"<id>": {...}}}`.

Steps:

- [ ] **Step 1: Turn on Rank Math's Headless CMS support so `getHead` exists.**
  - Use `POST /rankmath/v1/updateSettings`, with the setting found in Rank Math → General Settings → Others → "Headless CMS Support".
  - Confirm `GET /wp-json/rankmath/v1/getHead?url=https://czeramaison.com/shop/` returns `{"success":true,"head":"<title>..."}`.
  - If the route doesn't appear, **stop and report.** Don't build a substitute endpoint without the owner's go-ahead.
- [ ] **Step 2: Write the checks.** Each one prints `PASS <name>` or `FAIL <name>: <reason>` and exits non-zero on any failure.
  - `site`: a logged-out GET of `/` and `/product/bath-towel/` contains `window.location.href = "https://czeramaison.com/coming-soon/"`.
  - `cleanup`:
    - `GET /wp/v2/posts?status=publish` is `[]`;
    - no product category with slug `uncategorized`;
    - option `default_product_cat` equals the `gift-sets` term ID (read it through the MCP ability `hostinger-ai/wp-settings-get` or a `/wp/v2/settings` field if exposed; otherwise assert that product 210's categories are `['gift-sets']`);
    - `sitemap_index.xml` contains neither `post-sitemap.xml` nor `category-sitemap.xml`.
  - `noindex`:
    - `head()` of `/cart/`, `/checkout/`, `/my-account/` and `/product/build-your-czera-box/` contains `name="robots" content="noindex`;
    - `product-sitemap.xml` does not contain `build-your-czera-box`;
    - `page-sitemap.xml` contains `/build-your-box/`.
  - `schema`:
    - For every product, `head()` JSON-LD has `@type` `Product` with `offers.priceCurrency == 'EGP'` and `float(offers.price) == float(live price)`, plus `brand.name == 'CZERA'`.
    - The Home head has an `Organization` with `name == 'CZERA'` and `sameAs` containing both `https://www.instagram.com/czera_maison` and `https://www.facebook.com/CzeraMaison`, and a `WebSite`.
    - Product heads have a `BreadcrumbList`.
  - `meta`: for every `indexable()` entry, the `<title>` and meta description equal `seo_meta.json`'s values, HTML-unescaped once, and:
    - the title ends `| CZERA`;
    - the description is 155 characters or fewer;
    - every title and description is unique;
    - no banned word, no Arabic character, no `EGP` or price digits, no `&amp;amp;`.
  - `llms`: a logged-out GET `/llms.txt`:
    - contains every `indexable()` URL;
    - contains neither `hello-world` nor `/coming-soon/`;
    - has no Arabic character and no `EGP`.
- [ ] **Step 3: Run `python tools/wp/seo_checks.py all`.** Expected: `site` PASS. Everything else FAIL; record the failure lines in the PR description.
- [ ] **Step 4: Commit.**
  `git add tools/wp/seo_checks.py tools/wp/seo_meta.json && git commit -m "test: live SEO checks for the store (#NN)"`

### Task 2: Clean-up

**Files:** none in the repo; WordPress changes through the MCP.

**Interfaces:** Consumes the Task 1 `cleanup` check.

- [ ] **Step 1: Delete post 1 ("Hello world!")** with the ability `hostinger-ai/posts-delete`.
- [ ] **Step 2: Move product 210 into `gift-sets`.**
  - Set the option `default_product_cat` to the `gift-sets` term ID.
  - Delete the `uncategorized` product category. WooCommerce refuses to delete the default category, so set the new default first.
- [ ] **Step 3: Turn off the post and category sitemaps** in Rank Math (`updateSettings`; Sitemap → Posts and Categories → "Include in Sitemap" off).
- [ ] **Step 4: Run the checks.** Flush LiteSpeed, then run `python tools/wp/seo_checks.py cleanup`. Expected: PASS. Then `site`. Expected: PASS.

### Task 3: Site-level structured data and noindex

**Files:** none in the repo.

**Interfaces:** Consumes the Task 1 `schema` (site parts) and `noindex` checks.

- [ ] **Step 1: Set Rank Math's Local SEO / Knowledge Graph:**
  - type Organization, name `CZERA`;
  - logo media 326, the wordmark that `czera-order-emails.php` uses;
  - email `support@czeramaison.com`;
  - social profiles `https://www.instagram.com/czera_maison` and `https://www.facebook.com/CzeraMaison`.
- [ ] **Step 2: Set the WooCommerce product schema brand to `CZERA`**, using Rank Math's WooCommerce "Brand" setting with a fixed value rather than a taxonomy.
- [ ] **Step 3: Make sure cart, checkout and my-account are `noindex`** (Rank Math's WooCommerce "noindex" options). Set product 210's robots to `noindex`: `POST /rankmath/v1/updateMeta` with `objectType: 'post', objectID: 210, meta: {rank_math_robots: ['noindex']}`.
- [ ] **Step 4: Run the checks.** Flush, then run `noindex` (expected PASS) and `schema` (expected PASS for Organization, WebSite, Brand and BreadcrumbList; product prices pass already).

### Task 4: Titles and descriptions

**Files:**
- Modify: `tools/wp/seo_meta.json` (all values)
- Modify: `tools/wp/seo_checks.py` (add `push-meta`)

**Interfaces:**
- Consumes `indexable()` and the `seo_meta.json` shape from Task 1.
- Produces `push_meta()`, which writes every entry with `POST /rankmath/v1/updateMeta`:
  - posts and products: `objectType: 'post'`;
  - categories: `objectType: 'term'`;
  - meta: `{rank_math_title, rank_math_description}`.

  It is idempotent and safe to re-run.

- [ ] **Step 1: Fill `seo_meta.json`** for every `indexable()` entry, following the Global Constraints and the spec's search terms.
  - Product titles: `<exact product name>, <size or key fact> | CZERA`, e.g. `Bath Towel, 70 × 140 cm 100% Cotton | CZERA`.
  - Product descriptions name what it is, the size, cotton, the GSM where confirmed, and "in the CZERA gift box with satin ribbon" for gift sets.
  - The Home title leads with the brand line's facts: 100% cotton towels, bathrobes and gift sets in Egypt.
  - The `/build-your-box/` description states the up-to-6 towels and up-to-2 robes rule.
- [ ] **Step 2: Add `push-meta` and run it.** `python tools/wp/seo_checks.py push-meta`, then flush.
- [ ] **Step 3: Run the checks.** `python tools/wp/seo_checks.py meta`. Expected: PASS. Then `site`. Expected: PASS.
- [ ] **Step 4: Commit.**
  `git add tools/wp/seo_meta.json tools/wp/seo_checks.py && git commit -m "feat: search titles and descriptions for every store page (#NN)"`

### Task 5: llms.txt

**Files:** none in the repo, unless a snippet proves necessary (then `tools/wp/live/czera-llms.php` plus an AgDR, after asking).

**Interfaces:** Consumes the Task 1 `llms` check.

- [ ] **Step 1: Check whether Rank Math's "LLMS Txt" module exists** (version 1.0.281: `saveModule` with module `llms-txt`, or Rank Math → Dashboard → Modules).
  - If it does, turn it on and include Pages, Products and Product categories. Exclude cart, checkout, my-account, `/coming-soon/` and product 210.
  - Then turn off Hostinger's file through the MCP ability `hostinger-ai/hostinger-plugin-settings-update` with `{enable_llms_txt: false}`, so there is one source.
  - If the module doesn't exist, stop and report the options. Keeping Hostinger's file needs the sample post gone, which Task 2 did.
- [ ] **Step 2: Run the checks.** Flush, then run `python tools/wp/seo_checks.py llms` (expected PASS) and `all` (expected PASS on every check).
- [ ] **Step 3: Commit the changelog and open the PR.**
  - Add a `CHANGELOG.md` entry under `## [Unreleased]`.
  - `git add CHANGELOG.md`, commit, push, then `gh pr create` with:
    - the `seo_checks.py all` output before (Task 1 Step 3) and after;
    - the settings changed;
    - a Glossary covering SEO, AEO, GEO, meta description, structured data and llms.txt.
  - Then the code-review marker and the owner's merge.

## Phase 2: Copy sheet (owner approval)

Create the issue "Search-ready store, phase 2: copy sheet for product, category and FAQ text", and the branch `docs/#NN-seo-copy-sheet`.

### Task 6: Write the copy sheet

**Files:** Create `docs/seo-copy-2026-11.md`.

**Interfaces:** Produces the approved text that Phase 3 applies, verbatim. It has these sections, in this order:
- `## Products`: one subsection per product, keyed by WooCommerce ID and slug, each with `Current` and `Proposed`.
- `## Categories`: `towels`, `bathrobes`, `gift-sets`, `beach`, each with `Proposed`.
- `## FAQ`: the spec's question list, each with its answer. The ordering and payment answers come in two variants, `Store` and `Design site`.
- `## Launch-day checklist`: the spec's item 8, copied as checkboxes.

- [ ] **Step 1: Write the sheet.**
  - Read the current text with the MCP ability `woocommerce/products-query`, and the client's files under `graphics/client-2026-10/czera products/*/info.txt`.
  - Proposed product text is 80–150 words, a tidied version of the current text. It states size, cotton and the GSM where confirmed. Sets list their contents and the gift box with satin ribbon.
  - Category introductions are two or three sentences.
  - FAQ answers use only the confirmed facts, and leave out any question the facts can't answer.
- [ ] **Step 2: Self-check the sheet.** Run the Global Constraints' banned-word, Arabic and GSM rules against the file:
  `python -c "import re,sys;t=open('docs/seo-copy-2026-11.md',encoding='utf-8').read();print([w for w in ['discover','elevate','indulge','best in class','egyptian cotton','by hand','handmade','instapay','machine wash','tumble','next day','!'] if w in t.lower()], bool(re.search('[؀-ۿ]',t)))"`.
  Expected: `[] False`.
- [ ] **Step 3: Commit, push and open a docs-only PR.** The owner's approval of this PR is the Phase 3 gate.

## Phase 3: Visible copy and the FAQ page (after the copy sheet is merged)

Create the issue "Search-ready store, phase 3: product and category text and a FAQ page on both sites", and the branch `feature/#NN-seo-copy-and-faq`. Every string comes verbatim from `docs/seo-copy-2026-11.md`.

### Task 7: Product and category text on both sites

**Files:**
- Modify: `js/data/products.js` (each product's description fields, using the field names already there)
- Modify: the design site's collection page intro, where `catalog.html` / `js/pages/` render the category heading
- Test: `tests/products.test.js`
- Modify: `tools/wp/seo_checks.py` (add a `copy` check)

**Interfaces:** Consumes the copy sheet. Produces `copy`, which checks that each product's live WooCommerce `description` and each category's `description` (HTML-stripped) equals the sheet's Proposed text.

- [ ] **Step 1: Write the failing tests** in `tests/products.test.js`:
  - `'bath-range products and towel sets state 650+ GSM'`: every product in those groups has a description containing `650+ GSM`.
  - `'robes state 1200 GSM'`.
  - `'beach towels state no GSM'`: the two stripe beach towels' descriptions don't match `/GSM/`.
  - `'descriptions avoid the banned words'`: none contain any banned word from the Global Constraints.
- [ ] **Step 2: Run `npm test`.** Expected: the new tests FAIL.
- [ ] **Step 3: Apply the copy.**
  - Put the sheet's Proposed product text into `js/data/products.js`, and the category introductions into the design site's collection page.
  - On WordPress, update each product's `description` with the ability `woocommerce/product-update`, and each category's `description` with `hostinger-ai/wc-product-categories-update`.
  - Confirm that WooCommerce shows the category description above the grid on the store's collection pages, which are restyled by `tools/wp/live/collection-pages.css`. If it doesn't show, or shows out of place, match the design site's position with CSS in that file, kept as a reference copy.
- [ ] **Step 4: Run the checks.** `npm test` (expected PASS), then flush and run `python tools/wp/seo_checks.py copy` and `site` (expected PASS).
- [ ] **Step 5: Screenshot** one product page and one category page on both sites, at 390 px and 1280 px wide. Check that the text sits where the design puts it.
- [ ] **Step 6: Commit.** Stage `js/data/products.js`, the collection page files, `tests/products.test.js`, `tools/wp/seo_checks.py` and any changed `tools/wp/live/*.css`, then commit.

### Task 8: The FAQ page on both sites

**Files:**
- Create: `faq.html`, `js/pages/faq.js`. Reuse `css/pages/returns.css` for layout; add `css/pages/faq.css` only for the question styling the returns page lacks.
- Modify: `js/ui/shell.js:70`, adding `<li><a href="faq.html">Questions</a></li>` after "Returns & exchanges" in the footer's Help column.
- Test: `tests/nav.test.js` (or the test file that covers the footer)
- Modify: `tools/wp/seo_meta.json` (the FAQ page's title and description) and `tools/wp/seo_checks.py` (add the FAQ page to `indexable()`, and a FAQPage assertion to `schema`)

**Interfaces:** Consumes the copy sheet's FAQ section and `push_meta()`.

- [ ] **Step 1: Write the failing tests.**
  - A footer test: the Help column lists `Returns & exchanges` then `Questions`, linking `faq.html`.
  - A `faq.js` test: it renders every question from the sheet, in order, as headings followed by their answers.
- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Build the design-site page** like `returns.html`: the same reading column, a "Help" eyebrow, the "Questions" heading, and the Design site variants of the ordering and payment answers.
- [ ] **Step 4: Build the store page.**
  - Create the page `/faq/` with `hostinger-ai/pages-create`, using Rank Math's FAQ block (`rank-math/faq-block`, which outputs the FAQPage schema). Use the Store variants of the answers.
  - Apply the Returns page's layout: turn off Astra's title, boxed background and sidebar, as in #153, using the same page settings.
  - Extend snippet 18's styles to the FAQ page, updating both the live snippet and `tools/wp/live/czera-returns.php`.
  - Add "Questions" after "Returns & exchanges" in footer widget `block-7`.
  - Add its meta to `seo_meta.json`, run `push-meta`, and flush.
- [ ] **Step 5: Run the checks.** `npm test`, then `python tools/wp/seo_checks.py all`. Expected: PASS everywhere, including FAQPage on `/faq/` and `/faq/` in `llms.txt`.
- [ ] **Step 6: Screenshot** both FAQ pages at 390 px and 1280 px, and compare them with the Returns pages.
- [ ] **Step 7: Commit, changelog, PR.** Stage the new and changed files plus `CHANGELOG.md` and open the PR. The UI change needs the design-review marker from `pr-quality.md`, besides the code review and the owner's merge.
