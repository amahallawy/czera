# Czera — Design base

Single source of truth for the Czera Maison visual system. Any design
skill, reviewer, or contributor reads this **before** touching markup or
CSS. Code-level tokens live in [`css/tokens.css`](css/tokens.css); this
document explains the *intent* behind those tokens and the rules they
exist to protect.

> If a decision is in conflict between this file and the code, this file
> wins for new work — and the code is updated to match in the same PR.
> If something is missing here, add it before relying on it.

---

## 1. Brand at a glance

**Czera** — 100% cotton towels (650+ GSM), bathrobes (1200 GSM) and
gift sets in the black Czera box. Bilingual (English default, Arabic
mirror). A showroom: editorial brand storytelling on the home page, a
Frette-style collection and product page, a bag, and orders sent by
email to support@czeramaison.com (owner, 2026-10-18, #84; the site no
longer uses WhatsApp). Facts come only from the client's product files and catalogue
PDF (see [`PRODUCT.md`](PRODUCT.md)); the full page-by-page design is in
[the showroom spec](docs/superpowers/specs/2026-10-13-czera-showroom-design.md).

| | |
|---|---|
| **Voice** | Warm, calm, factual. No exclamation marks. No "discover", "elevate", "indulge". Start from the catalogue's own lines; state sizes, GSM, contents and price. |
| **Posture** | The hotel experience, at home. Refined, gift-ready, never loud. |
| **Surface** | Ivory pages, near-black for the gift-box moments, gold kept rare. |
| **Brand line** | *Luxury towels & bath essentials.* Catalogue line: *Every detail feels like home.* |
| **Region** | Egypt. Orders by email. EGP pricing. |

---

## 2. References and what we take from each

| Reference | We borrow | We do **not** borrow |
|---|---|---|
| [abysshabidecor.com](https://www.abysshabidecor.com/home) | Chapter rhythm (full-bleed media → centered copy → next chapter), restrained type scale, single-accent color discipline | Their full-page video maximalism — Czera leans more print-editorial |
| [frette.com/en_US/towels](https://www.frette.com/en_US/towels) | Catalogue grid density, hover behaviour, filter chrome, product-name treatment, body-copy weight | Their cooler grey palette — Czera is warm ivory + gold |
| [@czera_maison](https://www.instagram.com/czera_maison) | Photography mood (warm light, soft shadows, fabric closeups), gold-on-ivory product staging | Anything that resembles a typical mass-market towel ad |
| Client catalogue PDF (15-09-2026) | Product names, contents, the four promises and their icons, warm stone-and-sea lifestyle photography, copy lines | Text, icons and the scanner stamp printed on the pages: crop to the photo |
| Client's "Make your own box" mockup | The four-step Build Your Own Box structure | Its placeholder total |
| Czera brand book (in `graphics/`) | Palette, typography, crown mark, wordmark, pattern motifs | — |

---

## 3. Brand foundation

### 3.1 Palette

Defined in [`css/tokens.css`](css/tokens.css). Use the token, never the
hex literal.

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#F4F2EC` | Page background — Soft Ivory. The default surface. |
| `--color-surface` | `#E7E1D5` | Warm Beige — secondary surfaces, cards. |
| `--color-surface-soft` | `#FAF8F3` | Lifted ivory — input fields, hover-on-bg. |
| `--color-gold` | `#D4AF36` | Classic Royal Gold — **one accent per screen.** |
| `--color-gold-sand` | `#D8C28A` | Sand Gold — hairline dividers, subtle accents. |
| `--color-gold-deep` | `#BA7C17` | Deep Gold — emphasis, hover, link-active. |
| `--color-ink` | `#2B2B2B` | Body text. |
| `--color-ink-strong` | `#010100` | Headings on light bg + dark surfaces. |
| `--color-ink-mute` | `#6B6B6B` | Captions, metadata. |
| `--color-ink-faint` | `#A3A099` | Placeholder, divider on light. |
| `--color-on-dark` | `#F4F2EC` | Foreground on charcoal surfaces. |

**Gold is sacred.** A screen has one **solid** gold moment (a gold
button on a dark band, or the hero crown). Never gold buttons + gold
dividers + gold underlines on the same screen. The one standing
exception is the small deep-gold "Add to bag ›" text link on product
cards: it is the site's commerce cue and repeats per card, but it is
text, never a filled button. Color audit (impeccable `/colorize`,
`/quieter`) enforces this.

### 3.2 Typography

| Family | Source | Use |
|---|---|---|
| **Montserrat** (300 / 400 / 500) | Google Fonts | All Latin: body, nav, headings, labels. Display moments use **Montserrat Light 300** at large sizes with negative tracking. |
| **Italiana** (400) | Google Fonts | Reserved — product names + a single editorial flourish per page. Never body, never CTA. |
| **Cairo** (300 / 400 / 500 / 700) | Google Fonts | Arabic surface (`[lang="ar"], [dir="rtl"]`). |

**Banned serifs** (AI-luxury defaults — instant dilution): Cormorant
Garamond, Playfair Display, EB Garamond, Lora, DM Serif. If a future
brief wants "more editorial," push Italiana harder before reaching for
another serif.

**Type scale** — Frette-tight editorial proportions, no fluid clamps
below the `md` step. See `--fs-2xs` through `--fs-4xl` in
[`tokens.css`](css/tokens.css).

**Letter-spacing rule**: large display = negative (`--ls-display`,
`-0.025em`). Small caps = wide (`--ls-wide`, `0.06em`). Eyebrows =
widest (`--ls-widest`, `0.18em`) — restrained from the v1 `0.22em`
because anything wider reads as theatrical.

**Headings always weight 300**, never 400 or 700. The display feel
comes from size + tracking, not from weight.

### 3.3 Marks

- **Wordmark**: two transparent PNGs, centred in the header.
  `assets/logo/czera-wordmark-alt.png` (light) reads over the hero
  film; `assets/logo/czera-wordmark-gold.png` takes over on the ivory
  surface (once scrolled, and on every page without a hero).
  In the header both are 90px tall (70px at 899px and below), which
  draws the light glyph about 84px wide (66px) and the gold one about
  71px (55px): 1.25 times the first 72px and 56px, at the owner's
  request (amahallawy/czera#99). The PNGs carry transparent padding
  above and below the glyph, so a negative block margin keeps the
  link's box, and its focus ring, at 72px (56px) inside the 88px
  header. The WordPress store matches these glyph widths.
  `czera-wordmark-white.png` has a fake checkerboard baked into the
  pixels and must not be used.
- **Crown** (`.brand-crown`): inline SVG, defined in markup. Used
  anywhere the wordmark would be too heavy — chapter eyebrows, footer,
  hero. Variants: default ivory, `--sm` size, `--deep` gold.
- The crown is the brand's repeatable signature. Three peaks with
  beaded points. Never recolor it outside the gold/ivory/charcoal
  triad.

### 3.4 Pattern motifs

Brand book includes a few decorative motifs (in `graphics/`). They are
deliberately **unused** on the current landing — the design doctrine is
"empty space is the pattern." A motif is allowed as a single dim
background flourish on the catalogue intro or on the gift-set page when
those land. Anywhere else: ask first.

---

## 4. Design principles

These are the rails. Every design skill (`/critique`, `/polish`,
`/normalize`, `/distill`, `/quieter`, `/harden`) is applied against
them.

1. **Quiet over loud.** If a section can be removed without losing
   meaning, remove it. Czera is not a deals site. Whitespace is not
   wasted space.
2. **One accent per screen.** Gold is rare. A gold CTA + a gold
   underline + a gold eyebrow on the same fold = redo.
3. **Editorial, not promotional.** Headings state facts or the
   catalogue's own lines ("The hotel experience, at home.") not slogans
   ("Discover Luxury Today!").
4. **Real facts, plainly.** "100% cotton · 90 × 160 cm · 650 EGP",
   "1200 GSM, fits up to 130 kg". Only what the client's files say.
5. **Heading weight is 300, always.** See §3.2.
6. **No card chrome unless earned.** Product cards sit on the page
   surface — no shadow, no border, no rounded container. The photo,
   name, price and the gold text link do the work.
7. **Motion is restrained.** Reveal-on-scroll, slow ken-burns on
   chapter media, hover micro-states. No springs, no bounces, no
   parallax beyond the ken-burn.
8. **RTL is a peer, not an afterthought.** Anything that uses
   `margin-left` instead of `margin-inline-start` is a bug.
9. **Client photography only.** Every image comes from the client's
   product photos or a crop of the catalogue PDF. No Unsplash in
   production.
10. **Quiet commerce.** Ordering is always one tap away but never
    shouts: text links in grids, one solid button per screen, no
    pop-ups. A sale is shown quietly: a small-caps ivory "Sale" label on
    the photo and the old price struck through beside the new one, never
    red and never a percentage burst. The first-order offer is one thin
    black line the visitor can close. A single "Bestseller" tag is
    allowed; "Trending now" strips are not.

---

## 5. Layout system

### 5.1 Container

- `--content-max: 1320px` — outer container.
- Collection: a left filter sidebar (~200px) beside the grid.
- `--content-narrow: 720px` — editorial paragraph block.
- `--content-reading: 65ch` — comfortable measure for body copy.
- `--gutter: clamp(1rem, 4vw, 3rem)` — page side padding.

### 5.2 Section rhythm

`.section { padding-block: clamp(var(--space-8), 10vw, var(--space-10)); }`

That's `4rem → 8rem` of vertical air per section. The chapter rhythm
on the landing is: full-bleed media → centered copy block → next
chapter. **Air between chapters is the design** — do not tighten it
to fit "more above the fold." One deliberate exception: on phones the
story chapter is kept short because it sits between the hero and the
first prices (§6.4).

### 5.3 Spacing scale (4px base)

`--space-1` through `--space-10`. Use the tokens. Hard-coded `padding:
14px` is a code-review block.

### 5.4 Grid

- Header: `grid-template-columns: 1fr auto 1fr` — menu button, brand
  mark, bag. Symmetric: equal outer columns keep the wordmark on the
  page's centre line whatever the bag count.
- Collection grid: 2 columns on phones, 3 beside the sidebar from md
  up, with a small gap between cards. Hover lifts the image by 1.02
  scale and fades in the second photo. One full-width Build Your Own
  Box band after the last product card, for every filter result (with
  one to three matches it follows them; with none it stands alone).
  The Category filter lists Towels, Beach towels, Bathrobes, Gift sets, the
  grid's order; the menu and footer keep their own order (#91).
- Product page: photos stacked in a ~55% column; the buying panel
  stays in view in the other column.

---

## 6. Component patterns

Components live in [`css/components.css`](css/components.css). This
section explains *what each is for and when to use it.*

### 6.1 Site header

Fixed, 88px tall. Transparent with ivory text over the hero film, then
translucent ivory (`rgba(244, 242, 236, 0.94)` + backdrop blur) once
scrolled and on every page without a hero. Three zones at **every
screen size**: menu button left ("☰ MENU", small caps), wordmark
centred, bag right ("BAG" + gold count circle). At 480px and below
both labels drop and only the icons show. There is **no inline nav**: the
header carries only the brand and two controls (changed 2026-10-16,
amahallawy/czera#48).

**Slide-in menu.** The site's only primary nav, on every screen size.
Opens from the inline start (left in English, right in Arabic) so the
bag panel keeps the other side; a dimmed backdrop covers the page. It
lists, in large light type with hairline rules and in this order (client
request, 2026-10-20, amahallawy/czera#101): Shop all (the Collection, no
filter), The towel collection, Bathrobes, Beach towels, Gift sets, Build
Your Own Box, Sale (only while a product is on sale, #123), About CZERA. The list is `menuItems()` in
`js/lib/nav.js`; the category links use `navLabel` from the product data,
while the footer and the Collection filters keep the short `label`.

**Build Your Own Box is the featured item**, styled to invite a click
while staying one link in the same `nav` list (no extra landmark or
announcement): its text is gold (`--color-gold-text`, 5.2:1 on ivory), its
rule is gold instead of grey, and a line gift box (`--color-gold-deep`,
decorative, `aria-hidden`) sits at the inline end. Same type size, the
same 44px-plus target and the same focus ring as the other items. It is
the menu's only gold, so the one-accent rule (§3.1) holds. At 480px and below the panel
widens to `min(340px, 88vw)` with a narrower inset so the longer labels
stay on one line.

It is a modal dialog: focus moves to its
close button, the page behind is `inert`, and Esc, the close button,
the backdrop or a link closes it and returns focus to the menu button.

**Why**: the brand's heritage feel relies on a simple, near-empty
header. A centred wordmark with the nav one tap away reads as a
boutique, not a shop window, and one menu pattern on every device is
one thing to learn and to rebuild in WordPress.

**Don't**: drop-down megamenus, wide search bars, account avatars, or
bringing back an inline nav beside the centred wordmark.

### 6.2 Hero

Full viewport on every screen, phones included (#119: the hero fills the
phone screen; Our story no longer peeks in below it), the 30s brand film as
background, playing by itself and looping without end
(`assets/video/hero-30s.webm` / `.mp4`, silent). It opens on the cotton
field and ends, from 24s to 30s, on ivory linen with the gold CZERA
sign-off (owner decision, 2026-10-18, amahallawy/czera#96). Headline
bottom-left ("The hotel experience, at home.") and
two actions: "Shop the collection" (light filled) and "Build your own
box" (outline). Nothing else on the film: no fact line under the
headline (removed at the client's request, 2026-10-20, #101; the
WordPress hero had already dropped it) and no order or delivery line under
the buttons (owner decision, 2026-10-18; How to order covers it).

**Play / pause.** One quiet, icon-only round button (WCAG 2.2.2) at the
hero's bottom right, clear of the copy; on phones it sits beside "Build
your own box". At rest it is a 60% ivory icon on a soft dark disc; hover
and keyboard focus bring the icon to full ivory, darken the disc and, for
focus, draw the gold ring. 44px target. Its name follows the film:
"Pause film" while it plays, "Play film" while it is paused. Where the
browser refuses autoplay (iOS Low Power Mode, for one) the poster shows
and the same button starts it. The film plays for every visitor, Reduce
Motion included, and the button is always there to pause it (owner
decision, 2026-10-21, #119).

**Sign-off shade.** The linen is the film's brightest moment, so while it
plays the header's top shade deepens (`body.hero-signoff`, set by
`js/pages/home.js`; it fades in over 600ms, starting 0.6s before the cut
so it is full when the linen appears, and fades out when the film loops
back). MENU, BAG and their icons keep at least 4.5:1 on every sign-off
frame. Only the shade changes: no halo or shadow on the labels. On phones
the bottom scrim climbs higher, so the taller copy stays readable on every
frame. On portrait phones the sign-off wordmark sits behind the eyebrow
and headline; the copy stays readable and this is accepted (owner
decision, 2026-10-18).

**WordPress store.** The Home hero (Spectra container `czera-hero`) plays
the same 30s film on every screen size, tablets and phones included (#119),
and fills the phone screen. The "CZERA hero" Code Snippet adds the same
quiet button and sign-off class; the look is the "Hero film" Additional
CSS block (see `tools/wp/live/czera-hero.php` and `hero-film.css`).

### 6.3 Promises (replaces the old value strip)

Four line icons with labels, as in the client catalogue: 100% cotton ·
Highly absorbent · Long-lasting · Hotel quality (650+ GSM towels,
1200 GSM robes). Used on the home page (with a four-photo strip under
it) and on About. Factual, never marketing copy.

### 6.4 Chapters

The landing's narrative engine. Five chapter shapes:

| Variant | Layout | Surface |
|---|---|---|
| `chapter--light` | Centered copy on ivory, full-bleed media block | Light |
| `chapter--dark` | Centered copy on charcoal, full-bleed media block | Dark — uses `--color-on-dark`. Single gold accent is the **crown**; the eyebrow reads muted ivory and the link rests ivory (gold on hover only), per §3.1 one-accent-per-screen. |
| `chapter--split` | 50/50 image-left, copy-right (with `<dl>` spec list) | Light |
| `chapter--editorial` | Heading row + 3-column entries (no card chrome). Unused while the Journal is off the site. | Light |
| Build-your-box band | Near-black band in the black-gift-box look: the title "Build Your Own Box", one line of client copy and one gold button on one side, gift-box photo on the other. Used on Home and, full width after the last product card, in the Collection grid; the Collection uses the compact version (shorter photo; see §6.15). | Dark |
| `chapter--story` | Text over image — photo full-bleed on the leading edge, copy over the trailing ivory void, a `to right` scrim (`.chapter__scrim`) fading the image into `--color-bg` so image and copy read as one field. Mirrors on RTL. On desktop it meets the hero with no gap and its photo fades in from ivory over the top 140px (`mask-image`), so the film and the photo never meet in a hard cut; an ivory strip between them read as a layout bug (critique 2026-10-18). Stacks (image over copy) at 768px and below; on phones it stays short because it sits before the first prices: a 2:1 photo, no pull-quote, balanced title lines. Ends on one text link, "About Czera ›" (the gift-sets tile follows one screen later). | Light |

Each chapter starts with `<span class="eyebrow">…</span>`, then the
crown mark, then the title, then the body. Skipping the eyebrow makes
chapters blur into each other.

### 6.5 Buttons and links

- **Solid ink** (`#010100`, ivory text): the main action on light
  surfaces: "Add to bag · price", "Add box to bag", "Continue".
- **Solid gold**: the main action on a dark band ("Create your box",
  "Enquire now").
  One per screen.
- **Outline**: the second action beside a solid one (hero).
- **Send green** (`--color-send`): only the final "Send order by email"
  in the bag.
- **Contact us**: every contact button is labelled "Contact us" (the
  About bulk band's is "Enquire now", the client's wording, #101) and
  opens the visitor's email app (`mailto:support@czeramaison.com`); its
  accessible name adds "(opens your email app)".
- **Gold text link with `›`**: "Add to bag ›" on product cards, "Or
  order just this by email ›", "See all gift sets ›".

No ghost-button stacks. A third action is a text link, not a button.

### 6.6 Spec list (`<dl class="spec-list">`)

Used in chapter–split for material specs. Two-column key/value, hairline
divider between rows. Reads like a Frette product fact-sheet.

### 6.7 Footer

Dark. Four columns: brand block (wordmark, "Luxury towels & bath
essentials" in gold sentence case, one line) / Shop / Help (How to order, Sizes & care,
Delivery, About) / Contact (support@czeramaison.com as a mailto link, a
row of social icons for Instagram, Facebook and TikTok, then a "Contact
us" outline button that opens an email to the same address, 16px below
the icons). Bottom row: © line and the
English · العربية switch. No newsletter form (the site has nowhere to
send it). On Home it sits under the three-step "How to order" band.
Column headings are `h2` (small caps by style), so the page's heading
order never skips a level.
Social media are icons, not text (owner, 2026-10-18): WordPress core's
social-link drawings (the same ones the store's Social Icons block
uses), 22px in 44px targets, ivory 78% like the footer links and gold
on hover; each link's accessible name is the old text ("Instagram
@czera_maison (opens in a new tab)").

### 6.8 Product card

Used everywhere a product appears (Home gift sets, Collection, related
products). Photo (4:5, second photo on hover), name (Italiana), one
spec line, price ("1,450 EGP"), and a gold "Add to bag ›" text link
beside the price. Clicking anywhere else opens the product page. No
buttons, no badges except a single optional "Bestseller" tag and, on
products with a sale price, the "Sale" label (#123): ivory ground, gold
small caps (`.card__flag`), top inline-start corner of the photo. The
price shows the regular price struck through in muted ink
(`.price__was`) beside the sale price in strong ink. The same label and
price pair appear on the product page. Sale prices are never red.

### 6.9 Collection page

Title, then a left sidebar with Category, Price and Colour filters.
Each option shows its count, computed from the product data; options
that would return nothing are greyed out. On phones the sidebar
becomes a "Filters" button that opens a panel.

### 6.10 Product page

Photos stacked large on the left; the buying panel stays in view on
the right: category, name, price, short description, "In the box"
list for sets, quantity, "Add to bag · price", the "Or order just this
by email ›" link, four quick facts, the delivery line. Under that,
fold-out sections: Description and Features open, Sizes & care and
Delivery & payment closed. At the bottom: a dark "Add this to a box of
your own" band (towels and beach towels pre-fill the box; robes and
sets just link) beside Recently viewed (Bestsellers for first-time
visitors). No upsell modals, no pop-ups.

### 6.11 Bag panel

The bag icon in the header shows the item count. Adding an item shows a
short black confirmation near the bag ("Black Bathrobe added to your
bag · View bag"). The bag opens as a panel that slides in from the
right, in two steps: (1) items with photo, name, spec, quantity,
remove, line price, total, "Continue"; (2) delivery details: name,
phone, address, city required, note optional, then the green "Send
order by email" button, which opens the visitor's email app addressed to
support@czeramaison.com, subject "Order from czeramaison.com", with the
order written out in the body. A confirmation step follows: "Your order
is ready in your email app", the order text, a "Copy order" button and,
for visitors whose email app did not open, the address to send it to and
a "try again" link. Orders longer than about 2,000 characters as a link
(some email apps cut those short) get one more line asking the visitor
to check every item arrived. The bag is kept in the visitor's browser.

**First-order code (#123).** In step 1, above the totals, a gold-ruled
note reads "First order? Enter WELCOME10 for 10% off." (code and percent
come from `CONFIG.firstOrder`), with a labelled field and an "Apply"
button (44px). A valid code (case and spaces ignored) adds a "First order
−10%" row in gold text with a negative amount between Subtotal and Total,
and the field gives way to the code with a "Remove" text button. An
invalid code shows "That code isn't valid." under the field and changes
nothing. Step 2 shows the same three rows, and the email gets a
`Code WELCOME10: −10% (−N EGP)` line before the discounted Total. Clear
bag, or an emptied bag, removes the code. The discount applies to the
bag's items only and is never red.

### 6.11a Top line (every page)

A black strip, at least 44px tall (it wraps on narrow screens and at
large text sizes), as the first child of the site header: ivory small
caps, "First order · 10% off with code WELCOME10" with the amount and the
code in gold, and a × button (`aria-label="Close offer"`, 44px) at the
inline end. The wording is fixed; the code and percent come from
`CONFIG.firstOrder`. Its measured height sets `--promo-h`. While it shows the
header and the page offset grow by its height (`--promo-h`), on pages
with and without the hero, so it never covers the hero copy, the menu
button or the bag; the hero film still fills the screen below it. Closing
it removes it and remembers the choice per code (`czera.promo.v1`), so
it stays closed on every page and after a reload, and returns if the code
changes. Not a pop-up: it never moves, fades in or covers content.

### 6.11b Sale filter

Sale is a filter on the Collection, not a page of its own (owner,
2026-10-22). While at least one product has a `salePrice`, the filter
panel starts with a "Sale" group holding one checkbox, "On sale (n)",
that works like the other filters and combines with them. A "Sale" item
in the menu, after Build Your Own Box and before About CZERA, in the same
style as its neighbours (Build Your Own Box stays the only featured
item), opens `catalog.html?sale=1`: the usual Collection with that box
ticked. With nothing on sale the group and the menu item are gone, and
`?sale=1` opens the full collection. Category tile "from" prices keep the
regular price.

### 6.12 Gift-set tabs (Home)

Two tabs above a row of four product cards: *For the home* and *Robes
& beach*. Tab labels are small caps with a count; the active tab has an
ink underline.

### 6.13 Build Your Own Box

The client's mockup structure: three numbered steps on the left (box,
colour, towels with quantity) as bordered option tiles (the selected
tile has an ink outline); a preview on the right with the box photo,
the running item list, the total, "Box included free", and "Add box to
bag". There is no ribbon step: ribbons are added when available and are
never a customer choice (owner, 2026-10-18). The preview stays in view; on phones it
becomes a total bar pinned to the bottom (the one allowed exception
to §14's sticky-bar rule).

### 6.14 Category tiles (Home)

Photo tiles with a bottom-left label: meta line (count · from price),
name, "Shop …" link, ivory on the photo. The shade behind the label is a
fixed-height gradient anchored to the tile's bottom edge (88% ink at 0,
84% at 60px, 55% at 120px, clear by 200px), not a percentage of the
tile, so it covers the label the same way on every tile height. The
labels measure about 5.3:1 at worst (5.29:1, against the brightest pixel
behind them). Same stops as the WordPress build.

### 6.15 Build-your-box band (Home, Collection)

The one dark band: copy on the left, photo on the right. The copy is
the client's (2026-10-20, #101), the same on Home and the Collection:
the title **"Build Your Own Box"** (no eyebrow above it, so the words are
not said twice), the line "Create a gift that feels personal. Choose your
towels, select your preferred options, and complete your CZERA experience
with our signature gift box." and the gold button **"Create your box"**
(shown in capitals). There is no steps list: it offered a box colour, and
the box colour and the ribbon are never the customer's choice. The copy
sets the band's height (about 470px on desktop) and the photo fills its
half with `object-fit: cover`; at 768px and below the photo sits on top
at 4:3. One accent: gold only on the button.

On the Collection the band is the compact version (the photo capped at
240px tall) and closes the grid: it spans every column after
the last product card, whatever the filter leaves, so browsing always
ends on the invitation to build a box (#91). The WordPress shop and
category pages carry the same band after their product grid.

---

## 7. Motion

| Cue | When | How |
|---|---|---|
| `.reveal` (opacity + 20px Y) | Section enters viewport | IntersectionObserver in [`js/main.js`](js/main.js); 700ms `--ease-out`. |
| Ken-burns on `.chapter__media` | Chapter media in view | Slow `transform: scale()` + `translate()`, ~20s loop. Imperceptible per frame. |
| Menu slide | Menu button | Panel slides in from the inline start, 360ms `--ease-out`; backdrop fades in. Instant under reduced motion. |
| Hero film | Home, on load (every device) | The 30s film loops silently; a quiet round button, always shown, pauses it (§6.2). It plays under Reduce Motion too (owner decision, 2026-10-21, #119). |
| Sign-off shade | Film 23.4–30s | The header shade deepens, 600ms opacity fade (`--dur-slow`), and lifts when the film loops. Instant under reduced motion. |
| Image hover lift | Catalogue cards | `transform: scale(1.02)` on the inner img, 320ms `--ease-out`. |
| `prefers-reduced-motion` | Always respected, except the hero film (§6.2) | All transitions clamped to `0.01ms`; reveal becomes instant. |

What we do **not** do: spring physics, page-load splash screens,
cursor-following effects, sticky cursor blobs, scroll-jacking,
horizontal scroll storytelling, parallax beyond ken-burn.

---

## 8. Imagery

- **Sources**: the client's product photos (`assets/czera products/`)
  and crops of the catalogue PDF. Catalogue pages carry printed text,
  icons and a CamScanner stamp: crop to the photo area so none of it
  shows. Some product photos also have printed panels (e.g. the black
  robe's "1200 gm / 130 kg"); prefer the clean shot.
- **Subjects**: stacked towels, fabric closeups, bath scenes, robes on
  hooks, gift boxes with ribbon, striped beach towels by the sea.
- **Light**: warm, side-lit, soft shadow. Never flat product-on-white.
- **Crop**: tight on texture; loose on lifestyle. No center-locked
  product photos.
- **Aspect**: hero is 16:9 desktop / 4:5 mobile; chapter media is
  3:2; editorial entries are 4:5.
- **Files**: page-ready copies live in `assets/img/products/` and
  `assets/img/catalogue/`. Client originals move to `graphics/`, the
  staging dump — never reference files there from production HTML.
  The Unsplash placeholders still in `index.html` are removed in the
  showroom build.

---

## 9. Voice and microcopy

- Sentences end with a period. No `!`. (Hero subtitle, promises,
  chapter bodies — all flat declarative.)
- Ranges use the en-dash (`500–1,500`, `&ndash;`), never a hyphen.
  Sizes use the multiplication sign: `90 × 160 cm`.
- Currency: `1,450 EGP` — comma-grouped amount, space, three-letter
  code (matches the client's mockup).
- CTAs are imperative + concrete: "Shop the collection", "Add to bag",
  "Create your box", "Send order by email", "Contact us". Never "Click here",
  "Learn more", "Get started", "Buy now".
- Product names are Italiana, title case as in the catalogue, no
  "Luxury" prefix ("The Complete Czera Set", "3 Bath Sheets Set").

---

## 10. Internationalisation

- Default surface: `<html lang="en">`. Arabic surface: `<html
  lang="ar" dir="rtl">`.
- Mirror, don't translate-and-paste. RTL flips the entire layout
  (header zones, chapter–split, footer grid, catalog filters). The
  menu panel and the bag panel swap sides with it.
- Use logical properties everywhere: `margin-inline-start`,
  `padding-inline-end`, `border-inline-start`. **No** `margin-left`
  in component CSS.
- Arabic typography uses Cairo via the token swap in
  [`tokens.css`](css/tokens.css). No font-stack hand-overrides per
  component.
- Numerals stay Latin (`1200 GSM`, `1,450 EGP`) on the Arabic surface for
  spec consistency — confirm with brand if Arabic-Indic numerals
  are wanted later.

---

## 11. Accessibility

Non-negotiables:

- Every image has `alt` text. Decorative-only images use `alt=""`
  **and** `aria-hidden="true"` on the wrapper.
- Visible focus on every interactive element. Default outline:
  1.5px ink-strong, 3px offset. On dark surfaces (hero, header over
  the hero, dark chapters, the black bands such as Build Your Own Box and
  About's bulk orders, the footer): gold. See
  [`base.css`](css/base.css) `:focus-visible`. The WordPress store
  draws the same gold ring on its black bands.
- Skip link is the first focusable element.
- Heading order is sequential — no `h2` followed by `h4`.
- Color contrast: ink on bg ≥ 7:1; ink-mute on bg ≥ 4.5:1.
- Form inputs always have a `<label>` (visible or `sr-only`); icon
  buttons always have `aria-label`.
- `prefers-reduced-motion` respected (see §7), except the hero film, which
  plays with its pause button always shown (§6.2, #119).
- Slide-in panels (menu, bag) are modal: the page behind is `inert`
  while one is open, Esc closes it, and focus returns to the button
  that opened it. One `nav` landmark labelled "Primary" per page; it
  lives in the menu panel, so it is exposed only while the menu is
  open (the Menu button's `aria-expanded` / `aria-controls` point to it).

---

## 12. Source material map

```
projects/czera/
├── design.md                ← this file
├── PRODUCT.md               who the site is for, voice, source of truth
├── index.html               home
├── catalog.html             collection (sidebar filters + grid)
├── product.html             product page (one template, all products)
├── build-your-box.html      Build Your Own Box (new)
├── about.html               About + bulk orders + contact (new)
├── css/
│   ├── tokens.css           brand tokens (vars only)
│   ├── base.css             reset + global typography + motion
│   ├── components.css       header, nav, buttons, footer
│   └── pages/
│       ├── landing.css
│       ├── catalog.css
│       └── product.css
├── js/
│   ├── main.js              global behaviours (nav, scroll-reveal)
│   └── catalog.js           filters + grid behaviour
├── assets/                  ← shipped, optimised, page-ready
│   ├── logo/                processed brand marks
│   ├── img/products/        product photos, web size
│   ├── img/catalogue/       cropped catalogue photography
│   └── video/               hero film
└── graphics/                ← raw client material — NEVER referenced from HTML
    ├── crown.jpeg           crown reference
    ├── WhatsApp Image …     brand book pages
    └── WhatsApp Unknown …   extracted zip dumps
```

**Hard rule**: production HTML/CSS may only reference `assets/`. Every
new client image is processed and renamed (kebab-case, descriptive)
into `assets/img/` before it appears in markup.

---

## 13. Page intents

Section-by-section choices are in the
[showroom spec](docs/superpowers/specs/2026-10-13-czera-showroom-design.md).

### Home (`index.html`)
Editorial, chapter-paced, in seven blocks: hero film, our story (text
over image), shop by category (editorial grid, gift sets lead), gift
sets (two tabs), Build Your Own Box (dark band), the four promises with
a photo strip, how to order (three steps, all by email: Add to bag,
Send your bag by email, We confirm and deliver) + footer. The story leads
the page (client request, 2026-10-17, amahallawy/czera#68); the menu
order is in §6.1 (About CZERA last since #101). Goal: the first screen sets the brand, the second
tells its story, and the category tiles with prices follow straight
after; the story's headline must not repeat the hero's.

### Collection (`catalog.html`)
Sidebar filters (sale while something is on sale, category, price,
colour) beside a three-column grid of product cards with "Add to bag ›",
closed by the Build Your Own Box band after the last card. `?sale=1`
opens it with the Sale filter ticked (§6.11b). Goal: browse, compare
prices, add to the bag.

### Product (`product.html`)
Large stacked photos, a buying panel that stays in view, fold-out
details, and a related band at the bottom. Goal: everything needed to
decide, with "Add to bag" always beside it.

### Build Your Own Box (`build-your-box.html`)
Three steps (colour, towels, bathrobes) and a live preview with the
running total; price is the sum of the towels and bathrobes, the box
free. As on the WordPress builder (#107): up to 6 towels in all and up to
2 bathrobes, at least 2 pieces; each step's legend shows "Up to 6 · *n* of
6", and a full group disables its + buttons with "You have 6 towels.
Remove one to choose another." One box can mix towel colours (#113): the
colour buttons only choose which towels are listed (White: face, hand,
bath, bath sheet; Blue or Yellow stripe: beach), counts in other colours
are kept, and no colour is ever disabled; bathrobes are not affected by
it.
There is no box colour or ribbon step: the team picks the box to fit the
towels (#103).
With nothing chosen the preview reads "Nothing chosen yet." The product
page's related band reads "Build Your Own Box" with "Add this to a box of
your own." / "Start with this item" for towels that fit a box, and the
client's "Create a gift that feels personal." / "Create your box" for
everything else. Goal: a custom gift box in the bag in under a minute.

### About (`about.html`)
Photo header, two short chapters and the bulk-orders band in the
client's words (2026-10-20, #101), then the contact strip.

- *Our belief*: "The hotel experience, brought home." / "Inspired by the
  world's finest hotels, CZERA brings everyday luxury into your home
  through premium towels, bathrobes and thoughtfully curated gift sets."
- *The details* (`#sizes`): "It’s all in how it feels." / "Crafted from
  100% cotton, CZERA towels feature a premium 650+ GSM weight for
  exceptional softness, superior absorbency and lasting comfort. From
  luxurious towels and bathrobes to elegant gift sets, every detail is
  thoughtfully considered to bring the five-star hotel experience into
  your home." The care line follows.
- *Bulk & corporate orders* (`#bulk`, dark band): "Tailored solutions for
  hotels, businesses and special occasions." / "From premium hospitality
  towels and bathrobes to custom sizes, colors and embroidered logos,
  CZERA offers tailored textile solutions to meet your needs." and a gold
  "Enquire now" button: an email with the subject "Bulk or corporate
  order".

Then the contact strip (Email, Follow, Delivery). Goal: who Czera is and how to
order in quantity.

---

## 14. Anti-patterns

If you see any of these in a draft, push back:

- Cormorant / Playfair / EB Garamond anywhere
- `font-weight: 700` on a heading
- More than one gold element on a single fold
- Cards with shadow + border + rounded corners + gradient (any two of
  those three is already too much)
- Marketing copy: "discover", "elevate", "indulge", "experience
  luxury", "best in class"
- Exclamation marks
- Stock-grade product-on-white photography
- Sticky bottom-bar CTAs ("Buy Now") on mobile (sole exception: the
  Build Your Own Box total bar, §6.13)
- Filled "Add to bag" buttons on every product card (use the gold text
  link, §6.8)
- Claims the client's material doesn't make (origin, "by hand",
  thread counts)
- Cookie banners that take over the screen (a thin top strip is fine)
- Auto-playing audio
- Pop-up newsletter modals on first visit

---

## 15. How to use this file

When applying a design skill (e.g. `/critique`, `/polish`,
`/normalize`, `/distill`, `/typeset`, `/colorize`, `/arrange`,
`/quieter`, `/harden`, `/audit`):

1. Read this file first (it satisfies the impeccable Context Gathering
   Protocol for the project).
2. Read the relevant page CSS in `css/pages/` and the section in
   `index.html` / `catalog.html` / `product.html`.
3. Run the skill against the section.
4. If the change requires a new token, value, or rule, **update this
   file in the same PR** — no orphan changes.

When making a structural decision (new section type, new navigation
shape, swapping a typeface), record an AgDR at
`projects/czera/docs/agdr/AgDR-NNNN-<slug>.md` (per the workspace
`agdr-decisions.md` rule) and link it from this file's history.
